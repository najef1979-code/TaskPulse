import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import { useProjects } from './hooks/useProjects';
import { useTasks } from './hooks/useTasks';
import { useIsMobile } from './utils/responsive';
import { ProjectSelector } from './components/ProjectSelector';
import { KanbanBoard } from './components/KanbanBoard';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { UserMenu } from './components/UserMenu';
import { WhatsNewPopup } from './components/WhatsNewPopup';
import { MyAssignments } from './components/MyAssignments';
import { UnassignedTasks } from './components/UnassignedTasks';
import { MobileNav } from './components/MobileNav';
import { ErrorBoundary } from './components/ErrorBoundary';
import { activityApi, tasksApi } from './services/api';
import { FintechDashboard } from './experimental/FintechDashboard';
import { ErrorBoundary as ExperimentalErrorBoundary } from './experimental/components/ErrorBoundary';
import './App.css';

function AppContent() {
  const { loading: authLoading, isAuthenticated, user } = useAuth();
  const isMobile = useIsMobile();
  const [authView, setAuthView] = useState('login'); // 'login' or 'register'
  const [selectedProject, setSelectedProject] = useState(null);
  const { projects, loading: projectsLoading, createProject, deleteProject } = useProjects();
  const { 
    tasks, 
    loading: tasksLoading, 
    createTask, 
    updateTaskStatus, 
    deleteTask,
    assignTask
  } = useTasks(selectedProject?.id);
  const [taskSubtaskCounts, setTaskSubtaskCounts] = useState({});
  const [taskSubtasks, setTaskSubtasks] = useState({});
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const [whatsNewData, setWhatsNewData] = useState(null);
  const [showProjectDrawer, setShowProjectDrawer] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [currentView, setCurrentView] = useState('experimental'); // 'home', 'assignments', 'unassigned', or 'experimental'
  const [highlightedAssignment, setHighlightedAssignment] = useState(null);
  const [isExperimentalView, setIsExperimentalView] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Function to refresh subtasks for a specific task
  const refreshSubtasksForTask = async (taskId) => {
    try {
      const data = await tasksApi.getFull(taskId);
      setTaskSubtasks(prev => ({
        ...prev,
        [taskId]: data.subtasks || []
      }));
      setTaskSubtaskCounts(prev => ({
        ...prev,
        [taskId]: data.subtasks ? data.subtasks.length : 0
      }));
    } catch (err) {
      console.error(`Failed to refresh subtasks for task ${taskId}:`, err);
    }
  };

  // Fetch subtasks for tasks - single fetch, no N+1 problem
  useEffect(() => {
    if (tasks.length > 0) {
      const fetchAllSubtasks = async () => {
        const subtasksMap = {};
        const countsMap = {};
        
        await Promise.all(
          tasks.map(async (task) => {
            try {
              const data = await tasksApi.getFull(task.id);
              subtasksMap[task.id] = data.subtasks || [];
              countsMap[task.id] = data.subtasks ? data.subtasks.length : 0;
            } catch (err) {
              console.error(`Failed to fetch subtasks for task ${task.id}:`, err);
              subtasksMap[task.id] = [];
              countsMap[task.id] = 0;
            }
          })
        );
        
        setTaskSubtasks(subtasksMap);
        setTaskSubtaskCounts(countsMap);
      };
      
      fetchAllSubtasks();
    } else {
      setTaskSubtaskCounts({});
      setTaskSubtasks({});
    }
  }, [tasks]);

  // Check for "What's New" on login
  useEffect(() => {
    if (isAuthenticated && user && user.lastVisit) {
      const checkWhatsNew = async () => {
        try {
          const data = await activityApi.getWhatsNew(user.lastVisit);
          
          if (data.totalChanges > 0) {
            setWhatsNewData(data);
            setShowWhatsNew(true);
          }
        } catch (err) {
          console.error('Failed to fetch "What\'s New":', err);
        }
      };
      
      checkWhatsNew();
    }
  }, [isAuthenticated, user]);

  // Listen for PWA install prompt
  useEffect(() => {
    const handler = (e) => {
      setInstallPrompt(e.detail.prompt);
      setShowInstallPrompt(true);
    };
    
    window.addEventListener('pwa-installable', handler);
    return () => window.removeEventListener('pwa-installable', handler);
  }, []);

  // Close project drawer when project is selected on mobile
  useEffect(() => {
    if (isMobile && selectedProject) {
      setShowProjectDrawer(false);
    }
  }, [selectedProject, isMobile]);

  const handleInstallPWA = async () => {
    if (!installPrompt) return;
    
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    setShowInstallPrompt(false);
    setInstallPrompt(null);
  };

  const handleLogout = () => {
    // This will be handled by UserMenu, but we need to access it
    window.location.reload();
  };

  const handleNavigateToAssignments = (highlightItem = null) => {
    setHighlightedAssignment(highlightItem);
    setCurrentView('assignments');
    setShowWhatsNew(false);
  };

  const handleNavigateToUnassigned = () => {
    setCurrentView('unassigned');
    setShowWhatsNew(false);
  };

  const handleNavigateToDashboard = () => {
    setCurrentView('home');
    setHighlightedAssignment(null);
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setHighlightedAssignment(null);
  };

  const handleNavigateToExperimental = () => {
    setCurrentView('experimental');
  };

  // Show loading while checking authentication
  if (authLoading) {
    return <div style={styles.loading}>Loading TaskPulse...</div>;
  }

  // Show login/register if not authenticated
  if (!isAuthenticated) {
    return authView === 'login' ? (
      <Login onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <Register onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  // Main app when authenticated
  return (
    <div style={styles.app}>
      {/* Desktop Header / Mobile Top Bar - Hide in experimental view */}
      {currentView !== 'experimental' && (
      <header style={isMobile ? styles.mobileHeader : styles.header}>
          {isMobile && (
            <button 
              style={styles.menuButton}
              onClick={() => setShowProjectDrawer(!showProjectDrawer)}
            >
              ☰
            </button>
          )}
          
          <div style={styles.logoContainer}>
            <img src="/logo.png" alt="TaskPulse" style={isMobile ? styles.mobileLogo : styles.logo} />
            <img src="/logotxt.png" alt="TaskPulse" style={isMobile ? styles.mobileLogoTxt : styles.logoTxt} />
          </div>
          
          {!isMobile && selectedProject && (
            <div style={styles.projectInfo}>
              <span style={styles.projectName}>{selectedProject.name}</span>
            </div>
          )}
          
          <div style={styles.headerRight}>
            {!isMobile && (
              <UserMenu 
                onNavigateToAssignments={handleNavigateToAssignments}
                onNavigateToUnassigned={handleNavigateToUnassigned}
                onNavigateToDashboard={handleNavigateToDashboard}
                onNavigateToExperimental={handleNavigateToExperimental}
              />
            )}
          </div>
        </header>
      )}

      {/* Install PWA Banner */}
      {showInstallPrompt && (
        <div style={styles.installBanner}>
          <div style={styles.installContent}>
            <span style={styles.installText}>📱 Install TaskPulse for quick access</span>
            <div style={styles.installButtons}>
              <button onClick={handleInstallPWA} style={styles.installButton}>
                Install
              </button>
              <button 
                onClick={() => setShowInstallPrompt(false)} 
                style={styles.dismissButton}
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.main}>
        {/* Desktop: Only show ProjectSelector in home view */}
        {!isMobile && currentView === 'home' && (
          <ProjectSelector
            projects={projects}
            selectedProject={selectedProject}
            onSelectProject={setSelectedProject}
            onCreateProject={createProject}
            onDeleteProject={deleteProject}
          />
        )}

        {/* Mobile: Drawer overlay */}
        {isMobile && showProjectDrawer && (
          <>
            <div 
              style={styles.drawerOverlay}
              onClick={() => setShowProjectDrawer(false)}
            />
            <div style={styles.drawer}>
              <ProjectSelector
                projects={projects}
                selectedProject={selectedProject}
                onSelectProject={setSelectedProject}
                onCreateProject={createProject}
                onDeleteProject={deleteProject}
                isMobile={true}
              />
            </div>
          </>
        )}

        {/* Main Content */}
        <div style={styles.content}>
          {currentView === 'experimental' ? (
            <ExperimentalErrorBoundary isDark={isDarkMode}>
              <FintechDashboard onExit={() => setCurrentView('home')} />
            </ExperimentalErrorBoundary>
          ) : currentView === 'assignments' ? (
            <MyAssignments 
              onBack={handleBackToHome}
              highlightItem={highlightedAssignment}
            />
          ) : currentView === 'unassigned' ? (
            <UnassignedTasks 
              onBack={handleBackToHome}
            />
          ) : !selectedProject ? (
            <div style={styles.emptyState}>
              <h2>{isMobile ? '☰ Open menu' : '👈 Select a project'}</h2>
              <p>{isMobile ? 'Tap the menu to select or create a project' : 'or create a new one'}</p>
            </div>
          ) : tasksLoading ? (
            <div style={styles.loading}>Loading tasks...</div>
          ) : (
            <KanbanBoard
              tasks={tasks}
              onTaskStatusChange={updateTaskStatus}
              onDeleteTask={deleteTask}
              onCreateTask={createTask}
              onAssignTask={assignTask}
              taskSubtaskCounts={taskSubtaskCounts}
              taskSubtasks={taskSubtasks}
              onRefreshSubtasks={refreshSubtasksForTask}
              isMobile={isMobile}
            />
          )}
        </div>
      </div>

        {/* Mobile Bottom Navigation - Hide in experimental view */}
        {isMobile && currentView !== 'experimental' && (
          <MobileNav 
            selectedProject={selectedProject}
            onOpenProjects={() => setShowProjectDrawer(true)}
            onLogout={handleLogout}
            onNavigateToAssignments={handleNavigateToAssignments}
            onNavigateToUnassigned={handleNavigateToUnassigned}
            onNavigateToDashboard={handleNavigateToDashboard}
            onNavigateToExperimental={handleNavigateToExperimental}
          />
        )}

      {/* What's New Popup */}
      {showWhatsNew && whatsNewData && (
        <WhatsNewPopup
          data={whatsNewData}
          onClose={() => setShowWhatsNew(false)}
          onNavigateToAssignments={handleNavigateToAssignments}
        />
      )}
    </div>
  );
}

// Wrap with AuthProvider
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

const styles = {
  app: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  header: {
    backgroundColor: '#1e293b',
    color: 'white',
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  mobileHeader: {
    backgroundColor: '#1e293b',
    color: 'white',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  menuButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '4px 8px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logo: {
    height: '48px',
    width: 'auto',
    flexShrink: 0,
  },
  logoTxt: {
    height: '46px',
    width: 'auto',
    flexShrink: 0,
  },
  mobileLogo: {
    height: '39px',
    width: 'auto',
    flexShrink: 0,
  },
  mobileLogoTxt: {
    height: '37px',
    width: 'auto',
    flexShrink: 0,
  },
  projectInfo: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: '40px',
  },
  projectName: {
    fontSize: '18px',
    fontWeight: '600',
  },
  projectDesc: {
    fontSize: '14px',
    opacity: 0.8,
  },
  headerRight: {
    flexShrink: 0,
    marginLeft: 'auto',
  },
  installBanner: {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '12px 16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  installContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  installText: {
    fontSize: '14px',
  },
  installButtons: {
    display: 'flex',
    gap: '8px',
  },
  installButton: {
    padding: '6px 16px',
    backgroundColor: 'white',
    color: '#3b82f6',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px',
  },
  dismissButton: {
    padding: '6px 16px',
    backgroundColor: 'transparent',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  main: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
    position: 'relative',
  },
  drawerOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998,
    animation: 'fadeIn 0.2s',
  },
  drawer: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: '280px',
    backgroundColor: 'white',
    zIndex: 999,
    animation: 'slideInLeft 0.3s',
    overflowY: 'auto',
    boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    paddingBottom: '60px', // Space for mobile nav
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#64748b',
    padding: '20px',
    textAlign: 'center',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    fontSize: '18px',
    color: '#64748b',
  },
};

export default App;