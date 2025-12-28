import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";

// --- DEBUG CONSOLE FOR PRODUCTION ---
function DebugConsole() {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const addLog = (type: string, args: any[]) => {
      const message = args.map(a =>
        typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
      ).join(' ');
      setLogs(prev => [`[${type}] ${message}`, ...prev].slice(0, 50));
    };

    console.log = (...args) => {
      addLog('LOG', args);
      originalLog.apply(console, args);
    };
    console.error = (...args) => {
      addLog('ERR', args);
      originalError.apply(console, args);
    };
    console.warn = (...args) => {
      addLog('WARN', args);
      originalWarn.apply(console, args);
    };

    window.addEventListener('error', (e) => {
      addLog('WIN_ERR', [e.message, e.filename, e.lineno]);
    });

    window.addEventListener('unhandledrejection', (e) => {
      addLog('PROMISE', [e.reason]);
    });

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  if (logs.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '200px',
      backgroundColor: 'rgba(0,0,0,0.85)',
      color: '#0f0',
      fontFamily: 'monospace',
      fontSize: '12px',
      overflowY: 'auto',
      zIndex: 99999,
      padding: '10px',
      pointerEvents: 'none' // Let clicks pass through
    }}>
      {logs.map((log, i) => (
        <div key={i} style={{ borderBottom: '1px solid #333', marginBottom: '4px' }}>{log}</div>
      ))}
    </div>
  );
}

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) throw new Error("Root element not found");

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <DebugConsole />
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
} catch (e) {
  console.error("🔥 [Main] Fatal startup error:", e);
  document.body.innerHTML = `<div style="color:red; padding: 20px;"><h1>Fatal Startup Error</h1><pre>${e instanceof Error ? e.message : String(e)}</pre></div>`;
}
