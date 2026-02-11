export function formatDate(dateString) {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);
  
  if (dateOnly.getTime() === today.getTime()) {
    return 'Today';
  } else if (dateOnly.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  }
}

export function formatDateLong(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

export function toISODate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

export function isOverdue(dateString) {
  if (!dateString) return false;
  return new Date(dateString) < new Date();
}

export function isDueSoon(dateString, days = 3) {
  if (!dateString) return false;
  const dueDate = new Date(dateString);
  const soon = new Date();
  soon.setDate(soon.getDate() + days);
  return dueDate <= soon && dueDate >= new Date();
}

export function getDueDateColor(dateString) {
  if (!dateString) return '#64748b';
  if (isOverdue(dateString)) return '#ef4444';
  if (isDueSoon(dateString)) return '#f59e0b';
  return '#64748b';
}

export function getDueDateBgColor(dateString) {
  if (!dateString) return '#f1f5f9';
  if (isOverdue(dateString)) return '#fee2e2';
  if (isDueSoon(dateString)) return '#fef3c7';
  return '#f1f5f9';
}

export function formatDateTime(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function daysUntilDue(dateString) {
  if (!dateString) return null;
  const dueDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDateOnly = new Date(dueDate);
  dueDateOnly.setHours(0, 0, 0, 0);
  
  const diffTime = dueDateOnly - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

export function getDueDateBadge(dateString) {
  const days = daysUntilDue(dateString);
  
  if (!dateString) return null;
  if (days < 0) return { text: `${Math.abs(days)} days overdue`, color: '#ef4444', bg: '#fee2e2' };
  if (days === 0) return { text: 'Due today', color: '#f59e0b', bg: '#fef3c7' };
  if (days === 1) return { text: 'Due tomorrow', color: '#f59e0b', bg: '#fef3c7' };
  if (days <= 3) return { text: `Due in ${days} days`, color: '#f59e0b', bg: '#fef3c7' };
  if (days <= 7) return { text: `Due in ${days} days`, color: '#64748b', bg: '#f1f5f9' };
  return { text: formatDate(dateString), color: '#64748b', bg: '#f1f5f9' };
}