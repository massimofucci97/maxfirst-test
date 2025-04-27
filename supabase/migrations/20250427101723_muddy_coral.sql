/*
  # Create storage bucket for items

  1. New Storage Bucket
    - Creates a new public storage bucket named 'items' for storing item images
  
  2. Security
    - Enable public access for reading images
    - Allow authenticated users to upload images
    - Set size limits and file type restrictions
*/

-- Create a new storage bucket for items if it doesn't exist
insert into storage.buckets (id, name, public)
values ('items', 'items', true)
on conflict (id) do nothing;

-- Policy to allow public access to read files
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'items' );

-- Policy to allow authenticated users to upload files
create policy "Authenticated users can upload images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'items' 
  and (storage.extension(name) = 'jpg' or storage.extension(name) = 'jpeg' or storage.extension(name) = 'png')
  and position('/' in name) = 0
  and storage.filesize(name) < 5000000 -- 5MB file size limit
);