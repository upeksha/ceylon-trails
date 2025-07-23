import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fef2f2',
          fontFamily: 'Arial, sans-serif'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            maxWidth: '500px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#dc2626',
              marginBottom: '12px'
            }}>
              Oops! Something went wrong
            </h2>
            <p style={{
              color: '#6b7280',
              fontSize: '16px',
              marginBottom: '20px',
              lineHeight: '1.5'
            }}>
              Ceylon Trails encountered an unexpected error. This is likely a temporary issue.
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  backgroundColor: '#dc2626',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                Reload Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                style={{
                  backgroundColor: '#059669',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                Try Again
              </button>
            </div>
            
            {/* Show error details in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{
                marginTop: '20px',
                textAlign: 'left',
                backgroundColor: '#f9fafb',
                padding: '12px',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#374151'
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: '600' }}>
                  Error Details (Development Only)
                </summary>
                <pre style={{
                  marginTop: '8px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {this.state.error && this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 