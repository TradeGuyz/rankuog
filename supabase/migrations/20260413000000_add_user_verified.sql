-- Add user_verified column to users table
-- Represents admin manual verification that the user is a real UoG student.
-- Distinct from email_verified (which is set automatically on email confirmation).
-- Only admins can set this to true.

ALTER TABLE public.users
  ADD COLUMN "user_verified" boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.users.user_verified IS
  'Set to true by an admin after manually confirming the user is a real UoG student. Distinct from email_verified, which is set automatically on email confirmation.';


-- Prevent users from updating their own user_verified status
-- (extends the existing own-profile update policy)
DROP POLICY "Own profile update" ON public.users;

CREATE POLICY "Own profile update" ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND is_admin      = (SELECT is_admin      FROM public.users WHERE id = auth.uid())
    AND email_verified = (SELECT email_verified FROM public.users WHERE id = auth.uid())
    AND user_verified  = (SELECT user_verified  FROM public.users WHERE id = auth.uid())
  );


-- Allow admins to update user_verified on any user
CREATE POLICY "Admin set user_verified" ON public.users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND is_admin = true
    )
  );
