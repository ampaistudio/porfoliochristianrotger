import React, { useState, useEffect, useRef } from "react";
import { 
  Mail, 
  Instagram, 
  Twitter, 
  Maximize2, 
  Grid 
} from "lucide-react";
import { Photo, PortfolioConfig, PublicComment } from "../types";
import { getLocalizedText } from "../defaultData";
import ClientSlideshow from "./client/ClientSlideshow";

interface ClientPortfolioViewProps {
  photos: Photo[];
  config: PortfolioConfig;
  brandColor: string;
  publicComments: PublicComment[];
}

export default function ClientPortfolioView({
  photos,
  config,
  brandColor,
  publicComments,
}: ClientPortfolioViewProps) {
  // Solo renderizar fotos públicas (ignorar drafts)
  const publishedPhotos = photos.filter(p => p.status !== 'draft');

  // Lang state, initialized from localStorage fallback
  const [lang, setLang] = useState<"es" | "en">(() => {
    const saved = localStorage.getItem("portfolio_lang");
    if (saved === "es" || saved === "en") return saved;
    // Default to 'en'
    return "en";
  });

  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");
  
  // Immersive Slide Projector State
  const [isProjectorOpen, setIsProjectorOpen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Helper to fallback to English if Spanish isn't set
  const t = (enField: string | undefined, esField: string | undefined) => {
    if (lang === "es" && esField) return esField;
    return getLocalizedText(enField, lang);
  };

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
        publishedPhotos.flatMap((p) => {
          if (!p.category) return [];
          return p.category.split(", ").map((c) => getLocalizedText(c, lang));
        })
      )
    )
  ];

  // Map category filtration
  const filteredPhotos = selectedCategory === "Todas" || selectedCategory === "All"
    ? publishedPhotos 
    : publishedPhotos.filter((p) => {
        if (!p.category) return false;
        return p.category.split(", ").map((c) => getLocalizedText(c, lang)).includes(selectedCategory);
      });

  const startProyection = (startIndex: number = 0) => {
    if (filteredPhotos.length === 0) return;
    setCurrentSlideIndex(startIndex);
    setIsProjectorOpen(true);
  };

  return (
    <div className="bg-[#09090b] min-h-screen text-stone-100 font-sans pb-4 transition-colors duration-200 selection:bg-stone-800 selection:text-white" ref={containerRef}>
      
      {/* Cinematic Minimalist Brand Header */}
      <header className="border-b bg-black/80 backdrop-blur sticky top-0 z-40" style={{ borderColor: brandColor }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div>
            <span 
              style={{ color: brandColor }}
              className="text-[10px] font-mono tracking-[0.25em] block uppercase font-bold drop-shadow-md"
            >
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
      <section className="relative overflow-hidden py-16 sm:py-20 border-b bg-gradient-to-b from-black to-stone-950 px-4" style={{ borderColor: brandColor }}>
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
                    : "bg-stone-900 text-stone-400 hover:text-white border border-stone-855/80"
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
                  src={photo.thumbnail_url || photo.url}
                  alt={t(photo.title, photo.title_es)}
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
                    {t(photo.title, photo.title_es)}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-400 line-clamp-2 leading-relaxed h-11 font-light">
                    {t(photo.description, photo.description_es) || (lang === "es" ? "Captura conceptual sin pies de fotos explícitos." : "Conceptual capture without explicit description.")}
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
          <p className="mt-2 text-stone-600 text-[10px] sm:text-xs font-mono max-w-2xl mx-auto leading-relaxed flex flex-col gap-1 items-center">
            <span>Powered by Nodo Ai Agency</span>
            <a href="https://www.nodoai.co" target="_blank" rel="noreferrer" className="hover:text-stone-400 transition-colors">
              www.nodoai.co
            </a>
          </p>
        </div>
      </footer>

      {/* IMMERSIVE SLIDE PROJECTOR VIEW - HUGE CAROUSEL SLIDESHOW */}
      {isProjectorOpen && (
        <ClientSlideshow
          isOpen={isProjectorOpen}
          onClose={() => setIsProjectorOpen(false)}
          photos={filteredPhotos}
          startIndex={currentSlideIndex}
          lang={lang}
          publicComments={publicComments}
          brandColor={brandColor}
        />
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
