-- Add role column to profiles
ALTER TABLE public.profiles
  ADD COLUMN role text NOT NULL DEFAULT 'user';

-- Ensure admin profile exists and has admin role
INSERT INTO public.profiles (id, name, role)
SELECT id, 'Admin', 'admin'
FROM auth.users
WHERE email = 'login@ideva.ai'
LIMIT 1
ON CONFLICT (id) DO UPDATE SET role = 'admin';
