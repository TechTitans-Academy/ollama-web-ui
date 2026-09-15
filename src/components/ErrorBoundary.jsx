import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Markdown Render Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-3 bg-red-950/40 border border-red-800 rounded-lg text-red-200 text-xs font-mono my-2 whitespace-pre-wrap">
          {this.props.rawContent || "Error rendering content snippet."}
        </div>
      );
    }

    return this.props.children;
  }
}
