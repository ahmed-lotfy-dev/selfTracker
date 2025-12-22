import type { MiddlewareHandler } from "hono";
import { auth } from "../../lib/auth.js";

/**
 * Middleware to authenticate requests using better-auth session tokens.
 * Checks for session token in Cookie or Authorization Bearer header.
 */
export const authMiddleware: MiddlewareHandler = async (c, next) => {
  try {
    const token = c.req.query('token');
    const headers = new Headers(c.req.raw.headers);

    if (token) {
      // Inject token into headers for WebSocket authentication
      headers.set('Authorization', `Bearer ${token}`);
      // Fallback: also set as cookies as better-auth may prefer this in some configurations
      headers.set('Cookie', `better-auth.session_token=${token}; __Secure-better-auth.session_token=${token}`);
    }

    const session = await auth.api.getSession({ headers });
    const log = c.get("logger");

    if (!session) {
      if (log) log.info({ msg: "[AuthMiddleware] Session not found", path: c.req.path });
      return c.json({ error: "Unauthorized" }, 401);
    }

    c.set("user", session.user);
    c.set("session", session.session);
  } catch (error) {
    console.error("[AuthMiddleware] Error validating session:", error);
    return c.json({ error: "Unauthorized" }, 401);
  }

  await next();
};
