import React, { Component } from 'react';
import { colors, spacing, radius, typography } from '../fintech-tokens';

/**
 * Error Boundary Component
 * Catches JavaScript errors in component tree and displays fallback UI
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // You can also log to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const isDark = this.props.isDark;
      
      return (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: isDark ? colors.grayDark[50] : colors.grayLight[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing.xl,
          zIndex: 9999,
        }}>
          <div style={{
            maxWidth: '500px',
            width: '100%',
            backgroundColor: isDark ? colors.grayDark[100] : '#FFFFFF',
            borderRadius: radius.lg,
            padding: spacing.xl,
            boxShadow: isDark 
              ? '0 10px 40px rgba(0, 0, 0, 0.6)'
              : '0 10px 40px rgba(0, 0, 0, 0.2)',
          }}>
            <h2 style={{
              fontSize: typography['2xl'],
              fontWeight: typography.weights.bold,
              color: isDark ? colors.grayDark[900] : colors.grayLight[900],
              marginBottom: spacing.md,
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm,
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              Something went wrong
            </h2>
            
            <p style={{
              fontSize: typography.base,
              color: isDark ? colors.grayDark[600] : colors.grayLight[600],
              marginBottom: spacing.lg,
              lineHeight: 1.5,
            }}>
              An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
            </p>

            <div style={{
              backgroundColor: isDark ? colors.grayDark[200] : colors.grayLight[100],
              borderRadius: radius.sm,
              padding: spacing.md,
              marginBottom: spacing.lg,
              overflow: 'auto',
              maxHeight: '150px',
            }}>
              <code style={{
                fontSize: typography.xs,
                color: isDark ? colors.grayDark[400] : colors.grayLight[700],
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
                {this.state.error?.toString()}
              </code>
            </div>

            <div style={{
              display: 'flex',
              gap: spacing.md,
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: `${spacing.sm} ${spacing.lg}`,
                  border: `1px solid ${isDark ? colors.grayDark[500] : colors.grayLight[300]}`,
                  borderRadius: radius.md,
                  backgroundColor: isDark ? colors.grayDark[200] : '#FFFFFF',
                  color: isDark ? colors.grayDark[900] : colors.grayLight[700],
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[300] : colors.grayLight[200];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[200] : '#FFFFFF';
                }}
              >
                Refresh Page
              </button>
              
              <button
                onClick={this.handleReset}
                style={{
                  padding: `${spacing.sm} ${spacing.lg}`,
                  border: 'none',
                  borderRadius: radius.md,
                  backgroundColor: colors.primary[600],
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary[500];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary[600];
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Export both named and default for compatibility
export { ErrorBoundary };
export default ErrorBoundary;
