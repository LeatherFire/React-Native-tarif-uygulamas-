// src/services/shoppingListService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShoppingItem, ShoppingList } from '../constants/shoppingList';
import uuid from 'react-native-uuid';

// Storage anahtarı
const STORAGE_KEY = 'shopping_list';

/**
 * Alışveriş listesini yükler
 */
export const loadShoppingList = async (): Promise<ShoppingItem[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (!jsonValue) return [];
    
    const shoppingList: ShoppingList = JSON.parse(jsonValue);
    return shoppingList.items || [];
  } catch (e) {
    console.error('Alışveriş listesi yüklenirken hata oluştu:', e);
    throw new Error('Alışveriş listesi yüklenemedi.');
  }
};

/**
 * Alışveriş listesini kaydeder
 */
export const saveShoppingList = async (items: ShoppingItem[]): Promise<void> => {
  try {
    const shoppingList: ShoppingList = { items };
    const jsonValue = JSON.stringify(shoppingList);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (e) {
    console.error('Alışveriş listesi kaydedilirken hata oluştu:', e);
    throw new Error('Alışveriş listesi kaydedilemedi.');
  }
};

/**
 * Alışveriş listesine öğe ekler
 */
export const addShoppingItem = async (
  name: string,
  quantity?: string,
  recipeId?: string
): Promise<ShoppingItem> => {
  try {
    // Mevcut listeyi yükle
    const items = await loadShoppingList();
    
    // Yeni öğe oluştur
    const newItem: ShoppingItem = {
      id: uuid.v4().toString(),
      name,
      quantity,
      recipeId,
      isCompleted: false,
      dateAdded: Date.now()
    };
    
    // Listeye ekle
    const updatedList = [...items, newItem];
    
    // Kaydet
    await saveShoppingList(updatedList);
    
    return newItem;
  } catch (e) {
    console.error('Alışveriş öğesi eklenirken hata oluştu:', e);
    throw new Error('Alışveriş öğesi eklenemedi.');
  }
};

/**
 * Alışveriş listesinden öğe siler
 */
export const removeShoppingItem = async (id: string): Promise<void> => {
  try {
    // Mevcut listeyi yükle
    const items = await loadShoppingList();
    
    // Öğeyi filtrele
    const updatedList = items.filter(item => item.id !== id);
    
    // Kaydet
    await saveShoppingList(updatedList);
  } catch (e) {
    console.error('Alışveriş öğesi silinirken hata oluştu:', e);
    throw new Error('Alışveriş öğesi silinemedi.');
  }
};

/**
 * Alışveriş öğesinin tamamlanma durumunu değiştirir
 */
export const toggleShoppingItemCompletion = async (id: string): Promise<boolean> => {
  try {
    // Mevcut listeyi yükle
    const items = await loadShoppingList();
    
    // Öğeyi bul ve durumunu değiştir
    const updatedList = items.map(item => {
      if (item.id === id) {
        return { ...item, isCompleted: !item.isCompleted };
      }
      return item;
    });
    
    // Değiştirilen öğenin yeni durumu
    const updatedItem = updatedList.find(item => item.id === id);
    const newCompletionStatus = updatedItem ? updatedItem.isCompleted : false;
    
    // Kaydet
    await saveShoppingList(updatedList);
    
    return newCompletionStatus;
  } catch (e) {
    console.error('Alışveriş öğesi durumu değiştirilirken hata oluştu:', e);
    throw new Error('Alışveriş öğesi durumu değiştirilemedi.');
  }
};

/**
 * Tamamlanan tüm öğeleri temizler
 */
export const clearCompletedItems = async (): Promise<void> => {
  try {
    // Mevcut listeyi yükle
    const items = await loadShoppingList();
    
    // Tamamlanmamış öğeleri filtrele
    const updatedList = items.filter(item => !item.isCompleted);
    
    // Kaydet
    await saveShoppingList(updatedList);
  } catch (e) {
    console.error('Tamamlanan öğeler temizlenirken hata oluştu:', e);
    throw new Error('Tamamlanan öğeler temizlenemedi.');
  }
};

/**
 * Tarif ID'sine göre öğeleri ekler (eğer yeni değilse eklenmez)
 */
export const addItemsFromRecipe = async (
  ingredients: string[],
  recipeId: string
): Promise<number> => {
  try {
    // Mevcut listeyi yükle
    const items = await loadShoppingList();
    
    // Yeni öğe sayısını takip et
    let addedCount = 0;
    
    // Malzemeleri işle ve yeni öğeler oluştur
    const newItems: ShoppingItem[] = [];
    
    for (const ingredient of ingredients) {
      // Bu malzeme zaten bu tarif için eklenmişse, tekrar ekleme
      const alreadyExists = items.some(
        item => item.name.toLowerCase() === ingredient.toLowerCase() && item.recipeId === recipeId
      );
      
      if (!alreadyExists) {
        newItems.push({
          id: uuid.v4().toString(),
          name: ingredient,
          recipeId,
          isCompleted: false,
          dateAdded: Date.now()
        });
        
        addedCount++;
      }
    }
    
    // Eğer yeni öğe yoksa işlem yapma
    if (newItems.length === 0) {
      return 0;
    }
    
    // Listeyi güncelle ve kaydet
    const updatedList = [...items, ...newItems];
    await saveShoppingList(updatedList);
    
    return addedCount;
  } catch (e) {
    console.error('Tariften öğeler eklenirken hata oluştu:', e);
    throw new Error('Tariften öğeler eklenemedi.');
  }
};