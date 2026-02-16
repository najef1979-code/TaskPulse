export function MobileNav({ onOpenProjects, onLogout, onNavigateToDashboard, onNavigateToExperimental }) {
  return (
    <nav style={styles.nav}>
      <button style={styles.navButton} onClick={onNavigateToDashboard}>
        <span style={styles.navIcon}>📊</span>
        <span style={styles.navLabel}>Dashboard</span>
      </button>

      <button style={styles.navButton} onClick={onOpenProjects}>
        <span style={styles.navIcon}>📁</span>
        <span style={styles.navLabel}>Projects</span>
      </button>

      <button style={styles.navButton} onClick={onNavigateToExperimental}>
        <span style={styles.navIcon}>🎨</span>
        <span style={styles.navLabel}>Experimental</span>
      </button>

      <button style={styles.navButton} onClick={onLogout}>
        <span style={styles.navIcon}>🚪</span>
        <span style={styles.navLabel}>Logout</span>
      </button>
    </nav>
  );
}

const styles = {
  nav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60px',
    backgroundColor: 'white',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: '0 8px',
    zIndex: 1000,
    boxShadow: '0 -2px 8px rgba(0,0,0,0.05)',
    paddingBottom: 'env(safe-area-inset-bottom)',
  },
  navButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 16px',
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '12px',
    minWidth: '70px',
    flexShrink: 0,
  },
  navIcon: {
    fontSize: '20px',
  },
  navLabel: {
    fontSize: '11px',
    fontWeight: '500',
  },
  currentProject: {
    flex: 1,
    textAlign: 'center',
    padding: '0 8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'block',
    maxWidth: '100%',
  },
  projectPlaceholder: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#94a3b8',
    fontStyle: 'italic',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};