// src/services/openaiService.ts

import axios from 'axios';
import { OPENAI_API_KEY } from '../constants/config';
import { NutritionInfo } from '../constants/nutrition';

const API_URL = 'https://api.openai.com/v1/chat/completions';

export interface RecipeData {
  title: string;
  description: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  ingredients: string[];
  instructions: string[];
  nutritionInfo?: NutritionInfo; // Beslenme bilgileri (opsiyonel)
  dietTypeIds?: string[]; // Diyet tipleri (opsiyonel)
  mealTypeId?: string; // Öğün tipi (opsiyonel)
}

/**
 * gpt-4o-mini modelini kullanarak yemek tarifi oluşturur.
 * @param prompt Tarif için kullanılacak metinsel istek
 * @returns RecipeData biçiminde ayrıştırılmış tarif verisi
 */
export const fetchRecipe = async (prompt: string): Promise<RecipeData> => {
  try {
    // İstek beslenme bilgileri içeriyorsa sistem mesajını ve JSON formatını güncelle
    const isNutritionRequest = prompt.toLowerCase().includes('beslenme') ||
                               prompt.toLowerCase().includes('protein') ||
                               prompt.toLowerCase().includes('kalori') ||
                               prompt.toLowerCase().includes('diyet');

    let systemMessage = 'Sen profesyonel bir şefsiniz. Kullanıcının tarif taleplerini eksiksiz, doğru ve JSON formatında yanıtlayacaksınız.';
    let jsonStructure = `
{
  "title": "Tarif Başlığı",
  "description": "Kısa açıklama",
  "prepTime": hazırlama süresi (dakika, sayı),
  "cookTime": pişirme süresi (dakika, sayı),
  "servings": porsiyon sayısı (sayı),
  "ingredients": ["malzeme 1", "malzeme 2", ...],
  "instructions": ["adım 1", "adım 2", ...]
}`;

    if (isNutritionRequest) {
      systemMessage = 'Sen beslenme ve diyetetik konusunda uzman bir şefsiniz. Beslenme değerlerini doğru hesaplayarak tarif oluşturacaksınız.';
      jsonStructure = `
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
  }
}`;
    }

    const response = await axios.post<{
      choices: { message: { content: string } }[];
    }>(
      API_URL,
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
Lütfen aşağıdaki isteğe uygun bir yemek tarifi oluştur ve **sadece** JSON yanıtı ver. 
JSON nesnesi şu alanları içermeli:
${jsonStructure}
  
İstek metni: "${prompt}"
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
    // Başta/sonda gelebilecek ekstra açıklamaları temizle
    const jsonText = raw
      .trim()
      .replace(/^[^[\{]*/, '')
      .replace(/[^}\]]*$/, '');
    const data: RecipeData = JSON.parse(jsonText);
    return data;
  } catch (err) {
    console.error('[openaiService] Tarif oluşturma hatası:', err);
    throw new Error('Tarif oluşturulurken bir hata oluştu.');
  }
};
