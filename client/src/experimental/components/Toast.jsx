import React, { useEffect, useState } from 'react';
import { colors, spacing, radius, typography, transition } from '../fintech-tokens';

/**
 * Toast Component
 * Displays temporary notification messages
 */
function Toast({ message, type = 'info', onClose, duration = 3000, isDark }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getStyles = () => {
    const baseStyles = {
      position: 'fixed',
      bottom: spacing.xl,
      left: '50%',
      transform: 'translateX(-50%)',
      minWidth: '300px',
      maxWidth: '90vw',
      padding: `${spacing.sm} ${spacing.lg}`,
      borderRadius: radius.md,
      fontSize: typography.sm,
      fontWeight: typography.weights.medium,
      display: 'flex',
      alignItems: 'center',
      gap: spacing.sm,
      boxShadow: isDark 
        ? '0 10px 40px rgba(0, 0, 0, 0.6)'
        : '0 10px 40px rgba(0, 0, 0, 0.2)',
      zIndex: 10000,
      cursor: 'pointer',
      transition: `all ${transition.normal}`,
      opacity: isVisible ? 1 : 0,
      transform: `translateX(-50%) ${isVisible ? 'translateY(0)' : 'translateY(20px)'}`,
    };

    const typeStyles = {
      success: {
        backgroundColor: isDark ? '#14532D' : '#DCFCE7',
        color: isDark ? '#86EFAC' : '#166534',
        border: `1px solid ${isDark ? '#166534' : '#86EFAC'}`,
      },
      error: {
        backgroundColor: isDark ? '#7F1D1D' : '#FEE2E2',
        color: isDark ? '#FCA5A5' : '#991B1B',
        border: `1px solid ${isDark ? '#991B1B' : '#FCA5A5'}`,
      },
      warning: {
        backgroundColor: isDark ? '#78350F' : '#FEF3C7',
        color: isDark ? '#FCD34D' : '#92400E',
        border: `1px solid ${isDark ? '#92400E' : '#FCD34D'}`,
      },
      info: {
        backgroundColor: isDark ? '#1E3A8A' : '#DBEAFE',
        color: isDark ? '#93C5FD' : '#1E40AF',
        border: `1px solid ${isDark ? '#1E40AF' : '#93C5FD'}`,
      },
    };

    return { ...baseStyles, ...typeStyles[type] };
  };

  const getIcon = () => {
    const iconSize = 18;
    const iconColor = 'currentColor';

    switch (type) {
      case 'success':
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        );
      case 'error':
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        );
      case 'warning':
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        );
      case 'info':
      default:
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        );
    }
  };

  return <div style={getStyles()} onClick={onClose}>{getIcon()}<span>{message}</span></div>;
}

/**
 * Toast Container
 * Manages multiple toasts
 */
export function ToastContainer({ toasts, removeToast, isDark }) {
  if (toasts.length === 0) return null;

  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          isDark={isDark}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
}

/**
 * Hook for managing toasts
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = useCallback((message, duration) => showToast(message, 'success', duration), [showToast]);
  const showError = useCallback((message, duration) => showToast(message, 'error', duration), [showToast]);
  const showWarning = useCallback((message, duration) => showToast(message, 'warning', duration), [showToast]);
  const showInfo = useCallback((message, duration) => showToast(message, 'info', duration), [showToast]);

  return {
    toasts,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
  };
}

export default Toast;