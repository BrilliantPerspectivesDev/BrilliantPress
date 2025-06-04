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