import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="h-screen w-full flex items-center justify-center bg-background text-foreground p-8">
          <div className="max-w-md w-full p-6 bg-destructive/10 border border-destructive/20 rounded-lg space-y-4">
            <h2 className="text-xl font-bold text-destructive flex items-center gap-2">
              <span>⚠️</span> Something went wrong
            </h2>
            <div className="p-4 bg-background rounded border font-mono text-xs overflow-auto max-h-[300px]">
              <p className="font-bold mb-2">{this.state.error?.name}: {this.state.error?.message}</p>
              <pre className="text-muted-foreground whitespace-pre-wrap">
                {this.state.error?.stack}
              </pre>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 text-sm font-medium"
              >
                Reload App
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
