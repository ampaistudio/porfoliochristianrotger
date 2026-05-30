import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Photo, PortfolioConfig } from "../../types";
import { getLocalizedText } from "../../defaultData";

interface GalleryPhotoCardProps {
  key?: React.Key;
  photo: Photo;
  config: PortfolioConfig;
  onEdit: (photo: Photo) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDrop: (e: React.DragEvent, targetId: string) => void;
}

export default function GalleryPhotoCard({
  photo, config, onEdit, onDelete, onDragStart, onDrop
}: GalleryPhotoCardProps) {
  const thumbSrc = photo.thumbnail_url || photo.url;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, photo.id)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => onDrop(e, photo.id)}
      className="bg-white border border-stone-200 rounded-2xl overflow-hidden hover:shadow-md transition flex flex-col justify-between cursor-move"
    >
      <div className="aspect-[4/3] bg-stone-100 relative overflow-hidden group">
        <img src={thumbSrc} alt={photo.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />

        <div className="absolute top-3 left-3 flex flex-col gap-1">
          <span className="bg-stone-900/90 text-white text-[9px] font-mono tracking-wider px-2 py-0.5 rounded uppercase font-bold">
            {photo.category ? photo.category.split(", ").map((c) => getLocalizedText(c, "es")).join(" / ") : "Sin Categoría"}
          </span>
          {photo.status === "draft" && (
            <span className="bg-amber-500/90 text-white text-[9px] font-mono tracking-wider px-2 py-0.5 rounded uppercase font-bold shadow-sm backdrop-blur-sm w-max border border-amber-400">
              🚧 Borrador
            </span>
          )}
        </div>

        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button
            onClick={() => onEdit(photo)}
            className="bg-white hover:bg-stone-50 text-stone-850 p-2.5 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" /> Editar
          </button>
          <button
            onClick={() => { if (confirm("¿Eliminar?")) onDelete(photo.id); }}
            className="bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Eliminar
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <h4 className="font-sans font-semibold text-stone-900 text-sm truncate">{photo.title}</h4>
          <p className="text-xs text-stone-500 line-clamp-2 h-8 leading-relaxed font-light">
            {photo.description || "Sin descripción descriptiva en la ficha."}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-3.5 border-t border-stone-100 text-[9.5px] font-mono text-stone-450 mt-4">
          {photo.camera && <span className="bg-stone-50 border border-stone-150 px-2 py-0.5 rounded">📷 {photo.camera}</span>}
          {photo.settings && <span className="bg-stone-50 border border-stone-150 px-2 py-0.5 rounded">⚙️ {photo.settings}</span>}
        </div>
      </div>
    </div>
  );
}
