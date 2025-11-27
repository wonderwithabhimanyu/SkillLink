/*
  # SkillLink Platform - Core Database Schema

  ## Overview
  Complete database schema for AI-powered campus skill swap platform with:
  - User profiles with skill DNA
  - Skill listings (teach & learn)
  - AI matching system
  - Skill coins economy
  - Session management
  - Real-time chat
  - Gamification (badges, streaks, certificates)
  - Marketplace
  - Analytics

  ## New Tables

  ### 1. profiles
  Extended user profiles with campus details, skill DNA, and preferences
  - `id` (uuid, FK to auth.users)
  - `email`, `full_name`, `avatar_url`
  - `campus_id`, `branch`, `year`, `course`
  - `gender`, `languages` (array)
  - `bio`, `learning_style`
  - `skill_coins` (default 100 for new users)
  - `total_sessions_taught`, `total_sessions_learned`
  - `rating`, `verified_teacher` (blue tick)
  - `skill_dna_profile` (jsonb - AI-generated)
  - `preferences` (jsonb - filters, availability)
  - `streak_days`, `last_activity_date`
  - `premium_tier` (free/pro/enterprise)
  - `created_at`, `updated_at`

  ### 2. skills
  Master skill catalog
  - `id`, `name`, `category`, `subcategory`
  - `description`, `icon_url`
  - `popularity_score`

  ### 3. user_skills_teaching
  Skills that users can teach
  - `id`, `user_id`, `skill_id`
  - `proficiency_level` (beginner/intermediate/expert)
  - `hourly_coin_rate`
  - `availability` (jsonb - time slots)
  - `teaching_mode` (in-person/online/both)
  - `total_sessions`, `average_rating`

  ### 4. user_skills_learning
  Skills users want to learn
  - `id`, `user_id`, `skill_id`
  - `priority` (high/medium/low)
  - `current_level`, `target_level`
  - `learning_mode`, `preferred_pace`

  ### 5. skill_matches
  AI-generated matches between learners and teachers
  - `id`, `learner_id`, `teacher_id`, `skill_id`
  - `match_score` (0-100)
  - `compatibility_factors` (jsonb - DNA match, filters, etc.)
  - `status` (pending/accepted/rejected/completed)
  - `created_at`

  ### 6. sessions
  Learning sessions between users
  - `id`, `skill_id`, `teacher_id`, `learner_id`
  - `session_type` (video/chat/in-person)
  - `scheduled_start`, `scheduled_end`
  - `actual_start`, `actual_end`
  - `coin_amount`, `status`
  - `meeting_link`, `location`
  - `notes`, `recording_url`

  ### 7. session_reviews
  Reviews and ratings after sessions
  - `id`, `session_id`, `reviewer_id`, `reviewee_id`
  - `rating` (1-5), `review_text`
  - `tags` (array)

  ### 8. transactions
  Skill coin transaction history
  - `id`, `user_id`, `amount`, `transaction_type`
  - `related_session_id`, `description`

  ### 9. badges
  Achievement badges
  - `id`, `name`, `description`, `icon_url`
  - `criteria` (jsonb)

  ### 10. user_badges
  Badges earned by users
  - `id`, `user_id`, `badge_id`, `earned_at`

  ### 11. certificates
  Skill certificates
  - `id`, `user_id`, `skill_id`, `issued_by_user_id`
  - `certificate_url`, `verification_code`

  ### 12. marketplace_items
  Skill marketplace for selling content
  - `id`, `seller_id`, `title`, `description`
  - `item_type` (course/notes/pdf/tutorial)
  - `price_coins`, `preview_url`, `file_url`
  - `downloads`, `rating`

  ### 13. skill_reels
  Short video skill showcases
  - `id`, `user_id`, `skill_id`
  - `video_url`, `thumbnail_url`
  - `duration`, `views`, `likes`

  ### 14. community_rooms
  Public skill learning rooms
  - `id`, `skill_id`, `name`, `description`
  - `room_type` (text/video/hybrid)
  - `member_count`, `created_by`

  ### 15. messages
  Real-time chat messages
  - `id`, `sender_id`, `receiver_id`, `room_id`
  - `message_text`, `message_type`
  - `read_at`

  ### 16. notifications
  User notifications
  - `id`, `user_id`, `notification_type`
  - `title`, `body`, `data` (jsonb)
  - `read_at`

  ### 17. analytics_events
  Platform analytics tracking
  - `id`, `user_id`, `event_type`, `event_data` (jsonb)

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data or public data
  - Admin role for campus administrators
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extended user data)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  campus_id uuid,
  branch text,
  year integer,
  course text,
  gender text,
  languages text[] DEFAULT '{}',
  bio text,
  learning_style text,
  skill_coins integer DEFAULT 100,
  total_sessions_taught integer DEFAULT 0,
  total_sessions_learned integer DEFAULT 0,
  rating numeric(3,2) DEFAULT 0,
  verified_teacher boolean DEFAULT false,
  skill_dna_profile jsonb DEFAULT '{}',
  preferences jsonb DEFAULT '{}',
  streak_days integer DEFAULT 0,
  last_activity_date date,
  premium_tier text DEFAULT 'free',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Skills master table
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  category text NOT NULL,
  subcategory text,
  description text,
  icon_url text,
  popularity_score integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- User skills (teaching)
CREATE TABLE IF NOT EXISTS user_skills_teaching (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  skill_id uuid REFERENCES skills(id) ON DELETE CASCADE NOT NULL,
  proficiency_level text NOT NULL,
  hourly_coin_rate integer NOT NULL,
  availability jsonb DEFAULT '{}',
  teaching_mode text NOT NULL,
  total_sessions integer DEFAULT 0,
  average_rating numeric(3,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, skill_id)
);

-- User skills (learning)
CREATE TABLE IF NOT EXISTS user_skills_learning (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  skill_id uuid REFERENCES skills(id) ON DELETE CASCADE NOT NULL,
  priority text DEFAULT 'medium',
  current_level text,
  target_level text,
  learning_mode text,
  preferred_pace text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, skill_id)
);

-- AI skill matches
CREATE TABLE IF NOT EXISTS skill_matches (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  learner_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  teacher_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  skill_id uuid REFERENCES skills(id) ON DELETE CASCADE NOT NULL,
  match_score integer NOT NULL,
  compatibility_factors jsonb DEFAULT '{}',
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_id uuid REFERENCES skills(id) ON DELETE SET NULL,
  teacher_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  learner_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_type text NOT NULL,
  scheduled_start timestamptz NOT NULL,
  scheduled_end timestamptz NOT NULL,
  actual_start timestamptz,
  actual_end timestamptz,
  coin_amount integer NOT NULL,
  status text DEFAULT 'scheduled',
  meeting_link text,
  location text,
  notes text,
  recording_url text,
  created_at timestamptz DEFAULT now()
);

-- Session reviews
CREATE TABLE IF NOT EXISTS session_reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  reviewer_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reviewee_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount integer NOT NULL,
  transaction_type text NOT NULL,
  related_session_id uuid REFERENCES sessions(id) ON DELETE SET NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Badges
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  description text,
  icon_url text,
  criteria jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- User badges
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id uuid REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Certificates
CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  skill_id uuid REFERENCES skills(id) ON DELETE CASCADE NOT NULL,
  issued_by_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  certificate_url text,
  verification_code text UNIQUE NOT NULL,
  issued_at timestamptz DEFAULT now()
);

-- Marketplace items
CREATE TABLE IF NOT EXISTS marketplace_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  item_type text NOT NULL,
  price_coins integer NOT NULL,
  preview_url text,
  file_url text,
  downloads integer DEFAULT 0,
  rating numeric(3,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Skill reels
CREATE TABLE IF NOT EXISTS skill_reels (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  skill_id uuid REFERENCES skills(id) ON DELETE CASCADE NOT NULL,
  video_url text NOT NULL,
  thumbnail_url text,
  duration integer,
  views integer DEFAULT 0,
  likes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Community rooms
CREATE TABLE IF NOT EXISTS community_rooms (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_id uuid REFERENCES skills(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  room_type text DEFAULT 'text',
  member_count integer DEFAULT 0,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  room_id uuid REFERENCES community_rooms(id) ON DELETE CASCADE,
  message_text text NOT NULL,
  message_type text DEFAULT 'text',
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  notification_type text NOT NULL,
  title text NOT NULL,
  body text,
  data jsonb DEFAULT '{}',
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Analytics events
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills_teaching ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills_learning ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for skills (public read)
CREATE POLICY "Anyone can view skills"
  ON skills FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_skills_teaching
CREATE POLICY "Users can view all teaching skills"
  ON user_skills_teaching FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own teaching skills"
  ON user_skills_teaching FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_skills_learning
CREATE POLICY "Users can view own learning skills"
  ON user_skills_learning FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own learning skills"
  ON user_skills_learning FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for skill_matches
CREATE POLICY "Users can view their matches"
  ON skill_matches FOR SELECT
  TO authenticated
  USING (auth.uid() = learner_id OR auth.uid() = teacher_id);

CREATE POLICY "Users can update their matches"
  ON skill_matches FOR UPDATE
  TO authenticated
  USING (auth.uid() = learner_id OR auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = learner_id OR auth.uid() = teacher_id);

-- RLS Policies for sessions
CREATE POLICY "Users can view their sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = teacher_id OR auth.uid() = learner_id);

CREATE POLICY "Users can create sessions"
  ON sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = teacher_id OR auth.uid() = learner_id);

CREATE POLICY "Users can update their sessions"
  ON sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = teacher_id OR auth.uid() = learner_id)
  WITH CHECK (auth.uid() = teacher_id OR auth.uid() = learner_id);

-- RLS Policies for session_reviews
CREATE POLICY "Users can view reviews for their sessions"
  ON session_reviews FOR SELECT
  TO authenticated
  USING (
    auth.uid() = reviewer_id OR 
    auth.uid() = reviewee_id OR
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = session_reviews.session_id 
      AND (sessions.teacher_id = auth.uid() OR sessions.learner_id = auth.uid())
    )
  );

CREATE POLICY "Users can create reviews for their sessions"
  ON session_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);

-- RLS Policies for transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for badges (public read)
CREATE POLICY "Anyone can view badges"
  ON badges FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_badges
CREATE POLICY "Users can view all user badges"
  ON user_badges FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for certificates
CREATE POLICY "Users can view all certificates"
  ON certificates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create certificates they issue"
  ON certificates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = issued_by_user_id);

-- RLS Policies for marketplace_items
CREATE POLICY "Users can view all marketplace items"
  ON marketplace_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own marketplace items"
  ON marketplace_items FOR ALL
  TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

-- RLS Policies for skill_reels
CREATE POLICY "Users can view all skill reels"
  ON skill_reels FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own skill reels"
  ON skill_reels FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for community_rooms
CREATE POLICY "Users can view all community rooms"
  ON community_rooms FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create community rooms"
  ON community_rooms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- RLS Policies for messages
CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    auth.uid() = sender_id OR 
    auth.uid() = receiver_id OR
    room_id IS NOT NULL
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for analytics_events
CREATE POLICY "Users can insert analytics events"
  ON analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_campus ON profiles(campus_id);
CREATE INDEX IF NOT EXISTS idx_profiles_premium ON profiles(premium_tier);
CREATE INDEX IF NOT EXISTS idx_user_skills_teaching_user ON user_skills_teaching(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_teaching_skill ON user_skills_teaching(skill_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_learning_user ON user_skills_learning(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_matches_learner ON skill_matches(learner_id);
CREATE INDEX IF NOT EXISTS idx_skill_matches_teacher ON skill_matches(teacher_id);
CREATE INDEX IF NOT EXISTS idx_skill_matches_status ON skill_matches(status);
CREATE INDEX IF NOT EXISTS idx_sessions_teacher ON sessions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_sessions_learner ON sessions(learner_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
