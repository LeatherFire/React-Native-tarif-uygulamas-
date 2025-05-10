// src/services/ingredientBasedRecipeService.ts
import axios from 'axios';
import { OPENAI_API_KEY } from '../constants/config';
import { CATEGORIES } from '../constants/categories';

export interface IngredientBasedRecipeData {
  title: string;
  description: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  ingredients: string[];
  instructions: string[];
  categoryId: string;
  missingIngredients?: string[]; // Eksik olan ama önerilen malzemeler
}

/**
 * Eldeki malzemelere göre tarif oluşturur
 * @param availableIngredients Kullanıcının elindeki malzemeler
 * @param excludedIngredients Kullanılmak istenmeyen malzemeler
 * @param recipeType İstenilen tarif türü (ör: çorba, makarna)
 * @param additionalNotes Ek notlar (diyet kısıtlamaları, tercihler)
 */
export const fetchIngredientBasedRecipe = async (
  availableIngredients: string[],
  excludedIngredients: string[] = [],
  recipeType: string = '',
  additionalNotes: string = ''
): Promise<IngredientBasedRecipeData> => {
  try {
    // Kategori listesi oluştur
    const categoryOptions = CATEGORIES.map(cat => `${cat.id}: ${cat.name}`).join(', ');

    // Sistem mesajı
    const systemMessage = `
    Sen yaratıcı bir şefsin. Kullanıcının belirttiği malzemelerle yapılabilecek en lezzetli ve pratik tarifi oluştur.
    Kullanıcı hangi malzemelere sahip olduğunu belirtti. Başka bir malzemeye ihtiyaç varsa, bunu belirt.
    Tarif için en uygun kategoriyi aşağıdakilerden seç:
    ${categoryOptions}
    `;

    // Malzemeleri metin haline getir
    const ingredientsText = availableIngredients.join(', ');
    const excludedText = excludedIngredients.length > 0 
      ? `Şu malzemeleri kullanma: ${excludedIngredients.join(', ')}.` 
      : '';
    
    const typeText = recipeType 
      ? `Tarif türü: ${recipeType}.` 
      : 'Mevcut malzemelerle yapılabilecek en iyi tarifi öner.';

    // Prompt oluştur
    const prompt = `
      Elimdeki malzemeler: ${ingredientsText}.
      ${excludedText}
      ${typeText}
      ${additionalNotes ? `Ek notlar: ${additionalNotes}` : ''}
      
      Lütfen bu malzemelerle yapılabilecek bir tarif oluştur. Eksik temel malzemeler varsa belirt.
      Tarif için en uygun kategoriyi mutlaka belirle.
    `;

    // JSON formatı
    const jsonStructure = `
    {
      "title": "Tarif Başlığı",
      "description": "Kısa açıklama (tarif hakkında bilgi ve neden bu malzemelerle iyi olduğu)",
      "prepTime": hazırlama süresi (dakika, sayı),
      "cookTime": pişirme süresi (dakika, sayı),
      "servings": porsiyon sayısı (sayı),
      "ingredients": ["gereken malzeme 1", "gereken malzeme 2", ...],
      "instructions": ["adım 1", "adım 2", ...],
      "categoryId": "tarif için en uygun kategori ID'si (ana-yemek, corba, salata, tatli, icecek, atistirmalik, kahvalti, diger kategorilerinden birini seç)",
      "missingIngredients": ["eksik olan ama gerekli malzeme 1", "eksik olan ama gerekli malzeme 2", ...] (opsiyonel, kullanıcının elinde olmayan ama önerilen malzemeler)
    }`;

    // API isteği
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemMessage,
          },
          {
            role: 'user',
            content: `
              Lütfen aşağıdaki malzemelerle yapılabilecek bir tarif oluştur ve **sadece** JSON yanıtı ver.
              JSON nesnesi şu alanları içermeli:
              ${jsonStructure}
              
              İstek: "${prompt}"
            `.trim(),
          },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const raw = response.data.choices[0].message.content;
    
    // JSON yanıtını temizle
    const jsonText = raw
      .trim()
      .replace(/^[^{]*/, '')
      .replace(/[^}]*$/, '');
    
    const data: IngredientBasedRecipeData = JSON.parse(jsonText);
    
    // Eksik kategori kontrolü
    if (!data.categoryId || data.categoryId.trim() === '') {
      data.categoryId = 'diger';
    }
    
    // Kategori ID'sinin geçerli olup olmadığını kontrol et
    const validCategoryIds = CATEGORIES.map(cat => cat.id);
    if (!validCategoryIds.includes(data.categoryId)) {
      // Eğer geçersiz bir kategori ID döndüyse, tarif adına göre en uygun kategoriyi bul
      if (data.title.toLowerCase().includes('çorba')) {
        data.categoryId = 'corba';
      } else if (data.title.toLowerCase().includes('salata')) {
        data.categoryId = 'salata';
      } else if (data.title.toLowerCase().includes('tatlı') || data.title.toLowerCase().includes('kurabiye')) {
        data.categoryId = 'tatli';
      } else if (data.title.toLowerCase().includes('içecek') || data.title.toLowerCase().includes('smoothie')) {
        data.categoryId = 'icecek';
      } else if (data.title.toLowerCase().includes('kahvaltı')) {
        data.categoryId = 'kahvalti';
      } else if (
        data.ingredients.some(i => i.toLowerCase().includes('et')) || 
        data.ingredients.some(i => i.toLowerCase().includes('tavuk')) ||
        data.ingredients.some(i => i.toLowerCase().includes('balık'))
      ) {
        data.categoryId = 'ana-yemek';
      } else {
        data.categoryId = 'diger';
      }
    }
    
    return data;
  } catch (err) {
    console.error('[ingredientBasedRecipeService] Malzeme bazlı tarif oluşturma hatası:', err);
    throw new Error('Malzeme bazlı tarif oluşturulurken bir hata oluştu.');
  }
};