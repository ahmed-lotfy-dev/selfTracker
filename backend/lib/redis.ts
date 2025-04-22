import { createClient } from "redis"
import type { RedisClientType } from "redis"
let redisClient: RedisClientType | null = null // Ensure that the Redis client is properly typed

// Get Redis client
export async function getRedisClient(): Promise<RedisClientType> {
  // If the client is already initialized and connected, return it
  if (redisClient && redisClient.isOpen) {
    return redisClient
  }

  try {
    if (!redisClient) {
      // Create the Redis client
      redisClient = createClient({
        url: process.env.REDIS_URL,
        socket: {
          reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
        },
      })

      // Attempt to connect
      await redisClient.connect()
      console.log("Redis connected")
    }

    return redisClient
  } catch (err) {
    console.error("Redis connection error:", err)
    throw new Error("Failed to connect to Redis")
  }
}
