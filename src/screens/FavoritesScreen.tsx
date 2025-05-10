// src/screens/FavoritesScreen.tsx (güncelleme)
import React, { useEffect } from 'react';
import { StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import { Text } from 'react-native-paper';
import RecipeCard from '../components/RecipeCard';
import { useRecipeStore } from '../store/recipeStore';
import { useFocusEffect } from '@react-navigation/native';

const FavoritesScreen = () => {
  const { recipes, favoriteIds, loadAllRecipes, loadFavorites, toggleFavorite } = useRecipeStore();
  const [refreshing, setRefreshing] = React.useState(false);
  
  // Ekran odaklandığında verileri yenile
  useFocusEffect(
    React.useCallback(() => {
      loadFavorites();
      loadAllRecipes();
    }, [])
  );
  
  // İlk yükleme
  useEffect(() => {
    loadFavorites();
    loadAllRecipes();
  }, []);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadFavorites(), loadAllRecipes()]);
    setRefreshing(false);
  };
  
  const handleToggleFavorite = async (id: string) => {
    await toggleFavorite(id);
  };
  
  // Favori tarifleri filtrele
  const favoriteRecipes = recipes.filter(recipe => favoriteIds.includes(recipe.id));

  return (
    <View style={styles.container}>
      {favoriteRecipes.length > 0 ? (
        <FlatList
          data={favoriteRecipes}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <RecipeCard 
              recipe={item} 
              onToggleFavorite={handleToggleFavorite} 
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text>Henüz favorilerinize tarif eklemediniz.</Text>
          <Text>Tarifleri favorilere eklemek için kalp simgesine dokunun.</Text>
        </View>
      )}
    </View>
  );
};

// ... stillemeler aynı

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FavoritesScreen;