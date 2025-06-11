/*
  # Fix tours table migration

  1. Tables
    - Create tours table if it doesn't exist
    - Handle existing policies and indexes gracefully
    
  2. Security
    - Enable RLS on tours table
    - Create policies for authenticated users (with conflict handling)
    
  3. Performance
    - Add indexes for common queries
    
  4. Data
    - Insert sample tour data
*/

-- Create tours table
CREATE TABLE IF NOT EXISTS tours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  year integer NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  is_active boolean DEFAULT false,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate them
DO $$
BEGIN
  -- Drop policies if they exist
  DROP POLICY IF EXISTS "Authenticated users can read tours" ON tours;
  DROP POLICY IF EXISTS "Authenticated users can insert tours" ON tours;
  DROP POLICY IF EXISTS "Authenticated users can update tours" ON tours;
  DROP POLICY IF EXISTS "Authenticated users can delete tours" ON tours;
  
  -- Create new policies
  CREATE POLICY "Authenticated users can read tours"
    ON tours
    FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Authenticated users can insert tours"
    ON tours
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

  CREATE POLICY "Authenticated users can update tours"
    ON tours
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

  CREATE POLICY "Authenticated users can delete tours"
    ON tours
    FOR DELETE
    TO authenticated
    USING (true);
END $$;

-- Create indexes (with IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_tours_is_active ON tours(is_active);
CREATE INDEX IF NOT EXISTS idx_tours_year ON tours(year);

-- Create or replace the update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists, then create new one
DO $$
BEGIN
  DROP TRIGGER IF EXISTS update_tours_updated_at ON tours;
  
  CREATE TRIGGER update_tours_updated_at
    BEFORE UPDATE ON tours
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
END $$;

-- Insert sample tour data (only if it doesn't exist)
INSERT INTO tours (name, year, start_date, is_active, description)
SELECT 
  'Portugal Golf Tour 2025',
  2025,
  '2025-06-15 09:00:00+00',
  true,
  'Annual golf tour to the beautiful Algarve region of Portugal'
WHERE NOT EXISTS (
  SELECT 1 FROM tours WHERE name = 'Portugal Golf Tour 2025' AND year = 2025
);