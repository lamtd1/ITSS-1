import { GoogleGenerativeAI } from "@google/generative-ai";
import Translation from "../models/Translation.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const API_KEY = process.env.GOOGLE_API_KEY;


const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: { responseMimeType: "application/json" }
});

// Ensure sequence for Translation.translation_id is correctly aligned with current max id
let seqChecked = false;
const ensureTranslationSequence = async () => {
  if (seqChecked) return;
  try {
    await Translation.sequelize.query(`
      SELECT setval(
        pg_get_serial_sequence('"Translation"', 'translation_id'),
        (SELECT COALESCE(MAX(translation_id), 0) + 1 FROM "Translation"),
        false
      );
    `);
    seqChecked = true;
  } catch (e) {
    // Log but do not block translates
    console.warn('Sequence alignment skipped:', e?.message || e);
  }
};

// Helper to classify input
const classifyInput = (text) => {
  const trimmed = text.trim();
  const isJapanese = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(trimmed);
  const wordCount = trimmed.split(/\s+/).length;

  // Japanese Logic
  if (isJapanese) {
    // If it has sentence punctuation or is long, treat as sentence
    if (/[。！？]/.test(trimmed) || trimmed.length > 15) return 'SENTENCE';
    return 'JA_WORD';
  }

  // Vietnamese/Other Logic
  // If it's short (<= 3 words) and no sentence punctuation, treat as word lookup
  if (wordCount <= 3 && !/[.!?]/.test(trimmed)) return 'VI_WORD';

  return 'SENTENCE';
};

export const translate = async (req, res) => {
  try {
    const { text, source, target, mode = 'dictionary', user_id } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    const inputType = classifyInput(text);
    let prompt = '';

    // --- PROMPT DEFINITIONS ---

    if (mode === 'translate' || inputType === 'SENTENCE') {
      prompt = `
        You are a professional translator.
        Task: Translate the following text naturally.
        Input: "${text}"
        
        Rules:
        - If Input is Vietnamese -> Translate to Japanese (Polite/Natural).
        - If Input is Japanese -> Translate to VIETNAMESE.
        - Output JSON: 
          - If Target is Japanese: { "translation": "...", "furigana": "..." } (furigana is the reading of the translation in Hiragana)
          - If Target is Vietnamese: { "translation": "..." }
      `;
    }
    else if (inputType === 'JA_WORD') {
      prompt = `
        You are a Japanese Dictionary.
        Task: Provide a detailed lookup for the Japanese word or short phrase: "${text}"
        
        IMPORTANT: ALL definitions, meanings, and translations MUST be in VIETNAMESE.
        
        Output JSON Format:
        {
          "kanji": "${text}", // The word or phrase itself
          "reading": "...", // Hiragana/Katakana reading
          "han_viet": "...", // Sino-Vietnamese reading (if applicable, else empty string)
          "romaji": "...",
          "kunyomi": "...", // If applicable
          "onyomi": "...", // If applicable
          "stroke_count": number, // If applicable
          "jlpt": "...", // e.g. N5
          "radical": { "symbol": "...", "meaning": "..." },
          "components": ["...", "..."],
          "meaning": "...", // Main meaning in VIETNAMESE
          "translation": "...", // Short translation in VIETNAMESE
          "definition": "...", // Detailed definition in VIETNAMESE
          "usages": [
            { "word": "...", "reading": "...", "meaning": "..." } // Meaning in VIETNAMESE
          ],
          "examples": [
            { "sentence": "...", "reading": "...", "translation": "..." } // Translation in VIETNAMESE. MUST include at least 1 example.
          ]
        }
        Ensure strict JSON format. Return a SINGLE JSON Object, NOT an Array. All keys/strings in double quotes.
      `;
    }
    else if (inputType === 'VI_WORD') {
      prompt = `
        You are a Japanese Dictionary.
        Task: Find 3-5 Japanese terms that match the Vietnamese word: "${text}"
        
        Output JSON Array:
        [
          { 
            "word": "...", // Japanese word
            "reading": "...", // Reading
            "meaning": "..." // Nuance/Meaning in Vietnamese
          }
        ]
        Ensure strict JSON format.
      `;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let textResponse = response.text();

    // Clean up markdown if present
    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(textResponse);
    } catch (e) {
      console.error("JSON Parse Error:", e);
      console.log("Raw Response:", textResponse);
      // Fallback
      jsonResponse = { translation: textResponse };
    }

    // Fix: If JA_WORD but got Array, unwrap it
    if (inputType === 'JA_WORD' && Array.isArray(jsonResponse)) {
      jsonResponse = jsonResponse[0];
    }

    // Determine type based on keys for DB
    let type = 'sentence';
    if (Array.isArray(jsonResponse)) type = 'list';
    else if (jsonResponse.kanji) type = 'word';

    // Align sequence once to avoid duplicate key errors
    await ensureTranslationSequence();

    // Save to DB (PostgreSQL)
    const translation = await Translation.create({
      user_id: user_id ?? 1,
      translation_input_text: text,
      translation_input_source: source,
      translation_input_target: target,
      translation_output: jsonResponse,
      translation_type: type
    });

    res.json(jsonResponse);

  } catch (error) {
    console.error("Translation error:", error);

    // Handle quota exceeded error
    if (error.status === 429) {
      return res.status(429).json({
        error: "API quota exceeded",
        message: "Google Gemini APIの無料枠を超過しました。しばらく待ってから再度お試しください。",
        details: "Đã vượt quá giới hạn API miễn phí. Vui lòng thử lại sau.",
        retryAfter: error.errorDetails?.find(d => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo')?.retryDelay
      });
    }

    // Handle other errors
    res.status(500).json({
      error: "Translation failed",
      message: "翻訳に失敗しました。もう一度お試しください。",
      details: error.message
    });
  }
};

export const getHistory = async (req, res) => {
  try {
    const { user_id } = req.query; // Extract user_id from query params

    const whereClause = {};
    if (user_id) {
      whereClause.user_id = user_id;
    }

    const history = await Translation.findAll({
      where: whereClause, // Apply filter
      order: [['translation_created_at', 'DESC']],
      limit: 50
    });

    // Map back to frontend expected structure
    const formattedHistory = history.map(item => ({
      _id: item.translation_id, // Frontend might expect _id
      input: {
        text: item.translation_input_text,
        source: item.translation_input_source,
        target: item.translation_input_target
      },
      output: item.translation_output,
      type: item.translation_type,
      createdAt: item.translation_created_at
    }));

    res.json(formattedHistory);
  } catch (error) {
    console.error("History error:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
};
