/*
  # Add admin policies for profile management

  1. Security Changes
    - Admins can read ALL profiles (for user management panel)
    - Admins can update ANY profile's role (for promoting/demoting users)

  2. Notes
    - These policies are additive to existing per-user policies
    - Only users with role = 'admin' in the profiles table get these privileges
    - Regular users still only see/edit their own profile
*/

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Admins can update any profile (for role changes)
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );
