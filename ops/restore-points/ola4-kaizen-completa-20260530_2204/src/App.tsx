import React, { lazy, Suspense, useState } from "react";
import { CheckCircle, Moon, Sun } from "lucide-react";
import { useToast } from "./hooks/useToast";
import { useAuth } from "./hooks/useAuth";
import { usePortfolioData } from "./hooks/usePortfolioData";
import { ClientSession } from "./utils/supabase";

const PhotographerDashboard = lazy(() => import("./components/PhotographerDashboard"));
const ClientPortfolioView = lazy(() => import("./components/ClientPortfolioView"));
const AdminLogin = lazy(() => import("./components/AdminLogin"));
const ClientPinGate = lazy(() => import("./components/client/ClientPinGate"));

function PageLoader() {
  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-stone-700 border-t-stone-300 rounded-full animate-spin" />
    </div>
  );
}

const authorizedEmails = (import.meta.env.VITE_AUTHORIZED_EMAILS || "")
  .split(",").map((e: string) => e.trim()).filter(Boolean);
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export default function App() {
  const { toastMessage, showStatusToast, showToast } = useToast();
  const { isAuthenticated, viewMode, isDarkMode, handleLoginSuccess, handleLogout, handleViewModeChange, toggleDarkMode } = useAuth(showToast);
  const { photos, config, publicComments, handlePhotosUpdate, handleConfigUpdate, handleImportAllData } = usePortfolioData(showToast);

  const clientLinkUrl = `${window.location.origin}${window.location.pathname}`;

  // K9 — Session PIN gate
  const sessionParam = new URLSearchParams(window.location.search).get("session");
  const [unlockedSession, setUnlockedSession] = useState<ClientSession | null>(null);

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-300 ${
      viewMode === "photographer" && isAuthenticated && isDarkMode
        ? "dark-theme bg-stone-100 text-stone-900"
        : viewMode === "photographer" && !isAuthenticated
        ? "bg-stone-950"
        : "bg-stone-100 text-stone-900"
    }`}>

      {/* Admin top bar — only in photographer view */}
      {isAuthenticated && viewMode === "photographer" && (
        <div className="bg-stone-900 border-b border-stone-800 text-stone-300 py-3 px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono font-bold z-50">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-amber-600 rounded text-white text-[10px]">PREVISUALIZACIÓN</span>
            <span className="text-stone-400">Puedes simular o compartir el enlace:</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-stone-800/80 p-0.5 rounded-xl border border-stone-700">
              <button
                onClick={() => handleViewModeChange("photographer")}
                className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition ${viewMode === "photographer" ? "bg-white text-stone-950 shadow" : "hover:text-white text-stone-400"}`}
              >
                📸 Vista Panel Fotógrafo
              </button>
              <button
                onClick={() => handleViewModeChange("client")}
                className="px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition hover:text-white text-stone-400"
              >
                👤 Vista Cliente
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className="px-2.5 py-1.5 bg-stone-800/80 hover:bg-stone-700 border border-stone-700 text-stone-300 hover:text-white rounded-lg transition-all cursor-pointer flex items-center justify-center"
                title={isDarkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={handleLogout}
                className="px-3.5 py-1.5 bg-red-950/40 hover:bg-red-900 border border-red-900/40 text-red-200 hover:text-white rounded-lg transition-all cursor-pointer text-[10px]"
              >
                🚪 Salir Panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* K6 — Floating back button in client preview (only when admin is previewing client view) */}
      {isAuthenticated && viewMode === "client" && (
        <div className="fixed bottom-6 left-6 z-50">
          <button
            onClick={() => handleViewModeChange("photographer")}
            className="bg-stone-900/90 backdrop-blur-md border border-stone-700 text-stone-300 hover:text-white text-[10px] font-mono font-bold px-4 py-2.5 rounded-full shadow-2xl transition-all flex items-center gap-2 hover:border-stone-500"
          >
            ← Panel Fotógrafo
          </button>
        </div>
      )}

      {/* Main router */}
      <div className="flex-1">
        <Suspense fallback={<PageLoader />}>
          {/* Session PIN gate: si ?session=xxx en la URL y aún no desbloqueado */}
          {sessionParam && !unlockedSession && !isAuthenticated ? (
            <ClientPinGate sessionId={sessionParam} onUnlocked={setUnlockedSession} />
          ) : viewMode === "photographer" ? (
            !isAuthenticated ? (
              <AdminLogin onLoginSuccess={handleLoginSuccess} googleClientId={googleClientId} />
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
                authorizedEmails={authorizedEmails}
                googleClientId={googleClientId}
              />
            )
          ) : (
            <ClientPortfolioView
              photos={unlockedSession?.photo_ids
                ? photos.filter(p => unlockedSession.photo_ids!.includes(p.id))
                : photos}
              config={config}
              brandColor={config.brandColor}
              publicComments={publicComments}
            />
          )}
        </Suspense>
      </div>

      {/* Toast */}
      {showStatusToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white border border-stone-800 rounded-xl p-4 shadow-xl max-w-sm flex items-center gap-3 animate-fadeIn">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <p className="text-xs sm:text-sm font-sans font-medium leading-relaxed">{toastMessage}</p>
        </div>
      )}

      {/* Footer */}
      {viewMode === "photographer" && (
        <footer className={`border-t py-6 text-center text-xs font-sans mt-auto ${
          !isAuthenticated ? "bg-stone-950 border-stone-900 text-stone-500" : "bg-stone-50 border-stone-200/60 text-stone-500"
        }`}>
          <div className="max-w-7xl mx-auto px-4 space-y-2">
            <p className={`font-light text-sm ${!isAuthenticated ? "text-stone-400" : "text-stone-600"}`}>
              © 2026 {config.photographerName} PH • Portafolio de Aprobación & Presentación de Alta Gama
            </p>
            <p className={`text-[10px] sm:text-xs font-mono max-w-2xl mx-auto leading-relaxed flex flex-col gap-1 items-center ${!isAuthenticated ? "text-stone-600" : "text-stone-400"}`}>
              <span>Powered by Nodo Ai Agency</span>
              <a href="https://www.nodoai.co" target="_blank" rel="noreferrer" className="hover:opacity-70 transition-colors">
                www.nodoai.co
              </a>
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
