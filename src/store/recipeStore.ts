// src/store/recipeStore.ts
import { create } from 'zustand';
import { Recipe } from '../constants/mockData';
import { 
  loadRecipes, 
  loadRecipesByPage, 
  getTotalPages,
  saveRecipe, 
  loadFavoriteRecipes, 
  toggleFavoriteRecipe,
  deleteRecipe 
} from '../services/recipeStorageService';
import uuid from 'react-native-uuid'; // Normal uuid yerine bu import'u kullanın

interface RecipeState {
  recipes: Recipe[];
  favoriteIds: string[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  hasMoreRecipes: boolean;
  isFetchingNextPage: boolean;

  // Eylemler
  loadAllRecipes: () => Promise<void>;
  loadRecipesByPage: (page: number, limit: number, categoryId?: string | null) => Promise<void>;
  loadMoreRecipes: (limit: number, categoryId?: string | null) => Promise<void>;
  resetPagination: () => void;
  addOrUpdateRecipe: (recipe: Partial<Recipe>) => Promise<Recipe>;
  deleteRecipe: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  loadFavorites: () => Promise<void>;
}

// Sayfa başına gösterilecek tarif sayısı
export const RECIPES_PER_PAGE = 10;

export const useRecipeStore = create<RecipeState>((set, get) => ({
  recipes: [],
  favoriteIds: [],
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  hasMoreRecipes: true,
  isFetchingNextPage: false,

  // Tüm tarifleri tek seferde yükleme (küçük veri setleri için)
  loadAllRecipes: async () => {
    set({ isLoading: true, error: null });
    try {
      const recipes = await loadRecipes();
      const favoriteIds = await loadFavoriteRecipes();
      
      const updatedRecipes = recipes.map(recipe => ({
        ...recipe,
        isFavorite: favoriteIds.includes(recipe.id)
      }));
      
      set({ 
        recipes: updatedRecipes, 
        favoriteIds, 
        isLoading: false,
        currentPage: 1,
        totalPages: Math.ceil(updatedRecipes.length / RECIPES_PER_PAGE),
        hasMoreRecipes: updatedRecipes.length > RECIPES_PER_PAGE
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

    // Sayfalandırmalı tarif yükleme
  loadRecipesByPage: async (page: number, limit: number, categoryId?: string | null) => {
    // İlk sayfa ise loading true, sonraki sayfalar ise isFetchingNextPage true
    const isFirstPage = page === 1;
    
    set({ 
      isLoading: isFirstPage, 
      isFetchingNextPage: !isFirstPage,
      error: null 
    });
    
    try {
      const paginatedRecipes = await loadRecipesByPage(page, limit, categoryId);
      const totalPages = await getTotalPages(limit, categoryId);
      const favoriteIds = await loadFavoriteRecipes();
      
      // Tariflere favori bilgisini ekle
      const recipesWithFavorites = paginatedRecipes.map(recipe => ({
        ...recipe,
        isFavorite: favoriteIds.includes(recipe.id)
      }));
      
      set(state => ({
        // İlk sayfa ise önceki tarifleri temizle, değilse ekle
        recipes: page === 1 
          ? recipesWithFavorites 
          : [...state.recipes, ...recipesWithFavorites],
        favoriteIds,
        currentPage: page,
        totalPages,
        hasMoreRecipes: page < totalPages,
        isLoading: false,
        isFetchingNextPage: false
      }));
    } catch (err: any) {
      set({ 
        error: err.message, 
        isLoading: false, 
        isFetchingNextPage: false 
      });
    }
  },

  // Daha fazla tarif yükleme (mevcut sayfadan sonraki sayfa)
  loadMoreRecipes: async (limit: number, categoryId?: string | null) => {
    const { currentPage, hasMoreRecipes, isFetchingNextPage } = get();
    
    // Daha fazla sayfa yoksa veya zaten yükleme yapılıyorsa işlemi durdur
    if (!hasMoreRecipes || isFetchingNextPage) return;
    
    const nextPage = currentPage + 1;
    await get().loadRecipesByPage(nextPage, limit, categoryId);
  },

  // Sayfalandırmayı sıfırlama
  resetPagination: () => {
    set({
      currentPage: 1,
      recipes: [],
      hasMoreRecipes: true
    });
  },

  // src/store/recipeStore.ts dosyanızdaki addOrUpdateRecipe fonksiyonunu güncelleme
  addOrUpdateRecipe: async (recipeData: Partial<Recipe>): Promise<Recipe> => {
    set({ isLoading: true, error: null });
    try {
      // ID yoksa yeni bir tarif oluştur
      const isNewRecipe = !recipeData.id;

      // Tarifte eksik alanların kontrolünü yapalım
      const recipe: Recipe = {
        id: recipeData.id || uuid.v4().toString(),
        title: recipeData.title || 'İsimsiz Tarif',
        description: recipeData.description || '',
        imageUrl: recipeData.imageUrl || '',
        prepTime: recipeData.prepTime || 0,
        cookTime: recipeData.cookTime || 0,
        servings: recipeData.servings || 0,
        ingredients: recipeData.ingredients || [],
        instructions: recipeData.instructions || [],
        categoryId: recipeData.categoryId || 'diger', // Kategori ID'si, varsayılan olarak "diger"
        isFavorite: false, // Başlangıçta favori olmamalı
        createdAt: recipeData.createdAt || Date.now(), // Şimdiki zaman
        nutritionInfo: recipeData.nutritionInfo, // Beslenme bilgileri
        dietTypeIds: recipeData.dietTypeIds, // Diyet tipleri
        mealTypeId: recipeData.mealTypeId, // Öğün tipi
      };

      // Konsola debug bilgisi yazdıralım
      console.log('Kaydedilecek tarif:', JSON.stringify(recipe));

      // Tarifi kaydet
      await saveRecipe(recipe);

      // Store'da güncelle
      const currentRecipes = get().recipes;
      if (isNewRecipe) {
        set({
          recipes: [...currentRecipes, recipe],
          isLoading: false
        });
      } else {
        set({
          recipes: currentRecipes.map(r => r.id === recipe.id ? recipe : r),
          isLoading: false
        });
      }

      return recipe;
    } catch (err: any) {
      console.error('Tarif kaydetme hatası detayları:', err);
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  // Tarif sil
  deleteRecipe: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // Depodan sil
      await deleteRecipe(id);

      // Store'dan sil
      const currentRecipes = get().recipes;
      set({
        recipes: currentRecipes.filter(r => r.id !== id),
        isLoading: false
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  // Favorileri yükle
  loadFavorites: async () => {
    try {
      const favoriteIds = await loadFavoriteRecipes();
      set({ favoriteIds });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  // Favori durumunu değiştir
  toggleFavorite: async (id: string) => {
    try {
      // Önceki kodunuz aynı
      const isFavorite = await toggleFavoriteRecipe(id);
      
      // Store'u güncelle
      set(state => {
        // Favori ID'lerini güncelle
        const favoriteIds = isFavorite 
          ? [...state.favoriteIds, id]
          : state.favoriteIds.filter(fId => fId !== id);
        
        // Tarif listesini güncelle - isFavorite özelliğini de güncelliyoruz
        const recipes = state.recipes.map(recipe => {
          if (recipe.id === id) {
            return { ...recipe, isFavorite };
          }
          return recipe;
        });
        
        return { favoriteIds, recipes };
      });
    } catch (err: any) {
      set({ error: err.message });
    }
  }
}));