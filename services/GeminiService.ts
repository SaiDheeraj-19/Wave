
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getSmartRecommendations(listeningHistory: string[]) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Given this listening history: ${listeningHistory.join(', ')}, suggest 5 music genres and a mood for a custom playlist.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            genres: { type: Type.ARRAY, items: { type: Type.STRING } },
            mood: { type: Type.STRING },
            reasoning: { type: Type.STRING }
          },
          required: ['genres', 'mood']
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Recommendation failed:", error);
    return { genres: ['Jazz', 'Lofi'], mood: 'Chill', reasoning: 'Default fallback due to offline/error.' };
  }
}
