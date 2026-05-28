import React from "react";
import { MessageSquare, Trash2, FileText } from "lucide-react";
import { Photo, PortfolioConfig, ClientReviewSession } from "../../types";

interface DashboardReviewsProps {
  reviews: ClientReviewSession[];
  photos: Photo[];
  config: PortfolioConfig;
  onClearReviews: () => void;
  onSimulateClientView: () => void;
}

export default function DashboardReviews({
  reviews,
  photos,
  config,
  onClearReviews,
  onSimulateClientView,
}: DashboardReviewsProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-stone-50 p-4 border border-stone-200 rounded-xl">
        <div>
          <h2 className="font-sans font-medium text-stone-900">Feedback de tus Clientes</h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Revisa las fotos aprobadas, rechazadas y las anotaciones directas que los clientes han enviado.
          </p>
        </div>
        
        {reviews.length > 0 && (
          <button
            onClick={onClearReviews}
            className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Limpiar Historial
          </button>
        )}
      </div>

      <div className="space-y-5">
        {reviews.map((session) => {
          const approvedPhotos = session.feedbacks.filter(f => f.approved);
          const dateFormatted = new Date(session.createdAt).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          });

          return (
            <div key={session.id} className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              {/* Header card meta */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-stone-150 pb-4">
                <div>
                  <h4 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                    👤 {session.clientName}{" "}
                    {session.companyName && (
                      <span className="text-xs text-stone-500 font-normal">
                        ({session.companyName})
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">{session.clientEmail} • {dateFormatted}</p>
                </div>
                <div className="flex items-center gap-4 bg-stone-50 px-3 py-2 rounded-xl border border-stone-150 shrink-0 self-stretch sm:self-auto justify-between sm:justify-start">
                  <span className="text-xs text-stone-500">Aceptación:</span>
                  <span className="text-sm font-bold font-mono text-stone-800">
                    {approvedPhotos.length} / {session.feedbacks.length} Aprobadas
                  </span>
                </div>
              </div>

              {/* General comment */}
              {session.generalComment && (
                <div className="bg-stone-50 p-4 border border-stone-150 rounded-xl italic">
                  <p className="text-xs font-mono font-bold uppercase tracking-wider text-stone-400 mb-1 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-stone-500" /> Nota General del Cliente
                  </p>
                  <p className="text-sm text-stone-700 leading-relaxed font-sans">
                    "{session.generalComment}"
                  </p>
                </div>
              )}

              {/* Detail list per-photo review and feedback cards */}
              <div>
                <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-400 mb-3 block">
                  Desglose por Disparo
                </h5>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {session.feedbacks.map((f) => {
                    const originalPhoto = photos.find(p => p.id === f.photoId);
                    if (!originalPhoto) return null;

                    return (
                      <div key={f.photoId} className="flex gap-3 bg-stone-50/50 p-3 rounded-lg border border-stone-200/65">
                        <img
                          src={originalPhoto.url}
                          alt={originalPhoto.title}
                          className="w-16 h-16 object-cover rounded-md shrink-0 border border-stone-200"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start gap-2">
                            <h6 className="text-xs font-semibold text-stone-900 truncate" title={originalPhoto.title}>
                              {originalPhoto.title}
                            </h6>
                            <span className={`text-[9.5px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                              f.approved 
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-150" 
                                : "bg-red-50 text-red-700 border border-red-150"
                            }`}>
                              {f.approved ? "Aprobada" : "Descartada"}
                            </span>
                          </div>
                          <p className="text-xs text-stone-600 leading-relaxed italic line-clamp-3">
                            {f.comment ? `"${f.comment}"` : "Sin comentarios individuales de edición."}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {reviews.length === 0 && (
          <div className="bg-stone-50 rounded-2xl py-12 px-4 border border-dashed border-stone-300 text-center text-stone-500">
            <FileText className="w-10 h-10 mx-auto text-stone-300 mb-2" />
            <p className="font-medium text-stone-800">No hay feedback de clientes registrado aún</p>
            <p className="text-xs mt-1">Comparte tu portafolio presionando "Copiar Enlace de Cliente" en la cabecera.</p>
            <button
              onClick={onSimulateClientView}
              style={{ backgroundColor: config.brandColor }}
              className="mt-4 text-white text-xs px-4 py-2 rounded-lg font-medium cursor-pointer"
            >
              Simular Comentarios de Cliente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
