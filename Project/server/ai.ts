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
        console.log(`[AI Image] Request: "${prompt.substring(0, 100)}..."`);
        const result = await imageModel.generateContent(prompt);
        const response = await result.response;
        // The image response from Gemini is typically base64 in the parts
        const candidates = response.candidates;

        if (!candidates || candidates.length === 0) return null;

        const parts = candidates[0].content?.parts;
        const imagePart = parts?.find(p => p.inlineData);

        if (imagePart?.inlineData) {
            console.log("[AI Image] Generation Success. Uploading to Supabase...");

            // 1. Convert base64 to Buffer
            const base64Data = imagePart.inlineData.data;
            const buffer = Buffer.from(base64Data, 'base64');

            // 2. Generate unique filename
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(7);
            const filename = `img-${timestamp}-${random}.png`;

            // 3. Upload to Supabase
            // Import dynamically or at top level? Using dynamic import to avoid circular dep issues if any, 
            // but top-level is better. We need to add the import.
            const { supabase } = await import("./supabase");

            if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
                console.warn("[Storage] Supabase credentials missing. Returning base64 (Persistence will be limited).");
                return `data:${imagePart.inlineData.mimeType};base64,${base64Data}`;
            }

            const { data, error } = await supabase
                .storage
                .from('resource-images')
                .upload(filename, buffer, {
                    contentType: imagePart.inlineData.mimeType,
                    upsert: false
                });

            if (error) {
                console.error("[Storage] Upload failed:", error);
                // Fallback to base64 if upload fails, to not break the user flow entirely
                return `data:${imagePart.inlineData.mimeType};base64,${base64Data}`;
            }

            // 4. Get Public URL
            const { data: { publicUrl } } = supabase
                .storage
                .from('resource-images')
                .getPublicUrl(filename);

            console.log(`[Storage] Image stored at: ${publicUrl}`);
            return publicUrl;
        }
    } catch (err) {
        console.error("[AI Image] Status: Error", err);
    }
    return null;
}
