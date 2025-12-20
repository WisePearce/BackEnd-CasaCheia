import redis from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = redis.createClient({
    url: process.env.REDIS_URL,
    socket: {
        reconnectStrategy: retries => {
            if (retries >= 10) {
                return new Error('Excedeu o número máximo de tentativas de reconexão ao Redis');
            }
            return Math.min(retries * 50, 500);
        }
    }
});
redisClient.on('error', (err) => console.log('Erro no Redis Client', err));

await redisClient.on('connect', () => {
    console.log('Conectado ao Redis com sucesso');
});

await redisClient.connect();