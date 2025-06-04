export interface TeamMember {
  id: string;
  name: string;
  bio: string;
  photoUrl: string;
  connectEmail?: string;
  bookLinks: BookLink[];
  socialLinks: SocialLink[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BookLink {
  title: string;
  url: string;
  description?: string;
  coverImageUrl?: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  username?: string;
}

export interface AdminUser {
  uid: string;
  email: string;
  role: 'admin' | 'editor';
}

export interface PressRelease {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  excerpt: string;
  publishDate: Date;
  author?: string;
  category?: string;
  tags?: string[];
  featuredImageUrl?: string;
  attachments?: PressReleaseAttachment[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PressReleaseAttachment {
  name: string;
  url: string;
  type: 'pdf' | 'image' | 'document' | 'other';
  size?: number;
} 