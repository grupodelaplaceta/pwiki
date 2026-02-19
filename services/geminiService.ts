
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function summarizeArticle(content: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Resume el siguiente contenido de artículo en un tono profesional y enciclopédico (máximo 2 frases): \n\n${content}`,
    });
    return response.text || "Resumen no disponible.";
  } catch (error) {
    console.error("Error de Gemini:", error);
    return "Error al generar el resumen.";
  }
}

export async function suggestRelatedTags(title: string, content: string): Promise<string[]> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Dado el título "${title}" y el contenido "${content.substring(0, 500)}", proporciona un array JSON con 5 etiquetas relevantes en español.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return [];
  }
}
