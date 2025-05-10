// src/services/worldCuisineRecipeService.ts
import axios from 'axios';
import { OPENAI_API_KEY } from '../constants/config';
import { CATEGORIES } from '../constants/categories';
import { CUISINES } from '../constants/cuisines';

export interface WorldCuisineRecipeData {
  title: string;
  description: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  ingredients: string[];
  instructions: string[];
  categoryId: string;
  cuisineInfo?: {
    originalName?: string;
    region?: string;
    history?: string;
    servingSuggestions?: string[];
  };
}

/**
 * Seçilen dünya mutfağına göre tarif oluşturur
 * @param cuisineName Seçilen mutfak adı (örn: "Türk Mutfağı", "İtalyan Mutfağı")
 * @param specificDish Spesifik bir yemek adı (opsiyonel)
 * @param additionalNotes Ek notlar (diyet kısıtlamaları, tercihler)
 * @param useRandomDish Rastgele bir yemek önerisi isteniyorsa true
 */
export const fetchWorldCuisineRecipe = async (
  cuisineName: string,
  specificDish: string = '',
  additionalNotes: string = '',
  useRandomDish: boolean = true
): Promise<WorldCuisineRecipeData> => {
  try {
    // Kategori listesi oluştur
    const categoryOptions = CATEGORIES.map(cat => `${cat.id}: ${cat.name}`).join(', ');

    // Sistem mesajı
    const systemMessage = `
    Sen profesyonel bir şef ve dünya mutfakları uzmanısın. Seçilen mutfağın otantik ve geleneksel tariflerini en iyi şekilde oluşturmalısın.
    Tarife uygun kategori seçimi yapmalısın ve bu mutfağın özgün pişirme tekniklerini, malzemelerini ve sunumunu yansıtmalısın.
    Tarif için en uygun kategoriyi aşağıdakilerden seç:
    ${categoryOptions}
    `;

    // Prompt oluşturma
    let prompt = '';
    
    if (useRandomDish) {
      prompt = `
        ${cuisineName} mutfağından otantik ve lezzetli bir tarif oluştur.
        Bu mutfağın geleneksel pişirme teknikleri ve malzemelerini kullan.
        ${additionalNotes ? `Ek notlar: ${additionalNotes}` : ''}
        
        Lütfen tarifi adım adım açıkla ve malzemelerin doğru miktarlarını liste halinde ver.
        Ayrıca bu yemeğin kültürel önemi ve servis önerileri hakkında kısa bilgiler ekle.
      `;
    } else {
      prompt = `
        ${cuisineName} mutfağından "${specificDish}" tarifi oluştur.
        Bu yemeğin en otantik ve geleneksel versiyonunu hazırlamak için gereken tüm adımları ve malzemeleri ver.
        ${additionalNotes ? `Ek notlar: ${additionalNotes}` : ''}
        
        Lütfen tarifi adım adım açıkla ve malzemelerin doğru miktarlarını liste halinde ver.
        Ayrıca bu yemeğin kültürel önemi ve servis önerileri hakkında kısa bilgiler ekle.
      `;
    }

    // JSON formatı
    const jsonStructure = `
    {
      "title": "Tarif Başlığı",
      "description": "Kısa açıklama (tarif hakkında bilgi ve bu mutfağın özelliğini yansıtan)",
      "prepTime": hazırlama süresi (dakika, sayı),
      "cookTime": pişirme süresi (dakika, sayı),
      "servings": porsiyon sayısı (sayı),
      "ingredients": ["malzeme 1", "malzeme 2", ...],
      "instructions": ["adım 1", "adım 2", ...],
      "categoryId": "tarif için en uygun kategori ID'si (ana-yemek, corba, salata, tatli, icecek, atistirmalik, kahvalti, diger kategorilerinden birini seç)",
      "cuisineInfo": {
        "originalName": "Yemeğin orijinal adı (yerel dilde yazılışı)",
        "region": "Bu yemeğin en çok yapıldığı bölge",
        "history": "Yemeğin kısa tarihçesi",
        "servingSuggestions": ["Servis önerisi 1", "Servis önerisi 2", ...]
      }
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
              Lütfen aşağıdaki isteğe uygun bir dünya mutfağı tarifi oluştur ve **sadece** JSON yanıtı ver.
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
    
    const data: WorldCuisineRecipeData = JSON.parse(jsonText);
    
    // Kategori seçimini otomatikleştir
    if (!data.categoryId || data.categoryId.trim() === '') {
      // Mutfak tipine göre varsayılan kategoriler belirle
      if (cuisineName.includes('İtalyan')) {
        data.categoryId = specificDish.toLowerCase().includes('pizza') ? 'ana-yemek' : 
                          specificDish.toLowerCase().includes('pasta') || specificDish.toLowerCase().includes('makarna') ? 'ana-yemek' : 
                          specificDish.toLowerCase().includes('tiramisu') || specificDish.toLowerCase().includes('panna cotta') ? 'tatli' : 'ana-yemek';
      } else if (cuisineName.includes('Türk')) {
        data.categoryId = specificDish.toLowerCase().includes('çorba') ? 'corba' : 
                         specificDish.toLowerCase().includes('kebap') || specificDish.toLowerCase().includes('köfte') ? 'ana-yemek' : 
                         specificDish.toLowerCase().includes('baklava') || specificDish.toLowerCase().includes('tatlı') ? 'tatli' : 'ana-yemek';
      } else if (cuisineName.includes('Japon')) {
        data.categoryId = specificDish.toLowerCase().includes('sushi') || specificDish.toLowerCase().includes('ramen') ? 'ana-yemek' : 
                         specificDish.toLowerCase().includes('mochi') ? 'tatli' : 'ana-yemek';
      } else {
        data.categoryId = 'ana-yemek'; // Varsayılan kategori
      }
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
      } else if (data.title.toLowerCase().includes('içecek') || data.title.toLowerCase().includes('çay') || data.title.toLowerCase().includes('kahve')) {
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
    console.error('[worldCuisineRecipeService] Dünya mutfağı tarifi oluşturma hatası:', err);
    throw new Error('Dünya mutfağı tarifi oluşturulurken bir hata oluştu.');
  }
};