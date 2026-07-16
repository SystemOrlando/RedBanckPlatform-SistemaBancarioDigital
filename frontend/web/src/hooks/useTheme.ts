import { useState, useEffect, useRef, useCallback } from 'react';

type Theme = 'light' | 'dark';

const getThemeForHour = (): Theme => {
  const currentHour = new Date().getHours();
  // Día: 06:00 a 17:59 -> light
  // Noche: 18:00 a 05:59 -> dark
  return currentHour >= 6 && currentHour < 18 ? 'light' : 'dark';
};

const applyThemeClass = (theme: Theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(getThemeForHour);
  const isOverridden = useRef(false);

  useEffect(() => {
    applyThemeClass(theme);
  }, [theme]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (isOverridden.current) return;
      setTheme(getThemeForHour());
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const toggleTheme = useCallback(() => {
    isOverridden.current = true;
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggleTheme };
};
