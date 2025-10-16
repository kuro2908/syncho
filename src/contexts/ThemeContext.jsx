import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const themes = {
  dark: {
    name: 'Blue Dark',
    bg: 'bg-slate-900',
    bgSecondary: 'bg-slate-800',
    bgTertiary: 'bg-slate-700',
    text: 'text-white',
    textSecondary: 'text-slate-300',
    textMuted: 'text-slate-400',
    border: 'border-slate-700',
    accent: 'bg-sky-600',
    accentHover: 'hover:bg-sky-700',
    accentText: 'text-sky-400',
    accentButtonText: 'text-white'
  },
  pureDark: {
    name: 'Pure Dark',
    bg: 'bg-black',
    bgSecondary: 'bg-neutral-900',
    bgTertiary: 'bg-neutral-800',
    text: 'text-white',
    textSecondary: 'text-neutral-300',
    textMuted: 'text-neutral-400',
    border: 'border-neutral-800',
    accent: 'bg-neutral-700',
    accentHover: 'hover:bg-neutral-600',
    accentText: 'text-neutral-300',
    accentButtonText: 'text-white'
  },
  darkHighContrast: {
    name: 'Dark High Contrast',
    bg: 'bg-black',
    bgSecondary: 'bg-neutral-950',
    bgTertiary: 'bg-neutral-900',
    text: 'text-white',
    textSecondary: 'text-gray-100',
    textMuted: 'text-gray-300',
    border: 'border-white',
    accent: 'bg-white',
    accentHover: 'hover:bg-gray-200',
    accentText: 'text-black',
    accentButtonText: 'text-black'
  },
  light: {
    name: 'Light',
    bg: 'bg-gray-50',
    bgSecondary: 'bg-white',
    bgTertiary: 'bg-gray-100',
    text: 'text-gray-900',
    textSecondary: 'text-gray-700',
    textMuted: 'text-gray-500',
    border: 'border-gray-200',
    accent: 'bg-blue-600',
    accentHover: 'hover:bg-blue-700',
    accentText: 'text-blue-600',
    accentButtonText: 'text-white'
  },
  lightHighContrast: {
    name: 'Light High Contrast',
    bg: 'bg-white',
    bgSecondary: 'bg-gray-50',
    bgTertiary: 'bg-gray-100',
    text: 'text-black',
    textSecondary: 'text-gray-900',
    textMuted: 'text-gray-700',
    border: 'border-black',
    accent: 'bg-black',
    accentHover: 'hover:bg-gray-900',
    accentText: 'text-black',
    accentButtonText: 'text-white'
  },
  blue: {
    name: 'Ocean Blue',
    bg: 'bg-blue-950',
    bgSecondary: 'bg-blue-900',
    bgTertiary: 'bg-blue-800',
    text: 'text-white',
    textSecondary: 'text-blue-100',
    textMuted: 'text-blue-300',
    border: 'border-blue-700',
    accent: 'bg-cyan-500',
    accentHover: 'hover:bg-cyan-600',
    accentText: 'text-cyan-400',
    accentButtonText: 'text-white'
  },
  purple: {
    name: 'Purple Dream',
    bg: 'bg-purple-950',
    bgSecondary: 'bg-purple-900',
    bgTertiary: 'bg-purple-800',
    text: 'text-white',
    textSecondary: 'text-purple-100',
    textMuted: 'text-purple-300',
    border: 'border-purple-700',
    accent: 'bg-pink-500',
    accentHover: 'hover:bg-pink-600',
    accentText: 'text-pink-400',
    accentButtonText: 'text-white'
  },
  green: {
    name: 'Forest Green',
    bg: 'bg-green-950',
    bgSecondary: 'bg-green-900',
    bgTertiary: 'bg-green-800',
    text: 'text-white',
    textSecondary: 'text-green-100',
    textMuted: 'text-green-300',
    border: 'border-green-700',
    accent: 'bg-emerald-500',
    accentHover: 'hover:bg-emerald-600',
    accentText: 'text-emerald-400',
    accentButtonText: 'text-white'
  },
  rose: {
    name: 'Rose Garden',
    bg: 'bg-rose-950',
    bgSecondary: 'bg-rose-900',
    bgTertiary: 'bg-rose-800',
    text: 'text-white',
    textSecondary: 'text-rose-100',
    textMuted: 'text-rose-300',
    border: 'border-rose-700',
    accent: 'bg-pink-500',
    accentHover: 'hover:bg-pink-600',
    accentText: 'text-pink-400',
    accentButtonText: 'text-white'
  }
};

export const ThemeProvider = ({ children }) => {
  // Initialize state with saved theme from localStorage
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedTheme = localStorage.getItem('syncho-theme');
    return (savedTheme && themes[savedTheme]) ? savedTheme : 'dark';
  });

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('syncho-theme', currentTheme);
  }, [currentTheme]);

  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  const theme = themes[currentTheme];

  return (
    <ThemeContext.Provider value={{ theme, currentTheme, changeTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};
