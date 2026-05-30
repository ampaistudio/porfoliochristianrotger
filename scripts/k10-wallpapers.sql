-- K10 — Sección Wallpapers gratuitos descargables
-- Aplica en: Supabase → SQL Editor

-- Agregar columna is_wallpaper a la tabla photos
ALTER TABLE photos
  ADD COLUMN IF NOT EXISTS is_wallpaper BOOLEAN DEFAULT FALSE;

-- Índice para filtrar wallpapers rápido
CREATE INDEX IF NOT EXISTS idx_photos_wallpaper
  ON photos(is_wallpaper)
  WHERE is_wallpaper = TRUE;

-- NOTA: Marcar fotos como wallpaper desde el panel admin
-- activa el botón de descarga gratuita en la vista pública cliente.
