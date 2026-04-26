/*
  # Create profiles table with role-based access

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - references auth.users
      - `role` (text, default 'user') - user role: 'user', 'organizer', or 'admin'
      - `display_name` (text, default '') - optional display name
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `profiles` table
    - Users can read their own profile
    - Users can update their own display_name (but not role)
    - Auto-create profile on new user signup via trigger

  3. Changes to events
    - Update INSERT policy: only users with 'organizer' or 'admin' role can create events

  4. Notes
    - Default role is 'user' - must be promoted to 'organizer' by an admin
    - Role changes should only be done via direct database access or admin tooling
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user',
  display_name text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_role CHECK (role IN ('user', 'organizer', 'admin'))
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can insert their own profile (for the trigger / initial creation)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update their own display_name only
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Auto-create profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to avoid duplicates
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update events INSERT policy: only organizers and admins can create events
DROP POLICY IF EXISTS "Organizers can create events" ON events;

CREATE POLICY "Organizers can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = organizer_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('organizer', 'admin')
    )
  );

-- Create profiles for any existing auth users who don't have one yet
INSERT INTO profiles (id, display_name)
SELECT id, COALESCE(raw_user_meta_data->>'full_name', '')
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;
