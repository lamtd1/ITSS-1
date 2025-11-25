import translationService from '../services/ai/translationService.js';

/**
 * Controller xử lý các request dịch thuật
 */

/**
 * Dịch từ tiếng Nhật sang tiếng Việt
 */
export const translateJaToVi = async (req, res) => {
  console.log('\n🎯 [CONTROLLER] translateJaToVi được gọi');
  console.log('📦 Request body:', req.body);
  
  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      console.log('⚠️ [CONTROLLER] Text trống, trả về lỗi 400');
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập văn bản cần dịch'
      });
    }

    console.log('➡️ [CONTROLLER] Gọi translationService.translateJapaneseToVietnamese...');
    const translatedText = await translationService.translateJapaneseToVietnamese(text);
    console.log('✅ [CONTROLLER] Nhận kết quả từ service');

    res.json({
      success: true,
      data: {
        sourceLanguage: 'ja',
        targetLanguage: 'vi',
        originalText: text,
        translatedText
      }
    });
  } catch (error) {
    console.error('❌ [CONTROLLER] JA->VI translate error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Có lỗi xảy ra khi dịch văn bản'
    });
  }
};
