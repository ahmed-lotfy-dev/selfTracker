import { Hono } from "hono"
import { auth } from "../../lib/auth.js"

const desktopAuthRouter = new Hono()

// System browser visits this to initiate OAuth — sets cookie, redirects to provider
desktopAuthRouter.get("/desktop/:provider", async (c) => {
  const { provider } = c.req.param()
  const callbackURL = c.req.query("callbackURL") || "selftracker://auth"
  try {
    const body = JSON.stringify({ provider, callbackURL })
    const host = c.req.header("host") || "selftracker.ahmedlotfy.site"
    const url = `https://${host}/api/auth/sign-in/social`
    const headers = new Headers(c.req.raw.headers)
    headers.set("Content-Type", "application/json")
    headers.set("Origin", `https://${host}`)
    const synthetic = new Request(url, { method: "POST", headers, body })
    const authRes = await auth.handler(synthetic)
    const txt = await authRes.text()
    let data: any
    try { data = JSON.parse(txt) } catch { data = null }
    if (data?.url) {
      const setCookie = authRes.headers.get("set-cookie")
      if (setCookie) c.header("Set-Cookie", setCookie)
      return c.redirect(data.url, 302)
    }
    return c.json({ error: "Failed to initiate OAuth", raw: txt }, 500)
  } catch (e: any) {
    console.error("[Desktop OAuth] Failed:", e)
    return c.html(`<html><body style="font-family:system-ui;background:#09090b;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column;gap:20px;text-align:center;padding:20px"><h2 style="margin:0">Authentication Failed</h2><p style="color:#a1a1aa">${e?.message || "Could not initiate sign-in"}</p></body></html>`)
  }
})

export default desktopAuthRouter
