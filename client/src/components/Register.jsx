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

    // Validation
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
      // Registration successful, parent will handle redirect
    } catch (err) {
      setError(err.message || 'Registration failed');
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
        <p style={styles.subtitle}>Create your account</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.formInner}>
          <div style={styles.field}>
            <label style={styles.label}>Username *</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              placeholder="Choose a username"
              required
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
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f1f5f9',
    padding: '20px',
  },
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  logo: {
    maxWidth: '360px',
    height: 'auto',
  },
  form: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '450px',
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
    color: '#64748b',
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
    gap: '16px',
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
    fontSize: '14px',
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
};