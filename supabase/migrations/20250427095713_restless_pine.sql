/*
  # Add User Authentication and Data Isolation
  
  1. Changes
    - Add user_id column to items and transactions tables
    - Update RLS policies to restrict data access to owners
    - Add foreign key constraints to auth.users
  
  2. Security
    - Enable RLS on all tables
    - Add policies to ensure users can only access their own data
    - Cascade deletions when users are removed
*/

-- Add user_id column to items
ALTER TABLE items
ADD COLUMN user_id UUID NOT NULL DEFAULT auth.uid();

-- Add user_id column to transactions
ALTER TABLE transactions
ADD COLUMN user_id UUID NOT NULL DEFAULT auth.uid();

-- Add foreign key constraints
ALTER TABLE items
ADD CONSTRAINT items_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE transactions
ADD CONSTRAINT transactions_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create indexes for user_id columns
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);

-- Drop existing policies
DROP POLICY IF EXISTS "Allow full access to items" ON items;
DROP POLICY IF EXISTS "Allow full access to transactions" ON transactions;

-- Create new RLS policies for items
CREATE POLICY "Users can view their own items"
ON items FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own items"
ON items FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items"
ON items FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items"
ON items FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create new RLS policies for transactions
CREATE POLICY "Users can view their own transactions"
ON transactions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
ON transactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
ON transactions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
ON transactions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);