/**
 * Common Style Constants for Experimental Dashboard Components
 * Centralizes repeated styles to improve maintainability
 */

import { spacing, typography, radius, transition, colors } from '../fintech-tokens';

/**
 * Shadow constants
 */
export const shadows = {
  cardLight: '0 2px 8px rgba(0, 0, 0, 0.05)',
  cardHoverLight: '0 6px 20px rgba(0, 0, 0, 0.08)',
  cardDark: '0 2px 8px rgba(0, 0, 0, 0.4)',
  cardHoverDark: '0 6px 20px rgba(0, 0, 0, 0.6)',
  modalLight: '0 10px 40px rgba(0, 0, 0, 0.2)',
  modalDark: '0 10px 40px rgba(0, 0, 0, 0.6)',
};

/**
 * Border constants
 */
export const borders = {
  width: '1px',
  style: 'solid',
};

/**
 * Modal styles
 */
export const getModalBackdropStyles = (isDark) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  zIndex: 100,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const getModalStyles = (isDark, width = '400px') => ({
  backgroundColor: isDark ? colors.grayDark[100] : '#FFFFFF',
  borderRadius: radius.lg,
  padding: spacing.xl,
  width,
  maxWidth: '90vw',
  boxShadow: isDark ? shadows.modalDark : shadows.modalLight,
});

export const getModalTitleStyles = (isDark) => ({
  fontSize: typography.lg,
  fontWeight: typography.weights.semibold,
  color: isDark ? colors.grayDark[900] : colors.grayLight[900],
  marginBottom: spacing.lg,
});

export const getFormLabelStyles = (isDark) => ({
  fontSize: typography.sm,
  fontWeight: typography.weights.semibold,
  color: isDark ? colors.grayDark[200] : colors.grayLight[600],
  marginBottom: spacing.sm,
  display: 'block',
});

export const getInputStyles = (isDark) => ({
  width: '100%',
  padding: `${spacing.sm} ${spacing.md}`,
  borderRadius: radius.sm,
  border: `1px solid ${isDark ? colors.grayDark[500] : colors.grayLight[300]}`,
  fontSize: typography.base,
  fontFamily: typography.family,
  backgroundColor: isDark ? colors.grayDark[200] : '#FFFFFF',
  color: isDark ? colors.grayDark[900] : colors.grayLight[900],
  outline: 'none',
  transition: `all ${transition.fast}`,
  marginBottom: spacing.md,
});

export const getModalButtonsStyles = () => ({
  display: 'flex',
  gap: spacing.md,
  justifyContent: 'flex-end',
  marginTop: spacing.lg,
});

export const getCancelButtonStyles = (isDark) => ({
  padding: `${spacing.sm} ${spacing.lg}`,
  border: `1px solid ${isDark ? colors.grayDark[500] : colors.grayLight[300]}`,
  borderRadius: radius.md,
  backgroundColor: isDark ? colors.grayDark[200] : '#FFFFFF',
  color: isDark ? colors.grayDark[300] : colors.grayLight[600],
  fontSize: '14px',
  fontWeight: 500,
  cursor: 'pointer',
  transition: `all ${transition.fast}`,
});

export const getSaveButtonStyles = () => ({
  padding: `${spacing.sm} ${spacing.lg}`,
  border: 'none',
  borderRadius: radius.md,
  backgroundColor: colors.primary[600],
  color: '#FFFFFF',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: `all ${transition.fast}`,
});

/**
 * Button hover handlers
 */
export const getHoverStyles = {
  primary: (e, isDark) => {
    e.currentTarget.style.backgroundColor = colors.primary[500];
  },
  primaryLeave: (e) => {
    e.currentTarget.style.backgroundColor = colors.primary[600];
  },
  secondary: (e, isDark) => {
    e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[300] : colors.grayLight[300];
  },
  secondaryLeave: (e, isDark) => {
    e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[200] : colors.grayLight[200];
  },
  cancel: (e) => {
    e.currentTarget.style.borderColor = colors.grayLight[400];
  },
  cancelLeave: (e, isDark) => {
    e.currentTarget.style.borderColor = isDark ? colors.grayDark[500] : colors.grayLight[300];
  },
  menu: (e, isDark) => {
    e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[200] : colors.grayLight[100];
  },
  menuLeave: (e) => {
    e.currentTarget.style.backgroundColor = 'transparent';
  },
  subtask: (e, isDark) => {
    e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[200] : colors.grayLight[100];
  },
  subtaskLeave: (e) => {
    e.currentTarget.style.backgroundColor = 'transparent';
  },
  expandButton: (e, isDark) => {
    e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[300] : colors.grayLight[200];
  },
  expandButtonLeave: (e, isDark) => {
    e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[200] : colors.grayLight[100];
  },
};

export default {
  shadows,
  borders,
  getModalBackdropStyles,
  getModalStyles,
  getModalTitleStyles,
  getFormLabelStyles,
  getInputStyles,
  getModalButtonsStyles,
  getCancelButtonStyles,
  getSaveButtonStyles,
  getHoverStyles,
};