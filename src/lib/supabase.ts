import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing required Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
);

export interface EventRow {
  id: string;
  title: string;
  description: string;
  date: string;
  sport: string;
  distance_tags: string[];
  category_tags: string[];
  price: number;
  city: string;
  state: string;
  image_url: string;
  interested_count: number;
  organizer_id: string | null;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string;
  contact_info: string;
  website_url: string;
  created_at: string;
}

export interface CityRow {
  id: string;
  name: string;
  event_count: number;
  image_url: string;
  created_at: string;
}

export interface ProfileRow {
  id: string;
  role: 'user' | 'organizer' | 'admin';
  display_name: string;
  phone: string;
  location: string;
  privacy_accepted: boolean;
  created_at: string;
}

export interface ForumPostRow {
  id: string;
  author_id: string;
  content: string;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

export interface ForumCommentRow {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
}

export interface ForumLikeRow {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}
