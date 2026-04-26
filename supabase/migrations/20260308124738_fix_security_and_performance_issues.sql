/*
  # Fix Security and Performance Issues

  This migration addresses multiple security and performance concerns:

  ## 1. Add Missing Indexes
    - Add index on forum_comments.author_id for foreign key performance
    - Add index on forum_posts.author_id for foreign key performance

  ## 2. Optimize RLS Policies (Auth Function Initialization)
    - Replace auth.uid() with (SELECT auth.uid()) in all policies
    - This prevents re-evaluation of auth functions for each row
    - Improves query performance at scale

  ## 3. Remove Unused Indexes
    - Drop idx_saved_events_user_id (covered by composite index)
    - Drop idx_saved_events_event_id (covered by composite index)

  ## 4. Fix Function Search Paths
    - Set search_path for security-critical functions
    - Prevents search path injection attacks

  ## 5. Fix RLS Policy Issues
    - Convert "always true" newsletter policies to proper validation
    - Consolidate multiple permissive policies where appropriate

  ## Security Improvements
    - All auth.uid() calls now use SELECT wrapper for performance
    - Functions have immutable search paths
    - Newsletter subscription requires email validation
*/

-- ============================================================
-- 1. ADD MISSING INDEXES FOR FOREIGN KEYS
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_forum_comments_author_id 
  ON forum_comments(author_id);

CREATE INDEX IF NOT EXISTS idx_forum_posts_author_id 
  ON forum_posts(author_id);

-- ============================================================
-- 2. DROP UNUSED INDEXES
-- ============================================================

DROP INDEX IF EXISTS idx_saved_events_user_id;
DROP INDEX IF EXISTS idx_saved_events_event_id;

-- ============================================================
-- 3. FIX FUNCTION SEARCH PATHS
-- ============================================================

-- Recreate functions with secure search_path
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_organizer_or_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('organizer', 'admin')
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.update_forum_post_likes_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_posts
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_forum_post_comments_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_posts
    SET comments_count = comments_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_posts
    SET comments_count = GREATEST(0, comments_count - 1)
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, display_name)
  VALUES (NEW.id, 'user', COALESCE(NEW.raw_user_meta_data->>'display_name', 'Anonymous'));
  RETURN NEW;
END;
$$;

-- ============================================================
-- 4. OPTIMIZE RLS POLICIES - FORUM_LIKES
-- ============================================================

DROP POLICY IF EXISTS "Auth users can like posts" ON forum_likes;
DROP POLICY IF EXISTS "Users can unlike posts" ON forum_likes;

CREATE POLICY "Auth users can like posts"
  ON forum_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can unlike posts"
  ON forum_likes
  FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- ============================================================
-- 5. OPTIMIZE RLS POLICIES - EVENTS
-- ============================================================

DROP POLICY IF EXISTS "Admins can create events" ON events;
DROP POLICY IF EXISTS "Organizers can create events" ON events;
DROP POLICY IF EXISTS "Admins can update events" ON events;
DROP POLICY IF EXISTS "Organizers can update own events" ON events;
DROP POLICY IF EXISTS "Approved events are publicly readable" ON events;
DROP POLICY IF EXISTS "Organizers can delete own events" ON events;

-- Consolidated INSERT policy
CREATE POLICY "Organizers and admins can create events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (SELECT auth.uid())
      AND role IN ('organizer', 'admin')
    )
  );

-- Consolidated UPDATE policy
CREATE POLICY "Users can update events based on role"
  ON events
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = (SELECT auth.uid())
      AND (
        p.role = 'admin' 
        OR (p.role = 'organizer' AND events.organizer_id = p.id)
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = (SELECT auth.uid())
      AND (
        p.role = 'admin' 
        OR (p.role = 'organizer' AND events.organizer_id = p.id)
      )
    )
  );

-- SELECT policy
CREATE POLICY "Approved events are publicly readable"
  ON events
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- DELETE policy
CREATE POLICY "Organizers can delete own events"
  ON events
  FOR DELETE
  TO authenticated
  USING (
    organizer_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- ============================================================
-- 6. OPTIMIZE RLS POLICIES - SAVED_EVENTS
-- ============================================================

DROP POLICY IF EXISTS "Users can save events" ON saved_events;
DROP POLICY IF EXISTS "Users can unsave events" ON saved_events;
DROP POLICY IF EXISTS "Users can view own saved events" ON saved_events;
DROP POLICY IF EXISTS "Admins can view all saved events" ON saved_events;

CREATE POLICY "Users can save events"
  ON saved_events
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can unsave events"
  ON saved_events
  FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can view saved events"
  ON saved_events
  FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- ============================================================
-- 7. OPTIMIZE RLS POLICIES - REGISTRATIONS
-- ============================================================

DROP POLICY IF EXISTS "Users can cancel registrations" ON registrations;
DROP POLICY IF EXISTS "Users can register for events" ON registrations;
DROP POLICY IF EXISTS "Users can view own registrations" ON registrations;
DROP POLICY IF EXISTS "Admins can view all registrations" ON registrations;

CREATE POLICY "Users can register for events"
  ON registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can cancel registrations"
  ON registrations
  FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can view registrations"
  ON registrations
  FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- ============================================================
-- 8. OPTIMIZE RLS POLICIES - PROFILES
-- ============================================================

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Profiles are publicly readable" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Profiles are publicly readable"
  ON profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can update profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = (SELECT auth.uid()) AND p.role = 'admin'
    )
  )
  WITH CHECK (
    id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = (SELECT auth.uid()) AND p.role = 'admin'
    )
  );

-- ============================================================
-- 9. OPTIMIZE RLS POLICIES - FORUM_POSTS
-- ============================================================

DROP POLICY IF EXISTS "Admins can delete any forum post" ON forum_posts;
DROP POLICY IF EXISTS "Auth users can create forum posts" ON forum_posts;
DROP POLICY IF EXISTS "Users can delete own forum posts" ON forum_posts;

CREATE POLICY "Auth users can create forum posts"
  ON forum_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (author_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete forum posts"
  ON forum_posts
  FOR DELETE
  TO authenticated
  USING (
    author_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- ============================================================
-- 10. OPTIMIZE RLS POLICIES - FORUM_COMMENTS
-- ============================================================

DROP POLICY IF EXISTS "Auth users can create forum comments" ON forum_comments;
DROP POLICY IF EXISTS "Users can delete own forum comments" ON forum_comments;

CREATE POLICY "Auth users can create forum comments"
  ON forum_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (author_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete forum comments"
  ON forum_comments
  FOR DELETE
  TO authenticated
  USING (
    author_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- ============================================================
-- 11. FIX NEWSLETTER RLS POLICIES
-- ============================================================

DROP POLICY IF EXISTS "Anonymous users can subscribe to newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscribers;

-- Require valid email format
CREATE POLICY "Users can subscribe to newsletter"
  ON newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL AND 
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  );
