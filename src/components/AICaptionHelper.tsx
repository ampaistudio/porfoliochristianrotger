import React, { useState } from "react";
import { Sparkles, Camera, Sliders, Feather, Loader, AlertCircle } from "lucide-react";
import { AICaptionResponse } from "../types";

interface AICaptionHelperProps {
  onApply: (caption: AICaptionResponse) => void;
  brandColor: string;
}

export default function AICaptionHelper({ onApply, brandColor }: AICaptionHelperProps) {
  const [idea, setIdea] = useState("");
  const [camera, setCamera] = useState("Sony Alpha 7R V");
  const [lens, setLens] = useState("FE 85mm f/1.4 GM");
  const [style, setStyle] = useState("Cinematográfico de alto contraste");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AICaptionResponse | null>(null);

  const stylePresets = [
    "Cinematográfico, grano suave, misterioso",
    "Minimalista, nórdico, luz natural suave",
    "Alta costura, editorial de revista, dinámico",
    "Brutalista, urbano de alto contraste, frío",
    "Íntimo, melancólico, luz cálida Rembrandt",
  ];

  const handleGenerate = async () => {
    if (!idea.trim()) {
      setError("Por favor indique la idea, sujeto o escena de la fotografía.");
      return;
    }

    setGenerating(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/generate-captions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idea,
          camera,
          lens,
          style,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Algo salió mal generando el pie de foto.");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "Error al conectar con la Inteligencia Artificial.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 sm:p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-amber-600 animate-pulse" />
        <h3 className="font-sans font-medium text-lg text-stone-900">
          Asistente de Portafolio & Copys (Gemini AI)
        </h3>
      </div>
      <p className="text-stone-600 text-xs sm:text-sm mb-6 leading-relaxed">
        Escribe la idea de tu foto y la Inteligencia Artificial redactará un pie de foto poético/artístico en español, un análisis curatorial y sugerirá la mejor aproximación para impresionar a tus clientes.
      </p>

      <div className="space-y-4">
        {/* Concept Input */}
        <div>
          <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1.5">
            Idea o Concepto del Disparo *
          </label>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Ej. Retrato de mujer sosteniendo flores en contraluz cálido con grano nostálgico, en una habitación clásica de hotel..."
            rows={3}
            className="w-full text-sm bg-white border border-stone-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-stone-400 focus:border-stone-400 placeholder:text-stone-400 transition"
          />
        </div>

        {/* Technical Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1.5 flex items-center gap-1">
              <Camera className="w-3.5 h-3.5" /> Cámara Utilizada
            </label>
            <input
              type="text"
              value={camera}
              onChange={(e) => setCamera(e.target.value)}
              placeholder="Ej. Sony Alpha 7R V"
              className="w-full text-sm bg-white border border-stone-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-stone-400 transition text-stone-800"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1.5 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5" /> Lente / Sensor
            </label>
            <input
              type="text"
              value={lens}
              onChange={(e) => setLens(e.target.value)}
              placeholder="Ej. FE 85mm f/1.4 GM"
              className="w-full text-sm bg-white border border-stone-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-stone-400 transition text-stone-800"
            />
          </div>
        </div>

        {/* Style selection */}
        <div>
          <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1.5">
            Estilo Estético de la Toma
          </label>
          <input
            type="text"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full text-sm bg-white border border-stone-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-stone-400 transition text-stone-800 mb-2"
          />
          <div className="flex flex-wrap gap-1.5">
            {stylePresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setStyle(preset)}
                className="text-[11px] bg-stone-200/50 hover:bg-stone-200 text-stone-700 px-2 py-1 rounded transition font-medium"
              >
                {preset.split(",")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          style={{ backgroundColor: brandColor }}
          className="w-full text-white text-sm font-medium py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-95 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {generating ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Generando con Gemini AI...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Redactar con Inteligencia Artificial
            </>
          )}
        </button>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 flex items-start gap-2 text-red-700 text-xs sm:text-sm mt-3">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Error al generar contenido</p>
              <p className="mt-0.5 text-red-600/95 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Result display state */}
        {result && (
          <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 mt-4 space-y-4 animate-fadeIn shadow-sm">
            <div className="border-b border-stone-100 pb-3">
              <span className="text-[10px] font-mono font-bold tracking-widest text-amber-700 uppercase bg-amber-50 px-2 py-0.5 rounded">
                Resultado de Inteligencia Artificial
              </span>
            </div>

            <div>
              <h4 className="text-xs font-mono font-medium text-stone-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <Feather className="w-3 h-3 text-stone-500" /> Pie de Foto Narrativo sugerido
              </h4>
              <p className="text-sm text-stone-800 italic leading-relaxed bg-stone-50 rounded-lg px-3 py-2.5 border border-stone-100 font-sans">
                "{result.caption}"
              </p>
            </div>

            <div>
              <h4 className="text-xs font-mono font-medium text-stone-400 uppercase tracking-widest mb-1.5">
                Reseña Editorial del Concepto
              </h4>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {result.editorialReview}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-mono font-medium text-stone-400 uppercase tracking-widest mb-1.5">
                Sugerencias Técnicas & Iluminación recomendada
              </h4>
              <p className="text-xs sm:text-sm text-stone-500 leading-relaxed bg-stone-50/50 p-2.5 rounded border border-stone-100">
                {result.suggestedSettings}
              </p>
            </div>

            <div className="flex justify-end pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => onApply(result)}
                style={{ backgroundColor: brandColor }}
                className="text-white text-xs font-medium px-4 py-2 rounded-lg hover:opacity-95 transition"
              >
                Aplicar a los Datos del Disparo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
