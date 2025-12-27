import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) throw new Error("Root element not found");

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
} catch (e) {
  console.error("🔥 [Main] Fatal startup error:", e);
  document.body.innerHTML = `<div style="color:red; padding: 20px;"><h1>Fatal Startup Error</h1><pre>${e instanceof Error ? e.message : String(e)}</pre></div>`;
}
