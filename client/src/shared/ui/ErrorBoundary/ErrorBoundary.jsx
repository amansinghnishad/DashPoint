import React from "react";
import { Link } from "react-router-dom";

import ErrorState from "../ErrorState/ErrorState";

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
        <ErrorState
          eyebrow="The page hit an error"
          title="We couldn’t load this view"
          description="Your work is still saved. Reload the page to try again, or return home and continue from there."
        >
          <button
            type="button"
            onClick={this.handleReload}
            className="dp-btn-primary inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold transition-opacity hover:opacity-90"
          >
            Reload Application
          </button>
          <Link
            to="/"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-hairline px-5 text-sm font-semibold text-ink transition-colors hover:bg-canvas-soft"
          >
            Go to home
          </Link>
        </ErrorState>
      );
    }

    return this.props.children;
  }
}
