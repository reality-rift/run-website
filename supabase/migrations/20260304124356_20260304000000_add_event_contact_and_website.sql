/*
  # Add contact_info and website_url to events

  Adds fields for event organizer contact details and official website URL.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'contact_info'
  ) THEN
    ALTER TABLE events ADD COLUMN contact_info text NOT NULL DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'website_url'
  ) THEN
    ALTER TABLE events ADD COLUMN website_url text NOT NULL DEFAULT '';
  END IF;
END $$;