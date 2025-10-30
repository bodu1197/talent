-- Create category_visits table for tracking user category browsing history
CREATE TABLE IF NOT EXISTS category_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  category_name text NOT NULL,
  category_slug text,
  visit_count integer DEFAULT 1 NOT NULL,
  last_visited_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,

  -- Unique constraint to prevent duplicate user-category pairs
  UNIQUE(user_id, category_id)
);

-- Enable RLS
ALTER TABLE category_visits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own category visits" ON category_visits;
DROP POLICY IF EXISTS "Users can insert their own category visits" ON category_visits;
DROP POLICY IF EXISTS "Users can update their own category visits" ON category_visits;

-- RLS Policies
CREATE POLICY "Users can view their own category visits"
ON category_visits FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own category visits"
ON category_visits FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own category visits"
ON category_visits FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS category_visits_user_id_idx ON category_visits(user_id);
CREATE INDEX IF NOT EXISTS category_visits_category_id_idx ON category_visits(category_id);
CREATE INDEX IF NOT EXISTS category_visits_last_visited_at_idx ON category_visits(last_visited_at DESC);

-- Create updated_at trigger
DROP TRIGGER IF EXISTS update_category_visits_updated_at ON category_visits;
CREATE TRIGGER update_category_visits_updated_at
  BEFORE UPDATE ON category_visits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
