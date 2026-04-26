/*
  # Add admin read policies for newsletter subscribers and registrations

  1. Security Changes
    - Add SELECT policy on `newsletter_subscribers` for admins to view all subscribers
    - Add SELECT policy on `registrations` for admins to view all event registrations
    - Add SELECT policy on `saved_events` for admins to view all saved events
    - All policies use the existing `is_admin()` SECURITY DEFINER function

  2. Important Notes
    - These policies enable the admin panel to display subscriber lists, event attendees, and analytics
    - Only users with role='admin' in the profiles table can access this data
*/

CREATE POLICY "Admins can view all newsletter subscribers"
  ON newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can view all registrations"
  ON registrations
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can view all saved events"
  ON saved_events
  FOR SELECT
  TO authenticated
  USING (is_admin());
