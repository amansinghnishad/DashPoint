import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (typeof import.meta !== "undefined" && import.meta.env?.MODE !== "test") {
      console.error("[ErrorBoundary] Caught unhandled rendering exception:", error, errorInfo);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-canvas p-6">
          <div className="max-w-md w-full p-8 rounded-2xl border border-hairline bg-surface-card shadow-2xl text-center space-y-4">
            <div className="h-12 w-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <h2 className="text-xl font-bold text-ink tracking-tight">Something went wrong</h2>
            <p className="text-sm text-muted leading-relaxed">
              An unexpected render error occurred. You can reload the application to restore state.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="dp-btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
