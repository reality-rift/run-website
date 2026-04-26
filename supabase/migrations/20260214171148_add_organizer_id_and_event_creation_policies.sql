/*
  # Add organizer support to events

  1. Modified Tables
    - `events`
      - Added `organizer_id` (uuid, nullable) - references auth.users, identifies who created the event

  2. Security
    - New INSERT policy: authenticated users can create events (organizer_id must match their auth.uid())
    - New UPDATE policy: organizers can update their own events
    - New DELETE policy: organizers can delete their own events

  3. Indexes
    - Index on organizer_id for fast lookups of events by organizer
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'organizer_id'
  ) THEN
    ALTER TABLE events ADD COLUMN organizer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id);

CREATE POLICY "Organizers can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update own events"
  ON events FOR UPDATE
  TO authenticated
  USING (auth.uid() = organizer_id)
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete own events"
  ON events FOR DELETE
  TO authenticated
  USING (auth.uid() = organizer_id);
