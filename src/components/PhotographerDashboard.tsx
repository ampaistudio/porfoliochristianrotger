import React, { useState } from "react";
import { 
  Share2,
  ExternalLink,
  Settings
} from "lucide-react";
import { Photo, PortfolioConfig, PublicComment, ClientReviewSession } from "../types";
import DashboardGallery from "./dashboard/DashboardGallery";
import DashboardReviews from "./dashboard/DashboardReviews";
import DashboardSettings from "./dashboard/DashboardSettings";

interface PhotographerDashboardProps {
  photos: Photo[];
  onUpdatePhotos: (photos: Photo[]) => void;
  config: PortfolioConfig;
  onUpdateConfig: (config: PortfolioConfig) => void;
  publicComments: PublicComment[];
  onSimulateClientView: () => void;
  clientLinkUrl: string;
  onImportAllData?: (photos: Photo[], config: PortfolioConfig) => void;
  adminPassword?: string;
  onUpdateAdminPassword?: (pwd: string) => void;
  authorizedEmails?: string[];
  onUpdateAuthorizedEmails?: (emails: string[]) => void;
  googleClientId?: string;
  onUpdateGoogleClientId?: (id: string) => void;
}

export default function PhotographerDashboard({
  photos,
  onUpdatePhotos,
  config,
  onUpdateConfig,
  publicComments,
  onSimulateClientView,
  clientLinkUrl,
  onImportAllData,
  adminPassword = "admin",
  onUpdateAdminPassword,
  authorizedEmails = ["rotgerchristian@gmail.com"],
  onUpdateAuthorizedEmails,
  googleClientId = "",
  onUpdateGoogleClientId,
}: PhotographerDashboardProps) {
  const [activeTab, setActiveTab] = useState<"gallery" | "settings" | "reviews">("gallery");
  const [copiedLink, setCopiedLink] = useState(false);

  // Calculations for Stats
  const approvedTotalCount = publicComments.filter(c => c.isApproved).length;
  const reviewedTotalCount = publicComments.length;
  const approvalPercent = reviewedTotalCount > 0 ? Math.round((approvedTotalCount / reviewedTotalCount) * 100) : 100;

  const copyClientLink = () => {
    navigator.clipboard.writeText(clientLinkUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Top Banner introducing functionality */}
      <div className="bg-stone-900 text-white rounded-2xl p-5 sm:p-7 mb-8 shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2 text-stone-300 font-mono text-[10px] sm:text-xs uppercase tracking-[0.15em] font-extrabold">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            NODO AI AGENCY <span className="text-stone-500 font-normal mx-1">|</span> Panel de Control
          </div>
          <h1 className="font-sans text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            {config.title || "Tu Portafolio Creativo"}
          </h1>
          <p className="mt-2 text-stone-300 text-sm leading-relaxed">
            Construye el portafolio de tu trabajo, añade sugerencias con Inteligencia Artificial, compártelo con tu cliente, y recopila su feedback en tiempo real.
          </p>
        </div>
        
        {/* Actions for Sharing */}
        <div className="z-10 flex flex-col sm:flex-row gap-3 w-full md:w-auto self-stretch md:self-auto shrink-0">
          <button
            onClick={copyClientLink}
            className="flex-1 sm:flex-initial bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium text-xs px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            {copiedLink ? "¡Copiado!" : "Copiar Enlace de Cliente"}
          </button>
          <button
            onClick={onSimulateClientView}
            style={{ backgroundColor: config.brandColor }}
            className="flex-1 sm:flex-initial text-white font-medium text-xs px-5 py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition shadow-sm cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Abrir Vista Cliente
          </button>
        </div>
      </div>

      {/* Main Grid: Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-sm">
          <div className="text-stone-400 font-mono text-xs uppercase tracking-wider mb-1">Fotos en Portafolio</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-stone-100">{photos.length}</span>
            <span className="text-xs text-stone-500">piezas</span>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-sm">
          <div className="text-stone-400 font-mono text-xs uppercase tracking-wider mb-1">Comentarios Públicos</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-stone-100">{publicComments.length}</span>
            <span className="text-xs text-stone-500">recibidos</span>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-sm">
          <div className="text-stone-400 font-mono text-xs uppercase tracking-wider mb-1">Tasa de Aprobación</div>
          <div className="flex items-baseline gap-2 col-span-1">
            <span className="text-3xl font-semibold text-stone-100">{approvalPercent}%</span>
            <span className="text-xs text-emerald-600 font-medium font-mono">+{approvedTotalCount} públicos</span>
          </div>
        </div>

<div className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <span className="text-stone-400 font-mono text-xs uppercase tracking-wider">Color de Acento</span>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-5 h-5 rounded-md border border-stone-300 block" style={{ backgroundColor: config.brandColor }} />
            <span className="text-xs font-mono font-bold uppercase text-stone-700">{config.brandColor}</span>
          </div>
        </div>
      </div>

      {/* Tab select bar */}
      <div className="border-b border-stone-800 mb-8 flex flex-wrap gap-1">
        <button
          onClick={() => { setActiveTab("gallery"); }}
          className={`px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition cursor-pointer ${
            activeTab === "gallery" 
              ? "border-stone-100 text-stone-100" 
              : "border-transparent text-stone-400 hover:text-stone-200"
          }`}
        >
          🗃️ Galería & Fotos ({photos.length})
        </button>

        <button
          onClick={() => { setActiveTab("reviews"); }}
          className={`px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === "reviews" 
              ? "border-stone-100 text-stone-100" 
              : "border-transparent text-stone-400 hover:text-stone-200"
          }`}
        >
          📩 Feedback de Clientes ({publicComments.length})
        </button>

        <button
          onClick={() => { setActiveTab("settings"); }}
          className={`px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === "settings" 
              ? "border-stone-100 text-stone-100" 
              : "border-transparent text-stone-400 hover:text-stone-200"
          }`}
        >
          <Settings className="w-4 h-4 shrink-0" />
          Ajustes de Perfil
        </button>
      </div>

      {/* Tab Switched Content */}
      <div className="mt-4">
        {activeTab === "gallery" && (
          <DashboardGallery
            photos={photos}
            onUpdatePhotos={onUpdatePhotos}
            config={config}
            onUpdateConfig={onUpdateConfig}
          />
        )}

        {activeTab === "reviews" && (
          <DashboardReviews
            publicComments={publicComments}
            photos={photos}
            config={config}
            onSimulateClientView={onSimulateClientView}
          />
        )}

        {activeTab === "settings" && (
          <DashboardSettings
            config={config}
            onUpdateConfig={onUpdateConfig}
            photos={photos}
            onImportAllData={onImportAllData}
            adminPassword={adminPassword}
            onUpdateAdminPassword={onUpdateAdminPassword}
            authorizedEmails={authorizedEmails}
            onUpdateAuthorizedEmails={onUpdateAuthorizedEmails}
            googleClientId={googleClientId}
            onUpdateGoogleClientId={onUpdateGoogleClientId}
          />
        )}
      </div>

    </div>
  );
}
