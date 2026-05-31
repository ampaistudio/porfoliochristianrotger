import React, { useState } from "react";
import { X, Send, Mail } from "lucide-react";
import { PortfolioConfig } from "../../types";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: PortfolioConfig;
  lang: "es" | "en";
  brandColor: string;
}

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_CONTACT;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const emailjsConfigured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

async function sendViaEmailJS(params: Record<string, string>): Promise<void> {
  const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: SERVICE_ID,
      template_id: TEMPLATE_ID,
      user_id: PUBLIC_KEY,
      template_params: params,
    }),
  });
  if (!res.ok) throw new Error("EmailJS error");
}

export default function ContactModal({ isOpen, onClose, config, lang, brandColor }: ContactModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      if (emailjsConfigured) {
        await sendViaEmailJS({
          from_name: name,
          from_email: email,
          message,
          to_email: config.email || "",
          photographer_name: config.photographerName,
        });
        setStatus("ok");
      } else {
        // Fallback: open mailto
        const subject = encodeURIComponent(lang === "es" ? `Consulta de ${name}` : `Inquiry from ${name}`);
        const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
        window.open(`mailto:${config.email}?subject=${subject}&body=${body}`);
        setStatus("ok");
      }
    } catch {
      setStatus("error");
    }
  };

  const t = (es: string, en: string) => lang === "es" ? es : en;

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#0f0f11] border border-stone-800 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-800">
          <div>
            <h2 className="text-white font-serif text-lg font-bold">
              {t("Contratar / Contactar", "Hire / Contact")}
            </h2>
            <p className="text-stone-400 text-xs mt-0.5">{config.photographerName}</p>
          </div>
          <button onClick={onClose} className="text-stone-500 hover:text-white transition p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {status === "ok" ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                <Send className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-white font-semibold">
                {t("¡Mensaje enviado!", "Message sent!")}
              </p>
              <p className="text-stone-400 text-sm">
                {t("Me pondré en contacto pronto.", "I'll be in touch soon.")}
              </p>
              <button
                onClick={onClose}
                style={{ backgroundColor: brandColor }}
                className="mt-2 px-6 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition"
              >
                {t("Cerrar", "Close")}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-mono text-stone-400 mb-1">
                  {t("Nombre *", "Name *")}
                </label>
                <input
                  type="text"
                  required
                  maxLength={80}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2.5 text-white text-sm outline-none focus:border-stone-500 placeholder:text-stone-600 transition"
                  placeholder={t("Tu nombre completo", "Your full name")}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-mono text-stone-400 mb-1">
                  {t("Email *", "Email *")}
                </label>
                <input
                  type="email"
                  required
                  maxLength={120}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2.5 text-white text-sm outline-none focus:border-stone-500 placeholder:text-stone-600 transition"
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-mono text-stone-400 mb-1">
                  {t("Mensaje *", "Message *")}
                </label>
                <textarea
                  required
                  maxLength={1000}
                  rows={4}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2.5 text-white text-sm outline-none focus:border-stone-500 placeholder:text-stone-600 transition resize-none"
                  placeholder={t("Describe tu proyecto o consulta...", "Describe your project or inquiry...")}
                />
              </div>
              {status === "error" && (
                <p className="text-red-400 text-xs font-mono">
                  {t("Error al enviar. Intentá de nuevo.", "Send error. Please try again.")}
                </p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border border-stone-700 text-stone-400 hover:text-white text-sm py-2.5 rounded-lg transition"
                >
                  {t("Cancelar", "Cancel")}
                </button>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  style={{ backgroundColor: brandColor }}
                  className="flex-1 text-white text-sm font-semibold py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  {status === "sending" ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><Mail className="w-4 h-4" /> {t("Enviar", "Send")}</>
                  )}
                </button>
              </div>
              {!emailjsConfigured && (
                <p className="text-stone-600 text-[10px] font-mono text-center">
                  {t("Vía cliente de correo local", "Via local mail client")}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
