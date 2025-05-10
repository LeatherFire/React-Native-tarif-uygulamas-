// src/screens/HomeScreen.tsx (güncelleme)
import React, { useEffect } from 'react';
import { StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import { Text, FAB, Searchbar } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import RecipeCard from '../components/RecipeCard';
import CategorySelector from '../components/CategorySelector';
import { useRecipeStore } from '../store/recipeStore';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { recipes, isLoading, loadAllRecipes, toggleFavorite } = useRecipeStore();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [refreshing, setRefreshing] = React.useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string | null>(null);

  // Ekran odaklandığında tarifleri yeniden yükle
  useFocusEffect(
    React.useCallback(() => {
      loadAllRecipes();
    }, [])
  );

  // İlk yükleme
  useEffect(() => {
    loadAllRecipes();
  }, []);

  const handleToggleFavorite = async (id: string) => {
    await toggleFavorite(id);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllRecipes();
    setRefreshing(false);
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
  };

  // Önce arama filtresini uygula, sonra kategori filtresini uygula
  const filteredRecipes = recipes
    .filter(recipe => 
      searchQuery 
        ? recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    )
    .filter(recipe => 
      selectedCategoryId 
        ? recipe.categoryId === selectedCategoryId
        : true
    );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Tarif ara..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
      />
      
      <CategorySelector
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={handleCategorySelect}
      />
      
      {filteredRecipes.length > 0 ? (
        <FlatList
          data={filteredRecipes}
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
          {selectedCategoryId ? (
            <Text>Bu kategoride henüz tarif bulunamadı.</Text>
          ) : searchQuery ? (
            <Text>Aramanızla eşleşen tarif bulunamadı.</Text>
          ) : (
            <Text>Henüz tarif bulunamadı.</Text>
          )}
          <Text>Yeni bir tarif oluşturmak için + butonuna dokunun.</Text>
        </View>
      )}
      
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('RecipeOptions')}
      />
    </View>
  );
};

// ... stillemeler aynı

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchBar: {
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 80, // FAB için alan bırakıyoruz
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#FF6B6B',
  },
});

export default HomeScreen;