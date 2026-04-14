-- Add column to store the uploaded verification image URL
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_image_url text;

-- Create storage bucket (private — only owner + admins can read)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verification-documents',
  'verification-documents',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- RLS: users can upload into their own folder (<user_id>/verification.<ext>)
CREATE POLICY "Users can upload own verification"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'verification-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS: users can view their own file
CREATE POLICY "Users can view own verification"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'verification-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS: users can replace their own file (re-submission)
CREATE POLICY "Users can replace own verification"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'verification-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS: admins can read all submissions for review
CREATE POLICY "Admins can view all verifications"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'verification-documents'
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );
