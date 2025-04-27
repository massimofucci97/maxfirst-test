/*
  # Add Categories and Rarities to Items
  
  1. New Types
    - `item_category` enum for different item types
      - cabin
      - weapon
      - module
      - wheel
      - decoration
      - resource
    
    - `item_rarity` enum for item rarities
      - common
      - rare
      - special
      - epic
      - legendary
      - relic
  
  2. Changes
    - Add category and rarity columns to items table with default values
    - Add indexes for efficient filtering
*/

-- Create enum types for categories and rarities
CREATE TYPE item_category AS ENUM (
  'cabin',
  'weapon',
  'module',
  'wheel',
  'decoration',
  'resource'
);

CREATE TYPE item_rarity AS ENUM (
  'common',
  'rare',
  'special',
  'epic',
  'legendary',
  'relic'
);

-- Add new columns to items table with default values
ALTER TABLE items
ADD COLUMN category item_category DEFAULT 'weapon' NOT NULL,
ADD COLUMN rarity item_rarity DEFAULT 'common' NOT NULL;

-- Create indexes for new columns
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_rarity ON items(rarity);