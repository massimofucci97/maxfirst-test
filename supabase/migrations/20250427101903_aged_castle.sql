/*
  # Add Storage Bucket Policies

  1. Storage Changes
    - Create 'items' storage bucket if it doesn't exist
    - Add RLS policies for the 'items' bucket:
      - Allow authenticated users to upload files
      - Allow authenticated users to read their own files
      - Allow authenticated users to delete their own files

  2. Security
    - Enable RLS on the storage bucket
    - Add policies based on user authentication
*/

-- Create the storage bucket if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'items'
  ) THEN
    INSERT INTO storage.buckets (id, name)
    VALUES ('items', 'items');
  END IF;
END $$;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies for the items bucket
DO $$
BEGIN
  -- Clean up any existing policies
  DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated users to read their own files" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated users to delete their own files" ON storage.objects;
  
  -- Create new policies
  CREATE POLICY "Allow authenticated users to upload files"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'items' AND
      auth.uid() IS NOT NULL
    );

  CREATE POLICY "Allow authenticated users to read their own files"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'items' AND
      auth.uid() = owner
    );

  CREATE POLICY "Allow authenticated users to delete their own files"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'items' AND
      auth.uid() = owner
    );
END $$;