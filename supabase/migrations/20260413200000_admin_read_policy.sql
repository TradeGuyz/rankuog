-- Security-definer function avoids infinite recursion when a policy
-- on `users` needs to query `users` to check is_admin.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.users WHERE id = auth.uid()),
    false
  )
$$;

-- Allow admins to read all user rows (needed to list pending verifications)
CREATE POLICY "Admin read all users"
  ON public.users FOR SELECT
  USING (public.is_admin());
