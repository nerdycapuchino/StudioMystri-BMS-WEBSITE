import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
// In a real app, we would handle the missing key more gracefully in the UI.
// Here we just instantiate if it exists to prevent immediate crashes,
// but the actual call will fail or be skipped if key is missing.

let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const generateMarketingContent = async (
  topic: string,
  targetAudience: string,
  channel: 'Email' | 'WhatsApp'
): Promise<string> => {
  if (!ai) {
    // Return a mock response if no API key is present for demo purposes
    return `(Mock AI Response - Set API_KEY to enable real generation)\n\nSubject: Exclusive Offer on ${topic}!\n\nHi there,\n\nWe know ${targetAudience} love quality. That's why we're excited to introduce our latest ${topic} collection...`;
  }

  try {
    const model = 'gemini-3-flash-preview';
    const prompt = `Act as a professional marketing copywriter for a high-end interior design studio called "Studio Mystri".
    Write a catchy ${channel} campaign message about "${topic}".
    The target audience is: "${targetAudience}".
    Keep the tone sophisticated but inviting.
    If it's an email, include a subject line.
    Limit to 150 words.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "Failed to generate content.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating content. Please try again later.";
  }
};