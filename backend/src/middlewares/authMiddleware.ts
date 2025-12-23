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

    console.log(`[AuthMiddleware] Request Path: ${c.req.path} | Has Auth: ${!!finalHeaders.get('Authorization')} | Has Cookie: ${!!finalHeaders.get('Cookie')} | Host: ${finalHeaders.get('host')}`);

    if (finalHeaders.get('Authorization')) {
      console.log(`[AuthMiddleware] Auth Header Snippet: ${finalHeaders.get('Authorization')?.substring(0, 20)}...`);
    }

    if (!session) {
      console.warn(`[AuthMiddleware] Session NOT FOUND for request to ${c.req.path}`);
      console.warn(`[AuthMiddleware] BETTER_AUTH_URL: ${process.env.BETTER_AUTH_URL}`);
      console.warn(`[AuthMiddleware] Request Host: ${finalHeaders.get('host')}`);

      if (log) {
        log.info({
          msg: "[AuthMiddleware] Session not found",
          path: c.req.path,
          fullUrl: c.req.url,
          hasTokenInQuery: !!token,
          authHeader: finalHeaders.get('Authorization')?.substring(0, 15),
          cookieHeader: finalHeaders.get('Cookie')?.substring(0, 40),
          host: finalHeaders.get('host'),
          betterAuthUrl: process.env.BETTER_AUTH_URL,
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