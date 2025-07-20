import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// Use the light-weight Gemini model for speed
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Default generation settings
const generationConfig = {
  temperature: 0.4,
  topP: 1,
  topK: 1,
  maxOutputTokens: 256,
  responseMimeType: "text/plain",
};

/**
 * Translate any non-English sentence to clean English.
 * @param {string} text - The text you want to translate.
 * @returns {Promise<string>} Translated English sentence
 */
const translateToEnglish = async (text) => {
  if (!text || typeof text !== "string") {
    throw new Error("Invalid input for translation");
  }

  const prompt = `Translate this sentence to English. Return only the clean English sentence without extra explanation or formatting:\n\n"${text}"`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
    });

    const responseText = result.response.text().trim();
    return responseText;
  } catch (error) {
    console.error("Gemini translation failed:", error.message);
    return text; // Fallback to original if translation fails
  }
};

export { translateToEnglish };
