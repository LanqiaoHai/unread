export interface Book {
  id: string;
  title: string;
  authors: string[];
  thumbnail?: string;
  description?: string;
  publishedDate?: string;
}

export interface AbandonedBook extends Book {
  abandonedAt: number; // timestamp
  progress: string; // e.g. "P.150" or "30%"
  reason: string;
  score: number; // -5 to 5, excluding 0
  isPublic?: boolean;
  likesCount?: number;
  commentsCount?: number;
  isLiked?: boolean;
  username?: string; // Cache the uploader's name
}

