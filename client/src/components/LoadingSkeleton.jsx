import { useIsMobile } from '../utils/responsive';

export function TaskCardSkeleton() {
  const isMobile = useIsMobile();
  
  return (
    <div style={{
      ...styles.card,
      ...(isMobile ? styles.cardMobile : {})
    }}>
      <div style={{ ...styles.skeleton, ...styles.title }} />
      <div style={{ ...styles.skeleton, ...styles.description }} />
      <div style={{ ...styles.skeleton, ...styles.description }} />
      
      <div style={styles.footer}>
        <div style={{ ...styles.skeleton, ...styles.badge }} />
        <div style={{ ...styles.skeleton, ...styles.badge }} />
      </div>
    </div>
  );
}

export function BoardColumnSkeleton() {
  return (
    <div style={styles.column}>
      <div style={{ ...styles.skeleton, ...styles.columnHeader }} />
      
      {[1, 2, 3].map((i) => (
        <TaskCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProjectItemSkeleton() {
  return (
    <div style={styles.projectItem}>
      <div style={{ ...styles.skeleton, ...styles.projectIcon }} />
      <div style={{ ...styles.skeleton, ...styles.projectName }} />
    </div>
  );
}

export function KanbanSkeleton({ isMobile = false }) {
  if (isMobile) {
    return (
      <div style={styles.mobileContainer}>
        <div style={styles.mobileTabs}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ ...styles.skeleton, ...styles.mobileTab }}></div>
          ))}
        </div>
        <div style={styles.mobileContent}>
          <TaskCardSkeleton />
          <TaskCardSkeleton />
          <TaskCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.board}>
      {[1, 2, 3].map(col => (
        <div key={col} style={styles.column}>
          <div style={{ ...styles.skeleton, ...styles.columnHeader }}></div>
          <TaskCardSkeleton />
          <TaskCardSkeleton />
        </div>
      ))}
    </div>
  );
}

export function ProjectsListSkeleton() {
  return (
    <div style={styles.projectsList}>
      {[1, 2, 3, 4, 5].map((i) => (
        <ProjectItemSkeleton key={i} />
      ))}
    </div>
  );
}

// Add shimmer animation to document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shimmer {
      0% {
        background-position: -468px 0;
      }
      100% {
        background-position: 468px 0;
      }
    }
  `;
  document.head.appendChild(style);
}

const styles = {
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  cardMobile: {
    padding: '12px',
    marginBottom: '8px',
  },
  skeleton: {
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '4px',
  },
  title: {
    height: '20px',
    width: '60%',
    marginBottom: '12px',
  },
  description: {
    height: '14px',
    width: '90%',
    marginBottom: '6px',
  },
  footer: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
  },
  badge: {
    height: '24px',
    width: '80px',
    borderRadius: '12px',
  },
  column: {
    backgroundColor: '#f1f5f9',
    borderRadius: '8px',
    padding: '12px',
    minWidth: '280px',
  },
  columnHeader: {
    height: '28px',
    width: '70%',
    marginBottom: '16px',
  },
  projectItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    marginBottom: '8px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
  },
  projectIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
  },
  projectName: {
    height: '16px',
    width: '60%',
  },
  projectsList: {
    padding: '16px',
  },

  // Kanban skeleton styles
  board: {
    display: 'flex',
    gap: '20px',
    padding: '20px',
  },
  column: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '16px',
  },
  columnHeader: {
    width: '50%',
    height: '24px',
    marginBottom: '16px',
  },

  // Mobile skeleton styles
  mobileContainer: {
    padding: '16px',
  },
  mobileTabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
  },
  mobileTab: {
    flex: 1,
    height: '60px',
    borderRadius: '8px',
  },
  mobileContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
};
