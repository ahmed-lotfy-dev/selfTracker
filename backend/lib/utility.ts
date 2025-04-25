import { getRedisClient } from "./redis"

const redisClient = getRedisClient()

export const clearLogsCache = async (userId: string, logs: string) => {
  const keys = await redisClient.keys(`${logs}:${userId}:*`)

  if (keys.length > 0) {
    await Promise.all(keys.map((key) => redisClient.del(key)))
  }
}
