import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8 bg-black/50 border border-red-900/20 relative overflow-hidden">
          {/* Diagnostic Grid Background */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[linear-gradient(to_right,#ff000044_1px,transparent_1px),linear-gradient(to_bottom,#ff000044_1px,transparent_1px)] bg-[size:16px_16px]" />
          
          <div className="text-center max-w-md relative z-10">
            <div className="flex justify-center mb-6">
              <div className="bg-red-500/10 p-5 rounded-none border border-red-500/20 flex flex-col items-center">
                <AlertTriangle className="h-10 w-10 text-red-500 animate-pulse" />
                <span className="text-[10px] font-mono text-red-500 mt-2 font-bold tracking-[0.3em] uppercase">System_Crash</span>
              </div>
            </div>
            <h2 className="text-2xl font-heading font-black text-white mb-2 uppercase tracking-tighter">
              CRITICAL_SYNTAX_ERROR
            </h2>
            <p className="font-mono text-[10px] text-red-500/60 mb-8 uppercase tracking-[0.2em]">
              The orchestration layer has encountered an unhandled exception. Signal integrity compromised.
            </p>
            
            {this.state.error && (
              <div className="mb-8 text-left border border-white/5 bg-black/80">
                <div className="px-3 py-1 bg-white/[0.03] border-b border-white/5 flex justify-between items-center text-[8px] font-mono text-white/30 tracking-widest uppercase">
                   <span>Error_Dump</span>
                   <span>0xFE_882</span>
                </div>
                <pre className="p-4 text-[10px] font-mono text-white/40 overflow-auto max-h-40 leading-relaxed uppercase selection:bg-red-500 selection:text-white">
                  {`MESSAGE: ${this.state.error.message}`}
                  {this.state.errorInfo?.componentStack && (
                    `\n\nSTACK_TRACE:\n${this.state.errorInfo.componentStack}`
                  )}
                </pre>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                variant="outline" 
                onClick={this.handleReset}
                className="bg-transparent border-white/10 hover:border-white hover:bg-white text-white hover:text-black font-mono text-[10px] uppercase tracking-widest rounded-none h-11 px-8 transition-all"
              >
                REQUEST_RETRY
              </Button>
              <Button 
                onClick={this.handleReload}
                className="bg-red-600 border-none hover:bg-red-500 text-white font-mono text-[10px] uppercase tracking-widest rounded-none h-11 px-8 transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)]"
              >
                <RefreshCw className="h-3 w-3 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                HARD_REBOOT
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
