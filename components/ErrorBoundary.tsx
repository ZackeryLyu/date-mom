import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-red-600 bg-red-50 min-h-screen flex flex-col items-center justify-center font-sans">
          <div className="bg-white p-6 rounded-xl shadow-xl border border-red-200 w-full max-w-md">
            <h1 className="text-xl font-bold mb-4 flex items-center">
              ⚠️ 发生错误 (Error)
            </h1>
            <p className="text-sm text-gray-600 mb-2">抱歉，应用遇到了一些问题：</p>
            <pre className="text-xs bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-48 whitespace-pre-wrap break-all">
              {this.state.error?.toString()}
            </pre>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    return this.