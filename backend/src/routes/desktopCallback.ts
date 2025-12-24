import { Hono } from "hono"
import { auth } from "../../lib/auth.js"

const desktopCallbackRouter = new Hono()

desktopCallbackRouter.get("/desktop-success", async (c) => {
  // Get the session from the cookie that better-auth set
  const session = await auth.api.getSession({
    headers: c.req.raw.headers
  })

  // If no session, show error or redirect to login
  if (!session) {
    return c.html(`
      <html>
        <body style="font-family: system-ui; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
          <h2>Authentication Failed</h2>
          <p>Could not retrieve session info.</p>
        </body>
      </html>
    `)
  }

  const token = session.session.token

  // HTML page that redirects to custom protocol and closes itself
  return c.html(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Authentication Successful</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
            color: #333;
          }
          .card {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 400px;
          }
          h2 { margin-top: 0; color: #10b981; }
          p { color: #666; margin-bottom: 1.5rem; }
          .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #10b981;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          button {
            background: #2563eb;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9rem;
          }
          button:hover { background: #1d4ed8; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="spinner"></div>
          <h2>Authentication Successful</h2>
          <p>Redirecting back to SelfTracker...</p>
          <button onclick="window.close()">Close this tab</button>
        </div>
        <script>
          // The deep link URL
          const deepLink = "selftracker://auth?token=${token}";
          
          // Attempt redirect
          window.location.href = deepLink;

          // Attempt to close the tab after a delay
          setTimeout(() => {
            window.close();
          }, 2000);
        </script>
      </body>
    </html>
  `)
})

export default desktopCallbackRouter
