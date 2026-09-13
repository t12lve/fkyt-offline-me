import React from 'react';
import { AlertOctagon, RotateCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Crash intercepté par ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-screen bg-[#07050d] text-purple-200 flex flex-col items-center justify-center p-6 select-none font-sans">
          <div className="w-full max-w-xl glass-panel rounded-3xl p-6 border-red-500/40 shadow-[0_0_50px_rgba(239,68,68,0.25)] relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-950/70 border border-red-500/50 flex items-center justify-center text-red-400 shrink-0">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-wide">
                  Erreur d'initialisation de l'interface
                </h1>
                <p className="text-xs text-purple-300/70 font-mono">
                  fkYT offline me • Diagnostic de plantage
                </p>
              </div>
            </div>

            <div className="bg-black/60 rounded-xl p-3 border border-red-500/20 text-xs font-mono text-red-300 mb-5 max-h-48 overflow-y-auto break-all">
              {this.state.error?.toString()}
              {this.state.errorInfo?.componentStack && (
                <div className="mt-2 text-[10px] text-purple-400/60 whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-800/80 border border-purple-500/40 text-xs font-semibold text-white flex items-center gap-2 transition-all cursor-pointer"
              >
                <RotateCw className="w-4 h-4" />
                <span>Recharger l'application</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
