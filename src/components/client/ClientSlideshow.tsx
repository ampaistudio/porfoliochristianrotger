import React, { useState, useEffect } from "react";
import { 
  X, 
  Sliders, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Maximize2, 
  Minimize2, 
  Sparkles 
} from "lucide-react";
import { Photo } from "../../types";
import { getLocalizedText } from "../../defaultData";

interface ClientSlideshowProps {
  isOpen: boolean;
  onClose: () => void;
  photos: Photo[];
  startIndex: number;
  lang: "es" | "en";
}

export default function ClientSlideshow({
  isOpen,
  onClose,
  photos,
  startIndex,
  lang,
}: ClientSlideshowProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(startIndex);
  const [isAutoplayRunning, setIsAutoplayRunning] = useState(false);
  const [isImmersiveTheater, setIsImmersiveTheater] = useState(false);
  const [imageFit, setImageFit] = useState<"contain" | "cover">("cover");

  // Reset current index when startIndex changes
  useEffect(() => {
    setCurrentSlideIndex(startIndex);
  }, [startIndex]);

  const handleNextSlide = () => {
    if (photos.length === 0) return;
    setCurrentSlideIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrevSlide = () => {
    if (photos.length === 0) return;
    setCurrentSlideIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  // Keyboard navigation for slideshow
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowRight") {
        handleNextSlide();
      } else if (e.key === "ArrowLeft") {
        handlePrevSlide();
      } else if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentSlideIndex, photos]);

  // Autoplay Timer Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoplayRunning && isOpen) {
      interval = setInterval(() => {
        handleNextSlide();
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoplayRunning, isOpen, currentSlideIndex, photos]);

  const handleClose = () => {
    setIsAutoplayRunning(false);
    setIsImmersiveTheater(false);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    onClose();
  };

  const activePhoto = photos[currentSlideIndex];
  if (!activePhoto) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#040405] text-white flex flex-col justify-between select-none animate-fadeIn">
      {/* Top Control Bar inside slides */}
      {!isImmersiveTheater ? (
        <header className="p-4 sm:p-6 flex items-center justify-between border-b border-stone-950/60 bg-black/40 backdrop-blur z-20">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase font-bold bg-amber-500/10 px-2.5 py-1 rounded">
              {lang === "es" ? "DIAPOSITIVA" : "SLIDE"} {currentSlideIndex + 1} {lang === "es" ? "DE" : "OF"} {photos.length} — {activePhoto.category ? activePhoto.category.split(", ").map((c) => getLocalizedText(c, lang)).join(" / ") : ""}
            </span>
            <h2 className="text-base sm:text-lg font-serif font-semibold mt-1">
              {getLocalizedText(activePhoto.title, lang)}
            </h2>
          </div>

          {/* Projector tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Play / Pause button */}
            <button
              onClick={() => setIsAutoplayRunning(!isAutoplayRunning)}
              className={`p-2 py-1 sm:p-2.5 rounded-lg border transition ${
                isAutoplayRunning 
                  ? "bg-white text-black border-white hover:bg-white/90" 
                  : "bg-stone-900 border-stone-850 text-stone-300 hover:text-white"
              }`}
              title={isAutoplayRunning ? "Pausar" : "Reproducción automática"}
            >
              {isAutoplayRunning ? (
                <span className="flex items-center gap-1.5 text-xs font-mono font-bold">
                  <Pause className="w-3.5 h-3.5 shrink-0" /> <span className="hidden sm:inline">{lang === "es" ? "PAUSAR" : "PAUSE"}</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-mono font-bold">
                  <Play className="w-3.5 h-3.5 shrink-0 animate-pulse" /> <span className="hidden sm:inline">{lang === "es" ? "REPRODUCIR AUTO" : "AUTOPLAY"}</span>
                </span>
              )}
            </button>

            {/* Aspect/Fit Toggle Button */}
            <button
              onClick={() => setImageFit(prev => prev === "contain" ? "cover" : "contain")}
              className="bg-stone-900 hover:bg-stone-850 border border-stone-850 p-2 sm:p-2.5 rounded-lg text-stone-300 hover:text-white transition flex items-center gap-1.5 text-xs font-mono font-bold"
              title={lang === "es" ? "Ajustar/Llenar pantalla" : "Fit/Fill screen"}
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">
                {lang === "es" 
                  ? (imageFit === "cover" ? "AJUSTAR" : "LLENAR MONITOR") 
                  : (imageFit === "cover" ? "FIT FRAME" : "FILL MONITOR")
                }
              </span>
            </button>

            {/* Pantalla Completa Button */}
            <button
              onClick={() => {
                setIsImmersiveTheater(true);
                try {
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                  }
                } catch (e) {}
              }}
              className="bg-stone-900 hover:bg-stone-850 border border-stone-850 p-2 sm:p-2.5 rounded-lg text-stone-300 hover:text-white transition flex items-center gap-1.5 text-xs font-mono font-bold"
              title={lang === "es" ? "Pantalla Completa" : "Fullscreen Link"}
            >
              <Maximize2 className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span className="hidden sm:inline">{lang === "es" ? "PANTALLA COMPLETA" : "FULLSCREEN"}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="bg-stone-900 hover:bg-stone-850 border border-stone-850 p-2 rounded-lg text-stone-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>
      ) : (
        /* Floating Exit Controls in Immersive Fullscreen Mode */
        <div className="absolute top-4 right-4 z-30 flex items-center gap-3">
          <span className="hidden md:inline text-[10px] uppercase font-mono bg-black/75 border border-stone-900 px-3 py-1.5 rounded-lg text-stone-300 tracking-wider">
            {lang === "es" ? "🎬 Modo Cine Fullscreen Activado" : "🎬 Immersive Slideshow Mode"}
          </span>

          {/* Image Fit Toggle Button in Immersive Mode */}
          <button
            onClick={() => setImageFit(prev => prev === "contain" ? "cover" : "contain")}
            className="bg-stone-900 border border-stone-800 hover:bg-stone-850 p-2.5 text-xs font-mono font-bold text-stone-300 hover:text-white rounded-lg transition flex items-center gap-1.5 shrink-0 shadow-lg cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>
              {lang === "es" 
                ? (imageFit === "cover" ? "AJUSTAR ENCUADRE" : "LLENAR MONITOR") 
                : (imageFit === "cover" ? "FIT IMAGE" : "FILL MONITOR")
              }
            </span>
          </button>

          <button
            onClick={() => {
              setIsImmersiveTheater(false);
              if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
              }
            }}
            className="bg-stone-900 border border-stone-800 p-2.5 text-xs font-mono font-bold text-amber-500 hover:text-amber-400 hover:bg-stone-850 rounded-lg transition flex items-center gap-1.5 shrink-0 shadow-lg cursor-pointer"
          >
            <Minimize2 className="w-4 h-4" />
            <span>{lang === "es" ? "MOSTRAR DETALLES" : "SHOW INFORMATION"}</span>
          </button>
        </div>
      )}

      {/* Core Photographic Canvas Area */}
      <div className={`flex-1 relative flex items-center justify-center transition-all duration-300 ${isImmersiveTheater ? "p-0" : "p-4 sm:p-8"}`}>
        {/* Direct Image Stage */}
        <div className={`transition-all duration-300 relative flex items-center justify-center overflow-hidden ${
          isImmersiveTheater 
            ? "absolute inset-0 w-screen h-screen max-w-full max-h-full" 
            : "w-full h-full max-w-4xl max-h-[62vh]"
        }`}>
          <img
            src={activePhoto.url}
            alt={getLocalizedText(activePhoto.title, lang)}
            className={`transition-all duration-500 animate-fadeIn ${
              imageFit === "cover" && isImmersiveTheater
                ? "w-full h-full object-cover" 
                : "max-h-full max-w-full object-contain rounded shadow-2xl"
            }`}
            referrerPolicy="no-referrer"
          />

          {/* Elegant and subtle digital watermark overlaid directly inside image container */}
          <div className="absolute bottom-4 right-4 pointer-events-none select-none z-10">
            <span className="text-[10px] sm:text-xs font-sans tracking-wide text-white/40 bg-black/45 px-2 py-1 rounded backdrop-blur-[1px] drop-shadow-md">
              ©Christian Rotger 2026
            </span>
          </div>
        </div>

        {/* Left Nav Arrow */}
        {photos.length > 1 && (
          <button
            onClick={handlePrevSlide}
            className="absolute left-4 sm:left-6 z-25 h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-stone-900/80 border border-stone-850 text-stone-300 hover:text-white flex items-center justify-center hover:bg-stone-800 transition shadow-lg shrink-0"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Right Nav Arrow */}
        {photos.length > 1 && (
          <button
            onClick={handleNextSlide}
            className="absolute right-4 sm:right-6 z-25 h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-stone-900/80 border border-stone-850 text-stone-300 hover:text-white flex items-center justify-center hover:bg-stone-800 transition shadow-lg shrink-0"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Help guidelines indicator down right */}
        <div className="absolute bottom-4 right-6 text-[10px] text-stone-600 font-mono hidden sm:block z-25">
          {lang === "es" 
            ? "Tip: Puedes navegar usando las flechas de tu teclado ⌨ (← Izq • Der →)" 
            : "Tip: You can navigate using your keyboard arrows ⌨ (← Left • Right →)"
          }
        </div>
      </div>

      {/* Bottom metadata and AI Narrative panel */}
      {!isImmersiveTheater && (
        <footer className="bg-stone-950 border-t border-stone-900/80 p-5 sm:p-7 z-20 min-h-[160px] flex flex-col md:flex-row gap-6 md:gap-10 justify-between items-start">
          {/* Description and metadata */}
          <div className="max-w-2xl space-y-3">
            <div className="space-y-1">
              <h3 className="text-lg font-serif font-black tracking-wide text-white">
                {getLocalizedText(activePhoto.title, lang)}
              </h3>
              <p className="text-xs sm:text-sm text-stone-400 leading-relaxed font-light">
                {getLocalizedText(activePhoto.description, lang) || (lang === "es" ? "Sin descripción proporcionada." : "No description provided.")}
              </p>
            </div>

            {/* Specs parameters bar */}
            {(activePhoto.camera || activePhoto.lens || activePhoto.settings) && (
              <div className="flex flex-wrap gap-2 text-[10px] font-mono text-stone-500">
                {activePhoto.camera && <span className="text-stone-300">📷 {activePhoto.camera}</span>}
                {activePhoto.lens && <span className="text-stone-400">• {lang === "es" ? "Lente:" : "Lens:"} {getLocalizedText(activePhoto.lens, lang)}</span>}
                {activePhoto.settings && <span className="text-stone-400">• {lang === "es" ? "Parámetros:" : "Settings:"} {activePhoto.settings}</span>}
              </div>
            )}
          </div>

          {/* AI Curated Commentary on the Right if available */}
          {activePhoto.editorialReview && (
            <div className="max-w-md bg-stone-900/50 border border-stone-800/65 rounded-xl p-4 space-y-2 shrink-0 self-stretch md:self-auto flex flex-col justify-center">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-stone-400 animate-pulse" />
                <span className="text-[9.5px] uppercase font-mono font-extrabold text-stone-400 tracking-widest">
                  {lang === "es" ? "Análisis Curatorial (IA Gemini)" : "Curatorial Review (Gemini AI)"}
                </span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed italic">
                "{getLocalizedText(activePhoto.editorialReview, lang)}"
              </p>
              {activePhoto.suggestedSettings && (
                <p className="text-[10px] text-stone-500 leading-relaxed max-w-sm truncate" title={getLocalizedText(activePhoto.suggestedSettings, lang)}>
                   💡 {getLocalizedText(activePhoto.suggestedSettings, lang)}
                </p>
              )}
            </div>
          )}
        </footer>
      )}
    </div>
  );
}
