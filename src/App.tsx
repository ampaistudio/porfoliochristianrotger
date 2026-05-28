import React, { useState, useEffect } from "react";
import { Photo, PortfolioConfig, PublicComment } from "./types";
import { DEFAULT_CONFIG, DEFAULT_PHOTOS } from "./defaultData";
import { fetchPhotos, fetchConfig, fetchPublicComments, updateConfigInSupabase, subscribeToPublicComments } from "./utils/supabase";
import PhotographerDashboard from "./components/PhotographerDashboard";
import ClientPortfolioView from "./components/ClientPortfolioView";
import AdminLogin from "./components/AdminLogin";
import { Eye, ShieldAlert, CheckCircle, RefreshCw, Smartphone, Monitor, Moon, Sun } from "lucide-react";

export default function App() {
  // 1. Core State with IndexedDB for heavy persistence (photos) and localStorage for config
  const [photos, setPhotos] = useState<Photo[]>([]);

  const [config, setConfig] = useState<PortfolioConfig>(DEFAULT_CONFIG);
  const [publicComments, setPublicComments] = useState<PublicComment[]>([]);

  // Current view mode: 'photographer' (admin panel) vs 'client' (external portfolio share)
  const [viewMode, setViewMode] = useState<"photographer" | "client">(() => {
    // Check if '?view=client' is in the URL path to start in Client View automatically
    const params = new URLSearchParams(window.location.search);
    return params.get("view") === "client" ? "client" : "photographer";
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("dashboard_theme") !== "light"; // Default to dark mode for admin
  });

  // Security and Authentication States
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      if (typeof window !== "undefined") {
        return sessionStorage.getItem("admin_authenticated") === "true";
      }
    } catch (e) {
      console.error("Session storage read error:", e);
    }
    return false;
  });

  const [adminPassword, setAdminPassword] = useState<string>(() => {
    return import.meta.env.VITE_ADMIN_PASSWORD || localStorage.getItem("admin_password") || "Gordini+2026";
  });

  const [authorizedEmails, setAuthorizedEmails] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("auth_google_emails");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Error reading whitelisted emails:", e);
    }
    const envEmails = import.meta.env.VITE_AUTHORIZED_EMAILS;
    if (envEmails) {
      return envEmails.split(",").map((email: string) => email.trim());
    }
    return ["rotgerchristian@gmail.com"];
  });

  const [googleClientId, setGoogleClientId] = useState<string>(() => {
    return (
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      localStorage.getItem("google_client_id") ||
      "448653609355-68049j4u9b456co09k96pco6p8v3f38h.apps.googleusercontent.com"
    );
  });

  // Automatically sync security settings to localStorage
  useEffect(() => {
    localStorage.setItem("admin_password", adminPassword);
  }, [adminPassword]);

  useEffect(() => {
    localStorage.setItem("dashboard_theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem("auth_google_emails", JSON.stringify(authorizedEmails));
  }, [authorizedEmails]);

  useEffect(() => {
    localStorage.setItem("google_client_id", googleClientId);
  }, [googleClientId]);

  const [showStatusToast, setShowStatusToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isDbLoaded, setIsDbLoaded] = useState(false);

  // Load all data from Supabase on initial mount
  useEffect(() => {
    async function initDB() {
      try {
        const [dbPhotos, dbConfig, dbComments] = await Promise.all([
          fetchPhotos(),
          fetchConfig(),
          fetchPublicComments()
        ]);
        
        if (dbPhotos && dbPhotos.length > 0) {
          setPhotos(dbPhotos);
        } else {
          setPhotos(DEFAULT_PHOTOS);
        }

        setConfig(dbConfig);
        setPublicComments(dbComments);
        console.log("Successfully loaded portfolio data from Supabase.");

        // Subscribe to real-time comments
        subscribeToPublicComments((payload) => {
          if (payload.eventType === 'INSERT') {
            const newComment = {
              id: payload.new.id,
              photoId: payload.new.photo_id,
              authorName: payload.new.author_name,
              text: payload.new.comment_text,
              isApproved: payload.new.is_approved,
              createdAt: payload.new.created_at
            };
            setPublicComments(prev => [newComment, ...prev]);
            
            // Show toast without causing re-render loop
            const toastEvent = new CustomEvent("show-toast", { detail: "🔔 ¡Nuevo comentario recibido en vivo!" });
            window.dispatchEvent(toastEvent);
          } else if (payload.eventType === 'UPDATE') {
            setPublicComments(prev => prev.map(c => c.id === payload.new.id ? { ...c, isApproved: payload.new.is_approved } : c));
          } else if (payload.eventType === 'DELETE') {
            setPublicComments(prev => prev.filter(c => c.id !== payload.old.id));
          }
        });

      } catch (error) {
        console.error("Failed to fetch from Supabase:", error);
      } finally {
        setIsDbLoaded(true);
      }
    }
    initDB();
  }, []);

  // Event listener for real-time toast
  useEffect(() => {
    const handleToast = (e: any) => {
      setToastMessage(e.detail);
      setShowStatusToast(true);
      setTimeout(() => setShowStatusToast(false), 4500);
    };
    window.addEventListener("show-toast", handleToast);
    return () => window.removeEventListener("show-toast", handleToast);
  }, []);

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

  const handleConfigUpdate = async (updatedConfig: PortfolioConfig) => {
    setConfig(updatedConfig);
    await updateConfigInSupabase(updatedConfig);
  };

  const handleImportAllData = (importedPhotos: Photo[], importedConfig: PortfolioConfig) => {
    // Note: Con Supabase, la importación se hace mediante el script backend (Fase 2 KAIZEN).
    // Esta función en UI queda obsoleta, pero se puede simular actualizando el estado local y pidiendo refresco.
    setPhotos(importedPhotos);
    setConfig(importedConfig);

    setToastMessage("🔄 Los datos locales se han actualizado (Para sincronizar a Supabase usa el script de migración)");
    setShowStatusToast(true);
    setTimeout(() => setShowStatusToast(false), 4500);
  };

  const handleClientFeedbackSubmit = async (
    clientName: string,
    clientEmail: string,
    companyName: string,
    feedbacks: any[],
    generalComment: string
  ) => {
    // Reemplazado por el nuevo flujo de comentarios públicos,
    // pero mantenemos la firma vacía para no romper dependencias si alguien lo llama
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("admin_authenticated");
    setToastMessage("🚪 ¡Sesión cerrada correctamente!");
    setShowStatusToast(true);
    setTimeout(() => setShowStatusToast(false), 3000);
  };

  const handleLoginSuccess = (userProfile?: { email: string; name: string; picture?: string }) => {
    setIsAuthenticated(true);
    sessionStorage.setItem("admin_authenticated", "true");
    setToastMessage(
      userProfile && userProfile.email !== "admin@portfolio.local"
        ? `🔑 ¡Sesión iniciada como ${userProfile.name}! (${userProfile.email})`
        : "🔑 ¡Sesión de administrador iniciada correctamente!"
    );
    setShowStatusToast(true);
    setTimeout(() => setShowStatusToast(false), 4500);
  };

  // Build client link url
  const clientLinkUrl = `${window.location.origin}${window.location.pathname}?view=client`;

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-300 ${viewMode === "photographer" && isAuthenticated && isDarkMode ? "dark-theme bg-stone-100 text-stone-900" : viewMode === "photographer" && !isAuthenticated ? "bg-stone-950" : "bg-stone-100 text-stone-900"}`}>
      
      {/* Dynamic View Selector floating top banner */}
      {isAuthenticated && (
      <div className="bg-stone-900 border-b border-stone-800 text-stone-300 py-3 px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono font-bold z-50">
        <div className="flex items-center gap-2">
          <span className="p-1 bg-amber-600 rounded text-white text-[10px]">PREVISUALIZACIÓN</span>
          <span className="text-stone-400">Puedes simular o compartir el enlace:</span>
        </div>

        <div className="flex items-center gap-3">
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

          {viewMode === "photographer" && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="px-2.5 py-1.5 bg-stone-800/80 hover:bg-stone-700 border border-stone-700 text-stone-300 hover:text-white rounded-lg transition-all duration-250 cursor-pointer flex items-center justify-center"
                title={isDarkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={handleLogout}
                className="px-3.5 py-1.5 bg-red-950/40 hover:bg-red-900 border border-red-900/40 text-red-200 hover:text-white rounded-lg transition-all duration-250 cursor-pointer text-[10px]"
                title="Cerrar sesión de administrador"
              >
                🚪 Salir Panel
              </button>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Main View Display Router */}
      <div className="flex-1">
        {viewMode === "photographer" ? (
          !isAuthenticated ? (
            <AdminLogin
              onLoginSuccess={handleLoginSuccess}
              authorizedEmails={authorizedEmails}
              correctPasswordHash={adminPassword}
              googleClientId={googleClientId}
            />
          ) : (
            <PhotographerDashboard
              photos={photos}
              onUpdatePhotos={handlePhotosUpdate}
              config={config}
              onUpdateConfig={handleConfigUpdate}
              publicComments={publicComments}
              onSimulateClientView={() => handleViewModeChange("client")}
              clientLinkUrl={clientLinkUrl}
              onImportAllData={handleImportAllData}
              adminPassword={adminPassword}
              onUpdateAdminPassword={setAdminPassword}
              authorizedEmails={authorizedEmails}
              onUpdateAuthorizedEmails={setAuthorizedEmails}
              googleClientId={googleClientId}
              onUpdateGoogleClientId={setGoogleClientId}
            />
          )
        ) : (
          <ClientPortfolioView
            photos={photos}
            config={config}
            brandColor={config.brandColor}
            publicComments={publicComments}
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
