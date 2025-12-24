import redis from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = redis.createClient({
  url: process.env.REDIS_URL_DEV || process.env.REDIS_URL_PRODUCTION,
  password: process.env.REDIS_PASSWORD || null
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Conectado ao Redis com sucesso!');
});

// Conectar ao Redis
(async () => {
  await redisClient.connect();
})();

export default redisClient;