import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  loading: false,
  initializing: true,
  error: null
};

function reducer(state, action) {
  switch (action.type) {
    case 'RESTORE_SESSION':
      return {
        ...state,
        user: action.payload?.user ?? null,
        token: action.payload?.token ?? null,
        initializing: false,
        error: null
      };
    case 'LOADING':
      return { ...state, loading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        error: null
      };
    case 'ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'LOGOUT':
      return { ...initialState, initializing: false };
    default:
      return state;
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedUser = window.localStorage.getItem('eb:user');
    const storedToken = window.localStorage.getItem('eb:token');
    dispatch({
      type: 'RESTORE_SESSION',
      payload: {
        user: storedUser ? JSON.parse(storedUser) : null,
        token: storedToken ?? null
      }
    });
  }, []);

  useEffect(() => {
    if (state.initializing || typeof window === 'undefined') return;
    if (state.user && state.token) {
      window.localStorage.setItem('eb:user', JSON.stringify(state.user));
      window.localStorage.setItem('eb:token', state.token);
    } else {
      window.localStorage.removeItem('eb:user');
      window.localStorage.removeItem('eb:token');
    }
  }, [state.user, state.token, state.initializing]);

  const login = useCallback(async (credentials) => {
    dispatch({ type: 'LOADING' });
    try {
      const response = await authService.login(credentials);
      dispatch({ type: 'AUTH_SUCCESS', payload: response });
      return response.user;
    } catch (error) {
      dispatch({ type: 'ERROR', payload: error.message });
      throw error;
    }
  }, []);

  const register = useCallback(async (payload) => {
    dispatch({ type: 'LOADING' });
    try {
      const response = await authService.register(payload);
      dispatch({ type: 'AUTH_SUCCESS', payload: response });
      return response.user;
    } catch (error) {
      dispatch({ type: 'ERROR', payload: error.message });
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  }, []);

  const forgotPassword = useCallback(async (email) => authService.forgotPassword(email), []);

  const value = useMemo(() => ({
    ...state,
    isAuthenticated: Boolean(state.user && state.token),
    login,
    register,
    logout,
    forgotPassword
  }), [state, login, register, logout, forgotPassword]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
