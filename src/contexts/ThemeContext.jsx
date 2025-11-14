import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { usePrefersColorScheme } from '../hooks/usePrefersColorScheme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const prefersDark = usePrefersColorScheme();
  const [theme, setTheme] = useState(() => window.localStorage.getItem('eb:theme') || (prefersDark ? 'dark' : 'light'));

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    window.localStorage.setItem('eb:theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  const value = useMemo(() => ({
    theme,
    isDark: theme === 'dark',
    setTheme,
    toggleTheme
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return context;
};
