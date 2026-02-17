import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { WhatsNewPopup } from './components/WhatsNewPopup';
import { ErrorBoundary } from './components/ErrorBoundary';
import { activityApi } from './services/api';
import { FintechDashboard } from './main-dashboard/FintechDashboard';
import { ErrorBoundary as ExperimentalErrorBoundary } from './main-dashboard/components/ErrorBoundary';
import './App.css';

function AppContent() {
  const { loading: authLoading, isAuthenticated, user } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' or 'register'
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const [whatsNewData, setWhatsNewData] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  // Main app when authenticated - FintechDashboard only
  return (
    <div style={styles.app}>
      <ExperimentalErrorBoundary isDark={isDarkMode}>
        <FintechDashboard />
      </ExperimentalErrorBoundary>

      {/* What's New Popup */}
      {showWhatsNew && whatsNewData && (
        <WhatsNewPopup
          data={whatsNewData}
          onClose={() => setShowWhatsNew(false)}
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