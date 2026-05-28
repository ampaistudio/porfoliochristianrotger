import React, { useState, useEffect } from "react";
import { 
  X, 
  Mail, 
  Instagram, 
  Twitter, 
  Camera, 
  Sliders, 
  Info,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Sparkles,
  Grid,
  Settings
} from "lucide-react";
import { Photo, PortfolioConfig } from "../types";
import { getLocalizedText } from "../defaultData";

interface ClientPortfolioViewProps {
  photos: Photo[];
  config: PortfolioConfig;
  brandColor: string;
}

export default function ClientPortfolioView({
  photos,
  config,
  brandColor,
}: ClientPortfolioViewProps) {
  // Lang state, initialized from localStorage fallback
  const [lang, setLang] = useState<"es" | "en">(() => {
    const saved = localStorage.getItem("portfolio_lang");
    return (saved === "es" || saved === "en") ? saved : "es";
  });

  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");
  
  // Immersive Slide Projector State
  const [isProjectorOpen, setIsProjectorOpen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAutoplayRunning, setIsAutoplayRunning] = useState(false);
  const [isImmersiveTheater, setIsImmersiveTheater] = useState(false);
  const [imageFit, setImageFit] = useState<"contain" | "cover">("cover"); // Default to cover for maximum screen occupancy!

  // Sync state to localStorage on language changes
  useEffect(() => {
    localStorage.setItem("portfolio_lang", lang);
  }, [lang]);

  // Keep selected category synced when toggling languages
  useEffect(() => {
    if (lang === "es" && selectedCategory === "All") {
      setSelectedCategory("Todas");
    } else if (lang === "en" && selectedCategory === "Todas") {
      setSelectedCategory("All");
    }
  }, [lang, selectedCategory]);

  // Extract all categories in current language (handles both single and multiple categories per photo)
  const categories = [
    lang === "es" ? "Todas" : "All", 
    ...Array.from(
      new Set(
        photos.flatMap((p) => {
          if (!p.category) return [];
          return p.category.split(", ").map((c) => getLocalizedText(c, lang));
        })
      )
    )
  ];

  // Map category filtration
  const filteredPhotos = selectedCategory === "Todas" || selectedCategory === "All"
    ? photos 
    : photos.filter((p) => {
        if (!p.category) return false;
        return p.category.split(", ").map((c) => getLocalizedText(c, lang)).includes(selectedCategory);
      });

  // Keyboard navigation for cinematic slideshow
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isProjectorOpen) return;
      if (e.key === "ArrowRight") {
        handleNextSlide();
      } else if (e.key === "ArrowLeft") {
        handlePrevSlide();
      } else if (e.key === "Escape") {
        setIsProjectorOpen(false);
        setIsAutoplayRunning(false);
        setIsImmersiveTheater(false);
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isProjectorOpen, currentSlideIndex, filteredPhotos]);

  // Autoplay Timer Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoplayRunning && isProjectorOpen) {
      interval = setInterval(() => {
        handleNextSlide();
      }, 5000); // changes every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoplayRunning, isProjectorOpen, currentSlideIndex, filteredPhotos]);

  const startProyection = (startIndex: number = 0) => {
    if (filteredPhotos.length === 0) return;
    setCurrentSlideIndex(startIndex);
    setIsProjectorOpen(true);
  };

  const handleNextSlide = () => {
    if (filteredPhotos.length === 0) return;
    setCurrentSlideIndex((prev) => (prev + 1) % filteredPhotos.length);
  };

  const handlePrevSlide = () => {
    if (filteredPhotos.length === 0) return;
    setCurrentSlideIndex((prev) => (prev - 1 + filteredPhotos.length) % filteredPhotos.length);
  };

  const activePhoto = filteredPhotos[currentSlideIndex];

  return (
    <div className="bg-[#09090b] min-h-screen text-stone-100 font-sans pb-4 transition-colors duration-200 selection:bg-stone-800 selection:text-white">
      
      {/* Cinematic Minimalist Brand Header */}
      <header className="border-b border-stone-900 bg-black/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono tracking-[0.25em] text-stone-500 block uppercase font-bold">
              {lang === "es" ? "EXPOSICIÓN FOTOGRÁFICA" : "PHOTOGRAPHY EXPOSITION"}
            </span>
            <h1 className="text-lg sm:text-xl font-serif font-black tracking-tight text-white uppercase">
              {config.photographerName}
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Elegant language switcher select-pill */}
            <div className="flex border border-stone-800 rounded-lg p-0.5 bg-stone-950 text-[10px] font-mono">
              <button
                onClick={() => setLang("es")}
                className={`px-2.5 py-1 rounded-md transition font-semibold ${
                  lang === "es" ? "bg-white text-black font-extrabold" : "text-stone-400 hover:text-white"
                }`}
              >
                ES
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-2.5 py-1 rounded-md transition font-semibold ${
                  lang === "en" ? "bg-white text-black font-extrabold" : "text-stone-400 hover:text-white"
                }`}
              >
                EN
              </button>
            </div>

            {/* Play slide button */}
            <button
              onClick={() => startProyection(0)}
              style={{ backgroundColor: brandColor }}
              className="text-white text-xs sm:text-sm font-semibold px-4 py-2 ml-1 rounded-lg flex items-center gap-2 hover:opacity-95 transition shadow-lg shrink-0"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{lang === "es" ? "Ver en Gran Slide" : "Enter Slideshow"}</span>
              <span className="xs:hidden">{lang === "es" ? "Slide" : "Slideshow"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Bio Banner Area */}
      <section className="relative overflow-hidden py-16 sm:py-20 border-b border-stone-900 bg-gradient-to-b from-black to-stone-950 px-4">
        {backgroundMeshEffect()}

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10 animate-fadeIn">
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-stone-400 bg-stone-900 px-3.5 py-1.5 rounded-full border border-stone-850">
            {getLocalizedText(config.title, lang) || (lang === "es" ? "ESTUDIO CREATIVO" : "CREATIVE STUDIO")}
          </span>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-semibold tracking-tight text-white leading-tight">
            {lang === "es" ? "Portafolio de Paisaje y Vida Silvestre" : "Wildlife and Landscape Portfolio"}
          </h2>
          
          <p className="max-w-2xl mx-auto text-stone-400 text-xs sm:text-sm leading-relaxed font-light">
            {getLocalizedText(config.bio, lang)}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-stone-400 text-[11px] sm:text-xs font-mono tracking-wide">
            <a href={`mailto:${config.email}`} className="hover:text-white transition flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-stone-500" /> {config.email}
            </a>
            {config.instagram && (
              <a href={`https://instagram.com/${config.instagram}`} target="_blank" rel="noreferrer" className="hover:text-white transition flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-stone-500" /> instagram.com/{config.instagram}
              </a>
            )}
            {config.twitter && (
              <a href={`https://twitter.com/${config.twitter}`} target="_blank" rel="noreferrer" className="hover:text-white transition flex items-center gap-1.5">
                <Twitter className="w-3.5 h-3.5 text-stone-500" /> @{config.twitter}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Main Photographic Exposition Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-10">
        
        {/* Category Filter Pills & Description */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-stone-900/60 pb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-mono tracking-wider uppercase rounded-lg transition ${
                  selectedCategory === cat
                    ? "bg-white text-black font-semibold"
                    : "bg-stone-900 text-stone-400 hover:text-white border border-stone-850/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="text-xs text-stone-400 font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {lang === "es" 
              ? `Total dispuesto: ${filteredPhotos.length} capturas en ${selectedCategory}`
              : `Total on display: ${filteredPhotos.length} captures in ${selectedCategory}`
            }
          </div>
        </div>

        {/* Masonry or Structured grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {filteredPhotos.map((photo, idx) => (
            <div 
              key={photo.id}
              onClick={() => startProyection(idx)}
              className="group bg-stone-950/40 border border-stone-900 rounded-2xl overflow-hidden hover:border-stone-850 hover:shadow-2xl transition duration-500 flex flex-col justify-between cursor-pointer"
            >
              {/* Photo Area with Zoom on Hover */}
              <div className="aspect-[4/3] bg-stone-950 relative overflow-hidden">
                <img
                  src={photo.url}
                  alt={getLocalizedText(photo.title, lang)}
                  className="w-full h-full object-cover group-hover:scale-[1.04] transition duration-700"
                  referrerPolicy="no-referrer"
                />
                
                {/* Micro Category Tag */}
                <span className="absolute top-3.5 left-3.5 z-10 bg-black/85 backdrop-blur-md border border-stone-850 text-[9px] font-mono tracking-[0.15em] px-2.5 py-1 rounded uppercase font-bold text-stone-400">
                  {photo.category ? photo.category.split(", ").map((c) => getLocalizedText(c, lang)).join(" / ") : ""}
                </span>

                {/* Subtle digital watermark overlay */}
                <span className="absolute bottom-3 right-3 z-10 text-[9px] sm:text-[10px] font-sans tracking-wide text-white/40 bg-black/35 px-1.5 py-0.5 rounded backdrop-blur-[1px] pointer-events-none select-none">
                  ©Christian Rotger 2026
                </span>

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-between p-4 pb-5">
                  <span className="text-white text-xs font-semibold tracking-wider flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-stone-400" /> 
                    {lang === "es" ? "Abrir en Pantalla Completa" : "View Slideshow"}
                  </span>
                  
                  {photo.settings && (
                    <span className="text-[10px] font-mono text-stone-300 bg-stone-900 border border-stone-850 px-2 py-0.5 rounded">
                      {photo.settings}
                    </span>
                  )}
                </div>
              </div>

              {/* Title, Metadata info below photo */}
              <div className="p-5 sm:p-6 space-y-3.5">
                <div className="space-y-1.5">
                  <h3 className="font-serif text-lg font-bold text-white tracking-wide group-hover:text-stone-200 transition">
                    {getLocalizedText(photo.title, lang)}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-400 line-clamp-2 leading-relaxed h-11 font-light">
                    {getLocalizedText(photo.description, lang) || (lang === "es" ? "Captura conceptual sin pies de fotos explícitos." : "Conceptual capture without explicit description.")}
                  </p>
                </div>

                {/* Info and tech parameters */}
                {(photo.camera || photo.lens) && (
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-stone-900 text-[10px] font-mono text-stone-500">
                    <span className="bg-stone-900 border border-stone-850/60 px-2 py-0.5 rounded text-stone-400">
                      📷 {photo.camera || (lang === "es" ? "Cámara" : "Camera")}
                    </span>
                    {photo.lens && (
                      <span className="bg-stone-900 border border-stone-850/60 px-2 py-0.5 rounded text-stone-400">
                        🔍 {getLocalizedText(photo.lens, lang).split(" ")[0]}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredPhotos.length === 0 && (
            <div className="col-span-full border border-dashed border-stone-850 bg-stone-950/20 rounded-3xl py-20 text-center text-stone-500">
              <Grid className="w-12 h-12 mx-auto text-stone-800 mb-3" />
              <p className="font-mono text-xs uppercase tracking-widest text-stone-400">
                {lang === "es" ? "Ninguna fotografía cargada aún" : "No photographs uploaded yet"}
              </p>
              <p className="text-xs text-stone-600 mt-1">
                {lang === "es" 
                  ? "Ingresa al panel superior como fotógrafo para adjuntar diapositivas." 
                  : "Go to the photographer admin panel to upload your photos."
                }
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Dynamic, Cinematic Dark Footer */}
      <footer className="border-t border-stone-900 bg-black/40 py-12 mt-20 text-center text-xs text-stone-500 font-sans">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <p className="tracking-widest uppercase text-[9px] font-mono text-stone-400">
            {lang === "es" ? "PORTAFOLIO DE ALTA GAMA" : "PREMIUM FINE ART PORTFOLIO"}
          </p>
          <p className="text-stone-300 font-light text-sm">
            © 2026 {config.photographerName} PH • {lang === "es" ? "Fotografía de Conservación & Paisaje" : "Conservation & Landscape Photography"}
          </p>
          <p className="mt-2 text-stone-650 text-[10px] sm:text-xs font-mono max-w-2xl mx-auto leading-relaxed">
            {lang === "es" 
              ? "Potenciado con Inteligencia Artificial Gemini para análisis editorial y sugerencias de parámetros óptimos para fotografía salvaje." 
              : "Powered by Gemini AI for contextual curatorial analysis and optimal wild shooting suggestions."
            }
          </p>
        </div>
      </footer>

      {/* IMMERSIVE SLIDE PROJECTOR VIEW - HUGE CAROUSEL SLIDESHOW */}
      {isProjectorOpen && activePhoto && (
        <div className="fixed inset-0 z-50 bg-[#040405] text-white flex flex-col justify-between select-none animate-fadeIn">
          
          {/* Top Control Bar inside slides */}
          {!isImmersiveTheater ? (
            <header className="p-4 sm:p-6 flex items-center justify-between border-b border-stone-950/60 bg-black/40 backdrop-blur z-20">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase font-bold bg-amber-500/10 px-2.5 py-1 rounded">
                  {lang === "es" ? "DIAPOSITIVA" : "SLIDE"} {currentSlideIndex + 1} {lang === "es" ? "DE" : "OF"} {filteredPhotos.length} — {activePhoto.category ? activePhoto.category.split(", ").map((c) => getLocalizedText(c, lang)).join(" / ") : ""}
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
                  className="bg-stone-900 hover:bg-stone-800 border border-stone-850 p-2 sm:p-2.5 rounded-lg text-stone-300 hover:text-white transition flex items-center gap-1.5 text-xs font-mono font-bold"
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
                  className="bg-stone-900 hover:bg-stone-800 border border-stone-850 p-2 sm:p-2.5 rounded-lg text-stone-300 hover:text-white transition flex items-center gap-1.5 text-xs font-mono font-bold"
                  title={lang === "es" ? "Pantalla Completa" : "Fullscreen Link"}
                >
                  <Maximize2 className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  <span className="hidden sm:inline">{lang === "es" ? "PANTALLA COMPLETA" : "FULLSCREEN"}</span>
                </button>

                {/* Close Button */}
                <button
                  onClick={() => {
                    setIsProjectorOpen(false);
                    setIsAutoplayRunning(false);
                    setIsImmersiveTheater(false);
                    if (document.fullscreenElement) {
                      document.exitFullscreen().catch(() => {});
                    }
                  }}
                  className="bg-stone-900 hover:bg-stone-800 border border-stone-850 p-2 rounded-lg text-stone-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </header>
          ) : (
            /* Floating Exit Controls in Immersive Fullscreen Mode */
            <div className="absolute top-4 right-4 z-30 flex items-center gap-3">
              <span className="hidden md:inline text-[10px] uppercase font-mono bg-black/75 border border-stone-905 px-3 py-1.5 rounded-lg text-stone-300 tracking-wider">
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
                className="bg-stone-900 border border-stone-800 p-2.5 text-xs font-mono font-bold text-amber-500 hover:text-amber-400 hover:bg-stone-855 rounded-lg transition flex items-center gap-1.5 shrink-0 shadow-lg cursor-pointer"
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
            {filteredPhotos.length > 1 && (
              <button
                onClick={handlePrevSlide}
                className="absolute left-4 sm:left-6 z-25 h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-stone-900/80 border border-stone-850 text-stone-300 hover:text-white flex items-center justify-center hover:bg-stone-800 transition shadow-lg shrink-0"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Right Nav Arrow */}
            {filteredPhotos.length > 1 && (
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
      )}

    </div>
  );
}

function backgroundMeshEffect() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-20">
      <div 
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full filter blur-3xl opacity-30"
        style={{ backgroundColor: "#7C2D12" }}
      />
      <div 
        className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full filter blur-3xl opacity-20"
        style={{ backgroundColor: "#1e1b4b" }}
      />
      
      {/* Subtle photography grid background mesh */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#141416_1px,transparent_1px),linear-gradient(to_bottom,#141416_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
    </div>
  );
}
