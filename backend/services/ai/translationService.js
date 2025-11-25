import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Service dịch tiếng Nhật sử dụng Google Gemini API
 */
class TranslationService {
  constructor() {
    // Đọc API key từ file key_gg.txt
    const keyPath = path.join(__dirname, '../../../key_gg.txt');
    const keyContent = fs.readFileSync(keyPath, 'utf8');
    this.apiKey = keyContent.split('\n')[0].trim();
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  /**
   * Dịch văn bản từ tiếng Nhật sang tiếng Việt
   * @param {string} text - Văn bản tiếng Nhật cần dịch
   * @returns {Promise<string>} - Văn bản tiếng Việt đã dịch
   */
  async translateJapaneseToVietnamese(text) {
    if (!text || text.trim() === '') {
      throw new Error('Văn bản cần dịch không được để trống');
    }

    try {
      console.log('🔄 [JA->VI] Bắt đầu dịch...');
      console.log('📝 Input:', text);
      
      const prompt = `Bạn là một chuyên gia dịch thuật, chuyên dịch từ tiếng Nhật sang tiếng Việt. Hãy dịch chính xác và tự nhiên, giữ nguyên ý nghĩa và ngữ cảnh của văn bản gốc.

Dịch văn bản sau từ tiếng Nhật sang tiếng Việt (chỉ trả về kết quả dịch, không giải thích):

${text}`;

      console.log('📤 Đang gửi request đến Gemini API...');
      const result = await this.model.generateContent(prompt);
      console.log('📥 Đã nhận response từ Gemini API');
      
      const response = await result.response;
      const translatedText = response.text().trim();
      
      console.log('✅ Output:', translatedText);
      console.log('---');
      
      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      throw new Error(`Lỗi dịch thuật: ${error.message}`);
    }
  }
}

export default new TranslationService();
