import React, { useState } from "react";
import { PortfolioConfig } from "../../types";
import { generateCuratorialAnalysis } from "../../utils/ai";
import { sampleUnsplashPresets } from "../../defaultData";

interface GalleryPhotoFormProps {
  config: PortfolioConfig;
  editingPhotoId: string | null;
  newPhotoUrl: string;
  setNewPhotoUrl: (v: string) => void;
  newPhotoTitle: string;
  setNewPhotoTitle: (v: string) => void;
  newPhotoDesc: string;
  setNewPhotoDesc: (v: string) => void;
  newPhotoDate: string;
  setNewPhotoDate: (v: string) => void;
  newPhotoStatus: 'published' | 'draft';
  setNewPhotoStatus: (v: 'published' | 'draft') => void;
  newPhotoTranslations: { title_es: string; description_es: string; editorialReview_es: string; suggestedSettings_es: string };
  setNewPhotoTranslations: (v: any) => void;
  newPhotoCategory: string;
  setNewPhotoCategory: (v: string) => void;
  newPhotoCamera: string;
  setNewPhotoCamera: (v: string) => void;
  newPhotoLens: string;
  setNewPhotoLens: (v: string) => void;
  newPhotoSettings: string;
  setNewPhotoSettings: (v: string) => void;
  newPhotoEditorial: string;
  setNewPhotoEditorial?: (v: string) => void;
  newPhotoSuggested?: string;
  setNewPhotoSuggested?: (v: string) => void;
  resetForm: () => void;
  handleAddPhotoSubmit: (e: React.FormEvent) => void;
  onUpdateConfig?: (config: PortfolioConfig) => void;
}

