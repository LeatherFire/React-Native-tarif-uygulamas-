// src/services/recipeStorageService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe } from '../constants/mockData';

// Storage anahtar tanımları
const STORAGE_KEYS = {
  RECIPES: 'recipes',
  FAVORITES: 'favorite_recipes',
};

/**
 * Tüm tarifleri depoya kaydeder
 */
export const saveRecipes = async (recipes: Recipe[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(recipes);
    await AsyncStorage.setItem(STORAGE_KEYS.RECIPES, jsonValue);
  } catch (e) {
    console.error('Tarifler kaydedilirken hata oluştu:', e);
    throw new Error('Tarifler kaydedilemedi.');
  }
};

/**
 * Depodaki tüm tarifleri yükler
 */
export const loadRecipes = async (): Promise<Recipe[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.RECIPES);
    return jsonValue ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Tarifler yüklenirken hata oluştu:', e);
    throw new Error('Tarifler yüklenemedi.');
  }
};

/**
 * Tek bir tarifi depoya ekler/günceller
 */
export const saveRecipe = async (recipe: Recipe): Promise<void> => {
  try {
    // Mevcut tarifleri yükle
    const recipes = await loadRecipes();
    
    // Tarif zaten varsa güncelle, yoksa ekle
    const index = recipes.findIndex(r => r.id === recipe.id);
    if (index !== -1) {
      recipes[index] = recipe;
    } else {
      recipes.push(recipe);
    }
    
    // Güncellenmiş tarif listesini kaydet
    await saveRecipes(recipes);
  } catch (e) {
    console.error('Tarif kaydedilirken hata oluştu:', e);
    throw new Error('Tarif kaydedilemedi.');
  }
};

/**
 * ID'ye göre tarif yükler
 */
export const loadRecipeById = async (id: string): Promise<Recipe | null> => {
  try {
    const recipes = await loadRecipes();
    return recipes.find(recipe => recipe.id === id) || null;
  } catch (e) {
    console.error('Tarif yüklenirken hata oluştu:', e);
    throw new Error('Tarif yüklenemedi.');
  }
};

/**
 * ID'ye göre tarif siler
 */
export const deleteRecipe = async (id: string): Promise<void> => {
  try {
    const recipes = await loadRecipes();
    const updatedRecipes = recipes.filter(recipe => recipe.id !== id);
    await saveRecipes(updatedRecipes);
  } catch (e) {
    console.error('Tarif silinirken hata oluştu:', e);
    throw new Error('Tarif silinemedi.');
  }
};

/**
 * Favorileri yükler
 */
export const loadFavoriteRecipes = async (): Promise<string[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
    return jsonValue ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Favoriler yüklenirken hata oluştu:', e);
    throw new Error('Favoriler yüklenemedi.');
  }
};

/**
 * Bir tarifi favorilere ekler/çıkarır
 */
export const toggleFavoriteRecipe = async (id: string): Promise<boolean> => {
  try {
    const favoriteIds = await loadFavoriteRecipes();
    const isFavorite = favoriteIds.includes(id);
    
    let updatedFavorites: string[];
    
    if (isFavorite) {
      // Favorilerden çıkar
      updatedFavorites = favoriteIds.filter(favId => favId !== id);
    } else {
      // Favorilere ekle
      updatedFavorites = [...favoriteIds, id];
    }
    
    // Güncellenmiş favorileri kaydet
    await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updatedFavorites));
    
    // Yeni durumu döndür (true = favorilerde, false = değil)
    return !isFavorite;
  } catch (e) {
    console.error('Favori durumu değiştirilirken hata oluştu:', e);
    throw new Error('Favori durumu değiştirilemedi.');
  }
};