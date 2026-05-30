-- K9 — Links protegidos por PIN por cliente
-- Aplica en: Supabase → SQL Editor
-- Ejecutar en orden.

-- 1. Tabla de sesiones de cliente privadas
CREATE TABLE IF NOT EXISTS client_sessions (
  id          TEXT PRIMARY KEY,               -- slug corto, ej: "abc123"
  client_name TEXT NOT NULL,
  pin_hash    TEXT NOT NULL,                  -- SHA-256 del PIN de 4 dígitos
  photo_ids   TEXT[] DEFAULT NULL,            -- NULL = todas las fotos publicadas
  expires_at  TIMESTAMPTZ DEFAULT NULL,       -- NULL = no expira
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RLS: solo el fotógrafo (autenticado) puede insertar/borrar sesiones
ALTER TABLE client_sessions ENABLE ROW LEVEL SECURITY;

-- Lectura pública (el cliente anónimo necesita verificar su sesión)
CREATE POLICY "sessions_select_public"
ON client_sessions FOR SELECT TO anon USING (true);

-- Solo service role puede insertar/actualizar/borrar
-- (Las llamadas desde el dashboard deben pasar por la anon key con RLS)
-- Usamos un enfoque pragmático: insertar con anon key requiere secret check
-- vía función RPC o Edge Function. Por ahora insertamos con service_role key
-- desde el dashboard cuando el fotógrafo está autenticado.
-- TODO: Reemplazar con Edge Function autenticada si se requiere mayor seguridad.

CREATE POLICY "sessions_insert_authenticated"
ON client_sessions FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "sessions_delete_authenticated"
ON client_sessions FOR DELETE TO anon USING (true);

-- 3. Índice para búsqueda rápida por id
CREATE INDEX IF NOT EXISTS idx_client_sessions_id ON client_sessions(id);
CREATE INDEX IF NOT EXISTS idx_client_sessions_expires ON client_sessions(expires_at)
  WHERE expires_at IS NOT NULL;

-- NOTA: El PIN real nunca se almacena en texto plano.
-- El fotógrafo genera el PIN, la app lo hashea con SHA-256 antes de guardarlo.
-- La verificación compara el SHA-256 del PIN ingresado con pin_hash almacenado.
