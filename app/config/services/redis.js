import { Redis as UpstashRedis } from "@upstash/redis"
import { createClient } from "redis"
import dotenv from "dotenv"

dotenv.config()

let redisClient

// Upstash (REST) — usa as variáveis UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const upstash = new UpstashRedis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })

  // Adaptar a interface para ser compatível com os controllers existentes
  redisClient = {
    setEx: (key, seconds, value) => upstash.setex(key, seconds, value),
    get: (key) => upstash.get(key),
    del: (key) => upstash.del(key),
    ttl: (key) => upstash.ttl(key),
  }


} else {
  // Redis TCP padrão (desenvolvimento local)
  const url = process.env.NODE_ENV === "production" ? process.env.REDIS_URL : process.env.REDIS_URL_DEV
  const tcpClient = url ? createClient({ url, socket: { reconnectStrategy: () => false } }) : null

  if (tcpClient) {
    tcpClient.on("error", (err) => console.error("Redis Client Error:", err.message))


    // Adaptar interface
    redisClient = {
      setEx: (key, seconds, value) => tcpClient.setEx(key, seconds, value),
      get: (key) => tcpClient.get(key),
      del: (key) => tcpClient.del(key),
      ttl: (key) => tcpClient.ttl(key),
    }

    ;(async () => {
      try {
        if (!tcpClient.isOpen) await tcpClient.connect()
      } catch (err) {
        // Apenas log, app continua
      }
    })()
  }
}

// Fallback: se não houver Redis configurado, retorna erros nas operações
if (!redisClient) {
  console.warn("Redis: NENHUM servidor configurado. SMS de verificação não funcionará.")
  redisClient = {
    setEx: () => { throw new Error("Redis não configurado") },
    get: () => { throw new Error("Redis não configurado") },
    del: () => { throw new Error("Redis não configurado") },
    ttl: () => { throw new Error("Redis não configurado") },
  }
}

export default redisClient
