import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Resolve directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Faltan credenciales de Supabase en el archivo .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importData() {
  console.log("🚀 Iniciando importación a Supabase...");
  
  const backupPath = path.resolve(__dirname, '../../respaldo_portafolio_ph_2026-05-28.json');
  if (!fs.existsSync(backupPath)) {
    console.error(`❌ No se encontró el archivo de respaldo en: ${backupPath}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(backupPath, 'utf8');
  const data = JSON.parse(rawData);

  // 1. Import Config
  if (data.config) {
    console.log("📥 Importando configuración...");
    const { error } = await supabase.from('portfolio_config').insert([
      {
        photographerName: data.config.photographerName,
        title: data.config.title,
        bio: data.config.bio,
        email: data.config.email,
        instagram: data.config.instagram,
        twitter: data.config.twitter,
        brandColor: data.config.brandColor,
        categories: data.config.categories || ["Paisajes | Landscapes", "Vida Silvestre | Wildlife", "Urbano | Urban"]
      }
    ]);
    if (error) console.error("❌ Error en config:", error.message);
    else console.log("✅ Configuración importada.");
  }

  // 2. Import Photos
  if (data.photos && data.photos.length > 0) {
    console.log(`📥 Importando ${data.photos.length} fotos...`);
    
    const photosToInsert = data.photos.map((p: any) => ({
      id: p.id,
      url: p.url, 
      title: p.title,
      description: p.description,
      category: p.category,
      date: p.date,
      lens: p.lens,
      camera: p.camera,
      settings: p.settings,
      editorialReview: p.editorialReview,
      suggestedSettings: p.suggestedSettings
    }));

    // Insert in chunks to avoid payload too large issues since we are inserting base64 strings currently
    for (let i = 0; i < photosToInsert.length; i += 2) {
      const chunk = photosToInsert.slice(i, i + 2);
      const { error } = await supabase.from('photos').upsert(chunk);
      if (error) {
        console.error(`❌ Error insertando bloque de fotos (${i} a ${i+2}):`, error.message);
      } else {
        console.log(`✅ Bloque de fotos importado (${i+1} a ${i+chunk.length})...`);
      }
    }
  }

  // 3. Import Reviews (if any)
  if (data.reviews && data.reviews.length > 0) {
    console.log(`📥 Importando ${data.reviews.length} sesiones de review...`);
    for (const review of data.reviews) {
      const { error: sessionError } = await supabase.from('client_review_sessions').upsert([
        {
          id: review.id,
          clientName: review.clientName,
          clientEmail: review.clientEmail,
          companyName: review.companyName,
          generalComment: review.generalComment,
          status: review.status
        }
      ]);

      if (sessionError) {
        console.error(`❌ Error importando sesión ${review.id}:`, sessionError.message);
        continue;
      }

      if (review.feedbacks && review.feedbacks.length > 0) {
        const feedbacksToInsert = review.feedbacks.map((f: any) => ({
          session_id: review.id,
          photoId: f.photoId,
          approved: f.approved,
          comment: f.comment
        }));
        
        const { error: feedbackError } = await supabase.from('client_feedbacks').upsert(feedbacksToInsert);
        if (feedbackError) console.error(`❌ Error importando feedbacks de sesión ${review.id}:`, feedbackError.message);
      }
    }
    console.log("✅ Sesiones de review importadas.");
  }

  console.log("🎉 Importación finalizada con éxito.");
}

importData().catch(console.error);
