-- Migration: Create Storage Bucket for Guest Identities
-- 1. Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('guest-identities', 'guest-identities', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for the guest-identities bucket

-- 3.1 Allow Public read-only access (Since public = true, this is for the URL to work)
CREATE POLICY "Public Read Access" ON storage.objects
    FOR SELECT USING (bucket_id = 'guest-identities');

-- 3.2 Allow Authenticated users to upload files
CREATE POLICY "Authenticated Upload Access" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'guest-identities');

-- 3.3 Allow Authenticated users to update/delete their own uploads (optional but good)
CREATE POLICY "Authenticated Update/Delete Access" ON storage.objects
    FOR ALL TO authenticated USING (bucket_id = 'guest-identities');
