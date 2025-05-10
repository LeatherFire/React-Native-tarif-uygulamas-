// src/screens/HomeScreen.tsx
import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  FlatList, 
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Text, FAB, Searchbar } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import RecipeCard from '../components/RecipeCard';
import CategorySelector from '../components/CategorySelector';
import { useRecipeStore, RECIPES_PER_PAGE } from '../store/recipeStore';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { 
    recipes, 
    isLoading, 
    isFetchingNextPage,
    currentPage,
    hasMoreRecipes,
    loadRecipesByPage, 
    loadMoreRecipes,
    resetPagination,
    toggleFavorite 
  } = useRecipeStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Recipe[] | null>(null);

  // İlk yükleme
  useEffect(() => {
    loadInitialRecipes();
  }, []);

  // Kategori değiştiğinde yeniden yükle
  useEffect(() => {
    if (searchQuery === '') {
      resetPagination();
      loadInitialRecipes();
    }
  }, [selectedCategoryId]);

  // Ekran odaklandığında tarifleri yeniden yükle
  useFocusEffect(
    useCallback(() => {
      // Sadece aktif bir arama yoksa yükle
      if (searchQuery === '' && searchResults === null) {
        loadInitialRecipes();
      }
    }, [searchQuery, searchResults])
  );

  // İlk sayfa tariflerini yükle
  const loadInitialRecipes = useCallback(() => {
    loadRecipesByPage(1, RECIPES_PER_PAGE, selectedCategoryId);
  }, [loadRecipesByPage, selectedCategoryId]);

  // Daha fazla tarif yükle
  const handleLoadMore = useCallback(() => {
    // Arama sonuçları gösteriliyorsa, daha fazla yükleme yapma
    if (searchResults !== null) return;
    
    loadMoreRecipes(RECIPES_PER_PAGE, selectedCategoryId);
  }, [loadMoreRecipes, selectedCategoryId, searchResults]);

  const handleToggleFavorite = useCallback(async (id: string) => {
    await toggleFavorite(id);
  }, [toggleFavorite]);

  // Arama fonksiyonu
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      // Arama temizlendiğinde normal tariflere dön
      setSearchResults(null);
      return;
    }
    
    // Yerel arama yap (kayıtlı tariflerde)
    const results = recipes.filter(recipe => 
      recipe.title.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(results);
  }, [recipes]);

  // Yenileme işlemi
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setSearchQuery('');
    setSearchResults(null);
    resetPagination();
    await loadRecipesByPage(1, RECIPES_PER_PAGE, selectedCategoryId);
    setRefreshing(false);
  }, [loadRecipesByPage, selectedCategoryId, resetPagination]);

  // Kategori seçimi
  const handleCategorySelect = useCallback((categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
    setSearchQuery('');
    setSearchResults(null);
  }, []);

  // Görüntülenecek tarif listesi
  const displayedRecipes = useMemo(() => {
    return searchResults !== null ? searchResults : recipes;
  }, [recipes, searchResults]);

  // Liste öğesini render et
  const renderRecipeItem = useCallback(({ item }) => (
    <RecipeCard 
      recipe={item} 
      onToggleFavorite={handleToggleFavorite} 
    />
  ), [handleToggleFavorite]);

  // Liste altında gösterilecek yükleme göstergesi
  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    
    return (
      <View style={styles.listFooter}>
        <ActivityIndicator size="small" color="#FF6B6B" />
        <Text style={styles.loadingMoreText}>Daha fazla tarif yükleniyor...</Text>
      </View>
    );
  }, [isFetchingNextPage]);

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
      
      {displayedRecipes.length > 0 ? (
        <FlatList
          data={displayedRecipes}
          keyExtractor={item => item.id}
          renderItem={renderRecipeItem}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews={true}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          }
          // Sayfalandırma için yeni özellikler:
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
        />
      ) : (
        <View style={styles.emptyContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#FF6B6B" />
          ) : (
            <>
              {selectedCategoryId ? (
                <Text>Bu kategoride henüz tarif bulunamadı.</Text>
              ) : searchQuery ? (
                <Text>Aramanızla eşleşen tarif bulunamadı.</Text>
              ) : (
                <Text>Henüz tarif bulunamadı.</Text>
              )}
              <Text>Yeni bir tarif oluşturmak için + butonuna dokunun.</Text>
            </>
          )}
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

// Stilleri güncelleyin
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
  listFooter: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  loadingMoreText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#757575'
  }
});

export default HomeScreen;