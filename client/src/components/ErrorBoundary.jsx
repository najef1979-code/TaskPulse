import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // You could also log to an error reporting service here
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    
    // If onRetry is provided, call it
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      const { title, message, showDetails } = this.props;
      
      return (
        <div style={styles.container}>
          <div style={styles.content}>
            <div style={styles.icon}>⚠️</div>
            <h2 style={styles.title}>
              {title || 'Something went wrong'}
            </h2>
            <p style={styles.message}>
              {message || 'An unexpected error occurred. Please try again.'}
            </p>
            
            {showDetails && this.state.error && (
              <details style={styles.details}>
                <summary style={styles.summary}>Error Details</summary>
                <pre style={styles.errorText}>
                  {this.state.error && this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            
            <button 
              onClick={this.handleRetry}
              style={styles.retryButton}
            >
              Try Again
            </button>
            
            <button 
              onClick={() => window.location.reload()}
              style={styles.reloadButton}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    padding: '20px',
  },
  content: {
    maxWidth: '500px',
    width: '100%',
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  icon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 12px 0',
  },
  message: {
    fontSize: '16px',
    color: '#64748b',
    margin: '0 0 24px 0',
    lineHeight: '1.5',
  },
  details: {
    textAlign: 'left',
    marginTop: '20px',
    marginBottom: '20px',
  },
  summary: {
    cursor: 'pointer',
    color: '#3b82f6',
    fontWeight: '600',
    marginBottom: '12px',
  },
  errorText: {
    backgroundColor: '#f1f5f9',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#475569',
    overflow: 'auto',
    maxHeight: '200px',
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginRight: '8px',
    transition: 'background-color 0.2s',
  },
  reloadButton: {
    backgroundColor: 'transparent',
    color: '#64748b',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};