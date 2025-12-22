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

    let session;
    // Synthesis: combine raw headers with our injected ones
    const finalHeaders = new Headers(c.req.raw.headers);

    // Normalize protocol for Better Auth (wss -> https)
    const proto = finalHeaders.get('x-forwarded-proto');
    if (proto === 'wss') finalHeaders.set('x-forwarded-proto', 'https');

    if (token) {
      // For WebSocket/Query-token based requests
      finalHeaders.set('Authorization', `Bearer ${token}`);
      finalHeaders.set('Cookie', `better-auth.session_token=${token}; __Secure-better-auth.session_token=${token}`);
      session = await auth.api.getSession({ headers: finalHeaders });
    } else {
      // For standard HTTP requests, use the normalized headers
      session = await auth.api.getSession({ headers: finalHeaders });
    }
    const log = c.get("logger");

    if (!session) {
      if (log) log.info({
        msg: "[AuthMiddleware] Session not found",
        path: c.req.path,
        fullUrl: c.req.url,
        hasTokenInQuery: !!token,
        authHeader: headers.get('Authorization')?.substring(0, 15),
        cookieHeader: headers.get('Cookie')?.substring(0, 40),
        host: headers.get('host'),
        forwardedProto: headers.get('x-forwarded-proto'),
        forwardedHost: headers.get('x-forwarded-host')
      });
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
