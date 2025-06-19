import { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

interface Colors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

const lightColors: Colors = {
  primary: '#1976D2',
  secondary: '#7B1FA2',
  accent: '#FF6B35',
  background: '#FAFAFA',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  border: '#E0E0E0',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
};

const darkColors: Colors = {
  primary: '#64B5F6',
  secondary: '#BA68C8',
  accent: '#FF8A65',
  background: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  border: '#333333',
  success: '#81C784',
  warning: '#FFB74D',
  error: '#E57373',
};

export function useTheme() {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    setIsDark(systemColorScheme === 'dark');
  }, [systemColorScheme]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const colors = isDark ? darkColors : lightColors;

  return {
    colors,
    isDark,
    toggleTheme,
  };
}