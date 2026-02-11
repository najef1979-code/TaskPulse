import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export function UserMenu({ onNavigateToAssignments, onNavigateToUnassigned, onNavigateToDashboard }) {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  const handleNavigateToAssignments = () => {
    setIsOpen(false);
    onNavigateToAssignments();
  };

  const handleNavigateToDashboard = () => {
    setIsOpen(false);
    onNavigateToDashboard();
  };

  const handleNavigateToUnassigned = () => {
    setIsOpen(false);
    onNavigateToUnassigned();
  };

  return (
    <div style={styles.container}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={styles.menuButton}
      >
        <span style={styles.userIcon}>👤</span>
        <span style={styles.username}>{user?.username}</span>
        <span style={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div style={styles.menu}>
          <div style={styles.userInfo}>
            <div style={styles.userInfoName}>{user?.full_name || user?.username}</div>
            {user?.email && (
              <div style={styles.userInfoEmail}>{user.email}</div>
            )}
          </div>

          <button onClick={handleNavigateToDashboard} style={styles.menuItem}>
            <span style={styles.menuItemIcon}>📊</span>
            Dashboard
          </button>

          <button onClick={handleNavigateToAssignments} style={styles.menuItem}>
            <span style={styles.menuItemIcon}>📋</span>
            My Assignments
          </button>

          <button onClick={handleNavigateToUnassigned} style={styles.menuItem}>
            <span style={styles.menuItemIcon}>✨</span>
            Unassigned Tasks
          </button>

          <hr style={styles.divider} />

          <button onClick={handleLogout} style={styles.menuItem}>
            <span style={styles.menuItemIcon}>🚪</span>
            Sign Out
          </button>
        </div>
      )}

      {isOpen && (
        <div style={styles.overlay} onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
  },
  menuButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: '#334155',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s',
  },
  userIcon: {
    fontSize: '18px',
  },
  username: {
    fontWeight: '500',
  },
  arrow: {
    fontSize: '10px',
    opacity: 0.8,
  },
  menu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '8px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    minWidth: '200px',
    zIndex: 1000,
  },
  userInfo: {
    padding: '16px',
    borderBottom: '1px solid #e2e8f0',
  },
  userInfoName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '4px',
  },
  userInfoEmail: {
    fontSize: '12px',
    color: '#64748b',
    wordBreak: 'break-all',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #e2e8f0',
    margin: 0,
  },
  menuItem: {
    width: '100%',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    fontSize: '14px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 0.2s',
  },
  menuItemIcon: {
    fontSize: '16px',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
};