export default function GalleryPhotoForm({
  config,
  editingPhotoId,
  newPhotoUrl,
  setNewPhotoUrl,
  newPhotoTitle,
  setNewPhotoTitle,
  newPhotoDesc,
  setNewPhotoDesc,
  newPhotoDate,
  setNewPhotoDate,
  newPhotoStatus,
  setNewPhotoStatus,
  newPhotoTranslations,
  setNewPhotoTranslations,
  newPhotoCategory,
  setNewPhotoCategory,
  newPhotoCamera,
  setNewPhotoCamera,
  newPhotoLens,
  setNewPhotoLens,
  newPhotoSettings,
  setNewPhotoSettings,
  newPhotoEditorial,
  setNewPhotoEditorial,
  newPhotoSuggested,
  setNewPhotoSuggested,
  resetForm,
  handleAddPhotoSubmit,
  onUpdateConfig
}: GalleryPhotoFormProps) {
  const [inlineNewCategory, setInlineNewCategory] = useState("");
  const [activeLangTab, setActiveLangTab] = useState<"en" | "es">("en");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const handleInlineAddCategory = () => {
    if (!inlineNewCategory.trim() || !onUpdateConfig) return;
    const currentCats = config.categories || [];
    if (!currentCats.includes(inlineNewCategory.trim())) {
      onUpdateConfig({
        ...config,
        categories: [...currentCats, inlineNewCategory.trim()]
      });
    }
    // Auto-select it
    const updatedSelected = newPhotoCategory ? newPhotoCategory.split(", ") : [];
    if (!updatedSelected.includes(inlineNewCategory.trim())) {
      updatedSelected.push(inlineNewCategory.trim());
      setNewPhotoCategory(updatedSelected.join(", "));
    }
    setInlineNewCategory("");
  };

  const handleGenerateAI = async () => {
    if (!newPhotoUrl) {
      alert("Por favor carga una foto primero para que la IA pueda analizarla.");
      return;
    }
    setIsGeneratingAI(true);
    try {
      const aiData = await generateCuratorialAnalysis(newPhotoUrl, newPhotoCamera, newPhotoLens, newPhotoTitle || "Sin Título");
      if (setNewPhotoEditorial) setNewPhotoEditorial(aiData.editorialReview_en);
      setNewPhotoTranslations({
        ...newPhotoTranslations,
        editorialReview_es: aiData.editorialReview_es
      });
      alert("¡Análisis Curatorial y Sugerencias generados en Inglés y Español con éxito!");
    } catch (error: any) {
      alert("Error al generar IA: " + error.message);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <form onSubmit={handleAddPhotoSubmit} className="space-y-4">
      {/* Standard Fallback Input URL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-stone-100 pt-4">
        <div className="md:col-span-2">
          <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1">
            O usar URL de web directa (Unsplash, etc.)
          </label>
          <input
            type="url"
            value={newPhotoUrl}
            onChange={(e) => setNewPhotoUrl(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="w-full text-sm bg-stone-50 border border-stone-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-stone-400 text-stone-800"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1">
            Banco de Prueba rápido
          </label>
          <div className="grid grid-cols-2 gap-1">
            {sampleUnsplashPresets.map((pr) => (
              <button
                key={pr.label}
                type="button"
                onClick={() => {
                  setNewPhotoUrl(pr.url);
                  setNewPhotoCategory(pr.cat);
                  if(!newPhotoTitle) setNewPhotoTitle(pr.label);
                }}
                className="text-[10px] bg-stone-100 border border-stone-200 hover:bg-stone-200 text-stone-800 px-1.5 py-1 rounded truncate transition cursor-pointer"
              >
                + {pr.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="flex bg-stone-100 p-1 rounded-lg w-max mb-4">
            <button
              type="button"
              onClick={() => setActiveLangTab("en")}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition ${activeLangTab === "en" ? "bg-white shadow-sm text-stone-900" : "text-stone-500 hover:text-stone-700"}`}
            >
              EN (Default)
            </button>
            <button
              type="button"
              onClick={() => setActiveLangTab("es")}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition ${activeLangTab === "es" ? "bg-white shadow-sm text-stone-900" : "text-stone-500 hover:text-stone-700"}`}
            >
              ES (Traducción)
            </button>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1">
              {activeLangTab === "en" ? "Photo Title *" : "Título de la Foto *"}
            </label>
            <input
              type="text"
              required={activeLangTab === "en"}
              value={activeLangTab === "en" ? newPhotoTitle : newPhotoTranslations.title_es}
              onChange={(e) => {
                if (activeLangTab === "en") setNewPhotoTitle(e.target.value);
                else setNewPhotoTranslations({ ...newPhotoTranslations, title_es: e.target.value });
              }}
              placeholder={activeLangTab === "en" ? "e.g. Autumn Shadow" : "Ej. Sombra de Otoño"}
              className="w-full text-sm bg-stone-50 border border-stone-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-stone-400 text-stone-800"
            />
          </div>
          
          <div>
            <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1">
              Fecha de Captura/Subida
            </label>
            <input
              type="date"
              required
              value={newPhotoDate}
              onChange={(e) => setNewPhotoDate(e.target.value)}
              className="w-full text-sm bg-stone-50 border border-stone-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-stone-400 text-stone-800"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1">
              Estado de Publicación
            </label>
            <select
              value={newPhotoStatus}
              onChange={(e) => setNewPhotoStatus(e.target.value as 'published' | 'draft')}
              className="w-full text-sm bg-stone-50 border border-stone-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-stone-400 text-stone-800 font-medium"
            >
              <option value="published">🟢 Publicada (Visible para todos)</option>
              <option value="draft">🚧 Borrador (Solo visible en Dashboard)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1.5">
            Categorías / Colecciones (Selecciona una o más) *
          </label>
          <div className="flex flex-wrap gap-1.5 p-3.5 bg-stone-50 border border-stone-200 rounded-xl min-h-[105px] content-start">
            {(config.categories || []).map((cat) => {
              const selectedCats = newPhotoCategory ? newPhotoCategory.split(", ") : [];
              const isSelected = selectedCats.includes(cat);
              
              const handleToggleCategory = () => {
                let updated = [...selectedCats];
                if (isSelected) {
                  updated = updated.filter(c => c !== cat);
                } else {
                  updated.push(cat);
                }
                if (updated.length === 0) {
                  updated = [config.categories?.[0] || "Otro | Other"];
                }
                setNewPhotoCategory(updated.join(", "));
              };

              const parts = cat.split(" | ");
              const label = parts.length > 1 ? `${parts[0]} / ${parts[1]}` : cat;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={handleToggleCategory}
                  style={{
                    borderColor: isSelected ? config.brandColor : "#e5e7eb",
                    backgroundColor: isSelected ? `${config.brandColor}15` : "#ffffff",
                    color: isSelected ? config.brandColor : "#57534e",
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer border shadow-sm transition-all duration-200 active:scale-95 text-stone-755 hover:border-stone-450"
                >
                  <span>{label}</span>
                  {isSelected && <span className="font-bold">✓</span>}
                </button>
              );
            })}
          </div>
          {onUpdateConfig && (
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder="Nueva categoría (ej. Bodas | Weddings)"
                value={inlineNewCategory}
                onChange={(e) => setInlineNewCategory(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleInlineAddCategory(); } }}
                className="flex-1 text-xs bg-white border border-stone-200 rounded-lg p-2 outline-none"
              />
              <button
                type="button"
                onClick={handleInlineAddCategory}
                className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded-lg transition"
              >
                + Añadir
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1">
          {activeLangTab === "en" ? "Description / Caption" : "Descripción / Pie de foto"}
        </label>
        <textarea
          value={activeLangTab === "en" ? newPhotoDesc : newPhotoTranslations.description_es}
          onChange={(e) => {
            if (activeLangTab === "en") setNewPhotoDesc(e.target.value);
            else setNewPhotoTranslations({ ...newPhotoTranslations, description_es: e.target.value });
          }}
          placeholder={activeLangTab === "en" ? "Write about the atmosphere..." : "Escribe algo sobre la atmósfera..."}
          rows={2}
          className="w-full text-sm bg-stone-50 border border-stone-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-stone-400 text-stone-800"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-stone-100 pt-4">
        <div>
          <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1">
            Cámara
          </label>
          <input
            type="text"
            value={newPhotoCamera}
            onChange={(e) => setNewPhotoCamera(e.target.value)}
            placeholder="Sony Alpha 7R V"
            className="w-full text-sm bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-800"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1">
            Lente Utilizado
          </label>
          <input
            type="text"
            value={newPhotoLens}
            onChange={(e) => setNewPhotoLens(e.target.value)}
            placeholder="FE 85mm f/1.4 GM"
            className="w-full text-sm bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-800"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1">
            Parámetros Técnicos
          </label>
          <input
            type="text"
            value={newPhotoSettings}
            onChange={(e) => setNewPhotoSettings(e.target.value)}
            placeholder="f/1.8, 1/250s, ISO 100"
            className="w-full text-sm bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-800"
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-stone-100 pt-4 mt-2">
        <h3 className="text-xs uppercase tracking-wider font-mono font-medium text-amber-600 flex items-center gap-1.5">
          ✨ Análisis Curatorial & Tips
        </h3>
        <button
          type="button"
          onClick={handleGenerateAI}
          disabled={isGeneratingAI || !newPhotoUrl}
          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-300 disabled:cursor-not-allowed text-white text-[10px] uppercase font-mono font-bold tracking-widest rounded-md transition shadow-sm flex items-center gap-1.5"
        >
          {isGeneratingAI ? "Pensando..." : "🪄 Auto-completar con IA (EN & ES)"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] uppercase font-mono text-stone-400 mb-1 font-bold">
            🇺🇸 AI Review (English)
          </label>
          <textarea
            value={newPhotoEditorial || ""}
            onChange={(e) => {
              if (setNewPhotoEditorial) setNewPhotoEditorial(e.target.value);
            }}
            placeholder="e.g. A piece that captures minimalism..."
            rows={3}
            className="w-full text-sm bg-stone-50 border border-stone-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-amber-500 text-stone-800"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase font-mono text-stone-400 mb-1 font-bold">
            🇪🇸 AI Review (Español)
          </label>
          <textarea
            value={newPhotoTranslations.editorialReview_es || ""}
            onChange={(e) => {
              setNewPhotoTranslations({ ...newPhotoTranslations, editorialReview_es: e.target.value });
            }}
            placeholder="Ej: Una pieza que captura la esencia del minimalismo..."
            rows={3}
            className="w-full text-sm bg-stone-50 border border-stone-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-amber-500 text-stone-800"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2.5 pt-4 border-t border-stone-100">
        <button
          type="button"
          onClick={resetForm}
          className="px-4 py-2.5 border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold rounded-lg transition cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          style={{ backgroundColor: config.brandColor }}
          className="px-5 py-2.5 text-white text-xs font-semibold rounded-lg hover:opacity-95 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
        >
          {editingPhotoId ? "Guardar Cambios" : "Agregar a Galería"}
        </button>
      </div>
    </form>
  );
}
