import type { MiddlewareHandler } from "hono"
import { logger } from "../lib/logger.js"

export const loggerMiddleware: MiddlewareHandler = async (c, next) => {
  const start = Date.now()
  const { method, path } = c.req

  c.set("logger", logger)

  logger.info({
    msg: "Incoming request",
    method,
    path,
    ip: c.req.header("x-forwarded-for") || c.env?.incoming?.socket?.remoteAddress,
    origin: c.req.header("origin"),
  })

  await next()

  const end = Date.now()
  const status = c.res.status

  logger.info({
    msg: "Request completed",
    method,
    path,
    status,
    durationMs: end - start,
  })
}
