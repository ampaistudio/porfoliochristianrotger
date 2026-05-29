import { useState, useEffect } from "react";
import { Photo, PortfolioConfig, PublicComment } from "../types";
import { DEFAULT_CONFIG, DEFAULT_PHOTOS } from "../defaultData";
import {
  fetchPhotos,
  fetchConfig,
  fetchPublicComments,
  updateConfigInSupabase,
  subscribeToPublicComments
} from "../utils/supabase";
import { DbRealtimeCommentPayload } from "../types/database";

export function usePortfolioData(showToast: (msg: string, duration?: number) => void) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [config, setConfig] = useState<PortfolioConfig>(DEFAULT_CONFIG);
  const [publicComments, setPublicComments] = useState<PublicComment[]>([]);
  const [isDbLoaded, setIsDbLoaded] = useState(false);

  useEffect(() => {
    async function initDB() {
      try {
        const [dbPhotos, dbConfig, dbComments] = await Promise.all([
          fetchPhotos(),
          fetchConfig(),
          fetchPublicComments()
        ]);

        setPhotos(dbPhotos && dbPhotos.length > 0 ? dbPhotos : DEFAULT_PHOTOS);
        setConfig(dbConfig);
        setPublicComments(dbComments);

        subscribeToPublicComments((payload: DbRealtimeCommentPayload) => {
          if (payload.eventType === "INSERT") {
            setPublicComments(prev => [{
              id: payload.new.id,
              photoId: payload.new.photo_id,
              authorName: payload.new.author_name,
              text: payload.new.comment_text,
              isApproved: payload.new.is_approved,
              createdAt: payload.new.created_at
            }, ...prev]);
            showToast("🔔 ¡Nuevo comentario recibido en vivo!", 4500);
          } else if (payload.eventType === "UPDATE") {
            setPublicComments(prev =>
              prev.map(c => c.id === payload.new.id ? { ...c, isApproved: payload.new.is_approved } : c)
            );
          } else if (payload.eventType === "DELETE") {
            setPublicComments(prev => prev.filter(c => c.id !== payload.old.id));
          }
        });
      } catch (error) {
        console.error("Failed to fetch from Supabase:", error);
      } finally {
        setIsDbLoaded(true);
      }
    }
    initDB();
  }, []);

  const handlePhotosUpdate = (updatedPhotos: Photo[]) => setPhotos(updatedPhotos);

  const handleConfigUpdate = async (updatedConfig: PortfolioConfig) => {
    setConfig(updatedConfig);
    await updateConfigInSupabase(updatedConfig);
  };

  const handleImportAllData = (importedPhotos: Photo[], importedConfig: PortfolioConfig) => {
    setPhotos(importedPhotos);
    setConfig(importedConfig);
    showToast("🔄 Datos locales actualizados. Para sincronizar a Supabase usá el script de migración.", 4500);
  };

  return {
    photos,
    config,
    publicComments,
    isDbLoaded,
    handlePhotosUpdate,
    handleConfigUpdate,
    handleImportAllData,
  };
}
