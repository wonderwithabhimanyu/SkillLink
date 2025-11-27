import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  campus_id?: string;
  branch?: string;
  year?: number;
  course?: string;
  gender?: string;
  languages?: string[];
  bio?: string;
  learning_style?: string;
  skill_coins: number;
  total_sessions_taught: number;
  total_sessions_learned: number;
  rating: number;
  verified_teacher: boolean;
  skill_dna_profile: SkillDNAProfile;
  preferences: UserPreferences;
  streak_days: number;
  last_activity_date?: string;
  premium_tier: 'free' | 'pro' | 'enterprise';
  created_at: string;
  updated_at: string;
}

export interface SkillDNAProfile {
  technical_aptitude?: number;
  creative_thinking?: number;
  analytical_skills?: number;
  communication?: number;
  leadership?: number;
  learning_speed?: string;
  preferred_learning_time?: string[];
  interests?: string[];
  personality_traits?: string[];
}

export interface UserPreferences {
  gender_preference?: string;
  learning_mode?: string[];
  availability_slots?: TimeSlot[];
  max_distance_km?: number;
  languages?: string[];
  pace_preference?: string;
}

export interface TimeSlot {
  day: string;
  start_time: string;
  end_time: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  description?: string;
  icon_url?: string;
  popularity_score: number;
}

export interface UserSkillTeaching {
  id: string;
  user_id: string;
  skill_id: string;
  proficiency_level: 'beginner' | 'intermediate' | 'expert';
  hourly_coin_rate: number;
  availability: Record<string, unknown>;
  teaching_mode: 'in-person' | 'online' | 'both';
  total_sessions: number;
  average_rating: number;
}

export interface UserSkillLearning {
  id: string;
  user_id: string;
  skill_id: string;
  priority: 'high' | 'medium' | 'low';
  current_level?: string;
  target_level?: string;
  learning_mode?: string;
  preferred_pace?: string;
}

export interface SkillMatch {
  id: string;
  learner_id: string;
  teacher_id: string;
  skill_id: string;
  match_score: number;
  compatibility_factors: CompatibilityFactors;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  created_at: string;
}

export interface CompatibilityFactors {
  skill_match: number;
  dna_compatibility: number;
  availability_match: number;
  learning_style_match: number;
  rating_score: number;
  preference_match: number;
}

export interface Session {
  id: string;
  skill_id?: string;
  teacher_id: string;
  learner_id: string;
  session_type: 'video' | 'chat' | 'in-person';
  scheduled_start: string;
  scheduled_end: string;
  actual_start?: string;
  actual_end?: string;
  coin_amount: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  meeting_link?: string;
  location?: string;
  notes?: string;
  recording_url?: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id?: string;
  room_id?: string;
  message_text: string;
  message_type: string;
  read_at?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  notification_type: string;
  title: string;
  body?: string;
  data: Record<string, unknown>;
  read_at?: string;
  created_at: string;
}

export interface MarketplaceItem {
  id: string;
  seller_id: string;
  title: string;
  description?: string;
  item_type: 'course' | 'notes' | 'pdf' | 'tutorial';
  price_coins: number;
  preview_url?: string;
  file_url?: string;
  downloads: number;
  rating: number;
}

export interface SkillReel {
  id: string;
  user_id: string;
  skill_id: string;
  video_url: string;
  thumbnail_url?: string;
  duration?: number;
  views: number;
  likes: number;
  created_at: string;
}

export interface CommunityRoom {
  id: string;
  skill_id?: string;
  name: string;
  description?: string;
  room_type: 'text' | 'video' | 'hybrid';
  member_count: number;
  created_by?: string;
  created_at: string;
}
