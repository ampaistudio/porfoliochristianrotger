-- SQL Script para la Fase C: Comentarios Públicos Moderados

-- 1. Crear la tabla de comentarios públicos
CREATE TABLE IF NOT EXISTS public_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photo_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    comment_text TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS (Row Level Security)
ALTER TABLE public_comments ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Seguridad (RLS)
-- Los clientes (anónimos) pueden INSERTAR nuevos comentarios
CREATE POLICY "Allow public inserts for comments" 
ON public_comments FOR INSERT 
TO public 
WITH CHECK (true);

-- Como no usamos Supabase Auth, permitimos lectura pública de todos los comentarios.
-- El frontend se encarga de filtrar cuáles mostrar al cliente y cuáles al administrador.
CREATE POLICY "Allow public read all comments" 
ON public_comments FOR SELECT 
TO public 
USING (true);

-- Permitimos UPDATE y DELETE públicos para que el panel de administración funcione sin Auth token
CREATE POLICY "Allow public update comments" 
ON public_comments FOR UPDATE 
TO public 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow public delete comments" 
ON public_comments FOR DELETE 
TO public 
USING (true);

-- 4. Habilitar Supabase Realtime para esta tabla
ALTER PUBLICATION supabase_realtime ADD TABLE public_comments;
