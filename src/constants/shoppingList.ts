// src/constants/shoppingList.ts
export interface ShoppingItem {
  id: string;         // Benzersiz kimlik
  name: string;       // Malzemenin adı
  quantity?: string;  // Miktar (opsiyonel)
  recipeId?: string;  // Hangi tariften eklendiği (opsiyonel)
  isCompleted: boolean; // Tamamlandı mı?
  dateAdded: number;  // Eklenme tarihi (timestamp)
}

export interface ShoppingList {
  items: ShoppingItem[];
}