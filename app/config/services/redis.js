import redis from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisUrl = process.env.NODE_ENV === "production" ? process.env.REDIS_URL : process.env.REDIS_URL_DEV;

const redisClient = redis.createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => {
      // Parar de tentar reconectar após a 1ª falha para evitar spam de erros
      console.error(`Redis: falha ao conectar (tentativa ${retries}). A desistir.`);
      return false;
    }
  }
});

redisClient.on('error', (err) => {
  // Apenas log se for depois de já termos desistido de reconectar
  if (redisUrl) {
    console.error('Redis Client Error:', err.message);
  }
});

redisClient.on('connect', () => {
  console.log('Conectado ao Redis com sucesso!');
});

// Conectar ao Redis (falha silenciosa — app funciona sem Redis)
(async () => {
  if (!redisUrl) return;
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (err) {
    // App continua funcionando sem Redis (apenas SMS de verificação)
  }
})();

export default redisClient;