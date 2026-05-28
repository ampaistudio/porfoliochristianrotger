import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Faltan credenciales de Supabase en el archivo .env");
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co", 
  supabaseAnonKey || "placeholder_key"
);

import { Photo, PortfolioConfig, ClientReviewSession, PublicComment } from '../types';
import { DEFAULT_CONFIG } from '../defaultData';

export async function fetchPhotos(): Promise<Photo[]> {
  const { data, error } = await supabase.from('photos').select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) console.error("Error fetching photos:", error);
  return (data || []).map((p: any) => ({
    ...p,
    sortOrder: p.sort_order,
    editorialReview: p.editorialReview,
    suggestedSettings: p.suggestedSettings,
    title_es: p.title_es,
    description_es: p.description_es,
    editorialReview_es: p.editorialReview_es,
    suggestedSettings_es: p.suggestedSettings_es
  }));
}

export async function fetchConfig(): Promise<PortfolioConfig> {
  const { data, error } = await supabase.from('portfolio_config').select('*').limit(1).single();
  if (error) {
    console.error("Error fetching config:", error);
    return DEFAULT_CONFIG;
  }
  
  if (data) {
    // Si la base de datos ya tiene un arreglo de categorías (incluso si lo vaciaron), respetarlo.
    const categories = Array.isArray(data.categories) ? data.categories : DEFAULT_CONFIG.categories;
    return { ...data, categories };
  }
  
  return DEFAULT_CONFIG;
}

export async function fetchReviews(): Promise<ClientReviewSession[]> {
  const { data, error } = await supabase.from('client_review_sessions')
    .select('*, client_feedbacks(*)')
    .order('created_at', { ascending: false });
  if (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
  return data.map((session: any) => ({
    ...session,
    feedbacks: session.client_feedbacks || []
  }));
}

export async function checkDbConnection(): Promise<boolean> {
  try {
    // Ping a lightweight table just to see if we can read 1 row
    const { error } = await supabase.from('photos').select('id').limit(1);
    if (error) return false;
    return true;
  } catch {
    return false;
  }
}

export async function savePhotoToSupabase(photo: Photo) {
  const payload = {
    ...photo,
    sort_order: photo.sortOrder || 0,
    title_es: photo.title_es,
    description_es: photo.description_es,
    editorialReview_es: photo.editorialReview_es,
    suggestedSettings_es: photo.suggestedSettings_es
  };
  // @ts-ignore
  delete payload.sortOrder;
  // @ts-ignore
  delete payload.status;
  return await supabase.from('photos').upsert([payload]);
}

export async function deletePhotoFromSupabase(id: string) {
  return await supabase.from('photos').delete().eq('id', id);
}

export async function updateConfigInSupabase(config: PortfolioConfig) {
  const { data: existing } = await supabase.from('portfolio_config').select('id').limit(1).single();
  if (existing) {
    return await supabase.from('portfolio_config').update(config).eq('id', existing.id);
  } else {
    return await supabase.from('portfolio_config').insert([config]);
  }
}

export async function insertReviewSessionInSupabase(session: ClientReviewSession) {
  const { feedbacks, ...sessionData } = session;
  const { error: sessionError } = await supabase.from('client_review_sessions').insert([sessionData]);
  if (sessionError) return { error: sessionError };

  if (feedbacks && feedbacks.length > 0) {
    const fbData = feedbacks.map((f: any) => ({
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

// --- FASE C: PUBLIC COMMENTS (SOCIAL PROOF) ---

export async function fetchPublicComments(): Promise<PublicComment[]> {
  const { data, error } = await supabase
    .from('public_comments')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error("Error fetching public comments:", error);
    return [];
  }
  
  return data.map((c: any) => ({
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

export function subscribeToPublicComments(callback: (payload: any) => void) {
  return supabase
    .channel('public-comments-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'public_comments' },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();
}
