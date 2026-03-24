-- Migration: Add Profiles and Admin Access
-- Description: Create a profiles table and update RLS for Admin visibility.
-- Date: 2026-03-23

BEGIN;

-- 1. Create Profiles table (extension of auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text,
    is_admin boolean DEFAULT false,
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profile Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 2. Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- feedback_messages
DROP POLICY IF EXISTS "Users can insert their own feedback" ON feedback_messages;
DROP POLICY IF EXISTS "Users can view their own feedback" ON feedback_messages;
DROP POLICY IF EXISTS "Users and Admins can view feedback" ON feedback_messages;
CREATE POLICY "Users and Admins can view feedback"
ON feedback_messages FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- generation_feedback
DROP POLICY IF EXISTS "Users can insert their own generation feedback" ON generation_feedback;
DROP POLICY IF EXISTS "Users can view their own generation feedback" ON generation_feedback;
DROP POLICY IF EXISTS "Users and Admins can view generation feedback" ON generation_feedback;
CREATE POLICY "Users and Admins can view generation feedback"
ON generation_feedback FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

COMMIT;
