-- SQL Script para añadir funcionalidad de Borradores (Drafts)

-- Añadir columna status a la tabla photos. Por defecto todo lo existente es publicado.
ALTER TABLE photos ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';
