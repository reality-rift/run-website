-- Production hardening migration
-- Adds missing indexes, constraints, and fixes RLS policies

-- ============================================
-- 1. MISSING INDEXES
-- ============================================

-- Events table indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_sport ON events(sport);
CREATE INDEX IF NOT EXISTS idx_events_city ON events(city);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_status_date ON events(status, date) WHERE status = 'approved';

-- Profiles index for role-based lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Registrations composite index for event stats
CREATE INDEX IF NOT EXISTS idx_registrations_event_created ON registrations(event_id, created_at);

-- ============================================
-- 2. DATA INTEGRITY CONSTRAINTS
-- ============================================

-- Prevent negative prices
DO $$ BEGIN
  ALTER TABLE events ADD CONSTRAINT check_event_price CHECK (price >= 0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Limit array tag lengths
DO $$ BEGIN
  ALTER TABLE events ADD CONSTRAINT check_distance_tags_length CHECK (coalesce(array_length(distance_tags, 1), 0) <= 10);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE events ADD CONSTRAINT check_category_tags_length CHECK (coalesce(array_length(category_tags, 1), 0) <= 10);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Forum post minimum content length
DO $$ BEGIN
  ALTER TABLE forum_posts ADD CONSTRAINT check_post_content_min_length CHECK (char_length(content) >= 1);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Forum comment minimum content length
DO $$ BEGIN
  ALTER TABLE forum_comments ADD CONSTRAINT check_comment_content_min_length CHECK (char_length(content) >= 1);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 3. AUDIT LOG TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_type text,
  target_id uuid,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
DO $$ BEGIN
  CREATE POLICY "Admins can read audit logs"
    ON audit_logs
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Authenticated users can insert audit entries (edge functions write these)
DO $$ BEGIN
  CREATE POLICY "Authenticated can insert audit logs"
    ON audit_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
