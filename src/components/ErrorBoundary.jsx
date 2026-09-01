import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', fontFamily: 'monospace', maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '24px', color: '#dc2626', marginBottom: '16px' }}>
            App Error (ErrorBoundary)
          </h1>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '13px', lineHeight: '1.6' }}>
            {this.state.error?.toString()}
            {'\n\n'}
            {this.state.errorInfo?.componentStack}
            {'\n\n--- Stack ---\n'}
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}