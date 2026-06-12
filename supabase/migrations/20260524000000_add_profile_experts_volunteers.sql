/*
  # Profile enhancements, Experts Corner, Volunteers, Registration URL

  1. Profiles: runner_level, achievements
  2. Events: registration_url (external registration portal)
  3. expert_articles table (admin-managed running plans / workouts / tips)
  4. event_volunteers table (volunteer signup per event)
*/

-- ── 1. Profile enhancements ────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS runner_level text DEFAULT 'beginner';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS achievements text[] DEFAULT '{}';

-- ── 2. Events: external registration URL ───────────────────────
ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_url text DEFAULT '';

-- ── 3. Expert articles ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expert_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'tips',
  image_url text DEFAULT '',
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE expert_articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view expert articles" ON expert_articles;
CREATE POLICY "Anyone can view expert articles"
  ON expert_articles FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can insert expert articles" ON expert_articles;
CREATE POLICY "Admins can insert expert articles"
  ON expert_articles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update expert articles" ON expert_articles;
CREATE POLICY "Admins can update expert articles"
  ON expert_articles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete expert articles" ON expert_articles;
CREATE POLICY "Admins can delete expert articles"
  ON expert_articles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ── 4. Event volunteers ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS event_volunteers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (event_id, user_id)
);

ALTER TABLE event_volunteers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view event volunteers" ON event_volunteers;
CREATE POLICY "Anyone can view event volunteers"
  ON event_volunteers FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can volunteer" ON event_volunteers;
CREATE POLICY "Users can volunteer"
  ON event_volunteers FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can withdraw volunteering" ON event_volunteers;
CREATE POLICY "Users can withdraw volunteering"
  ON event_volunteers FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
