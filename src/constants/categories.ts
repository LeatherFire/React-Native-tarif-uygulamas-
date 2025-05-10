// src/constants/categories.ts
export interface Category {
  id: string;
  name: string;
  icon: string; // Material Community Icons isimlerini kullanacağız
  color?: string; // Opsiyonel kategori rengi
}

export const CATEGORIES: Category[] = [
  {
    id: 'ana-yemek',
    name: 'Ana Yemek',
    icon: 'food-variant',
    color: '#FF6B6B'
  },
  {
    id: 'corba',
    name: 'Çorba',
    icon: 'bowl-mix',
    color: '#F9A826'
  },
  {
    id: 'salata',
    name: 'Salata',
    icon: 'food-apple',
    color: '#6BCB77'
  },
  {
    id: 'tatli',
    name: 'Tatlı',
    icon: 'cake-variant',
    color: '#D65DB1'
  },
  {
    id: 'icecek',
    name: 'İçecek',
    icon: 'cup',
    color: '#4D96FF'
  },
  {
    id: 'atistirmalik',
    name: 'Atıştırmalık',
    icon: 'food-croissant',
    color: '#AA96DA'
  },
  {
    id: 'kahvalti',
    name: 'Kahvaltı',
    icon: 'coffee',
    color: '#C89F65'
  },
  {
    id: 'diger',
    name: 'Diğer',
    icon: 'food',
    color: '#747474'
  }
];