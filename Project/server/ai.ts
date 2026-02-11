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
            const base64Data = imagePart.inlineData.data;
            // 4. Upload using helper
            const publicUrl = await uploadToSupabase(base64Data, imagePart.inlineData.mimeType);

            if (publicUrl) {
                console.log(`[Storage] Image stored at: ${publicUrl}`);
                return publicUrl;
            } else {
                return `data:${imagePart.inlineData.mimeType};base64,${base64Data}`;
            }
        }
    } catch (err) {
        console.error("[AI Image] Status: Error", err);
    }
    return null;
}

export async function uploadToSupabase(base64Data: string, mimeType: string): Promise<string | null> {
    try {
        const buffer = Buffer.from(base64Data, 'base64');
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        const filename = `img-${timestamp}-${random}.png`;

        const { supabase } = await import("./supabase");

        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
            console.warn("[Storage] Supabase credentials missing during upload.");
            return null;
        }

        const { data, error } = await supabase
            .storage
            .from('resource-images')
            .upload(filename, buffer, {
                contentType: mimeType,
                upsert: true
            });

        if (error) {
            console.error(`[Storage] Upload failed: ${error.message} (Code: ${(error as any).statusCode || 'Unknown'})`);
            if ((error as any).statusCode === '403' || error.message.includes('403')) {
                console.error("[Storage] RLS Policy Error: Please ensure 'resource-images' bucket has public Op permissions (INSERT/SELECT).");
            }
            return null;
        }

        const { data: { publicUrl } } = supabase
            .storage
            .from('resource-images')
            .getPublicUrl(filename);

        return publicUrl;
    } catch (e) {
        console.error("[Storage] Helper Error:", e);
        return null;
    }
}
