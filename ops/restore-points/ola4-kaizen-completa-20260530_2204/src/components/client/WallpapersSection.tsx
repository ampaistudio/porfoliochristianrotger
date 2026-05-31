import React, { useState } from "react";
import { Download } from "lucide-react";
import { Photo } from "../../types";
import { track } from "@vercel/analytics";

interface Props {
  wallpapers: Photo[];
  lang: "es" | "en";
  brandColor: string;
}

export default function WallpapersSection({ wallpapers, lang, brandColor }: Props) {
  const [downloading, setDownloading] = useState<string | null>(null);

  if (wallpapers.length === 0) return null;

  const handleDownload = async (photo: Photo) => {
    setDownloading(photo.id);
    try {
      track("wallpaper_downloaded", { title: photo.title, id: photo.id });
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${photo.title ?? "wallpaper"}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: open in new tab
      window.open(photo.url, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <section className="pt-16 pb-8 border-t border-stone-900/60">
      <div className="mb-8 space-y-1">
        <span
          className="text-[10px] font-mono tracking-[0.3em] uppercase font-bold"
          style={{ color: brandColor }}
        >
          {lang === "es" ? "DESCARGA GRATUITA" : "FREE DOWNLOAD"}
        </span>
        <h2 className="text-white font-serif text-2xl font-semibold">
          {lang === "es" ? "Wallpapers Seleccionados" : "Selected Wallpapers"}
        </h2>
        <p className="text-stone-500 text-xs max-w-lg leading-relaxed">
          {lang === "es"
            ? "Una selección de imágenes disponibles para descarga libre. Perfectas para pantalla de escritorio o móvil."
            : "A curated selection of images available for free download. Perfect for desktop or mobile wallpaper."}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {wallpapers.map((photo) => (
          <div
            key={photo.id}
            className="group relative rounded-xl overflow-hidden bg-stone-950 border border-stone-900 hover:border-stone-700 transition"
          >
            <div className="aspect-[9/16] sm:aspect-square relative overflow-hidden">
              <img
                src={photo.thumbnail_url || photo.url}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-[1.04] transition duration-500"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                <button
                  onClick={() => handleDownload(photo)}
                  disabled={downloading === photo.id}
                  style={{ backgroundColor: brandColor }}
                  className="w-full py-2 rounded-lg text-[11px] font-bold text-white uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  {downloading === photo.id
                    ? (lang === "es" ? "Descargando..." : "Downloading...")
                    : (lang === "es" ? "Descargar" : "Download")}
                </button>
              </div>
            </div>
            <div className="p-3">
              <p className="text-stone-300 text-xs font-medium truncate">{photo.title}</p>
              <p className="text-stone-600 text-[10px] font-mono mt-0.5">
                ©Christian Rotger 2026
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
