import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

export interface CuratorialAnalysis {
  editorialReview_en: string;
  editorialReview_es: string;
  suggestedSettings_en: string;
  suggestedSettings_es: string;
}

export async function generateCuratorialAnalysis(
  imageUrl: string,
  camera: string,
  lens: string,
  title: string
): Promise<CuratorialAnalysis> {
  if (!genAI) {
    throw new Error("No VITE_GEMINI_API_KEY found in .env file.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const base64String = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error("Failed to convert image to base64"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    const imagePart = {
      inlineData: {
        data: base64String,
        mimeType: blob.type || "image/jpeg"
      },
    };

    const prompt = `
You are an expert photography curator and technical analyst for the fine-art gallery "Nodo AI Agency".
Analyze the provided photograph. The photograph has the title "${title}".
The technical equipment used was Camera: ${camera}, Lens: ${lens}.

Your task is to generate:
1. An elegant, poetic, and professional "Curatorial Review" that describes the mood, lighting, composition, and emotional impact of the photo.
2. A "Suggested Settings" (Technical Tip) block that estimates the technical settings (Aperture, Shutter Speed, ISO) that might have been used or would be ideal for this shot, explaining briefly why.

You must provide the response in BOTH English and Spanish, formatted EXACTLY as a valid JSON object matching this structure:
{
  "editorialReview_en": "Your curatorial review in English here...",
  "editorialReview_es": "Your curatorial review in Spanish here...",
  "suggestedSettings_en": "Your suggested settings and technical explanation in English here...",
  "suggestedSettings_es": "Your suggested settings and technical explanation in Spanish here..."
}

Do not include markdown blocks, just the pure JSON object. Keep the curatorial review around 3-4 sentences.
    `;

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    
    let jsonStr = responseText;
    if (jsonStr.includes('```json')) {
      jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
    } else if (jsonStr.includes('```')) {
      jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
    }

    const parsedData = JSON.parse(jsonStr) as CuratorialAnalysis;
    return parsedData;
  } catch (error) {
    console.error("Error generating AI analysis via Gemini:", error);
    throw error;
  }
}
