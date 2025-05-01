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

    // Extra validation for malformed JSON
    try {
      return JSON.parse(data)
    } catch (parseError) {
      console.error("JSON parse error for key:", key, "Data:", data)
      await redisClient.del(key) // Clean up invalid data
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
    const result = await redisClient.set(key, serialized, { EX: ttl })
    return result === "OK"
  } catch (err) {
    console.error("Cache set error:", err)
    return false
  }
}

export async function clearCache(keys: string | string[]) {
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

      if (keysToDelete.length > 0) {
        await redisClient.del(keysToDelete)
        console.log(
          `[Redis] Cleared ${keysToDelete.length} keys matching pattern: ${rawPattern}`
        )
      } else {
        console.log(`[Redis] No keys matched for pattern: ${rawPattern}`)
      }
    } else {
      // Handle exact key deletion
      const deleted = await redisClient.del(rawPattern)

      if (deleted > 0) {
        console.log(`[Redis] Deleted exact key: ${rawPattern}`)
      } else {
        console.log(`[Redis] Key not found: ${rawPattern}`)
      }
    }
  }
}
