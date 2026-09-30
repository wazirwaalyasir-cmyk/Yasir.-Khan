import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fcfaff] dark:bg-[#14101c] flex items-center justify-center p-4 font-sans text-center">
          <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-[#1f172c] border border-purple-200 dark:border-purple-900/50 shadow-xl space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              پشتو شاعری • Pashto Poetry
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-pashto">
              په پاڼه کې یوه ناڅاپي ستونزه رامنځته شوه. مهرباني وکړئ لاندې تڼۍ په کښېکاږلو پاڼه له سره تازه کړئ.
            </p>
            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
              <span>بیا هڅه وکړئ (Reload)</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
