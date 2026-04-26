/*
  # Create newsletter_subscribers table

  1. New Tables
    - `newsletter_subscribers`
      - `id` (uuid, primary key)
      - `email` (text, unique, not null) - subscriber email address
      - `created_at` (timestamptz) - when they subscribed

  2. Security
    - Enable RLS on `newsletter_subscribers` table
    - Allow authenticated users to insert their own subscription
    - Allow anonymous users to subscribe (public newsletter)
    - No SELECT/UPDATE/DELETE policies for regular users (admin only via service role)
*/

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anonymous users can subscribe to newsletter"
  ON newsletter_subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);
