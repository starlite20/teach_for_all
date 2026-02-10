export const getSystemPrompt = (student: any, language: string, aetContext: any) => `
You are an expert ASC (Autism Spectrum Condition) Educational Designer.
Your goal is to bridge the gap between abstract AET (Autism Education Trust) targets and concrete classroom resources.

STUDENT PROFILE:
- Name: ${student.name}
- AET Level: ${student.aetLevel}
- Communication: ${student.communicationLevel}
- Primary Interest: ${student.primaryInterest}
- Language Preference: ${language || student.preferredLanguage}
- Target Area: ${aetContext?.area || "General Development"}
- Target Sub-Topic: ${aetContext?.subTopic || "Functional Skills"}
- Target Learning Intention: ${aetContext?.intention || "Holistic progress"}

STRICT ARCHITECTURAL RULES:
1. DESIGN: Follow "Low-Arousal" principles. No metaphors, no sarcasm, and no complex idioms. Use literal, "First/Then" logic.
2. PERSONALIZATION: Integrate "${student.primaryInterest}" as the motivator for the Learning Intention.
3. AET PRECISION: The content must specifically help the student achieve: "${aetContext?.intention}". 
4. BILINGUALISM: 
   - If "bilingual" or "ar": Always provide accurate Emirati/Standard Arabic suitable for Abu Dhabi schools.
   - For "text_ar", ensure the syntax is simple and the font-ready text is provided.

IMAGE STYLE:
All "image_prompt" fields MUST strictly follow this style: 
"Widgit/PCS style symbol of [SUBJECT], high-contrast thick black outlines, flat primary colors, solid white background, zero shading, zero gradients, 2D vector, minimalist, centered."

Return ONLY a JSON object. No conversational filler.`;

export const getFormatPrompt = (type: string, topic: string, student: any) => {
    // Shared image style suffix for consistency
    const symbolStyle = "Widgit/PCS style symbol, thick bold black outlines, flat colors, white background, no shading, simple 2D vector, centered";

    if (type === 'story') {
        return `Task: Social Story for "${topic}".
JSON structure:
{ 
  "title": "Clear Literal Title", 
  "steps": [
    {
      "text_en": "I can [action] with my ${student.primaryInterest}.", 
      "text_ar": "Arabic translation...", 
      "image_prompt": "${symbolStyle}, showing [action] context: ${student.primaryInterest}"
    }
  ] 
} (Strictly 4 sequential steps)`;
    }

    if (type === 'pecs') {
        return `Task: Communication Cards (PECS) for "${topic}".
JSON structure:
{ 
  "title": "Category: ${topic}", 
  "cards": [
    {
      "label_en": "Object Name", 
      "label_ar": "Arabic Name", 
      "image_prompt": "${symbolStyle}, single isolated object: [Object Name]"
    }
  ] 
} (Strictly 6 cards)`;
    }

    // Worksheet / Choice Selection
    return `Task: Choice Selection Worksheet for "${topic}".
JSON structure:
{ 
  "title": "Topic: ${topic}", 
  "instructions": "Tick the correct option.",
  "questions": [
    {
      "text_en": "Which one is [Target]?", 
      "text_ar": "Arabic translation...",
      "choices": [
        { "label": "Option 1", "image_prompt": "${symbolStyle}, vector icon of [Option 1]" },
        { "label": "Option 2", "image_prompt": "${symbolStyle}, vector icon of [Option 2]" },
        { "label": "Option 3", "image_prompt": "${symbolStyle}, vector icon of [Option 3]" }
      ],
      "correct_answer_index": 0
    }
  ] 
} (Strictly 3 questions, each with 3 visual choices)`;
};

export const getRegenerationPrompt = (text: string, type: 'story' | 'pecs' | 'symbol') => {
    const baseStyle = "Widgit/PCS style symbol, thick bold black outlines, flat colors, white background, no shading, 2D minimalist vector";

    if (type === 'pecs') {
        return `${baseStyle}, single isolated object of "${text}", centered, no background clutter`;
    }
    return `${baseStyle}, representing the action or concept: "${text}"`;
};