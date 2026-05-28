import React, { useState, useEffect } from "react";
import { 
  Sliders, 
  CheckCircle, 
  PlusCircle, 
  Upload, 
  Download, 
  Database, 
  X,
  Mail,
  Instagram,
  Twitter
} from "lucide-react";
import { Photo, PortfolioConfig, ClientReviewSession } from "../../types";

interface DashboardSettingsProps {
  config: PortfolioConfig;
  onUpdateConfig: (config: PortfolioConfig) => void;
  photos: Photo[];
  reviews: ClientReviewSession[];
  onImportAllData?: (photos: Photo[], config: PortfolioConfig, reviews: ClientReviewSession[]) => void;
  adminPassword?: string;
  onUpdateAdminPassword?: (pwd: string) => void;
  authorizedEmails?: string[];
  onUpdateAuthorizedEmails?: (emails: string[]) => void;
  googleClientId?: string;
  onUpdateGoogleClientId?: (id: string) => void;
}

export default function DashboardSettings({
  config,
  onUpdateConfig,
  photos,
  reviews,
  onImportAllData,
  adminPassword = "admin",
  onUpdateAdminPassword,
  authorizedEmails = ["rotgerchristian@gmail.com"],
  onUpdateAuthorizedEmails,
  googleClientId = "",
  onUpdateGoogleClientId,
}: DashboardSettingsProps) {
  const [backupMessage, setBackupMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [tempPassword, setTempPassword] = useState(adminPassword);
  const [pwSaved, setPwSaved] = useState(false);
  
  // Category management local state
  const [newCatEs, setNewCatEs] = useState("");
  const [newCatEn, setNewCatEn] = useState("");

  useEffect(() => {
    setTempPassword(adminPassword);
  }, [adminPassword]);

  const handleConfigChange = (key: keyof PortfolioConfig, value: string) => {
    onUpdateConfig({
      ...config,
      [key]: value
    });
  };

  const handleAddCategory = () => {
    const es = newCatEs.trim();
    const en = newCatEn.trim();
    if (!es) return;

    const catString = en ? `${es} | ${en}` : es;
    const currentCats = config.categories || [];
    
    if (currentCats.includes(catString)) {
      setNewCatEs("");
      setNewCatEn("");
      return;
    }

    const updated = [...currentCats, catString];
    onUpdateConfig({
      ...config,
      categories: updated
    });

    setNewCatEs("");
    setNewCatEn("");
  };

  const handleRemoveCategory = (catToRemove: string) => {
    const currentCats = config.categories || [];
    const updated = currentCats.filter(c => c !== catToRemove);
    onUpdateConfig({
      ...config,
      categories: updated
    });
  };

  const handleExportBackup = () => {
    try {
      const backupData = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        photos,
        config,
        reviews,
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData));
      const downloadAnchor = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 10);
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `respaldo_portafolio_ph_${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setBackupMessage({
        text: "✨ ¡Copia de seguridad local exportada con éxito! Se ha descargado tu archivo de respaldo .json.",
        type: "success"
      });
      setTimeout(() => setBackupMessage(null), 12000);
    } catch (err: any) {
      console.error("Error al exportar el respaldo:", err);
      setBackupMessage({
        text: `Error al generar la copia de seguridad: ${err.message || err}`,
        type: "error"
      });
    }
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);

        if (!parsed || typeof parsed !== "object") {
          throw new Error("El archivo no contiene un formato de respaldo JSON válido.");
        }

        const importedPhotos = parsed.photos;
        const importedConfig = parsed.config;
        const importedReviews = parsed.reviews || [];

        if (!Array.isArray(importedPhotos)) {
          throw new Error("La copia de seguridad no contiene fotos válidas.");
        }

        if (!importedConfig || typeof importedConfig !== "object" || !importedConfig.photographerName) {
          throw new Error("La copia de seguridad no contiene una plantilla de configuración de perfil.");
        }

        if (onImportAllData) {
          onImportAllData(importedPhotos, importedConfig, importedReviews);
          setBackupMessage({
            text: `✨ ¡Restauración exitosa! Se cargaron ${importedPhotos.length} fotos y la configuración del perfil de "${importedConfig.photographerName}". Todos tus datos están seguros.`,
            type: "success"
          });
          setTimeout(() => setBackupMessage(null), 15000);
        } else {
          throw new Error("Falta el callback de restauración en el componente raíz.");
        }
      } catch (err: any) {
        console.error("Error al restaurar el respaldo:", err);
        setBackupMessage({
          text: `⚠️ Error de validación al importar el archivo: ${err.message || 'JSON corrupto'}`,
          type: "error"
        });
      }
    };
    reader.onerror = () => {
      setBackupMessage({ text: "Error de lectura del archivo.", type: "error" });
    };
    reader.readAsText(file);
    event.target.value = ""; // Reset
  };

  return (
    <div className="max-w-2xl mx-auto bg-stone-50 border border-stone-200 rounded-2xl p-5 sm:p-7 space-y-6 shadow-sm">
      <div>
        <h2 className="font-sans font-medium text-stone-900 text-lg">Ajustes Estéticos de tu Exposición</h2>
        <p className="text-xs text-stone-500 mt-1">Configura cómo tus clientes miran tu marca personal y paleta de colores.</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1.5">
              Nombre Profesional / Estudio
            </label>
            <input
              type="text"
              value={config.photographerName}
              onChange={(e) => handleConfigChange("photographerName", e.target.value)}
              className="w-full text-sm bg-white border border-stone-200 rounded-lg p-2.5 outline-none "
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1.5">
              Título de Encabezado
            </label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => handleConfigChange("title", e.target.value)}
              className="w-full text-sm bg-white border border-stone-200 rounded-lg p-2.5 outline-none "
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1.5">
            Sobre Mi / Biografía Curatorial
          </label>
          <textarea
            value={config.bio}
            onChange={(e) => handleConfigChange("bio", e.target.value)}
            rows={3}
            className="w-full text-sm bg-white border border-stone-200 rounded-lg p-2.5 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1.5 flex items-center gap-1">
              <Mail className="w-3 h-3" /> Correo de contacto
            </label>
            <input
              type="email"
              value={config.email}
              onChange={(e) => handleConfigChange("email", e.target.value)}
              className="w-full text-sm bg-white border border-stone-200 rounded-lg p-2 outline-none "
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1.5 flex items-center gap-1">
              <Instagram className="w-3 h-3" /> Instagram
            </label>
            <input
              type="text"
              value={config.instagram}
              onChange={(e) => handleConfigChange("instagram", e.target.value)}
              className="w-full text-sm bg-white border border-stone-200 rounded-lg p-2 outline-none "
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1.5 flex items-center gap-1">
              <Twitter className="w-3 h-3" /> Twitter
            </label>
            <input
              type="text"
              value={config.twitter}
              onChange={(e) => handleConfigChange("twitter", e.target.value)}
              className="w-full text-sm bg-white border border-stone-200 rounded-lg p-2 outline-none "
            />
          </div>
        </div>

        {/* Accent presets palettes */}
        <div>
          <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-2">
            Color de Acento de la Marca (Preselecciones)
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { name: "Terracotta Rust", hex: "#7C2D12" },
              { name: "Slate Charcoal", hex: "#1C1917" },
              { name: "Deep Forest", hex: "#064E3B" },
              { name: "Bordeaux Plum", hex: "#581C87" },
              { name: "Linen Sand", hex: "#78716C" },
              { name: "Warm Amber", hex: "#B45309" },
            ].map((preset) => (
              <button
                key={preset.hex}
                type="button"
                onClick={() => handleConfigChange("brandColor", preset.hex)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 border rounded-xl transition ${
                  config.brandColor === preset.hex 
                    ? "border-stone-900 bg-stone-200" 
                    : "border-stone-250 bg-white hover:bg-stone-50 text-stone-700"
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full border border-stone-300 block" style={{ backgroundColor: preset.hex }} />
                {preset.name}
              </button>
            ))}
          </div>
          
          <div className="mt-3">
            <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-400 mb-1.5">
              O usar tu propio Código Hexadecimal (#HEX)
            </label>
            <input
              type="text"
              value={config.brandColor}
              onChange={(e) => handleConfigChange("brandColor", e.target.value)}
              placeholder="#7C2D12"
              className="w-32 text-xs font-mono font-bold bg-white border border-stone-200 rounded-lg p-2 text-stone-850 focus:ring-1 focus:ring-stone-400"
            />
          </div>
        </div>

        {/* SEGURIDAD Y BACKUP LOCAL CARD */}
        <hr className="border-stone-200/80 my-6" />

        <div className="bg-stone-100/90 border border-stone-200/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-stone-200/80 rounded-xl text-stone-700">
              <Database className="w-5 h-5 text-stone-650 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-sans font-semibold text-stone-800 flex items-center gap-2">
                Centro de Salvaguarda & Copias de Seguridad de Fotos
              </h3>
              <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                Evita perder tus imágenes y configuraciones. Tu navegador guarda los datos de forma local en una base de datos de alta capacidad (IndexedDB). Para total seguridad, descarga un respaldo físico que podrás restaurar en cualquier momento, reinstalación o dispositivo.
              </p>
            </div>
          </div>

          {backupMessage && (
            <div 
              className={`p-3.5 rounded-xl text-xs font-sans font-medium border leading-relaxed ${
                backupMessage.type === "success" 
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                  : backupMessage.type === "error"
                  ? "bg-rose-50 text-rose-800 border-rose-200"
                  : "bg-blue-50 text-blue-800 border-blue-200"
              }`}
            >
              {backupMessage.text}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Export Backup button */}
            <button
              type="button"
              onClick={handleExportBackup}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-stone-900 border border-stone-800 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow transition-all active:scale-[0.98] duration-150"
            >
              <Download className="w-4 h-4" />
              <span>Exportar Respaldo Completo (.json)</span>
            </button>

            {/* Import Backup button */}
            <label className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-stone-250 hover:bg-stone-50 text-stone-700 hover:text-stone-900 rounded-xl text-xs font-semibold cursor-pointer shadow-sm transition-all active:scale-[0.98] duration-150">
              <Upload className="w-4 h-4 text-stone-400" />
              <span>Restaurar Respaldo (.json)</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>

          <div className="bg-white/95 border border-stone-200/50 rounded-xl p-3 flex flex-wrap gap-x-4 gap-y-2 justify-between items-center text-[11px] font-sans text-stone-500">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-stone-600">Almacenamiento Local Activo:</span>
              <span>IndexedDB Encendido</span>
            </div>
            <div className="flex gap-3 font-mono font-medium">
              <span>Fotos: {photos.length}</span>
              <span>Feedback: {reviews.length}</span>
            </div>
          </div>
        </div>

        {/* GESTIÓN DE CATEGORÍAS */}
        <hr className="border-stone-200/80 my-6" />

        <div className="bg-stone-100/90 border border-stone-200/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs text-left">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-stone-200/80 rounded-xl text-stone-700">
              <PlusCircle className="w-5 h-5 text-emerald-600 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-sans font-semibold text-stone-800">
                📁 Gestión de Categorías / Colecciones
              </h3>
              <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                Agrega nuevas categorías para tus fotos o elimina las que ya no uses. Si una categoría tiene el formato <code>Nombre Español | Nombre Inglés</code>, se traducirá automáticamente para el cliente.
              </p>
            </div>
          </div>

          {/* Category list with delete buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            {(config.categories || []).map((cat) => {
              const parts = cat.split(" | ");
              const displayLabel = parts.length > 1 ? `${parts[0]} / ${parts[1]}` : cat;
              return (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1.5 bg-white border border-stone-200 px-3 py-1.5 rounded-xl text-xs text-stone-800 font-medium shadow-sm"
                >
                  <span>{displayLabel}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(cat)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-0.5 rounded transition shrink-0 cursor-pointer"
                    title="Eliminar categoría"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              );
            })}
          </div>

          {/* Add new category form */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Nombre en Español (ej. Retrato)"
                value={newCatEs}
                onChange={(e) => setNewCatEs(e.target.value)}
                className="text-sm bg-white border border-stone-200 rounded-lg p-2.5 outline-none font-sans"
              />
              <input
                type="text"
                placeholder="Nombre en Inglés (ej. Portrait)"
                value={newCatEn}
                onChange={(e) => setNewCatEn(e.target.value)}
                className="text-sm bg-white border border-stone-200 rounded-lg p-2.5 outline-none font-sans"
              />
            </div>
            <button
              type="button"
              onClick={handleAddCategory}
              style={{ backgroundColor: config.brandColor }}
              className="px-4 py-2.5 text-white text-xs font-semibold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all shadow-sm shrink-0 cursor-pointer"
            >
              Agregar Categoría
            </button>
          </div>
        </div>

        {/* CONFIGURACIÓN DE SEGURIDAD Y ACCESO ADMIN */}
        <hr className="border-stone-200/80 my-6" />

        <div className="bg-stone-100/90 border border-stone-200/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs text-left">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-stone-200/80 rounded-xl text-stone-700">
              <Sliders className="w-5 h-5 text-emerald-650 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-sans font-semibold text-stone-800 flex items-center gap-2">
                🛡️ Configuración de Seguridad y Acceso (Google & Contraseña)
              </h3>
              <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                Protege tu panel administrativo cuando subes este proyecto a Vercel o GitHub. Configura tu contraseña administrativa y vincula tu cuenta de Google.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {/* Admin Password setting */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1.5 flex items-center gap-1">
                🔓 Contraseña de Acceso Directo (Panel)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tempPassword}
                  onChange={(e) => {
                    setTempPassword(e.target.value);
                    setPwSaved(false);
                  }}
                  placeholder="Escribe la contraseña de acceso..."
                  className="flex-1 text-sm bg-white border border-stone-200 rounded-lg p-2.5 outline-none font-sans"
                />
                <button
                  type="button"
                  onClick={() => {
                    onUpdateAdminPassword?.(tempPassword);
                    setPwSaved(true);
                    setTimeout(() => setPwSaved(false), 3000);
                  }}
                  style={{ backgroundColor: config.brandColor }}
                  className="px-4 py-2.5 text-white text-xs font-semibold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all shadow-sm shrink-0 cursor-pointer"
                >
                  Guardar
                </button>
              </div>
              {pwSaved && (
                <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1.5 animate-fadeIn">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>¡Contraseña guardada correctamente!</span>
                </div>
              )}
              <p className="text-[11px] text-stone-400 mt-1">
                Esta es la contraseña de respaldo para ingresar en cualquier dispositivo sin Google.
              </p>
            </div>

            {/* Whitelisted emails setting */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1.5 flex items-center gap-1">
                ✉️ Correos de Google Whitelist (Separados por coma)
              </label>
              <input
                type="text"
                value={authorizedEmails.join(", ")}
                onChange={(e) => {
                  const emails = e.target.value.split(",").map(email => email.trim());
                  onUpdateAuthorizedEmails?.(emails);
                }}
                placeholder="correo@gmail.com, ..."
                className="w-full text-sm bg-white border border-stone-200 rounded-lg p-2.5 outline-none font-mono"
              />
              <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">
                Solo los emails ingresados aquí podrán loguearse presionando "Entrar con Google". Tu email actual autorizado es: <span className="text-stone-700 font-bold bg-stone-200/60 px-1.5 py-0.5 rounded">{authorizedEmails[0]}</span>.
              </p>
            </div>

            {/* Google Client ID setting */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1.5 flex items-center gap-1">
                ⚙️ Google OAuth Client ID (Para Vercel / Producción)
              </label>
              <input
                type="text"
                value={googleClientId}
                onChange={(e) => onUpdateGoogleClientId?.(e.target.value)}
                placeholder="Ingresa tu Google Client ID de Google Cloud Console"
                className="w-full text-[11px] font-mono bg-white border border-stone-200 rounded-lg p-2.5 outline-none"
              />
              <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">
                Si dejas este campo con el predeterminado, se usará un Client ID genérico de pruebas. Para producción en Vercel, crea tus credenciales en el <strong>Google Cloud Console (OAuth 2.0 Client ID)</strong> para tu dominio de Vercel y pégalo aquí. ¡Listo!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
