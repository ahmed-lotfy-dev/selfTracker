import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { logger } from "hono/logger";
import authRouter from "./routes/auth.js";
import { aj, isSpoofed } from "../lib/arcjet.js";
import userRouter from "./routes/users.js";
import { authMiddleware } from "../middleware/middleware.js";
import expensesRoute from "./routes/expenses.js";
const app = new Hono();
app.use(logger());
app.route("/api/auth", authRouter);
app.use("/api/users", authMiddleware);
app.route("/api/users", userRouter);
app.use("/api/expenses", authMiddleware);
app.route("/api/expenses", expensesRoute);
app.get("/", async (c) => {
    const headers = Object.fromEntries(c.req.raw.headers.entries());
    const decision = await aj.protect(headers, { requested: 5 }); // Deduct 5 tokens from the bucket
    console.log("Arcjet decision", decision.conclusion);
    if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
            return c.json({ error: "Too many requests" }, 429);
        }
        else if (decision.reason.isBot()) {
            return c.json({ error: "No bots allowed" }, 403);
        }
        else {
            return c.json({ error: "Forbidden" }, 403);
        }
    }
    // Arcjet Pro plan verifies the authenticity of common bots using IP data.
    // Verification isn't always possible, so we recommend checking the decision
    // separately.
    // https://docs.arcjet.com/bot-protection/reference#bot-verification
    if (decision.results.some(isSpoofed)) {
        return c.json({ error: "Forbidden" }, 403);
    }
    return c.json({ message: "Hello world" });
});
app.get("/api/error", () => {
    throw new Error("error triggered");
});
app.onError((err, c) => {
    return c.json({
        success: false,
        message: "An error occurred",
        error: err.message,
    }, 500);
});
serve({
    fetch: app.fetch,
    port: parseInt(process.env.PORT),
});
console.log(process.env.PORT);
console.log(`Server is running on http://localhost:${process.env.PORT}`);
