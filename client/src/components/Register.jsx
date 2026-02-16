import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export function Register({ onSwitchToLogin }) {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register({
        username,
        email,
        fullName,
        password,
      });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.leftPanel}>
        <div style={styles.branding}>
          <div style={styles.logoContainer}>
            <img src="/login.png" alt="TaskPulse Logo" style={styles.logo} />
          </div>
          <h1 style={styles.brandTitle}>Join TaskPulse</h1>
          <p style={styles.brandSubtitle}>Create an account to start managing your tasks</p>
        </div>
      </div>
      
      <div style={styles.rightPanel}>
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Create Account</h2>
            <p style={styles.formSubtitle}>Fill in your details to get started</p>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Username *</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
                placeholder="Choose a username"
                required
                autoFocus
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={styles.input}
                placeholder="Enter your full name"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                placeholder="Enter your email"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Password *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                placeholder="Create a password (min 6 characters)"
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Confirm Password *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={styles.input}
                placeholder="Confirm your password"
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
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={styles.switchText}>
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              style={styles.switchButton}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
  },
  leftPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    padding: '40px',
    '@media (max-width: 768px)': {
      display: 'none',
    },
  },
  branding: {
    textAlign: 'center',
    color: 'white',
  },
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '32px',
  },
  logo: {
    maxWidth: '200px',
    height: 'auto',
  },
  brandTitle: {
    margin: '0 0 16px 0',
    fontSize: '42px',
    fontWeight: '700',
    color: 'white',
    letterSpacing: '-0.5px',
  },
  brandSubtitle: {
    margin: 0,
    fontSize: '18px',
    color: '#94a3b8',
    fontWeight: '400',
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    backgroundColor: '#f8fafc',
  },
  formCard: {
    backgroundColor: 'white',
    padding: '48px',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    width: '100%',
    maxWidth: '480px',
  },
  formHeader: {
    marginBottom: '32px',
    textAlign: 'center',
  },
  formTitle: {
    margin: '0 0 8px 0',
    fontSize: '28px',
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: '-0.5px',
  },
  formSubtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '400',
  },
  error: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '14px',
    borderRadius: '8px',
    marginBottom: '24px',
    fontSize: '14px',
    fontWeight: '500',
    textAlign: 'center',
    border: '1px solid #fecaca',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    letterSpacing: '0.5px',
  },
  input: {
    padding: '14px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '15px',
    color: '#1e293b',
    outline: 'none',
    transition: 'all 0.2s',
    backgroundColor: '#f8fafc',
    ':focus': {
      borderColor: '#3b82f6',
      backgroundColor: 'white',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
    },
    ':hover': {
      borderColor: '#cbd5e1',
      backgroundColor: 'white',
    },
  },
  button: {
    padding: '14px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    letterSpacing: '0.5px',
    marginTop: '8px',
    ':hover': {
      backgroundColor: '#2563eb',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
    },
    ':active': {
      transform: 'translateY(0)',
    },
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
    cursor: 'not-allowed',
    ':hover': {
      backgroundColor: '#94a3b8',
      transform: 'none',
      boxShadow: 'none',
    },
  },
  switchText: {
    margin: '28px 0 0 0',
    fontSize: '14px',
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '400',
  },
  switchButton: {
    background: 'none',
    border: 'none',
    color: '#3b82f6',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    padding: 0,
    ':hover': {
      textDecoration: 'underline',
      color: '#2563eb',
    },
  },
};
