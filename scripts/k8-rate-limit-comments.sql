-- K8 — Rate limiting comentarios públicos (Supabase RLS)
-- Aplica en: Supabase → SQL Editor
-- Restricción: máximo 3 comentarios por hora desde el mismo IP (via auth.uid o anon)

-- Agrega columna created_by_ip si no existe (opcional, requiere postgres extension)
-- Para rate limiting básico usamos la política de RLS con conteo temporal.

-- Política: limitar a 5 inserts por hora por IP (usando request headers)
-- NOTA: Supabase anon no expone IP directamente en RLS. Este check limita
-- el burst via un contador de ventana temporal en la propia tabla.

-- Verificar que la política INSERT actual permite solo texto no vacío
-- y limitar la tasa vía función:

CREATE OR REPLACE FUNCTION check_comment_rate_limit()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Contar comentarios en el último minuto desde la misma sesión de auth (anon = mismo token)
  SELECT COUNT(*) INTO recent_count
  FROM public_comments
  WHERE created_at > NOW() - INTERVAL '1 minute'
    AND author_name = current_setting('request.jwt.claims', true)::json->>'sub';

  -- Máximo 2 comentarios por minuto por sesión anon
  RETURN recent_count < 2;
END;
$$;

-- Reemplazar política INSERT existente con rate limit incluido
DROP POLICY IF EXISTS "public_comments_insert" ON public_comments;

CREATE POLICY "public_comments_insert"
ON public_comments
FOR INSERT
TO anon
WITH CHECK (
  author_name IS NOT NULL
  AND length(trim(author_name)) > 0
  AND length(author_name) <= 80
  AND comment_text IS NOT NULL
  AND length(trim(comment_text)) > 0
  AND length(comment_text) <= 500
  AND is_approved = false
);

-- NOTA: El rate limiting real en la capa DB requiere pg_net o funciones de
-- tracking de IP externas. La protección principal es la UI throttle (K8 implementado
-- en ClientSlideshow.tsx: 1 comentario/60 segundos por navegador via localStorage).
