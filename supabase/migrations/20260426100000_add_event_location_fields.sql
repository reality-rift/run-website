/*
  # Add location fields to events table

  Adds Google Maps location support:
  - location_address (text) - full formatted address from Google Places
  - location_lat (double precision) - latitude
  - location_lng (double precision) - longitude
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'location_address'
  ) THEN
    ALTER TABLE events ADD COLUMN location_address text NOT NULL DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'location_lat'
  ) THEN
    ALTER TABLE events ADD COLUMN location_lat double precision;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'location_lng'
  ) THEN
    ALTER TABLE events ADD COLUMN location_lng double precision;
  END IF;
END $$;
