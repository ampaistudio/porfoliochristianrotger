import React, { useState, useEffect } from "react";
import { Sliders, CheckCircle } from "lucide-react";
import { PortfolioConfig } from "../../types";

interface SettingsSecurityProps {
  config: PortfolioConfig;
  adminPassword?: string;
  onUpdateAdminPassword?: (pwd: string) => void;
  authorizedEmails?: string[];
  onUpdateAuthorizedEmails?: (emails: string[]) => void;
  googleClientId?: string;
  onUpdateGoogleClientId?: (id: string) => void;
}

export default function SettingsSecurity({
  config,
  adminPassword = "admin",
  onUpdateAdminPassword,
  authorizedEmails = ["rotgerchristian@gmail.com"],
  onUpdateAuthorizedEmails,
  googleClientId = "",
  onUpdateGoogleClientId,
}: SettingsSecurityProps) {
  const [tempPassword, setTempPassword] = useState(adminPassword);
  const [pwSaved, setPwSaved] = useState(false);

  useEffect(() => {
    setTempPassword(adminPassword);
  }, [adminPassword]);

  return (
    <>
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
    </>
  );
}
