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
    console.log("Warning: GEMINI_API_KEY not found in environment variables.");
} else {
    console.log("Gemini AI successfully initialized (shared module).");
}

export async function generateAIImage(prompt: string): Promise<string | null> {
    if (!imageModel) {
        console.log("AI Image Test: imageModel not initialized.");
        return null;
    }
    try {
        console.log(`AI Image Test: Requesting generation for prompt: "${prompt}"`);
        const result = await imageModel.generateContent(prompt);
        const response = await result.response;

        // Log the structure to see what we get
        console.log("AI Image Test: Full Response received from API.");

        const candidates = response.candidates;
        if (!candidates || candidates.length === 0) {
            console.log("AI Image Test: No candidates in response.");
            return null;
        }

        const parts = candidates[0].content?.parts;
        const imagePart = parts?.find(p => p.inlineData);

        if (imagePart?.inlineData) {
            const data = imagePart.inlineData.data;
            const mimeType = imagePart.inlineData.mimeType;
            console.log(`AI Image Test: Success! MIME: ${mimeType}, Data size: ${data.length}`);
            return `data:${mimeType};base64,${data}`;
        } else {
            console.log("AI Image Test: No inlineData (image) found in parts.");
            // Log parts for debugging if it failed
            console.log("AI Image Test: Parts keys:", parts?.map(p => Object.keys(p)));
        }
    } catch (err) {
        console.error("AI Image Test: Error during generation:", err);
    }
    return null;
}
