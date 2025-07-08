
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateScript = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: `Eres un guionista profesional para narraciones de documentales y videos largos.
Tu tarea es generar un guion de voz en off completo, atractivo y bien estructurado.
El guion debe tener una duración aproximada de 12 a 15 minutos cuando se lee a un ritmo moderado, lo que equivale a unas 1800-2250 palabras.
Asegúrate de que el lenguaje sea claro, evocador y adecuado para una voz de narrador masculina y profunda.
Estructura la salida como un único bloque de texto, con párrafos bien definidos para facilitar la lectura y la locución. No uses markdown, solo texto plano.`,
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error generating script with Gemini:", error);
        if (error instanceof Error) {
           throw new Error(`Error de la API de Gemini: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the Gemini API.");
    }
};
