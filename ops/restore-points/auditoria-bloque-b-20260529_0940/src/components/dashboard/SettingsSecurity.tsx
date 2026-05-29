import React from "react";
import { Sliders } from "lucide-react";
import { PortfolioConfig } from "../../types";

interface SettingsSecurityProps {
  config: PortfolioConfig;
  authorizedEmails?: string[];
  // Google OAuth kept dormant
  googleClientId?: string;
}

export default function SettingsSecurity({
  config,
  authorizedEmails = [],
  googleClientId = "",
}: SettingsSecurityProps) {

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
          {/* Password info — managed via .env, not editable from UI */}
          <div className="bg-white border border-stone-200 rounded-xl p-3.5 flex items-start gap-3">
            <span className="text-lg">🔐</span>
            <div>
              <p className="text-xs font-semibold text-stone-700">Contraseña de acceso</p>
              <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">
                Gestionada de forma segura vía variable de entorno <code className="bg-stone-100 px-1 rounded">VITE_ADMIN_PASSWORD_HASH</code>.
                Para cambiarla, actualizá el hash SHA-256 en tu archivo <code className="bg-stone-100 px-1 rounded">.env</code> y en Vercel.
              </p>
            </div>
          </div>

          {/* Authorized emails — read only, from env */}
          {authorizedEmails.length > 0 && (
            <div>
              <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1.5">
                ✉️ Email autorizado (desde .env)
              </label>
              <div className="bg-white border border-stone-200 rounded-lg p-2.5 text-xs font-mono text-stone-600">
                {authorizedEmails.join(", ")}
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                Gestionado via <code className="bg-stone-100 px-1 rounded">VITE_AUTHORIZED_EMAILS</code> en .env.
              </p>
            </div>
          )}

          {/* Google OAuth dormant notice */}
          <div className="bg-stone-50 border border-dashed border-stone-300 rounded-xl p-3.5 flex items-start gap-3">
            <span className="text-base">💤</span>
            <div>
              <p className="text-xs font-semibold text-stone-500">Google OAuth — Inactivo</p>
              <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">
                El acceso vía Google está desactivado. El login opera exclusivamente con contraseña segura.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
