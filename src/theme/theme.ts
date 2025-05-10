import { DefaultTheme, DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FF6B6B',
    accent: '#4ECDC4',
    background: '#F8F9FA',
    text: '#212529',
    card: '#FFFFFF',
    border: '#E9ECEF',
  },
};

export const darkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#FF6B6B',
    accent: '#4ECDC4',
    background: '#212529',
    text: '#F8F9FA',
    card: '#343A40',
    border: '#495057',
  },
};

export type AppTheme = typeof lightTheme;