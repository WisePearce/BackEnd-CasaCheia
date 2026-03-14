import redis from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = redis.createClient({
  url: process.env.NODE_ENV === "production" ? process.env.REDIS_URL : process.env.REDIS_URL_DEV
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Conectado ao Redis com sucesso!');
});

// Conectar ao Redis
(async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (err) {
    // Isso evita que sua aplicação trave silenciosamente se o Redis Cloud falhar
    console.error('Erro ao conectar no Redis:', err);
  }
})();

export default redisClient;