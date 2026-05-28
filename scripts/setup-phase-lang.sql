-- SQL Script para añadir campos bilingües (Español)
-- Inglés será el idioma por defecto (columnas existentes)

ALTER TABLE photos ADD COLUMN IF NOT EXISTS title_es TEXT;
ALTER TABLE photos ADD COLUMN IF NOT EXISTS description_es TEXT;
ALTER TABLE photos ADD COLUMN IF NOT EXISTS "editorialReview_es" TEXT;
ALTER TABLE photos ADD COLUMN IF NOT EXISTS "suggestedSettings_es" TEXT;

-- Opcional: Para migrar los datos actuales (que probablemente están en español o spanglish)
-- Si el cliente quiere que los títulos existentes sean el título español inicial, 
-- puede ejecutar esto manualmente:
-- UPDATE photos SET title_es = title WHERE title_es IS NULL;
