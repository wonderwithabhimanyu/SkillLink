/*
  # SkillLink Platform - Database Functions and Triggers

  ## Overview
  Add database functions and triggers for:
  - Auto-updating timestamps
  - Profile creation on signup
  - Skill coin transactions
  - Session completion logic
  - Rating calculations
  - Streak tracking
  - Badge award automation

  ## Functions

  1. `update_updated_at_column()` - Auto-update timestamp
  2. `handle_new_user()` - Create profile on signup
  3. `process_session_completion()` - Handle coin transfer and ratings
  4. `calculate_user_rating()` - Recalculate user rating
  5. `update_streak()` - Track learning/teaching streaks
  6. `check_and_award_badges()` - Auto-award badges based on achievements
*/

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, skill_coins)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    100
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function to process session completion
CREATE OR REPLACE FUNCTION process_session_completion(session_uuid uuid)
RETURNS void AS $$
DECLARE
  session_record RECORD;
BEGIN
  SELECT * INTO session_record FROM sessions WHERE id = session_uuid;
  
  IF session_record.status = 'completed' THEN
    UPDATE profiles 
    SET 
      skill_coins = skill_coins - session_record.coin_amount,
      total_sessions_learned = total_sessions_learned + 1
    WHERE id = session_record.learner_id;
    
    UPDATE profiles 
    SET 
      skill_coins = skill_coins + session_record.coin_amount,
      total_sessions_taught = total_sessions_taught + 1
    WHERE id = session_record.teacher_id;
    
    INSERT INTO transactions (user_id, amount, transaction_type, related_session_id, description)
    VALUES 
      (session_record.learner_id, -session_record.coin_amount, 'session_payment', session_uuid, 'Paid for learning session'),
      (session_record.teacher_id, session_record.coin_amount, 'session_earning', session_uuid, 'Earned from teaching session');
    
    UPDATE user_skills_teaching
    SET total_sessions = total_sessions + 1
    WHERE user_id = session_record.teacher_id AND skill_id = session_record.skill_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate and update user rating
CREATE OR REPLACE FUNCTION calculate_user_rating(user_uuid uuid)
RETURNS void AS $$
DECLARE
  avg_rating numeric;
BEGIN
  SELECT AVG(rating)::numeric(3,2) INTO avg_rating
  FROM session_reviews
  WHERE reviewee_id = user_uuid;
  
  UPDATE profiles
  SET rating = COALESCE(avg_rating, 0)
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update rating after new review
CREATE OR REPLACE FUNCTION update_rating_after_review()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM calculate_user_rating(NEW.reviewee_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_review_insert ON session_reviews;
CREATE TRIGGER after_review_insert
  AFTER INSERT ON session_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_rating_after_review();

-- Function to update streak
CREATE OR REPLACE FUNCTION update_streak(user_uuid uuid)
RETURNS void AS $$
DECLARE
  last_date date;
  current_streak integer;
BEGIN
  SELECT last_activity_date, streak_days INTO last_date, current_streak
  FROM profiles
  WHERE id = user_uuid;
  
  IF last_date = CURRENT_DATE THEN
    RETURN;
  ELSIF last_date = CURRENT_DATE - INTERVAL '1 day' THEN
    UPDATE profiles
    SET 
      streak_days = current_streak + 1,
      last_activity_date = CURRENT_DATE
    WHERE id = user_uuid;
  ELSE
    UPDATE profiles
    SET 
      streak_days = 1,
      last_activity_date = CURRENT_DATE
    WHERE id = user_uuid;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and award badges
CREATE OR REPLACE FUNCTION check_and_award_badges(user_uuid uuid)
RETURNS void AS $$
DECLARE
  profile_record RECORD;
  badge_record RECORD;
BEGIN
  SELECT * INTO profile_record FROM profiles WHERE id = user_uuid;
  
  FOR badge_record IN SELECT * FROM badges LOOP
    IF badge_record.name = 'First Session' AND profile_record.total_sessions_taught + profile_record.total_sessions_learned >= 1 THEN
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (user_uuid, badge_record.id)
      ON CONFLICT DO NOTHING;
    ELSIF badge_record.name = '10 Sessions Master' AND profile_record.total_sessions_taught >= 10 THEN
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (user_uuid, badge_record.id)
      ON CONFLICT DO NOTHING;
    ELSIF badge_record.name = 'Week Warrior' AND profile_record.streak_days >= 7 THEN
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (user_uuid, badge_record.id)
      ON CONFLICT DO NOTHING;
    ELSIF badge_record.name = 'Skill Millionaire' AND profile_record.skill_coins >= 1000 THEN
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (user_uuid, badge_record.id)
      ON CONFLICT DO NOTHING;
    ELSIF badge_record.name = 'Top Rated Teacher' AND profile_record.rating >= 4.5 AND profile_record.total_sessions_taught >= 20 THEN
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (user_uuid, badge_record.id)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default badges
INSERT INTO badges (name, description, icon_url, criteria) VALUES
  ('First Session', 'Complete your first learning or teaching session', 'https://img.icons8.com/color/96/prize.png', '{"sessions": 1}'),
  ('10 Sessions Master', 'Teach 10 sessions', 'https://img.icons8.com/color/96/laurel-wreath.png', '{"sessions_taught": 10}'),
  ('Week Warrior', 'Maintain a 7-day learning streak', 'https://img.icons8.com/color/96/fire-element.png', '{"streak": 7}'),
  ('Skill Millionaire', 'Accumulate 1000 skill coins', 'https://img.icons8.com/color/96/diamonds.png', '{"coins": 1000}'),
  ('Top Rated Teacher', 'Achieve 4.5+ rating with 20+ sessions', 'https://img.icons8.com/color/96/star.png', '{"rating": 4.5, "sessions": 20}')
ON CONFLICT (name) DO NOTHING;

-- Insert sample skills
INSERT INTO skills (name, category, subcategory, description) VALUES
  ('Python Programming', 'Technology', 'Programming', 'Learn Python from basics to advanced'),
  ('Web Development', 'Technology', 'Programming', 'HTML, CSS, JavaScript, React'),
  ('Machine Learning', 'Technology', 'AI/ML', 'ML algorithms and deep learning'),
  ('Data Science', 'Technology', 'Data', 'Data analysis, visualization, statistics'),
  ('Guitar Playing', 'Music', 'Instruments', 'Learn to play guitar'),
  ('Digital Marketing', 'Business', 'Marketing', 'SEO, social media, content marketing'),
  ('Photography', 'Arts', 'Visual', 'Camera basics, composition, editing'),
  ('Spanish Language', 'Languages', 'Spanish', 'Conversational Spanish'),
  ('Public Speaking', 'Communication', 'Speaking', 'Presentation and oratory skills'),
  ('Graphic Design', 'Design', 'Visual', 'Adobe tools, design principles'),
  ('Content Writing', 'Writing', 'Creative', 'Blog posts, articles, copywriting'),
  ('Mobile App Development', 'Technology', 'Programming', 'iOS and Android development'),
  ('UI/UX Design', 'Design', 'Digital', 'User interface and experience design'),
  ('Video Editing', 'Media', 'Video', 'Premiere Pro, Final Cut, DaVinci'),
  ('Finance & Investing', 'Business', 'Finance', 'Stock market, mutual funds, trading')
ON CONFLICT (name) DO NOTHING;
