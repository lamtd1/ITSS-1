import { GoogleGenerativeAI } from "@google/generative-ai";
import Translation from "../models/Translation.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
const API_KEY = process.env.GOOGLE_API_KEY;


const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: { responseMimeType: "application/json" }
});

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
    const { text, source, target, mode = 'dictionary' } = req.body;
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
        - Output JSON: { "translation": "..." }
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

    // Save to DB
    const translation = new Translation({
      input: { text, source, target },
      output: jsonResponse,
      type
    });
    await translation.save();

    res.json(jsonResponse);

  } catch (error) {
    console.error("Translation error:", error);
    res.status(500).json({ error: "Translation failed", details: error.message });
  }
};

export const getHistory = async (req, res) => {
  try {
    const history = await Translation.find().sort({ createdAt: -1 }).limit(50);
    res.json(history);
  } catch (error) {
    console.error("History error:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
};
