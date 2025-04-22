import { createClient } from "redis"
import type { RedisClientType } from "redis"

let redisClient: RedisClientType | null = null
const REDIS_CONNECTION_TIMEOUT = 5000 // 5 seconds

export async function getRedisClient(): Promise<RedisClientType> {
  if (redisClient && redisClient.isOpen) return redisClient

  try {
    if (!redisClient) {
      redisClient = createClient({
        url: process.env.REDIS_URL,
        socket: {
          reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
          connectTimeout: REDIS_CONNECTION_TIMEOUT,
        },
      })

      redisClient.on("error", (err) => {
        console.error("Redis error:", err)
      })

      redisClient.on("end", () => {
        console.warn("Redis connection ended")
        redisClient = null
      })

      redisClient.on("close", () => {
        console.warn("Redis connection closed")
        redisClient = null
      })

      // Add timeout for the connection attempt
      await Promise.race([
        redisClient.connect(),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Redis connection timeout")),
            REDIS_CONNECTION_TIMEOUT
          )
        ),
      ])

      console.log("Redis connected")
    }

    return redisClient
  } catch (err) {
    console.error("Redis connection error:", err)
    redisClient = null
    throw err // Re-throw the original error
  }
}
