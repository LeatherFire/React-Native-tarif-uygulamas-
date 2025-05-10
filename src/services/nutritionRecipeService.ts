// src/services/nutritionRecipeService.ts
import axios from 'axios';
import { OPENAI_API_KEY } from '../constants/config';
import { NutritionInfo } from '../constants/nutrition';
import { CATEGORIES } from '../constants/categories';

export interface NutritionRecipeData {
  title: string;
  description: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  ingredients: string[];
  instructions: string[];
  nutritionInfo: NutritionInfo;
  categoryId: string; // Kategori ID'si eklendi
  dietTypeIds?: string[];
  mealTypeId?: string;
}

/**
 * Beslenme odaklı tarif oluşturur ve eksik beslenme değerlerini akıllıca doldurur
 */
export const fetchNutritionRecipe = async (
  prompt: string,
  nutritionGoals: Partial<NutritionInfo>,
  dietTypes: string[] = [],
  mealType: string = ''
): Promise<NutritionRecipeData> => {
  try {
    // Kategori listesi oluştur
    const categoryOptions = CATEGORIES.map(cat => `${cat.id}: ${cat.name}`).join(', ');

    // Eksik beslenme değerlerini gerçekçi bir şekilde tamamlayacak sistem mesajı
    const systemMessage = `
    Sen beslenme ve diyetetik konusunda uzman bir şefsin. Lütfen aşağıdaki kurallara göre beslenme değerlerini doğru hesaplayarak tarif oluştur:

    1. Kullanıcı bazı besin değerlerini belirtmişse, tarifi bu değerlere mümkün olduğunca yakın oluştur.
    2. Kullanıcı belirtmediği besin değerlerini, gerçekçi ve dengeli olacak şekilde otomatik hesapla.
    3. Besin değerleri arasında mantıklı bir denge olmalı:
       - 1g protein = yaklaşık 4 kalori
       - 1g karbonhidrat = yaklaşık 4 kalori
       - 1g yağ = yaklaşık 9 kalori
    4. Toplam kaloriler, protein+karbonhidrat+yağ kalorilerinin toplamına yakın olmalı.
    5. Hiçbir besin değeri sıfır olmamalı, en azından minimum miktarda içermeli.
    6. Tarif için en uygun kategoriyi belirle. Mutlaka aşağıdaki kategorilerden birini seç:
       ${categoryOptions}
    
    Kullanıcının girmediği değerleri, yemeğin türüne uygun şekilde otomatik tamamla.
    `;

    // Beslenme hedeflerini oluştur
    const nutritionPrompt = Object.entries(nutritionGoals)
      .filter(([_, value]) => value !== undefined && value > 0)
      .map(([key, value]) => {
        switch (key) {
          case 'calories': return `- Kalori: yaklaşık ${value} kcal`;
          case 'protein': return `- Protein: yaklaşık ${value} gram`;
          case 'carbs': return `- Karbonhidrat: yaklaşık ${value} gram`;
          case 'fat': return `- Yağ: yaklaşık ${value} gram`;
          default: return '';
        }
      })
      .filter(text => text !== '')
      .join('\n');

    // Gerçekçi besin değerleri önermek için daha detaylı prompt
    let autoFillPrompt = '';
    if (Object.keys(nutritionGoals).length < 4) {
      autoFillPrompt = `
      Not: Kullanıcı tüm besin değerlerini belirtmedi. Lütfen eksik değerleri şu şekilde tamamla:
      `;
      
      if (!nutritionGoals.calories && (nutritionGoals.protein || nutritionGoals.carbs || nutritionGoals.fat)) {
        autoFillPrompt += `- Kaloriyi protein, karbonhidrat ve yağ değerlerinden hesapla (p*4 + k*4 + y*9).\n`;
      }
      
      if (!nutritionGoals.protein) {
        autoFillPrompt += `- Protein: Yemeğin türüne uygun, dengeli bir protein miktarı belirle (0 olamaz).\n`;
      }
      
      if (!nutritionGoals.carbs) {
        autoFillPrompt += `- Karbonhidrat: Yemeğin türüne uygun, dengeli bir karbonhidrat miktarı belirle (0 olamaz).\n`;
      }
      
      if (!nutritionGoals.fat) {
        autoFillPrompt += `- Yağ: Yemeğin türüne ve kalori ihtiyacına göre dengeli bir yağ miktarı belirle (0 olamaz).\n`;
      }
    }

    // API isteği için JSON formatı
    const jsonStructure = `
    {
      "title": "Tarif Başlığı",
      "description": "Kısa açıklama",
      "prepTime": hazırlama süresi (dakika, sayı),
      "cookTime": pişirme süresi (dakika, sayı),
      "servings": porsiyon sayısı (sayı),
      "ingredients": ["malzeme 1", "malzeme 2", ...],
      "instructions": ["adım 1", "adım 2", ...],
      "nutritionInfo": {
        "calories": kalori miktarı (sayı),
        "protein": protein miktarı (gram, sayı),
        "carbs": karbonhidrat miktarı (gram, sayı),
        "fat": yağ miktarı (gram, sayı)
      },
      "categoryId": "tarif için en uygun kategori ID'si (ana-yemek, corba, salata, tatli, icecek, atistirmalik, kahvalti, diger kategorilerinden birini seç)"
    }`;

    // OpenAI API isteği için tam prompt
    const fullPrompt = `
    ${prompt}
    
    Beslenme hedefleri:
    ${nutritionPrompt}
    
    ${autoFillPrompt}
    
    ${dietTypes.length > 0 ? `Diyet tipleri: ${dietTypes.join(', ')}` : ''}
    ${mealType ? `Öğün tipi: ${mealType}` : ''}
    
    Lütfen tüm beslenme değerlerini gerçekçi bir şekilde hesapla, hiçbir değer 0 olamaz.
    Ayrıca, tarife en uygun kategori ID'sini seç. Kategoriler: ana-yemek, corba, salata, tatli, icecek, atistirmalik, kahvalti, diger.
    `;

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
              Lütfen aşağıdaki isteğe uygun bir beslenme odaklı yemek tarifi oluştur ve **sadece** JSON yanıtı ver.
              JSON nesnesi şu alanları içermeli:
              ${jsonStructure}
              
              İstek metni: "${fullPrompt}"
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
    
    const data: NutritionRecipeData = JSON.parse(jsonText);
    
    // Eksik kalan beslenme değerlerini düzeltme (yine de boş gelirse)
    if (data.nutritionInfo) {
      // Protein, karbonhidrat ve yağ değerlerinden toplam kalori hesapla
      const calculatedCalories = 
        (data.nutritionInfo.protein || 0) * 4 + 
        (data.nutritionInfo.carbs || 0) * 4 + 
        (data.nutritionInfo.fat || 0) * 9;
      
      // Eğer hesaplanan kalori ile verilen kalori arasında büyük fark varsa güncelle
      if (Math.abs(calculatedCalories - (data.nutritionInfo.calories || 0)) > 50) {
        data.nutritionInfo.calories = Math.round(calculatedCalories);
      }
      
      // Minimum değerler
      data.nutritionInfo.protein = Math.max(1, data.nutritionInfo.protein || 0);
      data.nutritionInfo.carbs = Math.max(1, data.nutritionInfo.carbs || 0);
      data.nutritionInfo.fat = Math.max(1, data.nutritionInfo.fat || 0);
    }
    
    // Eğer kategori ID yoksa varsayılan olarak "diger" kullan
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
      } else if (data.ingredients.some(i => i.toLowerCase().includes('et')) || 
                data.ingredients.some(i => i.toLowerCase().includes('tavuk')) ||
                data.ingredients.some(i => i.toLowerCase().includes('balık'))) {
        data.categoryId = 'ana-yemek';
      } else {
        data.categoryId = 'diger';
      }
    }
    
    return data;
  } catch (err) {
    console.error('[nutritionRecipeService] Beslenme odaklı tarif oluşturma hatası:', err);
    throw new Error('Beslenme odaklı tarif oluşturulurken bir hata oluştu.');
  }
};