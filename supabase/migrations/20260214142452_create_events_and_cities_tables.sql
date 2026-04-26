/*
  # Create events and cities tables for STARTLINE

  1. New Tables
    - `events`
      - `id` (uuid, primary key)
      - `title` (text) - event name
      - `description` (text) - short description
      - `date` (date) - event date
      - `sport` (text) - running, cycling, trail
      - `distance_tags` (text[]) - distance labels like "Half Marathon", "5K", "100 mi"
      - `category_tags` (text[]) - category labels like "Road Run", "Cycling", "Trail Run"
      - `price` (integer) - price in dollars
      - `city` (text) - city name
      - `state` (text) - state abbreviation
      - `image_url` (text) - event cover image
      - `interested_count` (integer, default 0) - number of interested users
      - `created_at` (timestamptz)
    - `cities`
      - `id` (uuid, primary key)
      - `name` (text) - city name
      - `event_count` (integer, default 0)
      - `image_url` (text) - city image
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add read-only policies for authenticated and anon users (public event data)
*/

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  date date NOT NULL,
  sport text NOT NULL,
  distance_tags text[] NOT NULL DEFAULT '{}',
  category_tags text[] NOT NULL DEFAULT '{}',
  price integer NOT NULL DEFAULT 0,
  city text NOT NULL,
  state text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  interested_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are publicly readable"
  ON events
  FOR SELECT
  TO anon, authenticated
  USING (date >= CURRENT_DATE - interval '30 days');

CREATE TABLE IF NOT EXISTS cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  event_count integer NOT NULL DEFAULT 0,
  image_url text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cities are publicly readable"
  ON cities
  FOR SELECT
  TO anon, authenticated
  USING (event_count >= 0);

-- Seed events data
INSERT INTO events (title, description, date, sport, distance_tags, category_tags, price, city, state, image_url, interested_count)
VALUES
  (
    'Golden Gate Half Marathon',
    'Run across the iconic Golden Gate Bridge with stunning bay views.',
    '2026-03-12',
    'running',
    ARRAY['Half Marathon', '5K'],
    ARRAY['Road Run'],
    85,
    'San Francisco',
    'CA',
    'https://images.unsplash.com/photo-1533561797500-4fad4750814e?q=80&w=600&auto=format&fit=crop',
    248
  ),
  (
    'Tour de Marin Century',
    'Epic century ride through the rolling hills of Marin County.',
    '2026-04-04',
    'cycling',
    ARRAY['100 mi', '60 mi'],
    ARRAY['Cycling'],
    120,
    'Sausalito',
    'CA',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=600&auto=format&fit=crop',
    156
  ),
  (
    'Dipsea Trail Classic',
    'Historic trail race from Mill Valley to Stinson Beach.',
    '2026-04-18',
    'running',
    ARRAY['12K'],
    ARRAY['Trail Run', 'Elevation'],
    65,
    'Mill Valley',
    'CA',
    'https://images.unsplash.com/photo-1552674605-5d2178b84916?q=80&w=600&auto=format&fit=crop',
    412
  ),
  (
    'Ladakh Marathon',
    'The highest marathon in the world at 11,500 feet.',
    '2026-05-15',
    'running',
    ARRAY['Full Marathon', 'Half Marathon', '10K'],
    ARRAY['Road Run', 'Altitude'],
    90,
    'Leh',
    'IN',
    'https://images.unsplash.com/photo-1552674605-46d532b2e591?q=80&w=600&auto=format&fit=crop',
    520
  ),
  (
    'Tata Mumbai Run',
    'India''s most prestigious road race through the heart of Mumbai.',
    '2026-03-02',
    'running',
    ARRAY['Full Marathon', 'Half Marathon', '10K', '5K'],
    ARRAY['Road Run'],
    75,
    'Mumbai',
    'IN',
    'https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?q=80&w=600&auto=format&fit=crop',
    890
  ),
  (
    'Tour of Nilgiris',
    'India''s premier multi-stage cycling tour through the Blue Mountains.',
    '2026-06-01',
    'cycling',
    ARRAY['200 mi'],
    ARRAY['Cycling', 'Multi-Stage'],
    150,
    'Ooty',
    'IN',
    'https://images.unsplash.com/photo-1541625602330-2277a4c46182?q=80&w=600&auto=format&fit=crop',
    340
  ),
  (
    'Goa River Marathon',
    'Scenic route along the Zuari river with ocean views.',
    '2026-03-10',
    'running',
    ARRAY['Full Marathon', 'Half Marathon'],
    ARRAY['Road Run'],
    60,
    'Goa',
    'IN',
    'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=600&auto=format&fit=crop',
    380
  ),
  (
    'Cycling Odyssey Kerala',
    'Backwaters to highlands, a 200km cycling adventure.',
    '2026-04-15',
    'cycling',
    ARRAY['200 km'],
    ARRAY['Cycling', 'Gran Fondo'],
    110,
    'Kochi',
    'IN',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=600&auto=format&fit=crop',
    210
  ),
  (
    'Bay to Breakers 12K',
    'The legendary footrace across San Francisco.',
    '2026-05-17',
    'running',
    ARRAY['12K'],
    ARRAY['Road Run', 'Fun Run'],
    55,
    'San Francisco',
    'CA',
    'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?q=80&w=600&auto=format&fit=crop',
    1200
  ),
  (
    'Bengaluru Midnight Marathon',
    'Run through the Garden City under the stars.',
    '2026-03-22',
    'running',
    ARRAY['Full Marathon', 'Half Marathon', '10K'],
    ARRAY['Road Run', 'Night Run'],
    70,
    'Bengaluru',
    'IN',
    'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=600&auto=format&fit=crop',
    650
  ),
  (
    'Hyderabad Cycling Challenge',
    'Flat and fast century ride through historic Hyderabad.',
    '2026-04-26',
    'cycling',
    ARRAY['100 km', '50 km'],
    ARRAY['Cycling'],
    80,
    'Hyderabad',
    'IN',
    'https://images.unsplash.com/photo-1605218427368-35b0185e927f?q=80&w=600&auto=format&fit=crop',
    290
  ),
  (
    'Big Sur Trail Ultra',
    'Rugged coastal trails with breathtaking Pacific views.',
    '2026-06-14',
    'running',
    ARRAY['50K', '25K'],
    ARRAY['Trail Run', 'Ultra'],
    130,
    'Big Sur',
    'CA',
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=600&auto=format&fit=crop',
    175
  );

-- Seed cities data
INSERT INTO cities (name, event_count, image_url)
VALUES
  ('Mumbai', 12, 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?q=80&w=600&auto=format&fit=crop'),
  ('Hyderabad', 8, 'https://images.unsplash.com/photo-1605218427368-35b0185e927f?q=80&w=600&auto=format&fit=crop'),
  ('Bengaluru', 15, 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=600&auto=format&fit=crop'),
  ('San Francisco', 10, 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=600&auto=format&fit=crop'),
  ('Goa', 6, 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=600&auto=format&fit=crop'),
  ('Leh', 4, 'https://images.unsplash.com/photo-1552674605-46d532b2e591?q=80&w=600&auto=format&fit=crop');
