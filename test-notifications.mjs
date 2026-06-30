import mongoose from "mongoose";
import User from "./app/models/userModel.js";
import Notification from "./app/models/notification.js";

const MONGODB_URL = "mongodb://admin:senha123@localhost:27017/ecomerce?authSource=admin";

async function setup() {
  await mongoose.connect(MONGODB_URL);
  console.log("✅ Conectado ao MongoDB\n");

  // 1. Criar user de teste se não existir
  let user = await User.findOne({ telefone: "999999999" });
  if (!user) {
    user = await User.create({
      name: "Teste Notificações",
      telefone: "999999999",
      password: "$argon2id$v=19$m=65536,t=3,p=4$salt1234567890123$hash1234567890123456789012345678901234567890123456789012345678901234",
      role: "user"
    });
    console.log("👤 Utilizador de teste criado:", user._id);
  } else {
    console.log("👤 Utilizador de teste já existe:", user._id);
  }

  // 2. Limpar notificações antigas e criar novas
  await Notification.deleteMany({ user: user._id });

  const notifs = await Notification.insertMany([
    { user: user._id, type: "status_update", title: "Pedido confirmado", body: "O seu pedido #123 foi confirmado.", data: { orderId: "123" }, read: false, createdAt: new Date() },
    { user: user._id, type: "new_product", title: "Novo produto", body: "Bolachas Cheias já disponíveis!", data: { productId: "abc" }, read: false, createdAt: new Date(Date.now() - 3600000) },
    { user: user._id, type: "promotion", title: "Promoção especial", body: "25% off em todos os bolos!", data: {}, read: false, createdAt: new Date(Date.now() - 7200000) },
  ]);
  console.log(`📬 ${notifs.length} notificações criadas`);
  notifs.forEach(n => console.log(`   - ${n._id}: "${n.title}"`));

  // 3. Fazer login para obter token
  console.log("\n🔑 A fazer login...");
  const loginResp = await fetch("http://localhost:5000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ telefone: "999999999", password: "teste123" })
  });
  const loginData = await loginResp.json();
  
  if (!loginData.status) {
    // Como não temos a password real do user criado, vamos gerar um token manualmente
    console.log("⚠️  Login falhou (password mockada). Vou gerar token manualmente.");
    const jwt = (await import("jsonwebtoken")).default;
    const token = jwt.sign({ id: user._id, role: user.role }, "rtghwergjwoiegjhwoipjfgiwopjgqwepjgwoifgw", { expiresIn: "4h" });
    return { user, notifs, token };
  }

  console.log("✅ Login OK, token obtido");
  return { user, notifs, token: loginData.token };
}

async function test() {
  const { user, notifs, token } = await setup();

  console.log("\n═══════════════════════════════════════");
  console.log("🧪 TESTE 1: GET /api/profile/notifications");
  console.log("═══════════════════════════════════════\n");

  const res1 = await fetch("http://localhost:5000/api/profile/notifications", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data1 = await res1.json();
  console.log(`Status: ${res1.status}`);
  console.log(`Resposta:`, JSON.stringify(data1, null, 2));

  if (data1.status && data1.data.length === 3) {
    console.log("\n✅ 3 notificações não lidas retornadas");
  } else {
    console.log("\n❌ Resultado inesperado");
  }

  console.log("\n═══════════════════════════════════════");
  console.log("🧪 TESTE 2: PATCH /api/profile/notifications/:id/read");
  console.log("═══════════════════════════════════════\n");

  const notifId = notifs[0]._id;
  console.log(`Marcando notificação ${notifId} como lida...\n`);
  const res2 = await fetch(`http://localhost:5000/api/profile/notifications/${notifId}/read`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` }
  });
  const data2 = await res2.json();
  console.log(`Status: ${res2.status}`);
  console.log(`Resposta:`, JSON.stringify(data2, null, 2));

  if (data2.status && data2.data.read === true) {
    console.log("\n✅ Notificação marcada como lida com sucesso");
  } else {
    console.log("\n❌ Falha ao marcar como lida");
  }

  console.log("\n═══════════════════════════════════════");
  console.log("🧪 TESTE 3: Verificar que só restam 2 não lidas");
  console.log("═══════════════════════════════════════\n");

  const res3 = await fetch("http://localhost:5000/api/profile/notifications", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data3 = await res3.json();
  console.log(`Resposta:`, JSON.stringify(data3, null, 2));

  if (data3.status && data3.data.length === 2) {
    console.log("\n✅ Apenas 2 notificações não lidas restantes (como esperado)");
  } else {
    console.log("\n❌ Número inesperado de notificações");
  }

  console.log("\n═══════════════════════════════════════");
  console.log("🧪 TESTE 4: ID inexistente — 404 esperado");
  console.log("═══════════════════════════════════════\n");

  const fakeId = new mongoose.Types.ObjectId();
  const res4 = await fetch(`http://localhost:5000/api/profile/notifications/${fakeId}/read`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` }
  });
  const data4 = await res4.json();
  console.log(`Status: ${res4.status}`);
  console.log(`Resposta:`, JSON.stringify(data4, null, 2));

  if (res4.status === 404 && !data4.status) {
    console.log("\n✅ 404 retornado corretamente para ID inexistente");
  } else {
    console.log("\n❌ Comportamento inesperado");
  }

  // Limpeza
  await Notification.deleteMany({ user: user._id });
  await User.deleteMany({ _id: user._id });
  console.log("\n🧹 Dados de teste removidos");
  await mongoose.disconnect();
  console.log("✅ Testes concluídos");
}

test().catch(e => {
  console.error("Erro no teste:", e);
  process.exit(1);
});
