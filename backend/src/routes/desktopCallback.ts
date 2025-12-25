import { Hono } from "hono"
import { auth } from "../../lib/auth.js"

const desktopCallbackRouter = new Hono()

desktopCallbackRouter.get("/desktop-success", async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers
  })

  if (!session) {
    return c.html(`
      <html>
        <body style="font-family: system-ui; background: #09090b; color: #ef4444; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
          <div style="text-align: center; padding: 20px;">
            <h2 style="margin: 0;">Authentication Failed</h2>
            <p style="color: #a1a1aa;">Could not retrieve session info.</p>
          </div>
        </body>
      </html>
    `)
  }

  const token = session.session.token

  return c.html(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Returning to SelfTracker...</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background-color: #09090b; /* Match App's Dark Mode */
            color: #ffffff;
            overflow: hidden;
          }
          .container {
            text-align: center;
            animation: fadeIn 0.4s ease-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .spinner {
            border: 2px solid rgba(255,255,255,0.1);
            border-top: 2px solid #3b82f6;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 0.8s linear infinite;
            margin: 0 auto 20px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          h2 { font-weight: 500; font-size: 1.2rem; margin: 0; color: #f4f4f5; }
          p { color: #a1a1aa; font-size: 0.9rem; margin-top: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="spinner"></div>
          <h2>Authentication Successful</h2>
          <p>You can close this tab if it doesn't close automatically.</p>
        </div>
        <script>
          const deepLink = "selftracker://auth?token=${token}";
          window.location.href = deepLink;
          
          // Try to close immediately
          setTimeout(() => {
            window.close();
          }, 300);

          // Fallback if window.close is blocked
          setTimeout(() => {
            document.querySelector("p").innerText = "You can now safely return to the SelfTracker app.";
          }, 3000);
        </script>
      </body>
    </html>
  `)
})

export default desktopCallbackRouter
