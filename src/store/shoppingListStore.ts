// src/store/shoppingListStore.ts
import { create } from 'zustand';
import { ShoppingItem } from '../constants/shoppingList';
import { 
  loadShoppingList, 
  saveShoppingList, 
  addShoppingItem, 
  removeShoppingItem, 
  toggleShoppingItemCompletion,
  clearCompletedItems,
  addItemsFromRecipe
} from '../services/shoppingListService';

interface ShoppingListState {
  items: ShoppingItem[];
  isLoading: boolean;
  error: string | null;
  
  // Eylemler
  loadItems: () => Promise<void>;
  addItem: (name: string, quantity?: string, recipeId?: string) => Promise<ShoppingItem>;
  removeItem: (id: string) => Promise<void>;
  toggleItemCompletion: (id: string) => Promise<void>;
  clearCompleted: () => Promise<void>;
  addItemsFromRecipe: (ingredients: string[], recipeId: string) => Promise<number>;
}

export const useShoppingListStore = create<ShoppingListState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  
  // Alışveriş listesini yükle
  loadItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const items = await loadShoppingList();
      set({ items, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
  
  // Yeni öğe ekle
  addItem: async (name, quantity, recipeId) => {
    set({ isLoading: true, error: null });
    try {
      const newItem = await addShoppingItem(name, quantity, recipeId);
      set(state => ({ 
        items: [...state.items, newItem],
        isLoading: false 
      }));
      return newItem;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },
  
  // Öğe sil
  removeItem: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await removeShoppingItem(id);
      set(state => ({
        items: state.items.filter(item => item.id !== id),
        isLoading: false
      }));
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
  
  // Öğe tamamlanma durumunu değiştir
  toggleItemCompletion: async (id) => {
    try {
      const newStatus = await toggleShoppingItemCompletion(id);
      set(state => ({
        items: state.items.map(item => 
          item.id === id 
            ? { ...item, isCompleted: newStatus } 
            : item
        )
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },
  
  // Tamamlanan öğeleri temizle
  clearCompleted: async () => {
    set({ isLoading: true, error: null });
    try {
      await clearCompletedItems();
      set(state => ({
        items: state.items.filter(item => !item.isCompleted),
        isLoading: false
      }));
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
  
  // Tariften öğeleri ekle
  addItemsFromRecipe: async (ingredients, recipeId) => {
    set({ isLoading: true, error: null });
    try {
      const addedCount = await addItemsFromRecipe(ingredients, recipeId);
      
      // Listeyi yeniden yükle
      const items = await loadShoppingList();
      set({ items, isLoading: false });
      
      return addedCount;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  }
}));