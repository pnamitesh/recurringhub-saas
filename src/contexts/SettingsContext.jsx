import React, { createContext, useState, useEffect } from 'react';

export const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [theme, setThemeState] = useState('light');
  const [businessName, setBusinessNameState] = useState('Demo Business');
  const [businessType, setBusinessTypeState] = useState('Tuition Center');
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('recurringHub_theme') || 'light';
      const savedBusinessName = localStorage.getItem('recurringHub_businessName') || 'Demo Business';
      const savedBusinessType = localStorage.getItem('recurringHub_businessType') || 'Tuition Center';

      setThemeState(savedTheme);
      setBusinessNameState(savedBusinessName);
      setBusinessTypeState(savedBusinessType);

      // Apply theme immediately
      applyTheme(savedTheme);
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading settings:', err);
      setIsLoading(false);
    }
  }, []);

  // Apply theme to body element
  const applyTheme = (themeName) => {
    try {
      document.body.classList.remove('light', 'dark');
      document.body.classList.add(themeName);
      localStorage.setItem('recurringHub_theme', themeName);
    } catch (err) {
      console.error('Error applying theme:', err);
    }
  };

  // Update theme
  const setTheme = (newTheme) => {
    try {
      setThemeState(newTheme);
      applyTheme(newTheme);
    } catch (err) {
      console.error('Error setting theme:', err);
    }
  };

  // Update business name
  const setBusinessName = (newName) => {
    try {
      setBusinessNameState(newName);
      localStorage.setItem('recurringHub_businessName', newName);
    } catch (err) {
      console.error('Error setting business name:', err);
    }
  };

  // Update business type
  const setBusinessType = (newType) => {
    try {
      setBusinessTypeState(newType);
      localStorage.setItem('recurringHub_businessType', newType);
    } catch (err) {
      console.error('Error setting business type:', err);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const value = {
    theme,
    setTheme,
    businessName,
    setBusinessName,
    businessType,
    setBusinessType
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
