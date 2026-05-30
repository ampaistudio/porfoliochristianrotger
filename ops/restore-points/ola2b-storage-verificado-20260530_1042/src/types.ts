export interface Photo {
  id: string;
  url: string;
  title: string;
  description?: string;
  category?: string;
  date: string;
  camera?: string;
  lens?: string;
  settings?: string;
  editorialReview?: string;
  suggestedSettings?: string;
  
  // Spanish translations
  title_es?: string;
  description_es?: string;
  editorialReview_es?: string;
  suggestedSettings_es?: string;

  sortOrder?: number;
  status?: 'published' | 'draft';
  thumbnail_url?: string;
}
export interface PublicComment {
  id?: string;
  photoId: string;
  authorName: string;
  text: string;
  isApproved: boolean;
  createdAt: string;
}

export interface ClientFeedback {
  photoId: string;
  approved: boolean;
  comment: string;
}

export interface ClientReviewSession {
  id: string;
  clientName: string;
  clientEmail: string;
  companyName?: string;
  createdAt: string;
  feedbacks: ClientFeedback[];
  generalComment?: string;
  status: "active" | "archived";
}

export interface PortfolioConfig {
  photographerName: string;
  title: string;
  bio: string;
  email: string;
  instagram: string;
  twitter: string;
  brandColor: string; // Tailwind accent or hex hex color code
  categories?: string[];
}

