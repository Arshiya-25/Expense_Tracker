// ErrorBoundary component to prevent cascading widget rendering crashes
import React from "react";
import { AlertTriangle } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an exception:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "20px",
            background: "rgba(255, 140, 168, 0.05)",
            border: "1px solid var(--red-dim)",
            borderRadius: "var(--radius-lg)",
            color: "var(--red)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            minHeight: "140px",
          }}
        >
          <AlertTriangle size={24} style={{ marginBottom: "8px" }} />
          <h4 style={{ fontSize: "14px", fontWeight: 600, margin: "0 0 4px" }}>Widget unavailable</h4>
          <p style={{ fontSize: "12px", color: "var(--text3)", margin: 0, maxWidth: "240px" }}>
            This card failed to load correctly. Please check console logs.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
