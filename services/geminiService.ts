
import { GoogleGenAI, Type } from "@google/genai";

export async function analyzeItemImage(base64Image: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = "Analyze this image of a curbside item. Provide a short catchy title, a brief description of its condition, and pick the best category from: Furniture, Books, Toys, Electronics, Clothing, Other. Return the response in JSON format.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING }
          },
          required: ["title", "description", "category"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
}
