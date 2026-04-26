/*
  # Add profile fields (phone, location, privacy) and event approval status

  1. Modified Tables
    - `profiles`
      - `phone` (text, default '') - user phone number
      - `location` (text, default '') - user location/city
      - `privacy_accepted` (boolean, default false) - whether user accepted privacy policy
    - `events`
      - `status` (text, default 'pending') - event approval status: 'pending', 'approved', 'rejected'
      - `rejection_reason` (text, default '') - admin notes when rejecting

  2. Security
    - Update events SELECT policy so public users only see approved events
    - Admin can see all events regardless of status
    - Admin can update event status (approve/reject)

  3. Important Notes
    - Existing seed events are set to 'approved' so they remain visible
    - Organizers see their own events regardless of status
    - The public events listing only shows approved events
*/

-- Add new columns to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone text NOT NULL DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'location'
  ) THEN
    ALTER TABLE profiles ADD COLUMN location text NOT NULL DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'privacy_accepted'
  ) THEN
    ALTER TABLE profiles ADD COLUMN privacy_accepted boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- Add status column to events
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'status'
  ) THEN
    ALTER TABLE events ADD COLUMN status text NOT NULL DEFAULT 'pending';
    ALTER TABLE events ADD CONSTRAINT valid_event_status CHECK (status IN ('pending', 'approved', 'rejected'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'rejection_reason'
  ) THEN
    ALTER TABLE events ADD COLUMN rejection_reason text NOT NULL DEFAULT '';
  END IF;
END $$;

-- Set all existing events to approved
UPDATE events SET status = 'approved' WHERE status = 'pending';

-- Drop old public SELECT policy and create new one that only shows approved events
DROP POLICY IF EXISTS "Events are publicly readable" ON events;

CREATE POLICY "Approved events are publicly readable"
  ON events FOR SELECT
  TO anon, authenticated
  USING (
    status = 'approved'
    OR (
      auth.uid() IS NOT NULL
      AND (
        organizer_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      )
    )
  );

-- Allow admins to update events (for approval/rejection)
DROP POLICY IF EXISTS "Admins can update events" ON events;

CREATE POLICY "Admins can update events"
  ON events FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow admins to insert events directly (bypassing organizer check)
DROP POLICY IF EXISTS "Admins can create events" ON events;

CREATE POLICY "Admins can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Update the trigger function to include new profile fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, phone, location, privacy_accepted)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'location', ''),
    COALESCE((NEW.raw_user_meta_data->>'privacy_accepted')::boolean, false)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
