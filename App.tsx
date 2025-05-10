import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import RootNavigator from './src/navigation/RootNavigator';
import { useThemeStore } from './src/store/themeStore';
import { useRecipeStore } from './src/store/recipeStore';

// Performans iyileştirmesi
enableScreens();

// Store initializer bileşeni
const StoreInitializer = () => {
  const { loadAllRecipes, loadFavorites } = useRecipeStore();
  
  useEffect(() => {
    // Uygulama başlangıcında verileri yükle
    loadAllRecipes();
    loadFavorites();
  }, []);
  
  return null;
};

// AppThemeProvider - tema değişiklikleri için
const AppThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { theme, isDarkMode } = useThemeStore();
  
  return (
    <PaperProvider theme={theme}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      {children}
    </PaperProvider>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AppThemeProvider>
        <StoreInitializer />
        <RootNavigator />
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}