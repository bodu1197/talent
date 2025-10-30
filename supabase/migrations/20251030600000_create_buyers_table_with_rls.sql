-- Create buyers table if not exists
CREATE TABLE IF NOT EXISTS buyers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own buyer record" ON buyers;
DROP POLICY IF EXISTS "Users can insert their own buyer record" ON buyers;
DROP POLICY IF EXISTS "Users can update their own buyer record" ON buyers;

-- RLS Policies for buyers table
-- Policy: Users can view their own buyer record
CREATE POLICY "Users can view their own buyer record"
ON buyers FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own buyer record (auto-creation)
CREATE POLICY "Users can insert their own buyer record"
ON buyers FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own buyer record
CREATE POLICY "Users can update their own buyer record"
ON buyers FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS buyers_user_id_idx ON buyers(user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_buyers_updated_at ON buyers;
CREATE TRIGGER update_buyers_updated_at
  BEFORE UPDATE ON buyers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
