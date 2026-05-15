import { createClient } from "redis"

const redisClient = createClient({
  url: process.env.REDIS_URL,
})

redisClient.on("error", (err) => console.error("Redis Client Error", err))
redisClient.on("connect", () => console.log("Connected to Redis"))
redisClient.on("close", () => console.log("Disconnected from Redis"))

await redisClient.connect()

export const getCache = async (key: string) => {
  try {
    const data = await redisClient.get(key)
    if (!data) return null
    try {
      return JSON.parse(data)
    } catch {
      await redisClient.del(key)
      return null
    }
  } catch (err) {
    console.error("Cache get error:", err)
    return null
  }
}

export const setCache = async (key: string, ttl: number, value: any) => {
  try {
    const serialized = JSON.stringify(value)
    await redisClient.set(key, serialized, { EX: ttl })
    return true
  } catch (err) {
    console.error("Cache set error:", err)
    return false
  }
}

export async function clearCache(keys: string | string[]) {
  try {
    const patterns = Array.isArray(keys) ? keys : [keys]

    for (const rawPattern of patterns) {
      if (rawPattern.includes("*")) {
        const keysToDelete: string[] = []

        for await (const key of redisClient.scanIterator({
          MATCH: rawPattern,
          COUNT: 100,
        })) {
          keysToDelete.push(key)
        }

        for (const key of keysToDelete) {
          await redisClient.del(key)
        }

        console.log(
          `[Redis] Cleared ${keysToDelete.length} keys matching pattern: ${rawPattern}`
        )
      } else {
        console.log(`[Redis] Skipping cache clear for key: ${rawPattern}`)
      }
    }
  } catch (err) {
    console.error("[Redis] clearCache error (non-fatal):", err)
  }
}
