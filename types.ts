export type Language = 'hi' | 'en';

export type UserRole = 'admin' | 'reporter' | 'user';

export type UserStatus = 'pending' | 'active' | 'rejected';

export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  password?: string;
  // New permissions
  isBlocked?: boolean; // Locks access completely
  canPost?: boolean;   // Permission to create/upload news
}

export type NewsStatus = 'pending' | 'approved' | 'rejected' | 'draft';

export interface NewsItem {
  id: string;
  title: string;
  subHeadline?: string;
  content: string;
  image: string;
  additionalImages?: string[];
  category: string;
  location?: string;
  tags?: string[];
  language: Language;
  authorId: string;
  authorName: string;
  status: NewsStatus;
  createdAt: string;
  views: number;
}

export interface Promotion {
  id: string;
  imageUrl: string;
  linkUrl: string;
  active: boolean;
}

export interface SiteConfig {
  siteName: string;
  logoUrl: string;
  promotions: Promotion[];
}

export interface Category {
  id: string;
  labelEn: string;
  labelHi: string;
}

export interface Translation {
  [key: string]: {
    en: string;
    hi: string;
  }
}