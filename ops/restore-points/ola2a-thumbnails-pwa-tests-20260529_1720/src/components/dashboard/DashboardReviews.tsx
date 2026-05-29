import React, { useState } from "react";
import { MessageSquare, Trash2, CheckCircle, XCircle, Zap, Image as ImageIcon } from "lucide-react";
import { Photo, PortfolioConfig, PublicComment } from "../../types";
import { approvePublicComment, deletePublicComment, addPublicComment } from "../../utils/supabase";

interface DashboardReviewsProps {
  publicComments: PublicComment[];
  photos: Photo[];
  config: PortfolioConfig;
  onSimulateClientView: () => void;
}

export default function DashboardReviews({
  publicComments,
  photos,
  config,
  onSimulateClientView,
}: DashboardReviewsProps) {
  const [isInjecting, setIsInjecting] = useState(false);

  const pendingComments = publicComments.filter(c => !c.isApproved);
  const approvedComments = publicComments.filter(c => c.isApproved);

  const handleApprove = async (id: string) => {
    await approvePublicComment(id);
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Seguro que deseas eliminar este comentario?")) {
      await deletePublicComment(id);
    }
  };

  const handleInjectTraction = async () => {
    setIsInjecting(true);
    // Simular comentarios positivos realistas pero anónimos (Backdoor)
    const fakeAuthors = ["Anónimo", "Amante del arte", "Visitante de la galería", "Curador Independiente", "Fotógrafo Local", "Coleccionista"];
    const fakeComments = [
      "Qué composición tan increíble. La luz es perfecta.",
      "Me encanta la profundidad de esta captura. Transmite muchísima emoción.",
      "Excelente trabajo, los tonos son muy cinematográficos.",
      "Sin palabras. Una pieza de colección definitivamente.",
      "Me quedé observando esta foto por minutos. Gran técnica.",
      "¡Fabulosa! Ojalá pudiera tenerla impresa en mi sala.",
      "La exposición perfecta. Muy buen ojo para este encuadre.",
      "Simplemente espectacular. Felicitaciones al autor."
    ];

    if (photos.length === 0) {
      alert("Necesitas subir al menos una foto para generar comentarios.");
      setIsInjecting(false);
      return;
    }

    const count = Math.min(3, photos.length);
    for (let i = 0; i < count; i++) {
      const randomPhoto = photos[Math.floor(Math.random() * photos.length)];
      const randomAuthor = fakeAuthors[Math.floor(Math.random() * fakeAuthors.length)];
      const randomCommentText = fakeComments[Math.floor(Math.random() * fakeComments.length)];

      await addPublicComment({
        photoId: randomPhoto.id,
        authorName: randomAuthor,
        text: randomCommentText,
        isApproved: true // Los comentarios inyectados ya nacen aprobados para empujar tracción rápido
      });
      // Esperar medio segundo entre inserciones para orden cronológico ligeramente diferente
      await new Promise(r => setTimeout(r, 500));
    }
    
    setIsInjecting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-stone-50 p-4 border border-stone-200 rounded-xl">
        <div>
          <h2 className="font-sans font-medium text-stone-900">Comentarios & Tracción</h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Modera los comentarios del público o inyecta vistas simuladas para generar prueba social.
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={onSimulateClientView}
            className="px-4 py-2 border border-stone-200 text-stone-600 hover:bg-stone-100 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            Ver Galería
          </button>
          <button
            onClick={handleInjectTraction}
            disabled={isInjecting}
            style={{ backgroundColor: config.brandColor }}
            className="px-4 py-2 text-white hover:opacity-90 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-sm disabled:opacity-50"
          >
            <Zap className={`w-3.5 h-3.5 ${isInjecting ? 'animate-pulse' : ''}`} /> 
            {isInjecting ? "Inyectando..." : "Inyectar Tracción"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* PENDING COMMENTS */}
        <div className="space-y-4">
          <h3 className="font-sans font-semibold text-stone-800 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-500" />
            Pendientes de Aprobación ({pendingComments.length})
          </h3>
          
          {pendingComments.length === 0 && (
            <div className="bg-stone-50 border border-dashed border-stone-200 rounded-xl p-6 text-center text-stone-400">
              <p className="text-sm">No hay comentarios nuevos pendientes.</p>
            </div>
          )}

          <div className="space-y-3">
            {pendingComments.map(comment => {
              const photo = photos.find(p => p.id === comment.photoId);
              return (
                <div key={comment.id} className="bg-white border border-amber-100 shadow-sm rounded-xl p-4 flex gap-4 items-start">
                  {photo ? (
                    <img src={photo.url} alt="thumbnail" className="w-12 h-12 rounded object-cover border border-stone-100 shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded bg-stone-100 flex items-center justify-center shrink-0">
                      <ImageIcon className="w-5 h-5 text-stone-300" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono font-bold text-stone-800 truncate">{comment.authorName}</p>
                    <p className="text-sm text-stone-600 mt-1 italic">"{comment.text}"</p>
                    <p className="text-[10px] text-stone-400 mt-2">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-1 shrink-0">
                    <button 
                      onClick={() => handleApprove(comment.id)}
                      className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition" title="Aprobar"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(comment.id)}
                      className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition" title="Rechazar/Eliminar"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* APPROVED COMMENTS */}
        <div className="space-y-4">
          <h3 className="font-sans font-semibold text-stone-800 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            Comentarios Públicos ({approvedComments.length})
          </h3>

          {approvedComments.length === 0 && (
            <div className="bg-stone-50 border border-dashed border-stone-200 rounded-xl p-6 text-center text-stone-400">
              <p className="text-sm">Aún no tienes comentarios visibles.</p>
            </div>
          )}

          <div className="space-y-3">
            {approvedComments.map(comment => {
              const photo = photos.find(p => p.id === comment.photoId);
              return (
                <div key={comment.id} className="bg-white border border-stone-200 shadow-sm rounded-xl p-4 flex gap-4 items-start opacity-75 hover:opacity-100 transition">
                  {photo ? (
                    <img src={photo.url} alt="thumbnail" className="w-10 h-10 rounded object-cover border border-stone-100 shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-stone-100 flex items-center justify-center shrink-0">
                      <ImageIcon className="w-4 h-4 text-stone-300" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono font-bold text-stone-700 truncate">{comment.authorName}</p>
                    <p className="text-sm text-stone-500 mt-0.5 line-clamp-2">"{comment.text}"</p>
                  </div>
                  
                  <button 
                    onClick={() => handleDelete(comment.id)}
                    className="p-1.5 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition" title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
