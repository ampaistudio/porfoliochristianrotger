import React, { useState, useEffect } from "react";
import { Photo, PortfolioConfig, ClientReviewSession, ClientFeedback } from "./types";
import { DEFAULT_CONFIG, DEFAULT_PHOTOS, DEFAULT_CLIENT_REVIEWS } from "./defaultData";
import { loadPhotosFromDB, savePhotosToDB } from "./utils/db";
import PhotographerDashboard from "./components/PhotographerDashboard";
import ClientPortfolioView from "./components/ClientPortfolioView";
import { Eye, ShieldAlert, CheckCircle, RefreshCw, Smartphone, Monitor } from "lucide-react";

export default function App() {
  // 1. Core State with localStorage fallback for persistence
  const [photos, setPhotos] = useState<Photo[]>(() => {
    try {
      const saved = localStorage.getItem("portfolio_photos");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error loading photos from localStorage:", e);
    }
    return DEFAULT_PHOTOS;
  });

  const [config, setConfig] = useState<PortfolioConfig>(() => {
    try {
      const saved = localStorage.getItem("portfolio_config");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object" && parsed.photographerName) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error loading config from localStorage:", e);
    }
    return DEFAULT_CONFIG;
  });

  const [reviews, setReviews] = useState<ClientReviewSession[]>(() => {
    try {
      const saved = localStorage.getItem("portfolio_reviews");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error loading reviews from localStorage:", e);
    }
    return DEFAULT_CLIENT_REVIEWS;
  });

  // Current view mode: 'photographer' (admin panel) vs 'client' (external portfolio share)
  const [viewMode, setViewMode] = useState<"photographer" | "client">(() => {
    // Check if '?view=client' is in the URL path to start in Client View automatically
    const params = new URLSearchParams(window.location.search);
    return params.get("view") === "client" ? "client" : "photographer";
  });

  const [showStatusToast, setShowStatusToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isDbLoaded, setIsDbLoaded] = useState(false);

  // Load photos from IndexedDB on initial mount for high capacity
  useEffect(() => {
    async function initDB() {
      try {
        const dbPhotos = await loadPhotosFromDB();
        if (dbPhotos && dbPhotos.length > 0) {
          setPhotos(dbPhotos);
          console.log("Successfully loaded photos from IndexedDB storage.");
        } else {
          console.log("IndexedDB was empty. Retaining defaults/localStorage.");
        }
      } catch (error) {
        console.error("Failed to restore photos from IndexedDB:", error);
      } finally {
        setIsDbLoaded(true);
      }
    }
    initDB();
  }, []);

  // 2. Synchronize states with localStorage and IndexedDB on every change safely
  useEffect(() => {
    if (!isDbLoaded) return; // Prevent initial render overwriting data with defaults!

    // 1. Try saving to IndexedDB (as primary high-capacity storage for base64)
    savePhotosToDB(photos).catch(err => console.error("Error at savePhotosToDB:", err));

    // 2. Try saving to localStorage (as fallback)
    try {
      localStorage.setItem("portfolio_photos", JSON.stringify(photos));
    } catch (e) {
      console.warn("localStorage quota exceeded, but photos are safely saved in IndexedDB database storage.", e);
    }
  }, [photos, isDbLoaded]);

  useEffect(() => {
    if (!isDbLoaded) return;
    try {
      localStorage.setItem("portfolio_config", JSON.stringify(config));
    } catch (e) {
      console.error("No se pudo persistir 'portfolio_config' en localStorage:", e);
    }
  }, [config, isDbLoaded]);

  useEffect(() => {
    if (!isDbLoaded) return;
    try {
      localStorage.setItem("portfolio_reviews", JSON.stringify(reviews));
    } catch (e) {
      console.error("No se pudo persistir 'portfolio_reviews' en localStorage:", e);
    }
  }, [reviews, isDbLoaded]);

  // Sync viewMode changes to address bar without refreshing for seamless simulation
  const handleViewModeChange = (mode: "photographer" | "client") => {
    setViewMode(mode);
    const newUrl = new URL(window.location.href);
    if (mode === "client") {
      newUrl.searchParams.set("view", "client");
    } else {
      newUrl.searchParams.delete("view");
    }
    window.history.pushState({}, "", newUrl.toString());

    setToastMessage(`Cambiado a vista de ${mode === "client" ? "Cliente" : "Fotógrafo (Admin)"}`);
    setShowStatusToast(true);
    setTimeout(() => setShowStatusToast(false), 3000);
  };

  // 3. Action Handlers
  const handlePhotosUpdate = (updatedPhotos: Photo[]) => {
    setPhotos(updatedPhotos);
  };

  const handleConfigUpdate = (updatedConfig: PortfolioConfig) => {
    setConfig(updatedConfig);
  };

  const handleImportAllData = (importedPhotos: Photo[], importedConfig: PortfolioConfig, importedReviews: ClientReviewSession[]) => {
    // Suspend saving during assignment to avoid multiple intermediate states
    setIsDbLoaded(false);

    setPhotos(importedPhotos);
    setConfig(importedConfig);
    setReviews(importedReviews);

    // Persist directly to secure structures
    savePhotosToDB(importedPhotos)
      .then(() => {
        setIsDbLoaded(true);
        console.log("Successfully loaded backup in-memory structures and storage.");
      })
      .catch(err => {
        setIsDbLoaded(true);
        console.error("IndexedDB store error during restore:", err);
      });

    try {
      localStorage.setItem("portfolio_photos", JSON.stringify(importedPhotos));
      localStorage.setItem("portfolio_config", JSON.stringify(importedConfig));
      localStorage.setItem("portfolio_reviews", JSON.stringify(importedReviews));
    } catch (e) {
      console.warn("localStorage quota warning during import. Fully loaded in IndexedDB.", e);
    }

    setToastMessage("🔄 ¡Portafolio y fotos restaurados con éxito desde tu respaldo!");
    setShowStatusToast(true);
    setTimeout(() => setShowStatusToast(false), 4500);
  };

  const handleClearReviews = () => {
    setReviews([]);
    setToastMessage("Se ha limpiado el historial de feedback de clientes.");
    setShowStatusToast(true);
    setTimeout(() => setShowStatusToast(false), 3000);
  };

  const handleClientFeedbackSubmit = (
    clientName: string,
    clientEmail: string,
    companyName: string,
    feedbacks: ClientFeedback[],
    generalComment: string
  ) => {
    const newSession: ClientReviewSession = {
      id: "review_" + Date.now(),
      clientName,
      clientEmail,
      companyName,
      createdAt: new Date().toISOString(),
      feedbacks,
      generalComment,
      status: "active",
    };

    setReviews([newSession, ...reviews]);
    
    setToastMessage("Se envió el feedback. ¡Puedes comprobarlo en el panel del Fotógrafo!");
    setShowStatusToast(true);
    setTimeout(() => setShowStatusToast(false), 4500);
  };

  // Build client link url
  const clientLinkUrl = `${window.location.origin}${window.location.pathname}?view=client`;

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-between">
      
      {/* Dynamic View Selector floating top banner */}
      <div className="bg-stone-900 border-b border-stone-800 text-stone-300 py-3 px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono font-bold z-50">
        <div className="flex items-center gap-2">
          <span className="p-1 bg-amber-600 rounded text-white text-[10px]">PREVISUALIZACIÓN</span>
          <span className="text-stone-400">Puedes simular o compartir el enlace:</span>
        </div>

        <div className="flex items-center gap-1 bg-stone-800/80 p-0.5 rounded-xl border border-stone-700">
          <button
            onClick={() => handleViewModeChange("photographer")}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              viewMode === "photographer"
                ? "bg-white text-stone-950 shadow"
                : "hover:text-white text-stone-400"
            }`}
          >
            📸 Vista Panel Fotógrafo
          </button>
          
          <button
            onClick={() => handleViewModeChange("client")}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              viewMode === "client"
                ? "bg-white text-stone-950 shadow"
                : "hover:text-white text-stone-400"
            }`}
          >
            👤 Vista Cliente
          </button>
        </div>
      </div>

      {/* Main View Display Router */}
      <div className="flex-1">
        {viewMode === "photographer" ? (
          <PhotographerDashboard
            photos={photos}
            onUpdatePhotos={handlePhotosUpdate}
            config={config}
            onUpdateConfig={handleConfigUpdate}
            reviews={reviews}
            onClearReviews={handleClearReviews}
            onSimulateClientView={() => handleViewModeChange("client")}
            clientLinkUrl={clientLinkUrl}
            onImportAllData={handleImportAllData}
          />
        ) : (
          <ClientPortfolioView
            photos={photos}
            config={config}
            brandColor={config.brandColor}
          />
        )}
      </div>

      {/* Persistent Elegant Screen Toast Notifications */}
      {showStatusToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white border border-stone-800 rounded-xl p-4 shadow-xl max-w-sm flex items-center gap-3 animate-fadeIn">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <p className="text-xs sm:text-sm font-sans font-medium leading-relaxed">
            {toastMessage}
          </p>
        </div>
      )}

      {/* Small informative app footer */}
      {viewMode === "photographer" && (
        <footer className="bg-stone-50 border-t border-stone-200/60 py-6 text-center text-xs text-stone-500 font-sans mt-auto">
          <p>© 2026 {config.photographerName} PH • Portafolio de Aprobación & Presentación de Alta Gama</p>
          <p className="mt-1 text-stone-400">Potenciado con Gemini AI para generación de descripciones editoriales para el cliente.</p>
        </footer>
      )}

    </div>
  );
}
