// src/store/recipeStore.ts
import { create } from 'zustand';
import { Recipe } from '../constants/mockData';
import { loadRecipes, saveRecipe, loadFavoriteRecipes, toggleFavoriteRecipe,deleteRecipe } from '../services/recipeStorageService';
import uuid from 'react-native-uuid'; // Normal uuid yerine bu import'u kullanın

interface RecipeState {
  recipes: Recipe[];
  favoriteIds: string[];
  isLoading: boolean;
  error: string | null;

  // Eylemler
  loadAllRecipes: () => Promise<void>;
  addOrUpdateRecipe: (recipe: Partial<Recipe>) => Promise<Recipe>;
  deleteRecipe: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  loadFavorites: () => Promise<void>;
}

export const useRecipeStore = create<RecipeState>((set, get) => ({
  recipes: [],
  favoriteIds: [],
  isLoading: false,
  error: null,

  loadAllRecipes: async () => {
    set({ isLoading: true, error: null });
    try {
      const recipes = await loadRecipes();
      const favoriteIds = await loadFavoriteRecipes();
      
      // Tarifleri favoriler listesine göre güncelle
      const updatedRecipes = recipes.map(recipe => ({
        ...recipe,
        isFavorite: favoriteIds.includes(recipe.id)
      }));
      
      set({ recipes: updatedRecipes, favoriteIds, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
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