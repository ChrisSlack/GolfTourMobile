/*
  # Create tours table

  1. New Tables
    - `tours`
      - `id` (uuid, primary key)
      - `name` (text, required) - Name of the tour
      - `year` (integer, required) - Year of the tour
      - `start_date` (timestamptz, required) - Start date of the tour
      - `end_date` (timestamptz, optional) - End date of the tour
      - `is_active` (boolean, default false) - Whether this tour is currently active
      - `description` (text, optional) - Tour description
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `tours` table
    - Add policy for authenticated users to read tour data
    - Add policy for authenticated users to manage tours (insert/update/delete)

  3. Indexes
    - Add index on `is_active` for efficient querying of active tours
    - Add index on `year` for filtering by year
*/

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

-- Create policies for authenticated users
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tours_is_active ON tours (is_active);
CREATE INDEX IF NOT EXISTS idx_tours_year ON tours (year);

-- Create a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tours_updated_at
  BEFORE UPDATE ON tours
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();