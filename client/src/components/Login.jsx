import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const ALLOW_REGISTRATION = import.meta.env.VITE_ALLOW_REGISTRATION === 'true';

export function Login({ onSwitchToRegister }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      // Login successful, parent will handle redirect
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.form}>
        <div style={styles.logoContainer}>
          <img src="/logo.png" alt="TaskPulse Logo" style={styles.logo} />
        </div>
        <p style={styles.subtitle}>Sign in to <span style={{color: '#f97316'}}>Task</span><span style={{color: '#3b82f6'}}>Pulse</span></p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.formInner}>
          <div style={styles.field}>
            <label style={styles.label}>Username or Password</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              placeholder="Enter Username or Password"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {}),
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {ALLOW_REGISTRATION && (
          <p style={styles.switchText}>
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              style={styles.switchButton}
            >
              Create one
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f1f5f9',
  },
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  logo: {
    maxWidth: '324px',
    height: 'auto',
  },
  form: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '32px',
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
  },
  subtitle: {
    margin: '0 0 32px 0',
    fontSize: '16px',
    color: '#f97316',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
    fontSize: '14px',
    textAlign: 'center',
  },
  formInner: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#334155',
  },
  input: {
    padding: '12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '13px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  button: {
    padding: '12px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
    cursor: 'not-allowed',
  },
  switchText: {
    margin: '24px 0 0 0',
    fontSize: '14px',
    color: '#64748b',
    textAlign: 'center',
  },
  switchButton: {
    background: 'none',
    border: 'none',
    color: '#3b82f6',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    textDecoration: 'underline',
    padding: 0,
  },
  hintText: {
    fontSize: '12px',
    color: '#94a3b8',
    marginTop: '4px',
  },
};
