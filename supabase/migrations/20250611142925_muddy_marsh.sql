/*
  # Create tours table

  1. New Tables
    - `tours`
      - `id` (uuid, primary key, default gen_random_uuid())
      - `name` (text, not null)
      - `year` (integer, not null)
      - `start_date` (timestamp with time zone, not null)
      - `end_date` (timestamp with time zone, nullable)
      - `is_active` (boolean, default false)
      - `description` (text, nullable)
      - `created_at` (timestamp with time zone, default now())
      - `updated_at` (timestamp with time zone, default now())

  2. Security
    - Enable RLS on `tours` table
    - Add policies for authenticated users to perform CRUD operations

  3. Indexes
    - Add index on `is_active` for quick filtering
    - Add index on `year` for year-based queries

  4. Sample Data
    - Insert Portugal Golf Tour 2025 as active tour
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

-- Create policies
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tours_is_active ON tours(is_active);
CREATE INDEX IF NOT EXISTS idx_tours_year ON tours(year);

-- Create trigger for updated_at
CREATE TRIGGER update_tours_updated_at
  BEFORE UPDATE ON tours
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample tour data
INSERT INTO tours (name, year, start_date, is_active, description)
VALUES (
  'Portugal Golf Tour 2025',
  2025,
  '2025-06-15 09:00:00+00',
  true,
  'Annual golf tour to the beautiful Algarve region of Portugal'
) ON CONFLICT DO NOTHING;
