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

-- Todos pueden LEER, pero idealmente solo leen los aprobados (o el cliente JS filtra, pero mejor en DB si se quiere)
CREATE POLICY "Allow public read for approved comments" 
ON public_comments FOR SELECT 
TO public 
USING (is_approved = true);

-- Los administradores (autenticados) pueden LEER todos, ACTUALIZAR y ELIMINAR
CREATE POLICY "Allow auth read all comments" 
ON public_comments FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow auth update comments" 
ON public_comments FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow auth delete comments" 
ON public_comments FOR DELETE 
TO authenticated 
USING (true);

-- 4. Habilitar Supabase Realtime para esta tabla
ALTER PUBLICATION supabase_realtime ADD TABLE public_comments;
