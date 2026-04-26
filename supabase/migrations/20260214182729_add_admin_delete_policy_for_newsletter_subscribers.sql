/*
  # Add admin delete policy for newsletter subscribers

  1. Security Changes
    - Add DELETE policy on `newsletter_subscribers` for admins to remove subscribers
    - Uses the existing `is_admin()` SECURITY DEFINER function

  2. Important Notes
    - Enables the admin panel to manage (remove) newsletter subscribers
*/

CREATE POLICY "Admins can delete newsletter subscribers"
  ON newsletter_subscribers
  FOR DELETE
  TO authenticated
  USING (is_admin());
