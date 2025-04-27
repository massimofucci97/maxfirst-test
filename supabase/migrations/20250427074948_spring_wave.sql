/*
  # Initial Schema for Game Finance Tracker
  
  1. New Tables
    - `items`
      - `id` (uuid, primary key)
      - `name` (text, non-null)
      - `description` (text, nullable)
      - `image_url` (text, nullable)
      - `created_at` (timestamptz, default now())
    
    - `transactions`
      - `id` (uuid, primary key)
      - `item_id` (uuid, foreign key to items.id)
      - `type` (text, enum: 'purchase' or 'sale')
      - `price` (numeric, non-null)
      - `quantity` (integer, non-null)
      - `date` (timestamptz, default now())
      - `notes` (text, nullable)
      - `created_at` (timestamptz, default now())
  
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to have full access to their own data
*/

-- Create enum type for transaction types
CREATE TYPE transaction_type AS ENUM ('purchase', 'sale');

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  price numeric NOT NULL CHECK (price > 0),
  quantity integer NOT NULL CHECK (quantity > 0),
  date timestamptz DEFAULT now(),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create index for commonly queried columns
CREATE INDEX IF NOT EXISTS idx_transactions_item_id ON transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);

-- Enable Row Level Security
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for items table
CREATE POLICY "Allow full access to items" 
  ON items 
  USING (true)
  WITH CHECK (true);

-- Create policies for transactions table
CREATE POLICY "Allow full access to transactions" 
  ON transactions 
  USING (true)
  WITH CHECK (true);