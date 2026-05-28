import React, { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, ShieldAlert, KeyRound, Chrome, AlertCircle, Sparkles, RefreshCw } from "lucide-react";

interface AdminLoginProps {
  onLoginSuccess: (userProfile?: { email: string; name: string; picture?: string }) => void;
  lang?: "es" | "en";
  authorizedEmails: string[];
  correctPasswordHash: string; // The saved admin password
  googleClientId: string; // From configuration
}

export default function AdminLogin({
  onLoginSuccess,
  lang = "es",
  authorizedEmails,
  correctPasswordHash,
  googleClientId,
}: AdminLoginProps) {
  const [activeTab, setActiveTab] = useState<"google" | "password">("google");
  
  // Password auth state
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  
  // Google auth info
  const [googleError, setGoogleError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Load Google Client SDK button
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const initGoogleSignIn = () => {
      // Check if window.google is ready
      if (typeof window !== "undefined" && (window as any).google?.accounts?.id) {
        try {
          const google = (window as any).google;
          google.accounts.id.initialize({
            client_id: googleClientId || "448653609355-mockid.apps.googleusercontent.com", // Fallback if not configured
            callback: (response: any) => {
              handleGoogleCredentialResponse(response);
            },
            auto_select: false,
          });

          // Render button on container if tab is Google
          const buttonElement = document.getElementById("google-signin-btn");
          if (buttonElement) {
            google.accounts.id.renderButton(buttonElement, {
              type: "standard",
              theme: "filled_blue",
              size: "large",
              text: "signin_with",
              shape: "rectangular",
              width: "100%",
              logo_alignment: "left"
            });
          }
        } catch (err) {
          console.warn("Google Sign-In initialization failed:", err);
        }
      } else {
        // Retry shortly if the script is still loading
        timer = setTimeout(initGoogleSignIn, 500);
      }
    };

    if (activeTab === "google") {
      initGoogleSignIn();
    }

    return () => clearTimeout(timer);
  }, [activeTab, googleClientId]);

  // Decode JWT safely in pure client-side JS
  const handleGoogleCredentialResponse = (response: any) => {
    setIsLoading(true);
    setGoogleError("");
    try {
      const token = response.credential;
      if (!token) {
        throw new Error("No credential token returned");
      }

      // JWT base64 decoding (Header.Payload.Signature)
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      const profile = JSON.parse(jsonPayload);
      const email = profile.email?.toLowerCase();
      const name = profile.name || "Fotógrafo";
      const picture = profile.picture;

      // Verify email whitelist (includes rotgerchristian@gmail.com by default)
      const isAuthorized = authorizedEmails.some(
        (authEmail) => authEmail.toLowerCase().trim() === email
      );

      if (isAuthorized) {
        onLoginSuccess({ email, name, picture });
      } else {
        setGoogleError(
          lang === "es"
            ? `Acceso Denegado: La cuenta ${email} no está registrada como administrador.`
            : `Access Denied: The account ${email} is not registered as an administrator.`
        );
      }
    } catch (err: any) {
      console.error("Google authentication parsing error:", err);
      setGoogleError(
        lang === "es"
          ? "Error al descodificar la sesión de Google. Por favor, intente con la contraseña administrativa."
          : "Error decoding Google session. Please log in using the administrator password."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle standard password submit
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (!password) {
      setPasswordError(
        lang === "es"
          ? "Por favor, introduce tu contraseña."
          : "Please enter your password."
      );
      return;
    }

    // Direct string match of the administrative password (defaulting to "admin")
    if (password === correctPasswordHash) {
      onLoginSuccess({
        email: "admin@portfolio.local",
        name: "Administrador",
      });
    } else {
      setPasswordError(
        lang === "es"
          ? "Contraseña incorrecta. Por favor, inténtalo de nuevo."
          : "Incorrect password. Please try again."
      );
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-8 bg-stone-950 font-sans relative overflow-hidden">
      {/* Visual background atmospheric elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div id="login_card" className="w-full max-w-md bg-stone-900/85 backdrop-blur-xl border border-stone-800 rounded-2xl shadow-2xl overflow-hidden relative z-10 transition-all duration-300">
        
        {/* Banner header visual */}
        <div className="p-6 sm:p-8 border-b border-stone-800/80 text-center relative">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-amber-500 flex items-center justify-center mx-auto mb-4 text-stone-900 font-bold text-lg shadow-lg">
            <KeyRound className="w-6 h-6 text-stone-950" />
          </div>
          <h2 className="text-xl sm:text-2xl font-serif text-white tracking-tight">
            {lang === "es" ? "Acceso Fotógrafo Autorizado" : "Authorized Photographer Access"}
          </h2>
          <p className="text-stone-400 text-xs mt-1.5 font-sans">
            {lang === "es" 
              ? "Inicia sesión para editar tu portafolio, ver feedback o subir imágenes." 
              : "Log in to manage your portfolio, view client reviews, or upload assets."}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-stone-800/50 bg-stone-900/40 p-1">
          <button
            onClick={() => setActiveTab("google")}
            className={`flex-1 py-2.5 text-xs font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === "google"
                ? "bg-stone-800 text-emerald-400 border border-stone-700/60 shadow-inner"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <Chrome className="w-3.5 h-3.5" />
            {lang === "es" ? "CUENTA DE GOOGLE" : "GOOGLE SIGN-IN"}
          </button>
          
          <button
            onClick={() => setActiveTab("password")}
            className={`flex-1 py-2.5 text-xs font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === "password"
                ? "bg-stone-800 text-emerald-400 border border-stone-700/60 shadow-inner"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            {lang === "es" ? "CONTRASEÑA" : "PASSWORD PANEL"}
          </button>
        </div>

        {/* Form Body Areas */}
        <div className="p-6 sm:p-8">
          
          {/* TAB 1: Google login */}
          {activeTab === "google" && (
            <div className="space-y-5 animate-fadeIn">
              <div className="bg-stone-950/60 border border-stone-850 p-4 rounded-xl">
                <p className="text-xs text-stone-300 leading-relaxed font-sans">
                  {lang === "es" ? (
                    <>
                      🔓 Entra directamente usando tu correo verificado de Google. El sistema permitirá el acceso directo a la cuenta:  
                      <span className="block mt-1.5 text-emerald-400 font-mono font-bold text-center bg-stone-900/80 px-2 py-1 rounded border border-stone-800 text-[11px]">
                        {authorizedEmails[0]}
                      </span>
                    </>
                  ) : (
                    <>
                      🔓 Access instantly using your verified Google Gmail account. Whitelisted admin email:
                      <span className="block mt-1.5 text-emerald-400 font-mono font-bold text-center bg-stone-900/80 px-2 py-1 rounded border border-stone-800 text-[11px]">
                        {authorizedEmails[0]}
                      </span>
                    </>
                  )}
                </p>
                
                {/* TIP MUY CLARO DE CONTRASEÑA DE RESPALDO */}
                <div className="mt-3.5 pt-3 border-t border-stone-850/60">
                  <p className="text-[11px] text-amber-400 font-sans leading-relaxed">
                    🌟 <strong>¿Tu cuenta de Google es diferente o estás en Vercel/GitHub?</strong> No te preocupes. Haz clic arriba en la pestaña <strong>CONTRASEÑA</strong> e ingresa usando la clave por defecto <strong>admin</strong>. ¡Entrarás al instante!
                  </p>
                </div>
              </div>

              {googleError && (
                <div className="bg-red-950/40 border border-red-900/50 rounded-xl p-3.5 text-xs text-red-300 flex items-start gap-2.5 font-sans leading-relaxed">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-0.5">La validación falló</span>
                    {googleError}
                  </div>
                </div>
              )}

              {/* Native Google Sign-In Container */}
              <div className="py-2.5 flex justify-center">
                {isLoading ? (
                  <div className="flex items-center gap-2 text-stone-400 text-xs font-mono">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>VERIFICANDO CREDENCIALES DE GOOGLE...</span>
                  </div>
                ) : (
                  <div className="w-full min-h-[44px]">
                    <div id="google-signin-btn" className="w-full" />
                  </div>
                )}
              </div>

              {/* Developer / Vercel explanation */}
              <div className="border-t border-stone-800/60 pt-4.5">
                <h4 className="text-[10px] font-mono uppercase font-bold text-stone-500 tracking-wider mb-1.5">
                  {lang === "es" ? "Instrucciones de Despliegue en Vercel:" : "Vercel / Production Setup Notes:"}
                </h4>
                <p className="text-[10px] text-stone-400 leading-relaxed font-sans">
                  {lang === "es" 
                    ? "Para que el botón de Google funcione en tu Vercel final, puedes configurar tu Client ID obtenido en Google Cloud Console en el panel de seguridad de esta app, o ingresar inmediatamente usando tu Contraseña Administrativa arriba."
                    : "To configure Google Sign-in on your final Vercel domain, register your app in Google Cloud Console, save your client-id in the security panel, or login instantly with the fallback Admin Password."}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Standard Password login */}
          {activeTab === "password" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-5 animate-fadeIn">
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-widest text-stone-400 font-extrabold mb-2 text-left">
                  {lang === "es" ? "Contraseña del Administrador" : "Administrator Password"}
                </label>
                <div id="password_input_container" className="relative rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/50 border border-stone-800 bg-stone-950/60">
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

                {passwordError && (
                  <div className="bg-red-950/40 border border-red-900/50 rounded-xl p-3 mt-3 text-xs text-red-300 flex items-center gap-2 font-sans">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                id="submit_password_btn"
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:focus:opacity-90 active:scale-[0.98] py-3 text-xs font-mono font-bold rounded-xl text-stone-950 transition flex items-center justify-center gap-1.5 shadow-lg tracking-wider cursor-pointer font-extrabold"
              >
                <span>{lang === "es" ? "INGRESAR AL PANEL" : "LOGIN TO DASHBOARD"}</span>
              </button>

              <div className="bg-stone-950/40 border border-stone-850 p-3.5 rounded-xl text-center text-[11px] text-stone-400 font-mono">
                {lang === "es" ? (
                  <>
                    💡 Contraseña por defecto: <span className="text-amber-400 font-bold bg-stone-900 px-2 py-0.5 rounded border border-stone-800">admin</span>
                    <span className="block mt-1 text-[10px] text-stone-500">(Puedes modificarla en cualquier momento dentro del panel)</span>
                  </>
                ) : (
                  <>
                    💡 Default password: <span className="text-amber-400 font-bold bg-stone-900 px-2 py-0.5 rounded border border-stone-800">admin</span>
                    <span className="block mt-1 text-[10px] text-stone-500">(You can edit this any time inside the dashboard settings)</span>
                  </>
                )}
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
