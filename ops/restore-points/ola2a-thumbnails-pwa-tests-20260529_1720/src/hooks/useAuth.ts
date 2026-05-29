import { useState } from "react";

type ViewMode = "photographer" | "client";

export function useAuth(showToast: (msg: string, duration?: number) => void) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem("admin_authenticated") === "true";
    } catch {
      return false;
    }
  });

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "client") return "client";
    if (params.get("view") === "photographer" || params.get("view") === "admin") return "photographer";
    try {
      if (sessionStorage.getItem("admin_authenticated") === "true") return "photographer";
    } catch {}
    return "client";
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("dashboard_theme") !== "light";
  });

  const handleLoginSuccess = (userProfile?: { email: string; name: string; picture?: string }) => {
    setIsAuthenticated(true);
    sessionStorage.setItem("admin_authenticated", "true");
    showToast(
      userProfile && userProfile.email !== "admin@portfolio.local"
        ? `🔑 ¡Sesión iniciada como ${userProfile.name}! (${userProfile.email})`
        : "🔑 ¡Sesión de administrador iniciada correctamente!",
      4500
    );
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("admin_authenticated");
    showToast("🚪 ¡Sesión cerrada correctamente!");
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    const newUrl = new URL(window.location.href);
    if (mode === "client") {
      newUrl.searchParams.set("view", "client");
    } else {
      newUrl.searchParams.delete("view");
    }
    window.history.pushState({}, "", newUrl.toString());
    showToast(`Cambiado a vista de ${mode === "client" ? "Cliente" : "Fotógrafo (Admin)"}`);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem("dashboard_theme", next ? "dark" : "light");
      return next;
    });
  };

  return {
    isAuthenticated,
    viewMode,
    isDarkMode,
    handleLoginSuccess,
    handleLogout,
    handleViewModeChange,
    toggleDarkMode,
  };
}
