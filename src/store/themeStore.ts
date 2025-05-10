import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DefaultTheme, MD3DarkTheme } from 'react-native-paper';

// Özel açık tema
export const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
    background: '#F8F9FA',
    surface: '#FFFFFF',
    text: '#212529',
    error: '#FF5252',
  },
};

// Özel koyu tema
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#F8F9FA',
    error: '#FF5252',
  },
};

// Tema tipini tanımlama
export type AppTheme = typeof lightTheme;

// ThemeStore tipi
interface ThemeState {
  isDarkMode: boolean;
  theme: AppTheme;
  toggleTheme: () => void;
}

// Tema store'unu oluştur (AsyncStorage ile kalıcı)
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      theme: lightTheme,
      toggleTheme: () => 
        set((state) => ({ 
          isDarkMode: !state.isDarkMode,
          theme: state.isDarkMode ? lightTheme : darkTheme
        })),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);