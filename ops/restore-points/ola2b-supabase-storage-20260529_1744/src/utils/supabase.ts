import { createClient } from '@supabase/supabase-js';
import { Photo, PortfolioConfig, ClientReviewSession, PublicComment } from '../types';
import { DEFAULT_CONFIG } from '../defaultData';
import { compressImageToBlob, generateThumbnailBlob } from './image';
import {
  DbPhoto,
  DbPortfolioConfig,
  DbPublicComment,
  DbClientReviewSession,
  DbClientFeedback,
  DbRealtimeCommentPayload,
  PhotoPayload
} from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "[Config] Faltan variables de entorno de Supabase. Definí VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function fetchPhotos(): Promise<Photo[]> {
  const { data, error } = await supabase.from('photos').select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) console.error("Error fetching photos:", error);
  return ((data as DbPhoto[]) || []).map((p) => ({
    ...p,
    sortOrder: p.sort_order ?? undefined,
  }));
}

export async function fetchConfig(): Promise<PortfolioConfig> {
  const { data, error } = await supabase.from('portfolio_config').select('*').limit(1).single();
  if (error) {
    console.error("Error fetching config:", error);
    return DEFAULT_CONFIG;
  }
  const row = data as DbPortfolioConfig;
  const categories = Array.isArray(row.categories) ? row.categories : DEFAULT_CONFIG.categories;
  return { ...row, categories };
}

export async function fetchReviews(): Promise<ClientReviewSession[]> {
  const { data, error } = await supabase.from('client_review_sessions')
    .select('*, client_feedbacks(*)')
    .order('created_at', { ascending: false });
  if (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
  return (data as DbClientReviewSession[]).map((session) => ({
    ...session,
    status: session.status as 'active' | 'archived',
    feedbacks: session.client_feedbacks || []
  }));
}

export async function checkDbConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('photos').select('id').limit(1);
    if (error) return false;
    return true;
  } catch {
    return false;
  }
}

export async function savePhotoToSupabase(photo: Photo) {
  const payload: PhotoPayload = {
    id: photo.id,
    url: photo.url,
    title: photo.title,
    description: photo.description ?? null,
    category: photo.category ?? null,
    date: photo.date,
    camera: photo.camera ?? null,
    lens: photo.lens ?? null,
    settings: photo.settings ?? null,
    editorialReview: photo.editorialReview ?? null,
    suggestedSettings: photo.suggestedSettings ?? null,
    sort_order: photo.sortOrder ?? 0,
    thumbnail_url: photo.thumbnail_url ?? null,
    title_es: photo.title_es ?? null,
    description_es: photo.description_es ?? null,
    editorialReview_es: photo.editorialReview_es ?? null,
    suggestedSettings_es: photo.suggestedSettings_es ?? null,
  };
  return await supabase.from('photos').upsert([payload]);
}

export async function deletePhotoFromSupabase(id: string) {
  return await supabase.from('photos').delete().eq('id', id);
}

const STORAGE_BUCKET = 'portfolio-photos';

export async function uploadPhotoToStorage(
  file: File,
  photoId: string
): Promise<{ url: string; thumbnailUrl: string }> {
  const photoPath = `photos/${photoId}.jpg`;
  const thumbPath = `thumbnails/${photoId}.jpg`;

  const [photoBlob, thumbBlob] = await Promise.all([
    compressImageToBlob(file, 1200),
    generateThumbnailBlob(file)
  ]);

  const [photoUpload, thumbUpload] = await Promise.all([
    supabase.storage.from(STORAGE_BUCKET).upload(photoPath, photoBlob, { upsert: true, contentType: 'image/jpeg' }),
    supabase.storage.from(STORAGE_BUCKET).upload(thumbPath, thumbBlob, { upsert: true, contentType: 'image/jpeg' })
  ]);

  if (photoUpload.error) throw new Error(`Storage upload failed: ${photoUpload.error.message}`);

  const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(photoPath);
  const { data: thumbUrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(thumbPath);

  return {
    url: urlData.publicUrl,
    thumbnailUrl: thumbUpload.error ? urlData.publicUrl : thumbUrlData.publicUrl
  };
}

export async function deletePhotoFromStorage(photoId: string) {
  await supabase.storage.from(STORAGE_BUCKET).remove([
    `photos/${photoId}.jpg`,
    `thumbnails/${photoId}.jpg`
  ]);
}

export async function updateConfigInSupabase(config: PortfolioConfig) {
  const { data: existing } = await supabase.from('portfolio_config').select('id').limit(1).single();
  if (existing) {
    return await supabase.from('portfolio_config').update(config).eq('id', (existing as { id: string }).id);
  } else {
    return await supabase.from('portfolio_config').insert([config]);
  }
}

export async function insertReviewSessionInSupabase(session: ClientReviewSession) {
  const { feedbacks, ...sessionData } = session;
  const { error: sessionError } = await supabase.from('client_review_sessions').insert([sessionData]);
  if (sessionError) return { error: sessionError };

  if (feedbacks && feedbacks.length > 0) {
    const fbData: DbClientFeedback[] = feedbacks.map((f) => ({
      session_id: session.id,
      photoId: f.photoId,
      approved: f.approved,
      comment: f.comment
    }));
    const { error: fbError } = await supabase.from('client_feedbacks').insert(fbData);
    if (fbError) return { error: fbError };
  }
  return { error: null };
}

export async function deleteAllReviewsInSupabase() {
  return await supabase.from('client_review_sessions').delete().neq('id', '0');
}

// --- PUBLIC COMMENTS ---

export async function fetchPublicComments(): Promise<PublicComment[]> {
  const { data, error } = await supabase
    .from('public_comments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching public comments:", error);
    return [];
  }

  return (data as DbPublicComment[]).map((c) => ({
    id: c.id,
    photoId: c.photo_id,
    authorName: c.author_name,
    text: c.comment_text,
    isApproved: c.is_approved,
    createdAt: c.created_at
  }));
}

export async function addPublicComment(comment: Omit<PublicComment, 'id' | 'createdAt'>) {
  return await supabase.from('public_comments').insert([{
    photo_id: comment.photoId,
    author_name: comment.authorName,
    comment_text: comment.text,
    is_approved: comment.isApproved
  }]);
}

export async function approvePublicComment(id: string) {
  return await supabase.from('public_comments').update({ is_approved: true }).eq('id', id);
}

export async function deletePublicComment(id: string) {
  return await supabase.from('public_comments').delete().eq('id', id);
}

export function subscribeToPublicComments(callback: (payload: DbRealtimeCommentPayload) => void) {
  return supabase
    .channel('public-comments-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'public_comments' },
      (payload) => {
        callback(payload as unknown as DbRealtimeCommentPayload);
      }
    )
    .subscribe();
}
