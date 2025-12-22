import type { MiddlewareHandler } from "hono";
import { auth } from "../../lib/auth.js";

/**
 * Middleware to authenticate requests using better-auth session tokens.
 * Checks for session token in Cookie or Authorization Bearer header.
 */
export const authMiddleware: MiddlewareHandler = async (c, next) => {
  try {
    // Use better-auth's session() method which handles both Cookie and Bearer
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (session?.user) {
      c.set("user", session.user);
      c.set("session", session.session);
    }
  } catch (error) {
    console.error("[AuthMiddleware] Error validating session:", error);
  }

  await next();
};
