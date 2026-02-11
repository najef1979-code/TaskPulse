import { useState, useEffect } from 'react';
import { usersApi } from '../services/api';

export function AssignmentSelector({ currentAssignee, onAssign, disabled = false }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (userId) => {
    onAssign(userId);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isOpen) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  const currentUser = users.find(u => u.id === currentAssignee);

  return (
    <div style={styles.container}>
      <button
        style={{
          ...styles.trigger,
          ...(disabled ? styles.triggerDisabled : {})
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) {
            setIsOpen(!isOpen);
          }
        }}
        disabled={disabled}
      >
        {currentUser ? (
          <>
            <span style={styles.userIcon}>
              {currentUser.user_type === 'bot' ? '🤖' : '👤'}
            </span>
            <span>{currentUser.full_name || currentUser.username}</span>
          </>
        ) : (
          <>
            <span style={styles.unassignedIcon}>👥</span>
            <span>Unassigned</span>
          </>
        )}
        <span style={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div style={styles.dropdown}>
          <button
            style={{
              ...styles.option,
              ...(currentAssignee === null ? styles.optionSelected : {})
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleSelect(null);
            }}
          >
            <span style={styles.unassignedIcon}>👥</span>
            <span>Unassigned</span>
            {currentAssignee === null && (
              <span style={styles.checkmark}>✓</span>
            )}
          </button>
          
          <div style={styles.divider}></div>
          
          {users.map((user) => (
            <button
              key={user.id}
              style={{
                ...styles.option,
                ...(user.id === currentAssignee ? styles.optionSelected : {})
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(user.id);
              }}
            >
              <span style={styles.userIcon}>
                {user.user_type === 'bot' ? '🤖' : '👤'}
              </span>
              <div style={styles.userInfo}>
                <div style={styles.userName}>
                  {user.full_name || user.username}
                </div>
                {user.full_name && user.username !== user.full_name && (
                  <div style={styles.userUsername}>@{user.username}</div>
                )}
              </div>
              {user.id === currentAssignee && (
                <span style={styles.checkmark}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    display: 'inline-block',
  },
  loading: {
    fontSize: '12px',
    color: '#94a3b8',
    padding: '4px 8px',
  },
  trigger: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    minWidth: '140px',
  },
  triggerDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  userIcon: {
    fontSize: '14px',
  },
  unassignedIcon: {
    fontSize: '14px',
    opacity: 0.5,
  },
  arrow: {
    marginLeft: 'auto',
    fontSize: '10px',
    color: '#94a3b8',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: '4px',
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    minWidth: '200px',
    maxHeight: '300px',
    overflowY: 'auto',
    zIndex: 1000,
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '10px 12px',
    border: 'none',
    background: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    fontSize: '14px',
  },
  optionSelected: {
    backgroundColor: '#eff6ff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: '500',
    color: '#1e293b',
  },
  userUsername: {
    fontSize: '12px',
    color: '#94a3b8',
  },
  checkmark: {
    color: '#3b82f6',
    fontSize: '16px',
  },
  divider: {
    height: '1px',
    backgroundColor: '#e2e8f0',
    margin: '4px 0',
  },
};