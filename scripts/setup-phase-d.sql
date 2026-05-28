-- SQL Script para la Fase D: Analíticas y Ordenamiento

-- 1. Añadir campo sort_order a la tabla photos para guardar el orden manual (Drag & Drop)
ALTER TABLE photos ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
