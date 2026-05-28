import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing JSON bodies
app.use(express.json());

// API route: Generate photography captions with Gemini
app.post("/api/generate-captions", async (req, res) => {
  try {
    const { idea, camera, lens, style, language = "es" } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return res.status(400).json({
        error: "Falta la clave API de Gemini. Por favor, confígurela en el panel 'Settings > Secrets' de AI Studio.",
        isConfigError: true
      });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    // Provide a detailed system instruction for creative photo descriptions
    const systemInstruction = 
      "Eres un redactor y curador de arte profesional especializado en fotografía editorial de alta gama. " +
      "Tu objetivo es escribir un pie de foto (caption) poético, artístico y sumamente profesional para una foto, " +
      "así como sugerir configuraciones técnicas óptimas si falta alguna. Responde únicamente con un objeto JSON válido " +
      "que tenga las propiedades: 'caption' (el pie de foto en el idioma solicitado), 'editorialReview' (una breve " +
      "reseña del concepto artístico de 2 a 3 líneas), 'suggestedSettings' (un párrafo corto comentando qué apertura, " +
      "velocidad y técnica de iluminación encajaría mejor con la idea para impresionar al cliente, en un tono sofisticado).";

    const prompt = `Escribe la información de la foto basada en:
Idea/Sujeto: "${idea || "Fotografía de retrato o de autor"}"
Cámara declarada: "${camera || "No declarada"}"
Lente declarado: "${lens || "No declarado"}"
Estilo deseado: "${style || "Cinematográfico, minimalista y elegante"}"
Idioma: "${language}"

Por favor genera el objeto JSON con las llaves solicitadas. No incluyas explicaciones de Markdown adicionales fuera del bloque JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.85,
      },
    });

    const jsonText = response.text || "{}";
    const result = JSON.parse(jsonText.trim());

    res.json(result);
  } catch (error: any) {
    console.error("Error in /api/generate-captions:", error);
    res.status(500).json({ 
      error: "Error interno al invocar a Gemini. Asegúrese de que su clave de API sea válida.",
      details: error.message 
    });
  }
});

// Setup Vite middleware in Development mode, otherwise serve build static assets
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

setupVite().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
});
