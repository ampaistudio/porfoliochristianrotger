export interface DbPhoto {
  id: string;
  url: string;
  title: string;
  description: string | null;
  category: string | null;
  date: string | null;
  lens: string | null;
  camera: string | null;
  settings: string | null;
  editorialReview: string | null;
  suggestedSettings: string | null;
  created_at: string | null;
  sort_order: number | null;
  thumbnail_url: string | null;
  title_es: string | null;
  description_es: string | null;
  editorialReview_es: string | null;
  suggestedSettings_es: string | null;
}

export interface DbPortfolioConfig {
  id: string;
  photographerName: string;
  title: string;
  bio: string;
  email: string;
  instagram: string;
  twitter: string;
  brandColor: string;
  categories: string[] | null;
}

export interface DbPublicComment {
  id: string;
  photo_id: string;
  author_name: string;
  comment_text: string;
  is_approved: boolean;
  created_at: string;
}

export interface DbClientReviewSession {
  id: string;
  clientName: string;
  clientEmail: string;
  companyName: string | null;
  createdAt: string;
  status: string;
  client_feedbacks?: DbClientFeedback[];
}

export interface DbClientFeedback {
  id?: string;
  session_id: string;
  photoId: string;
  approved: boolean;
  comment: string;
}

export interface DbRealtimeCommentPayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: DbPublicComment;
  old: Partial<DbPublicComment>;
}

export interface PhotoPayload {
  id: string;
  url: string;
  title: string;
  description?: string | null;
  category?: string | null;
  date: string;
  camera?: string | null;
  lens?: string | null;
  settings?: string | null;
  editorialReview?: string | null;
  suggestedSettings?: string | null;
  sort_order: number;
  thumbnail_url?: string | null;
  title_es?: string | null;
  description_es?: string | null;
  editorialReview_es?: string | null;
  suggestedSettings_es?: string | null;
}
