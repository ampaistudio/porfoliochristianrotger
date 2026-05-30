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
import { Photo, PublicComment } from "../../types";
import { getLocalizedText } from "../../defaultData";
import { addPublicComment } from "../../utils/supabase";
import { track } from '@vercel/analytics';

interface ClientSlideshowProps {
  isOpen: boolean;
  onClose: () => void;
  photos: Photo[];
  startIndex: number;
  lang: "es" | "en";
  publicComments: PublicComment[];
  brandColor: string;
}

export default function ClientSlideshow({
  isOpen,
  onClose,
  photos,
  startIndex,
  lang,
  publicComments,
  brandColor,
}: ClientSlideshowProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(startIndex);
  const [isAutoplayRunning, setIsAutoplayRunning] = useState(false);
  const [isImmersiveTheater, setIsImmersiveTheater] = useState(false);
  const [imageFit, setImageFit] = useState<"contain" | "cover">("cover");

  // Comments State
  const [newCommentName, setNewCommentName] = useState("");
  const [newCommentText, setNewCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCommentSuccess, setShowCommentSuccess] = useState(false);
  const [rateLimitMsg, setRateLimitMsg] = useState("");
  const [zoomText, setZoomText] = useState(false); // Font zoom toggle

  const COMMENT_THROTTLE_MS = 60_000;

  // Reset current index when startIndex changes, and track view
  useEffect(() => {
    setCurrentSlideIndex(startIndex);
    if (photos[startIndex]) {
      track('photo_viewed', { 
        title: photos[startIndex].title,
        category: photos[startIndex].category || 'none'
      });
    }
  }, [startIndex, photos]);

  useEffect(() => {
    if (isOpen && photos[currentSlideIndex]) {
      track('photo_viewed', { 
        title: photos[currentSlideIndex].title,
        category: photos[currentSlideIndex].category || 'none'
      });
    }
  }, [currentSlideIndex, isOpen]);

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

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentName.trim() || !newCommentText.trim() || !activePhoto) return;

    // Throttle: 1 comentario por minuto
    const lastAt = parseInt(localStorage.getItem("last_comment_at") ?? "0", 10);
    const elapsed = Date.now() - lastAt;
    if (elapsed < COMMENT_THROTTLE_MS) {
      const wait = Math.ceil((COMMENT_THROTTLE_MS - elapsed) / 1000);
      setRateLimitMsg(
        lang === "es"
          ? `Por favor esperá ${wait}s antes de enviar otro comentario.`
          : `Please wait ${wait}s before submitting another comment.`
      );
      setTimeout(() => setRateLimitMsg(""), 4000);
      return;
    }

    setIsSubmitting(true);
    await addPublicComment({
      photoId: activePhoto.id,
      authorName: newCommentName,
      text: newCommentText,
      isApproved: false
    });
    localStorage.setItem("last_comment_at", String(Date.now()));
    setIsSubmitting(false);
    setNewCommentName("");
    setNewCommentText("");
    setShowCommentSuccess(true);
    setTimeout(() => setShowCommentSuccess(false), 5000);
  };

  if (!photos.length) return null;

  const activePhoto = photos[currentSlideIndex];
  
  // Helper to fallback to English (with backward compatibility for " | ") if Spanish isn't set
  const t = (enField: string | undefined, esField: string | undefined) => {
    if (lang === "es" && esField) return esField;
    return getLocalizedText(enField, lang);
  };

  const currentPhotoComments = publicComments.filter(c => c.photoId === activePhoto.id && c.isApproved);

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
              {t(activePhoto.title, activePhoto.title_es)}
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

            {/* Font Size Toggle Button */}
            <button
              onClick={() => setZoomText(!zoomText)}
              className={`border border-stone-850 p-2 sm:p-2.5 rounded-lg transition flex items-center gap-1.5 text-xs font-mono font-bold ${
                zoomText ? "bg-white text-black" : "bg-stone-900 hover:bg-stone-850 text-stone-300 hover:text-white"
              }`}
              title={lang === "es" ? "Alternar Tamaño de Letra" : "Toggle Font Size"}
            >
              <span className="font-serif italic font-bold">Aa</span>
              <span className="hidden sm:inline">{lang === "es" ? "TEXTO" : "TEXT"}</span>
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
          {/* Protección Anti-Robo */}
          <div 
            className="absolute inset-0 z-10 select-none bg-transparent"
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          />
          <img
            src={activePhoto.url}
            alt={t(activePhoto.title, activePhoto.title_es)}
            className={`transition-all duration-500 animate-fadeIn pointer-events-none select-none ${
              imageFit === "cover" && isImmersiveTheater
                ? "w-full h-full object-cover" 
                : "max-h-full max-w-full object-contain rounded shadow-2xl"
            }`}
            referrerPolicy="no-referrer"
            onContextMenu={(e) => e.preventDefault()}
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
              <h3 className={`${zoomText ? 'text-xl sm:text-2xl' : 'text-lg'} font-serif font-black tracking-wide text-white transition-all`}>
                {t(activePhoto.title, activePhoto.title_es)}
              </h3>
              <p className={`${zoomText ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'} text-stone-400 leading-relaxed font-light transition-all`}>
                {t(activePhoto.description, activePhoto.description_es) || (lang === "es" ? "Sin descripción proporcionada." : "No description provided.")}
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

          {/* AI Curated Commentary & Public Comments */}
          <div className="w-full md:w-[400px] flex flex-col gap-4 shrink-0">
            
            {activePhoto.editorialReview && (
              <div className="bg-stone-900/50 border border-stone-800/65 rounded-xl p-4 space-y-2 flex flex-col justify-center">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-stone-400 animate-pulse" />
                  <span className="text-[9.5px] uppercase font-mono font-extrabold text-stone-400 tracking-widest">
                    {lang === "es" ? "Análisis Curatorial (Nodo Ai Agency)" : "Curatorial Review (Nodo Ai Agency)"}
                  </span>
                </div>
                <p className={`${zoomText ? 'text-sm' : 'text-xs'} text-stone-300 leading-relaxed italic transition-all`}>
                  "{t(activePhoto.editorialReview, activePhoto.editorialReview_es)}"
                </p>
              </div>
            )}

            {/* Public Comments List */}
            <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex flex-col gap-4 max-h-[250px] overflow-y-auto custom-scrollbar shadow-xl`}>
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <h4 className={`${zoomText ? 'text-sm' : 'text-xs'} font-mono tracking-widest text-stone-300 uppercase`}>
                  {lang === "es" ? `Comentarios (${currentPhotoComments.length})` : `Comments (${currentPhotoComments.length})`}
                </h4>
              </div>
              
              <div className="space-y-4">
                {currentPhotoComments.map((c) => (
                  <div key={c.id} className={`${zoomText ? 'text-base' : 'text-sm'} text-stone-200`}>
                    <p className="font-bold text-white drop-shadow-sm">{c.authorName}</p>
                    <p className="italic text-stone-300 mt-1 drop-shadow-sm">"{c.text}"</p>
                  </div>
                ))}
                {currentPhotoComments.length === 0 && (
                  <p className={`${zoomText ? 'text-sm' : 'text-xs'} text-stone-400 italic`}>
                    {lang === "es" ? "Sé el primero en dejar un comentario." : "Be the first to leave a comment."}
                  </p>
                )}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleCommentSubmit} className="mt-2 pt-3 border-t border-stone-800 space-y-2">
                {rateLimitMsg && (
                  <p className="text-xs text-amber-400 font-mono">{rateLimitMsg}</p>
                )}
                {showCommentSuccess ? (
                  <p className="text-xs text-emerald-400 font-mono">
                    {lang === "es" ? "✅ Enviado. Pendiente de moderación." : "✅ Submitted. Pending moderation."}
                  </p>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder={lang === "es" ? "Tu Nombre (Opcional Anónimo)" : "Your Name"}
                      value={newCommentName}
                      onChange={(e) => setNewCommentName(e.target.value.slice(0, 80))}
                      maxLength={80}
                      className="w-full bg-black/40 border border-white/20 backdrop-blur-sm rounded-lg p-2 text-sm text-white outline-none focus:border-white/50 placeholder:text-stone-500 transition-colors"
                      required
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={lang === "es" ? "Deja una apreciación..." : "Leave an appreciation..."}
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value.slice(0, 500))}
                        maxLength={500}
                        className="flex-1 bg-black/40 border border-white/20 backdrop-blur-sm rounded-lg p-2 text-sm text-white outline-none focus:border-white/50 placeholder:text-stone-500 transition-colors"
                        required
                      />
                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        style={{ backgroundColor: brandColor }}
                        className="px-3 rounded text-[10px] font-bold text-white uppercase hover:opacity-90 disabled:opacity-50 cursor-pointer"
                      >
                        {lang === "es" ? "Enviar" : "Send"}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
            
          </div>
        </footer>
      )}
    </div>
  );
}
