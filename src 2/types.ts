export interface Photo {
  id: string;
  url: string;
  title: string;
  description: string;
  category: string;
  date: string;
  lens?: string;
  camera?: string;
  settings?: string; // e.g., "f/1.8, 1/200s, ISO 400"
  editorialReview?: string;
  suggestedSettings?: string;
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
}

