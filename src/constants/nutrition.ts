// src/constants/nutrition.ts
export interface NutritionInfo {
  calories: number;
  protein: number;  // gram cinsinden
  carbs: number;    // gram cinsinden
  fat: number;      // gram cinsinden
  sugar?: number;   // gram cinsinden
  fiber?: number;   // gram cinsinden
  sodium?: number;  // miligram cinsinden
}

export interface MealType {
  id: string;
  name: string;
  icon: string;
}

export interface DietType {
  id: string;
  name: string;
  icon: string;
  description: string;
}

// Öğün tipleri
export const MEAL_TYPES: MealType[] = [
  { id: 'breakfast', name: 'Kahvaltı', icon: 'coffee' },
  { id: 'lunch', name: 'Öğle Yemeği', icon: 'food' },
  { id: 'dinner', name: 'Akşam Yemeği', icon: 'food-variant' },
  { id: 'snack', name: 'Atıştırmalık', icon: 'food-apple' },
];

// Diyet tipleri
export const DIET_TYPES: DietType[] = [
  { 
    id: 'balanced', 
    name: 'Dengeli', 
    icon: 'scale-balance',
    description: 'Dengeli makro besinleri içeren genel beslenme planı'
  },
  { 
    id: 'high-protein', 
    name: 'Yüksek Protein', 
    icon: 'arm-flex',
    description: 'Protein oranı yüksek, kas geliştirmeye yönelik beslenme planı'
  },
  { 
    id: 'low-carb', 
    name: 'Düşük Karbonhidrat', 
    icon: 'food-drumstick',
    description: 'Karbonhidrat miktarı kısıtlı, yağ ve protein ağırlıklı beslenme planı'
  },
  { 
    id: 'keto', 
    name: 'Ketojenik', 
    icon: 'food-steak',
    description: 'Çok düşük karbonhidrat, yüksek yağ içeren beslenme planı'
  },
  { 
    id: 'vegetarian', 
    name: 'Vejetaryen', 
    icon: 'leaf',
    description: 'Et içermeyen, sebze, meyve ve süt ürünleri içeren beslenme planı'
  },
  { 
    id: 'vegan', 
    name: 'Vegan', 
    icon: 'sprout',
    description: 'Hayvansal hiçbir ürün içermeyen tamamen bitkisel beslenme planı'
  },
  { 
    id: 'gluten-free', 
    name: 'Glutensiz', 
    icon: 'barley-off',
    description: 'Gluten içermeyen ürünlerden oluşan beslenme planı'
  },
  { 
    id: 'low-fat', 
    name: 'Düşük Yağ', 
    icon: 'oil',
    description: 'Yağ miktarı kısıtlı olan beslenme planı'
  },
];