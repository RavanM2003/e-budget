import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentUser, login as serviceLogin, logout as serviceLogout, register as serviceRegister, forgotPassword as serviceForgotPassword } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const stored = getCurrentUser();
    setUser(stored);
    setInitializing(false);
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setError(null);
    try {
      const loggedIn = await serviceLogin(email, password);
      setUser(loggedIn);
      return loggedIn;
    } catch (err) {
      setError(err.message || 'Unable to login');
      throw err;
    }
  }, []);

  const register = useCallback(async ({ email, password }) => {
    setError(null);
    try {
      const created = await serviceRegister(email, password);
      setUser(created);
      return created;
    } catch (err) {
      setError(err.message || 'Unable to register');
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    serviceLogout();
    setUser(null);
  }, []);

  const forgotPassword = useCallback(async (email) => serviceForgotPassword(email), []);

  const value = useMemo(
    () => ({
      user,
      initializing,
      error,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      forgotPassword
    }),
    [user, initializing, error, login, register, logout, forgotPassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
