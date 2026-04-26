/*
  # Fix infinite recursion in profiles RLS policies

  1. Problem
    - The "Admins can read all profiles" and "Admins can update any profile" policies
      query the profiles table to check if the current user is an admin
    - This triggers the same RLS policies again, causing infinite recursion

  2. Solution
    - Create a SECURITY DEFINER function `is_admin()` that bypasses RLS
      to check the user's role directly
    - Replace the recursive admin policies with ones that use this function

  3. Changes
    - New function: `public.is_admin()` (SECURITY DEFINER, bypasses RLS)
    - Drop and recreate "Admins can read all profiles" policy
    - Drop and recreate "Admins can update any profile" policy
    - Also fix the events INSERT policy which has same issue
*/

-- Create a security definer function to check admin status without triggering RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Create a security definer function to check organizer/admin status without triggering RLS
CREATE OR REPLACE FUNCTION public.is_organizer_or_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('organizer', 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Drop the recursive admin policies
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

-- Recreate admin policies using the security definer function
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Fix events INSERT policy that also queries profiles and could cause issues
DROP POLICY IF EXISTS "Organizers can create events" ON events;

CREATE POLICY "Organizers can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = organizer_id
    AND public.is_organizer_or_admin()
  );
