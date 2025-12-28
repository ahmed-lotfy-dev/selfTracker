console.log("[main.tsx] Script starting...");

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

console.log("[main.tsx] Imports loaded, mounting React...");

try {
  const root = document.getElementById("root");
  console.log("[main.tsx] Root element:", root);

  if (root) {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("[main.tsx] React render called successfully");
  } else {
    console.error("[main.tsx] CRITICAL: #root element not found!");
  }
} catch (e) {
  console.error("[main.tsx] CRITICAL ERROR during mount:", e);
}
