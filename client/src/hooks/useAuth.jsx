import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { authApi, setLogoutHandler } from '../services/api';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      // Only call logout API if we have a user session
      if (user) {
        await authApi.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  }, [user]);

  // Register logout handler for 401 errors
  useEffect(() => {
    setLogoutHandler(logout);
  }, [logout]);

  const checkAuth = async () => {
    try {
      const data = await authApi.getMe();
      setUser(data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const data = await authApi.login(username, password);
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const data = await authApi.register(userData);
    setUser(data.user);
    return data;
  };

  const updatePassword = async (oldPassword, newPassword) => {
    const data = await authApi.updatePassword(oldPassword, newPassword);
    return data;
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updatePassword,
    checkAuth,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
