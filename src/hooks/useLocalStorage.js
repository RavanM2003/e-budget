import { useEffect, useRef, useState } from 'react';

const readValue = (key, defaultValue) => {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.warn(`localStorage read error for ${key}`, error);
    return defaultValue;
  }
};

export const useLocalStorage = (key, defaultValue) => {
  const initialValue = useRef(defaultValue);
  const [value, setValue] = useState(() => readValue(key, defaultValue));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const serialized = JSON.stringify(value);
      window.localStorage.setItem(key, serialized);
    } catch (error) {
      console.warn(`localStorage write error for ${key}`, error);
    }
  }, [key, value]);

  const reset = () => setValue(initialValue.current);

  return [value, setValue, reset];
};
