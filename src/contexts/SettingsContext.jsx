import { createContext, useContext, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import i18n from '../i18n';

const defaultSettings = {
  language: 'az',
  currency: 'AZN',
  compactMode: false,
  enableAnimations: true,
  advanced: {
    showGuides: true,
    reduceMotion: false
  }
};

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useLocalStorage('eb:settings', defaultSettings);

  const updateSettings = (next) => {
    setSettings((prev) => {
      const merged = {
        ...prev,
        ...next,
        advanced: { ...prev.advanced, ...(next.advanced || {}) }
      };
      if (next.language && next.language !== i18n.language) {
        i18n.changeLanguage(next.language);
      }
      return merged;
    });
  };

  const value = useMemo(() => ({ settings, updateSettings }), [settings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};
