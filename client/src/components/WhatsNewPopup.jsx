import { authApi } from '../services/api';

export function WhatsNewPopup({ data, onClose }) {
  if (!data || data.totalChanges === 0) return null;

  const handleGotIt = async () => {
    try {
      await authApi.updateLastVisit();
    } catch (err) {
      console.error('Failed to update last visit:', err);
    }
    onClose();
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.popup} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>🔔 New Assignments</h2>
          <button style={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={styles.summary}>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>New Items:</span>
            <span style={styles.summaryValue}>{data.totalChanges}</span>
          </div>
        </div>

        {data.recentActivities && data.recentActivities.length > 0 && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Recent Assignments</h3>
            <div style={styles.activityList}>
              {data.recentActivities.map((activity) => (
                <div 
                  key={activity.id} 
                  style={styles.activityItem}
                >
                  <div style={styles.activityMessage}>
                    <span style={styles.activityIcon}>→</span>
                    {activity.message}
                  </div>
                  <div style={styles.activityMeta}>
                    <span style={styles.activityTime}>
                      {formatActivityTime(activity.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={styles.footer}>
          <button style={styles.dismissButton} onClick={handleGotIt}>
            Got it! 👍
          </button>
        </div>
      </div>
    </div>
  );
}

function formatActivityTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  popup: {
    backgroundColor: 'white',
    borderRadius: '12px',
    maxWidth: '500px',
    maxHeight: '80vh',
    width: '90%',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 20px 10px 20px',
    borderBottom: '1px solid #e5e7eb',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '600',
    color: '#1e293b',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    color: '#6b7280',
    cursor: 'pointer',
    padding: '0',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: {
    padding: '20px',
    backgroundColor: '#f0f9ff',
    borderBottom: '1px solid #e5e7eb',
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  summaryLabel: {
    fontSize: '12px',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  summaryValue: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1e293b',
  },
  section: {
    padding: '16px 20px',
    borderBottom: '1px solid #e5e7eb',
  },
  sectionTitle: {
    margin: '0 0 12px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '300px',
    overflowY: 'auto',
  },
  activityItem: {
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: '1px solid transparent',
  },
  activityMessage: {
    fontSize: '14px',
    color: '#374151',
    lineHeight: '1.5',
    marginBottom: '4px',
  },
  activityIcon: {
    color: '#3b82f6',
    marginRight: '8px',
    fontWeight: 'bold',
  },
  activityMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '11px',
    color: '#6b7280',
  },
  activityTime: {
    color: '#9ca3af',
  },
  clickHint: {
    color: '#3b82f6',
    fontWeight: '500',
  },
  footer: {
    padding: '16px 20px 20px 20px',
  },
  dismissButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};