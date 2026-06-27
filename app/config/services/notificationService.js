/**
 * Serviço de notificações — push via FCM e notificações in-app (MongoDB)
 */
import { getMessaging } from "firebase-admin/messaging";
import User from "../../models/userModel.js";
import Notification from "../../models/notification.js";

/**
 * Envia push notification FCM para um dispositivo específico
 */
const sendPush = async (token, title, body, data = {}) => {
  try {
    const message = {
      token,
      notification: { title, body },
      data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
    };
    await getMessaging().send(message);
  } catch (error) {
    console.error("Erro ao enviar push FCM:", error.code, error.message);
  }
};

/**
 * Envia push notification para todos os utilizadores que têm FCM tokens registados
 */
const sendPushToAllUsers = async (title, body, data = {}) => {
  try {
    const users = await User.find({ fcmTokens: { $exists: true, $not: { $size: 0 } } });
    const tokens = users.flatMap((u) => u.fcmTokens);
    if (tokens.length === 0) return;
    // FCM suporta até 500 tokens por mensagem multicast
    const message = {
      notification: { title, body },
      data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
      tokens,
    };
    const response = await getMessaging().sendEachForMulticast(message);
    console.log(`Push enviado para ${response.successCount} dispositivos, ${response.failureCount} falhas`);
    // Opcional: remover tokens inválidos
    if (response.failureCount > 0) {
      const invalidTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success && resp.error.code === "messaging/invalid-registration-token") {
          invalidTokens.push(tokens[idx]);
        }
      });
      if (invalidTokens.length > 0) {
        await User.updateMany(
          { fcmTokens: { $in: invalidTokens } },
          { $pullAll: { fcmTokens: invalidTokens } }
        );
      }
    }
  } catch (error) {
    console.error("Erro ao enviar push para todos:", error.message);
  }
};

/**
 * Salva notificação in-app no MongoDB
 */
const saveInAppNotification = async (userId, type, title, body, data = {}) => {
  try {
    await Notification.create({ user: userId, type, title, body, data });
  } catch (error) {
    console.error("Erro ao salvar notificação:", error.message);
  }
};

/**
 * Salva notificação in-app para todos os admins + emite via Socket.io
 */
const notifyAdmins = async (io, type, title, body, data = {}) => {
  try {
    const admins = await User.find({ role: "admin" });
    const notifications = admins.map((admin) => ({
      user: admin._id,
      type,
      title,
      body,
      data,
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
    // Socket.io — emite evento para todos os admins conectados
    if (io) {
      io.to("admin-room").emit(type, { title, body, data, createdAt: new Date() });
    }
  } catch (error) {
    console.error("Erro ao notificar admins:", error.message);
  }
};

/**
 * Busca notificações não lidas de um utilizador
 */
const getUnreadNotifications = async (userId) => {
  return Notification.find({ user: userId, read: false }).sort({ createdAt: -1 }).limit(50);
};

/**
 * Marca notificação como lida
 */
const markAsRead = async (notificationId) => {
  return Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true });
};

export { sendPush, sendPushToAllUsers, saveInAppNotification, notifyAdmins, getUnreadNotifications, markAsRead };
