import { createClient } from "redis"

const redisClient = createClient({
  url: process.env.REDIS_URL,
})

redisClient.on("error", (err) => console.error("Redis Client Error", err))
redisClient.on("connect", () => console.log("Connected to Redis"))
redisClient.on("close", () => console.log("Disconnected from Redis"))

await redisClient.connect()

export const setCache = async (key: string, ttl: number, data: any) =>
  redisClient.set(key, JSON.stringify(data), { EX: ttl })

export const getCache = async (key: string) => redisClient.get(key)

export const clearCache = async (keys: string | string[]) => {
  const keyList = Array.isArray(keys) ? keys : [keys]
  const deletePromises = keyList.map(async (key) => {
    if (key.includes("*")) {
      // Find and delete keys matching the pattern
      const keysToDelete = await redisClient.keys(key)
      if (keysToDelete.length) {
        await redisClient.del(keysToDelete)
      }
    } else {
      await redisClient.del(key)
    }
  })

  await Promise.all(deletePromises)
}
