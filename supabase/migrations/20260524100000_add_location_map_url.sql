/*
  # Add Google Maps link to events

  Organizers paste a Google Maps share link instead of needing
  a Maps API key for autocomplete.
*/

ALTER TABLE events ADD COLUMN IF NOT EXISTS location_map_url text DEFAULT '';
