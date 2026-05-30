/**
 * K7 — Migración fotos base64 → Supabase Storage
 *
 * Uso:
 *   npx tsx scripts/migrate-base64-to-storage.ts
 *
 * Qué hace:
 *   1. Lee todas las fotos de la tabla `photos` donde url empieza con "data:"
 *   2. Convierte la base64 a Blob WebP comprimido
 *   3. Sube foto y thumbnail al bucket `portfolio-photos`
 *   4. Actualiza la fila con las nuevas URLs públicas de Supabase Storage
 *   5. Imprime resumen de migración
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const BUCKET = 'portfolio-photos';
const MAX_WIDTH_PHOTO = 1200;
const MAX_WIDTH_THUMB = 400;
const WEBP_QUALITY = 0.82;

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY en .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ——— Helpers ————————————————————————————————————————

function base64ToBuffer(dataUrl: string): { buffer: Buffer; mime: string } {
  const [header, data] = dataUrl.split(',');
  const mime = header.match(/data:([^;]+)/)?.[1] ?? 'image/jpeg';
  return { buffer: Buffer.from(data, 'base64'), mime };
}

async function resizeToWebP(
  inputBuffer: Buffer,
  maxWidth: number,
): Promise<Buffer> {
  // Node.js doesn't have Canvas natively — use sharp if available, otherwise
  // upload the original buffer as-is (no resize). Sharp is an optional dep.
  try {
    const loader = new Function('m', 'return import(m)');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sharpMod: any = await loader('sharp').catch(() => null);
    const sharp = sharpMod?.default ?? sharpMod;
    if (!sharp) throw new Error('sharp not installed');
    return await sharp(inputBuffer)
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality: Math.round(WEBP_QUALITY * 100) })
      .toBuffer() as Buffer;
  } catch {
    return inputBuffer;
  }
}

async function uploadBuffer(
  photoId: string,
  path: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { upsert: true, contentType });
  if (error) throw new Error(`Storage upload error (${path}): ${error.message}`);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// ——— Main ————————————————————————————————————————————

async function migrate() {
  console.log('🔍 Buscando fotos con URL base64 en Supabase...\n');

  const { data: photos, error } = await supabase
    .from('photos')
    .select('id, url, thumbnail_url, title')
    .or('url.like.data:%,thumbnail_url.like.data:%');

  if (error) {
    console.error('❌ Error leyendo fotos:', error.message);
    process.exit(1);
  }

  if (!photos || photos.length === 0) {
    console.log('✅ No hay fotos con base64. Migración no necesaria.');
    return;
  }

  console.log(`📸 Encontradas ${photos.length} fotos para migrar.\n`);

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const photo of photos) {
    const id = photo.id as string;
    const title = (photo.title as string) || id;
    process.stdout.write(`  → [${title.substring(0, 40)}] `);

    const updates: Record<string, string> = {};

    try {
      // Migrate main URL
      if (typeof photo.url === 'string' && photo.url.startsWith('data:')) {
        const { buffer, mime } = base64ToBuffer(photo.url);
        const webpBuffer = await resizeToWebP(buffer, MAX_WIDTH_PHOTO);
        const isWebP = webpBuffer !== buffer;
        const ext = isWebP ? 'webp' : mime.split('/')[1] ?? 'jpg';
        const url = await uploadBuffer(
          id,
          `photos/${id}.${ext}`,
          webpBuffer,
          isWebP ? 'image/webp' : mime,
        );
        updates.url = url;
      }

      // Migrate thumbnail URL
      if (
        typeof photo.thumbnail_url === 'string' &&
        photo.thumbnail_url.startsWith('data:')
      ) {
        const { buffer, mime } = base64ToBuffer(photo.thumbnail_url);
        const webpBuffer = await resizeToWebP(buffer, MAX_WIDTH_THUMB);
        const isWebP = webpBuffer !== buffer;
        const ext = isWebP ? 'webp' : mime.split('/')[1] ?? 'jpg';
        const thumbUrl = await uploadBuffer(
          id,
          `thumbnails/${id}.${ext}`,
          webpBuffer,
          isWebP ? 'image/webp' : mime,
        );
        updates.thumbnail_url = thumbUrl;
      }

      if (Object.keys(updates).length > 0) {
        const { error: updateErr } = await supabase
          .from('photos')
          .update(updates)
          .eq('id', id);
        if (updateErr) throw new Error(`DB update: ${updateErr.message}`);
        console.log(`✅ migrada`);
        migrated++;
      } else {
        console.log(`⏭  sin cambios`);
        skipped++;
      }
    } catch (err) {
      console.log(`❌ error: ${(err as Error).message}`);
      failed++;
    }
  }

  console.log(`\n📊 Resumen:`);
  console.log(`   ✅ Migradas: ${migrated}`);
  console.log(`   ⏭  Sin cambios: ${skipped}`);
  console.log(`   ❌ Fallidas: ${failed}`);

  if (failed > 0) {
    console.log('\n⚠️  Algunas fotos fallaron. Revisá los errores y volvé a correr el script.');
  } else {
    console.log('\n🎉 Migración completada sin errores.');
  }
}

migrate().catch((err) => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
});
