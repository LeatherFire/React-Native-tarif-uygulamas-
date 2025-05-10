import axios from 'axios';
import { OPENAI_API_KEY } from '../constants/config';

const imageInstance = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
  },
});

/**
 * GPT Image-1 modeli ile yemek görseli oluşturur.
 * @param prompt Görseli tarif eden metin
 * @param size "1024x1024" | "1792x1024" | "1024x1792" boyutları
 * @param quality "low" | "medium" | "high" | "auto" kalite ayarı
 * @returns Base64 kodlanmış görsel verisi
 */
export const generateDishImage = async (
  prompt: string,
  size: '1024x1024' | '1792x1024' | '1024x1792' = '1024x1024',
  quality: 'low' | 'medium' | 'high' | 'auto' = 'medium'
): Promise<string> => {
  try {
    const enhancedPrompt = `Pixar'ın "Ratatouille" filmi tarzında 3D animasyon render: ${prompt}. Zengin dokular, ağız sulandıran yemek görselleri, lezzetli görünüm, iştah açıcı aydınlatma ve parlak renkler.`;
    const res = await imageInstance.post('/images/generations', {
      model: 'gpt-image-1',
      prompt: enhancedPrompt,
      n: 1,
      size: size,
      quality: quality
    });
    
    
    // Base64 formatında görsel verisini döndür
    if (res.data.data && res.data.data[0]) {
      // Önce url'i kontrol et
      if (res.data.data[0].url) {
        return res.data.data[0].url;
      }
      // Url yoksa b64_json'ı kontrol et (dokümantasyona göre b64_json olmalı)
      else if (res.data.data[0].b64_json) {
        return `data:image/png;base64,${res.data.data[0].b64_json}`;
      }
      // Her ikisi de yoksa hata fırlat
      else {
        throw new Error("API yanıtında görsel verisi bulunamadı");
      }
    } else {
      throw new Error("API yanıtı beklenen formatta değil");
    }
  } catch (err: any) {
    console.error(
      '[imageService] Görsel oluşturma hatası:',
      err.response?.data || err.message
    );
    
    if (err.response?.data?.error?.message) {
      throw new Error(`Görsel oluşturulurken bir hata oluştu: ${err.response.data.error.message}`);
    } else {
      throw new Error('Görsel oluşturulurken bir hata oluştu.');
    }
  }
};