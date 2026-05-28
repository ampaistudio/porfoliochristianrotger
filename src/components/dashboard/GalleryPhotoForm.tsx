import React from "react";
import { PortfolioConfig } from "../../types";

interface GalleryPhotoFormProps {
  config: PortfolioConfig;
  editingPhotoId: string | null;
  newPhotoUrl: string;
  setNewPhotoUrl: (v: string) => void;
  newPhotoTitle: string;
  setNewPhotoTitle: (v: string) => void;
  newPhotoDesc: string;
  setNewPhotoDesc: (v: string) => void;
  newPhotoCategory: string;
  setNewPhotoCategory: (v: string) => void;
  newPhotoCamera: string;
  setNewPhotoCamera: (v: string) => void;
  newPhotoLens: string;
  setNewPhotoLens: (v: string) => void;
  newPhotoSettings: string;
  setNewPhotoSettings: (v: string) => void;
  newPhotoEditorial: string;
  resetForm: () => void;
  handleAddPhotoSubmit: (e: React.FormEvent) => void;
  sampleUnsplashPresets: { label: string; url: string; cat: string }[];
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
  newPhotoCategory,
  setNewPhotoCategory,
  newPhotoCamera,
  setNewPhotoCamera,
  newPhotoLens,
  setNewPhotoLens,
  newPhotoSettings,
  setNewPhotoSettings,
  newPhotoEditorial,
  resetForm,
  handleAddPhotoSubmit,
  sampleUnsplashPresets,
  onUpdateConfig
}: GalleryPhotoFormProps) {
  const [inlineNewCategory, setInlineNewCategory] = React.useState("");

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
        <div>
          <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1">
            Título de la Foto *
          </label>
          <input
            type="text"
            required
            value={newPhotoTitle}
            onChange={(e) => setNewPhotoTitle(e.target.value)}
            placeholder="Ej. Sombra de Otoño"
            className="w-full text-sm bg-stone-50 border border-stone-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-stone-400 text-stone-800"
          />
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
          Descripción / Pie de foto descriptivo
        </label>
        <textarea
          value={newPhotoDesc}
          onChange={(e) => setNewPhotoDesc(e.target.value)}
          placeholder="Escribe algo sobre la atmósfera de la foto..."
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

      {newPhotoEditorial && (
        <div className="bg-stone-50 p-3.5 rounded-lg border border-stone-100 mt-4">
          <h5 className="text-xs uppercase font-mono font-bold tracking-wider text-stone-500 mb-1">Análisis Curatorial cargado por IA</h5>
          <p className="text-xs text-stone-600 leading-relaxed italic">"{newPhotoEditorial}"</p>
        </div>
      )}

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
