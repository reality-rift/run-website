/*
  # Add Avatar URL to Profiles

  1. Changes
    - Add `avatar_url` column to profiles table
    - This stores the public URL of user's profile picture
    - Can be from Supabase storage or an external service
  
  2. Security
    - Column is optional (nullable)
    - Users can update their own avatar_url via existing profile update policies
*/

-- Add avatar_url column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avatar_url text;
  END IF;
END $$;