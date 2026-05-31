import React, { useState, useEffect } from "react";
import { Link, Trash2, Plus, Copy, Check, Lock } from "lucide-react";
import { Photo, PortfolioConfig } from "../../types";
import {
  ClientSession,
  fetchClientSessions,
  createClientSession,
  deleteClientSession,
} from "../../utils/supabase";

interface DashboardSessionsProps {
  photos: Photo[];
  config: PortfolioConfig;
}

export default function DashboardSessions({ photos, config }: DashboardSessionsProps) {
  const [sessions, setSessions] = useState<ClientSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [clientName, setClientName] = useState("");
  const [pin, setPin] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [expiresAt, setExpiresAt] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchClientSessions().then(data => {
      setSessions(data);
      setLoading(false);
    });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) {
      setFormError("El PIN debe tener al menos 4 caracteres.");
      return;
    }
    setCreating(true);
    setFormError("");
    const photoIds = selectedPhotos.length > 0 ? selectedPhotos : null;
    const { session, error } = await createClientSession(
      clientName,
      pin,
      photoIds,
      expiresAt || null
    );
    if (error || !session) {
      setFormError(error || "Error al crear sesión.");
      setCreating(false);
      return;
    }
    setSessions(prev => [session, ...prev]);
    setShowForm(false);
    setClientName("");
    setPin("");
    setSelectedPhotos([]);
    setExpiresAt("");
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este enlace de cliente?")) return;
    await deleteClientSession(id);
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const buildLink = (sessionId: string) =>
    `${window.location.origin}${window.location.pathname}?session=${sessionId}`;

  const copyLink = (sessionId: string) => {
    navigator.clipboard.writeText(buildLink(sessionId));
    setCopiedId(sessionId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const togglePhoto = (photoId: string) => {
    setSelectedPhotos(prev =>
      prev.includes(photoId) ? prev.filter(id => id !== photoId) : [...prev, photoId]
    );
  };

  const publishedPhotos = photos.filter(p => p.status !== "draft");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-stone-900 font-semibold text-base flex items-center gap-2">
            <Lock className="w-4 h-4 text-stone-500" /> Sesiones de Cliente con PIN
          </h2>
          <p className="text-stone-500 text-xs mt-0.5">
            Genera links privados con PIN para compartir selecciones específicas de fotos.
          </p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          style={{ backgroundColor: config.brandColor }}
          className="flex items-center gap-2 text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          {showForm ? "Cancelar" : "Nueva Sesión"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-4"
        >
          <h3 className="text-xs font-mono uppercase text-stone-500 tracking-wider font-semibold">
            Nueva sesión protegida
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-mono text-stone-500 mb-1">
                Nombre del Cliente *
              </label>
              <input
                required
                maxLength={80}
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                placeholder="Ej: María García"
                className="w-full text-sm bg-white border border-stone-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-stone-400 text-stone-800"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-mono text-stone-500 mb-1">
                PIN de Acceso * (mín. 4 dígitos)
              </label>
              <input
                required
                type="password"
                minLength={4}
                maxLength={20}
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="••••"
                className="w-full text-sm bg-white border border-stone-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-stone-400 text-stone-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-mono text-stone-500 mb-1">
              Expiración (opcional)
            </label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={e => setExpiresAt(e.target.value)}
              className="text-sm bg-white border border-stone-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-stone-400 text-stone-800"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-mono text-stone-500 mb-2">
              Fotos Incluidas (vacío = todas)
            </label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
              {publishedPhotos.map(photo => {
                const selected = selectedPhotos.includes(photo.id);
                return (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => togglePhoto(photo.id)}
                    style={selected ? { borderColor: config.brandColor, color: config.brandColor, backgroundColor: `${config.brandColor}15` } : {}}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                      selected
                        ? "font-semibold"
                        : "border-stone-200 text-stone-600 hover:border-stone-400 bg-white"
                    }`}
                  >
                    {selected && <Check className="w-3 h-3" />}
                    {photo.title || photo.id.slice(0, 8)}
                  </button>
                );
              })}
              {publishedPhotos.length === 0 && (
                <p className="text-xs text-stone-400 italic">No hay fotos publicadas aún.</p>
              )}
            </div>
            {selectedPhotos.length > 0 && (
              <p className="text-[10px] text-stone-500 mt-1 font-mono">
                {selectedPhotos.length} foto{selectedPhotos.length !== 1 ? "s" : ""} seleccionada{selectedPhotos.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {formError && (
            <p className="text-red-500 text-xs font-mono">{formError}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-stone-200 text-stone-600 text-xs font-semibold rounded-lg hover:bg-stone-100 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={creating}
              style={{ backgroundColor: config.brandColor }}
              className="px-5 py-2 text-white text-xs font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition flex items-center gap-2"
            >
              {creating ? (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Link className="w-3.5 h-3.5" /> Crear Enlace</>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Sessions list */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-stone-400 text-sm">
          Cargando sesiones...
        </div>
      ) : sessions.length === 0 ? (
        <div className="border border-dashed border-stone-300 rounded-2xl py-16 text-center text-stone-400">
          <Lock className="w-10 h-10 mx-auto text-stone-300 mb-3" />
          <p className="font-mono text-xs uppercase tracking-widest">Sin sesiones activas</p>
          <p className="text-xs mt-1">Creá un enlace privado para compartir con un cliente.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map(session => {
            const link = buildLink(session.id);
            const isCopied = copiedId === session.id;
            const isExpired = session.expires_at ? new Date(session.expires_at) < new Date() : false;
            const photoCount = session.photo_ids ? session.photo_ids.length : publishedPhotos.length;

            return (
              <div
                key={session.id}
                className={`bg-white border rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isExpired ? "border-red-200 bg-red-50/30" : "border-stone-200"
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-900 text-sm">{session.client_name}</span>
                    {isExpired && (
                      <span className="text-[9px] bg-red-100 text-red-600 px-2 py-0.5 rounded font-mono font-bold uppercase">
                        Expirado
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-stone-400 font-mono truncate max-w-xs">
                    ID: {session.id} · {photoCount} foto{photoCount !== 1 ? "s" : ""}
                    {session.expires_at && (
                      <> · Expira: {new Date(session.expires_at).toLocaleDateString("es-AR")}</>
                    )}
                  </p>
                  <p className="text-[10px] text-stone-300 font-mono truncate max-w-xs hidden sm:block">
                    {link}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => copyLink(session.id)}
                    className={`flex items-center gap-1.5 text-[10px] font-mono font-bold px-3 py-2 rounded-lg border transition ${
                      isCopied
                        ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                        : "bg-stone-50 border-stone-200 text-stone-600 hover:border-stone-400 hover:text-stone-900"
                    }`}
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {isCopied ? "Copiado" : "Copiar link"}
                  </button>
                  <button
                    onClick={() => handleDelete(session.id)}
                    className="p-2 text-stone-400 hover:text-red-500 border border-stone-200 hover:border-red-200 rounded-lg transition"
                    title="Eliminar sesión"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
