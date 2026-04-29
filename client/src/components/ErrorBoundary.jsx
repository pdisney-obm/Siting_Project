import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          padding: '40px',
          fontFamily: 'monospace',
          background: '#FEF2F2',
          color: '#991B1B',
          height: '100vh',
          boxSizing: 'border-box',
        }}>
          <strong style={{ fontSize: '16px' }}>App crashed — check this error:</strong>
          <pre style={{ marginTop: '16px', whiteSpace: 'pre-wrap', fontSize: '13px' }}>
            {this.state.error.toString()}
            {'\n\n'}
            {this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
