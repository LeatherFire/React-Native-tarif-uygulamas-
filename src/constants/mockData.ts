// src/constants/mockData.ts
import { NutritionInfo } from './nutrition';

export interface Recipe {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    prepTime: number; // dakika cinsinden
    cookTime: number; // dakika cinsinden
    servings: number;
    ingredients: string[];
    instructions: string[];
    isFavorite: boolean;
    categoryId?: string; // Kategori alanı
    nutritionInfo?: NutritionInfo; // Beslenme bilgileri
    dietTypeIds?: string[]; // Diyet tipi alanları (keto, vegan, vs)
    mealTypeId?: string; // Öğün tipi (kahvaltı, öğle, akşam, atıştırmalık)
  }
  
  export const mockRecipes: Recipe[] = [
    {
      id: '1',
      title: 'Kıymalı Ispanak',
      description: 'Lezzetli ve besleyici bir ıspanak yemeği.',
      imageUrl: 'https://cdn.pixabay.com/photo/2018/04/13/17/12/vegetable-3317055_1280.jpg',
      prepTime: 15,
      cookTime: 30,
      servings: 4,
      ingredients: [
        '500g ıspanak',
        '250g kıyma',
        '1 soğan',
        '2 diş sarımsak',
        '2 yemek kaşığı zeytinyağı',
        'Tuz ve karabiber'
      ],
      instructions: [
        'Soğanı ve sarımsağı ince doğrayın.',
        'Zeytinyağında soğanları pembeleşene kadar kavurun.',
        'Kıymayı ekleyip kavurmaya devam edin.',
        'Yıkanmış ve doğranmış ıspanakları ekleyin.',
        'Tuz ve karabiber ekleyip karıştırın.',
        'Kapağını kapatıp 15-20 dakika pişirin.'
      ],
      isFavorite: false,
      categoryId: 'ana-yemek'
    },
    {
      id: '2',
      title: 'Mantarlı Risotto',
      description: 'Kremsi ve lezzetli İtalyan pirinç yemeği.',
      imageUrl: 'https://cdn.pixabay.com/photo/2014/04/05/11/39/mushroom-316079_1280.jpg',
      prepTime: 10,
      cookTime: 30,
      servings: 2,
      ingredients: [
        '200g arborio pirinci',
        '250g karışık mantar',
        '1 soğan',
        '2 diş sarımsak',
        '100ml beyaz şarap (isteğe bağlı)',
        '750ml sebze suyu',
        '50g rendelenmiş parmesan',
        '2 yemek kaşığı tereyağı',
        'Tuz ve karabiber'
      ],
      instructions: [
        'Soğanı ve sarımsağı ince doğrayın.',
        'Mantarları dilimleyin.',
        'Tereyağında soğanları pembeleşene kadar kavurun.',
        'Pirinci ekleyip 2-3 dakika kavurun.',
        'Beyaz şarabı ekleyip buharlaşana kadar pişirin.',
        'Sebze suyunu azar azar ekleyerek, her seferinde çekilene kadar karıştırın.',
        'Mantarları ekleyin ve pişirmeye devam edin.',
        'Pirinç pişince ocaktan alıp parmesan ve kalan tereyağını ekleyin.',
        'Tuz ve karabiber ile tatlandırın.'
      ],
      isFavorite: true,
      categoryId: 'ana-yemek'
    },
    {
      id: '3',
      title: 'Mercimek Çorbası',
      description: 'Klasik Türk mutfağından besleyici çorba.',
      imageUrl: 'https://cdn.pixabay.com/photo/2019/09/27/09/59/soup-4507314_1280.jpg',
      prepTime: 10,
      cookTime: 40,
      servings: 6,
      ingredients: [
        '2 su bardağı kırmızı mercimek',
        '1 soğan',
        '1 havuç',
        '1 patates',
        '2 yemek kaşığı salça',
        '2 litre su',
        'Tuz ve karabiber',
        'Pul biber ve kuru nane (servis için)'
      ],
      instructions: [
        'Soğanı, havucu ve patatesi küp küp doğrayın.',
        'Mercimekleri yıkayın.',
        'Tencereye zeytinyağı ekleyip soğanları kavurun.',
        'Havuç ve patatesi ekleyip 2-3 dakika daha kavurun.',
        'Salçayı ekleyip karıştırın.',
        'Mercimek ve suyu ekleyip kaynamaya bırakın.',
        'Yaklaşık 30-40 dakika, mercimekler yumuşayana kadar pişirin.',
        'Çorbayı blenderdan geçirin.',
        'Tuz ve karabiber ile tatlandırın.',
        'Üzerine pul biber ve nane serperek servis yapın.'
      ],
      isFavorite: false,
      categoryId: 'corba'
    }
  ];