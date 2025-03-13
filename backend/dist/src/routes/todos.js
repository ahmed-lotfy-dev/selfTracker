import { Hono } from "hono";
import { db } from "../db/index.js";
import { todoItems, users } from "../db/schema";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../../middleware/middleware.js";
import { sign, verify, decode } from "hono/jwt";
import { hash, verify as verifyHash } from "argon2";
const todosRouter = new Hono();
todosRouter.use("*", authMiddleware);
// Get all Todos
todosRouter.get("/", async (c) => {
    const user = c.get("user");
    const userTodos = await db.query.todoItems.findMany({
        where: eq(todoItems.userId, user.userId),
    });
    return c.json({ success: "true", todos: userTodos });
});
// Create Todo
todosRouter.post("/add", async (c) => {
    const user = c.get("user");
    const { title, description, completed, dueDate, category } = await c.req.json();
    try {
        const createdTodo = await db
            .insert(todoItems)
            .values({
            userId: user.id,
            title,
            description,
            completed,
            dueDate,
            category,
        })
            .returning();
        return c.json({
            success: "true",
            message: "Todo created successfully",
            todo: createdTodo[0],
        });
    }
    catch (error) {
        console.error("Error creating Todo:", error);
        return c.json({ success: "false", message: "Error creating Todo" }, 500);
    }
});
// Update Todo
todosRouter.patch("/:id", async (c) => {
    const { id, title, description, completed, dueDate, category } = await c.req.json();
    try {
        if (!id) {
            throw new Error("Todo ID is required");
        }
        const todo = await db.query.todoItems.findFirst({
            where: eq(todoItems.id, id),
        });
        if (!todo) {
            return c.json({ success: false, message: "Todo not found" }, 404);
        }
        const updatedTodo = await db
            .update(todoItems)
            .set({ ...todo, title, description, completed, dueDate, category })
            .where(eq(todoItems.id, id))
            .returning();
        return c.json({
            success: "true",
            message: "Todo updated successfully",
            user: updatedTodo[0],
        });
    }
    catch (error) {
        console.error("Error updating Todo:", error);
        return c.json({ success: "false", message: "Error updating Todo" }, 500);
    }
});
// Delete Todo
todosRouter.delete("/:id", async (c) => {
    const user = c.get("user");
    const id = c.req.param("id");
    const deletedUser = await db
        .delete(todoItems)
        .where(eq(todoItems.id, id))
        .returning();
    if (!deletedUser.length) {
        return c.json({ message: "Todo not found" }, 404);
    }
    return c.json({ message: "Todo deleted successfully" });
});
export default todosRouter;
