import React, { useState } from "react";
import { Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

const STORED_HASH = import.meta.env.VITE_ADMIN_PASSWORD_HASH || "";

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

interface AdminLoginProps {
  onLoginSuccess: (userProfile?: { email: string; name: string; picture?: string }) => void;
  lang?: "es" | "en";
  // Google OAuth kept dormant — not shown in UI
  googleClientId?: string;
}

export default function AdminLogin({
  onLoginSuccess,
  lang = "en",
}: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!password) {
      setErrorMsg(
        lang === "es" ? "Por favor, introduce tu contraseña." : "Please enter your password."
      );
      return;
    }

    setIsLoading(true);
    try {
      const inputHash = await sha256(password);
      if (inputHash === STORED_HASH) {
        onLoginSuccess({ email: "admin@portfolio.local", name: "Administrador" });
      } else {
        setErrorMsg(
          lang === "es"
            ? "Contraseña incorrecta. Inténtalo de nuevo."
            : "Incorrect password. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-8 bg-stone-950 font-sans relative overflow-hidden">
      {/* Visual background atmospheric elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-stone-900/85 backdrop-blur-xl border border-stone-800 rounded-2xl shadow-2xl overflow-hidden relative z-10 transition-all duration-300">
        
        {/* Banner header visual */}
        <div className="p-6 sm:p-8 border-b border-stone-800/80 text-center relative">
          <div className="inline-block px-3 py-1 bg-stone-950/50 border border-stone-800 rounded-full mb-4">
            <span className="text-xs font-mono tracking-[0.2em] font-extrabold text-stone-300">
              NODO <span className="text-emerald-500">AI</span> AGENCY
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif text-white tracking-tight">
            {lang === "es" ? "Acceso Administrativo" : "Administrative Access"}
          </h2>
          <p className="text-stone-400 text-xs mt-1.5 font-sans">
            {lang === "es" 
              ? "Ingresa tus credenciales para administrar tu portafolio." 
              : "Enter your credentials to manage your portfolio."}
          </p>
        </div>

        {/* Form Body Areas */}
        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5 animate-fadeIn">

            {/* Password Field */}
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-widest text-stone-400 font-extrabold mb-2 text-left">
                {lang === "es" ? "Contraseña" : "Password"}
              </label>
              <div className="relative rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/50 border border-stone-800 bg-stone-950/60">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500">
                  <Lock className="w-4 h-4 text-stone-500" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={lang === "es" ? "Introduce tu contraseña..." : "Enter admin password..."}
                  className="w-full pl-10 pr-12 py-3 bg-transparent text-sm text-white focus:outline-none placeholder-stone-600 font-sans"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="bg-red-950/40 border border-red-900/50 rounded-xl p-3 mt-3 text-xs text-red-300 flex items-center gap-2 font-sans">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-90 active:scale-[0.98] py-3 text-xs font-mono font-bold rounded-xl text-stone-950 transition flex items-center justify-center gap-1.5 shadow-lg tracking-wider cursor-pointer mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>{isLoading ? "..." : (lang === "es" ? "INGRESAR AL PANEL" : "LOGIN TO DASHBOARD")}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
