import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

// Use v1beta for gemini-3 models
export const geminiModel = genAI?.getGenerativeModel({
    model: "gemini-3-flash-preview"
}, { apiVersion: "v1beta" });

export const imageModel = genAI?.getGenerativeModel({
    model: "gemini-3-pro-image-preview"
}, { apiVersion: "v1beta" });

if (!genAI) {
    console.log("[AI] Warning: GEMINI_API_KEY not found.");
} else {
    console.log("[AI] System initialized.");
}

export async function generateAIImage(prompt: string): Promise<string | null> {
    if (!imageModel) return null;

    try {
        console.log(`[AI Image] Request: "${prompt.substring(0, 100)}..."`); // Log prompt (truncated)
        const result = await imageModel.generateContent(prompt);
        const response = await result.response;
        const candidates = response.candidates;

        if (!candidates || candidates.length === 0) return null;

        const parts = candidates[0].content?.parts;
        const imagePart = parts?.find(p => p.inlineData);

        if (imagePart?.inlineData) {
            console.log("[AI Image] Status: Success");
            return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
        }
    } catch (err) {
        console.error("[AI Image] Status: Error", err);
    }
    return null;
}
