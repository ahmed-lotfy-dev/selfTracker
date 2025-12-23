import type { MiddlewareHandler } from "hono";
import { auth } from "../../lib/auth.js";

/**
 * Middleware to authenticate requests using better-auth session tokens.
 * Checks for session token in Cookie or Authorization Bearer header.
 */
export const authMiddleware: MiddlewareHandler = async (c, next) => {
  try {
    const token = c.req.query('token');
    const finalHeaders = new Headers(c.req.raw.headers);

    // Normalize protocol for Better Auth (wss -> https)
    const proto = finalHeaders.get('x-forwarded-proto');
    if (proto === 'wss') finalHeaders.set('x-forwarded-proto', 'https');

    // If token is provided in query (e.g. from mobile WebSocket), inject it into headers
    if (token) {
      finalHeaders.set('Authorization', `Bearer ${token}`);
      finalHeaders.set('Cookie', `better-auth.session_token=${token}; __Secure-better-auth.session_token=${token}`);
    }

    const session = await auth.api.getSession({ headers: finalHeaders });
    const log = c.get("logger");

    if (!session) {
      console.warn(`[AuthMiddleware] Session not found | Path: ${c.req.path} | Auth Found: ${!!finalHeaders.get('Authorization')} | Cookie Found: ${!!finalHeaders.get('Cookie')} | Proto: ${proto}`);

      if (log) {
        log.info({
          msg: "[AuthMiddleware] Session not found",
          path: c.req.path,
          fullUrl: c.req.url,
          hasTokenInQuery: !!token,
          authHeader: finalHeaders.get('Authorization')?.substring(0, 15),
          cookieHeader: finalHeaders.get('Cookie')?.substring(0, 40),
          host: finalHeaders.get('host'),
        });
      }
      return c.json({ error: "Unauthorized" }, 401);
    }

    c.set("user", session.user);
    c.set("session", session.session);

    await next();
  } catch (error) {
    console.error("[AuthMiddleware] Error validating session:", error);
    return c.json({ error: "Unauthorized" }, 401);
  }
};
