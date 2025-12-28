import { useEffect, useState } from "react";

export function DebugConsole() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Toggle on Ctrl+Shift+D
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for both D cases just to be safe
      if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        setIsVisible(prev => !prev);
        console.log("Debug console toggled");
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const addLog = (type: string, args: any[]) => {
      // Safe stringify to prevent circular reference errors or massive objects
      const message = args.map(a => {
        try {
          return typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a);
        } catch (e) {
          return '[Circular/Unserializable]';
        }
      }).join(' ');
      setLogs(prev => [`[${type}] ${message}`, ...prev].slice(0, 50));
    };

    console.log = (...args) => {
      addLog('LOG', args);
      // init log might not be defined if consoles are swapped too early, but usually fine
      if (originalLog) originalLog.apply(console, args);
    };
    console.error = (...args) => {
      addLog('ERR', args);
      if (originalError) originalError.apply(console, args);
    };
    console.warn = (...args) => {
      addLog('WARN', args);
      if (originalWarn) originalWarn.apply(console, args);
    };

    const handleError = (e: ErrorEvent) => {
      addLog('WIN_ERR', [e.message, e.filename, e.lineno]);
    };

    const handleRejection = (e: PromiseRejectionEvent) => {
      addLog('PROMISE', [e.reason]);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  if (!isVisible && logs.length === 0) return null;
  if (!isVisible) return null; // Only show if toggled on, even if logs exist? 
  // No, original code: if (!isVisible || logs.length === 0) return null;
  // But wait, if I toggle it ON, I want to see it even if empty? 
  // Original logic: returns null if not visible OR no logs. 
  // Better logic: return null if not visible. If visible, show even if empty (so I know it works).

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '300px', // Increased height
      backgroundColor: 'rgba(0,0,0,0.9)',
      color: '#0f0',
      fontFamily: 'monospace',
      fontSize: '12px',
      overflowY: 'auto',
      zIndex: 99999,
      padding: '10px',
      borderTop: '2px solid #0f0'
    }}>
      <div style={{ borderBottom: '1px solid #333', marginBottom: '5px', paddingBottom: '5px', fontWeight: 'bold' }}>
        Debug Console (Ctrl+Shift+D to close) - {logs.length} logs
      </div>
      {logs.map((log, i) => (
        <div key={i} style={{ borderBottom: '1px solid #333', marginBottom: '4px', whiteSpace: 'pre-wrap' }}>{log}</div>
      ))}
    </div>
  );
}
