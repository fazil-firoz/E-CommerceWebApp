import React, { createContext, useState, useEffect } from 'react';
import { themeApi } from '../api/themeApi';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [activeTheme, setActiveTheme] = useState({
    id: 1,
    themeName: 'Kawaii Cute Pink Store',
    themeKey: 'kawaii',
    primaryColor: '#ff6584',
    secondaryColor: '#ff85c0',
    backgroundColor: '#fff5f7',
    accentColor: '#ff2a6d',
    headerBgColor: '#ffffff',
    heroBgGradient: 'linear-gradient(135deg, #ffffff 0%, #fff0f5 45%, #ffe4e6 100%)',
    cardBgColor: '#ffffff',
    textColor: '#2d3748',
    isActive: true
  });
  const [loading, setLoading] = useState(true);

  const fetchActiveTheme = async () => {
    try {
      const response = await themeApi.getActiveTheme();
      if (response.success && response.data) {
        setActiveTheme(response.data);
        applyThemeStyles(response.data);
      }
    } catch (error) {
      console.error('Failed to load active theme', error);
    } finally {
      setLoading(false);
    }
  };

  const applyThemeStyles = (theme) => {
    if (!theme) return;
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.primaryColor || '#ff6584');
    root.style.setProperty('--theme-secondary', theme.secondaryColor || '#ff85c0');
    root.style.setProperty('--theme-bg', theme.backgroundColor || '#fff5f7');
    root.style.setProperty('--theme-accent', theme.accentColor || '#ff2a6d');
    root.style.setProperty('--theme-header-bg', theme.headerBgColor || '#ffffff');
    root.style.setProperty('--theme-hero-gradient', theme.heroBgGradient || 'linear-gradient(135deg, #ffffff 0%, #fff0f5 45%, #ffe4e6 100%)');
    root.style.setProperty('--theme-card-bg', theme.cardBgColor || '#ffffff');
    root.style.setProperty('--theme-text', theme.textColor || '#2d3748');
  };

  useEffect(() => {
    fetchActiveTheme();

    const handleThemeUpdate = () => {
      fetchActiveTheme();
    };

    window.addEventListener('shopThemeUpdated', handleThemeUpdate);
    return () => window.removeEventListener('shopThemeUpdated', handleThemeUpdate);
  }, []);

  return (
    <ThemeContext.Provider value={{ activeTheme, fetchActiveTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
};
