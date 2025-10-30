-- Add missing columns to categories table for categories-full.ts data

-- Add service_count column (tracks number of services in this category)
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS service_count INTEGER DEFAULT 0;

-- Add popularity_score column (for sorting by popularity)
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS popularity_score INTEGER DEFAULT 0;

-- Add keywords column (for search optimization)
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS keywords TEXT[] DEFAULT '{}';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_categories_popularity ON categories(popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_categories_service_count ON categories(service_count DESC);
CREATE INDEX IF NOT EXISTS idx_categories_keywords ON categories USING GIN(keywords);

-- Add comment
COMMENT ON COLUMN categories.service_count IS 'Number of services in this category';
COMMENT ON COLUMN categories.popularity_score IS 'Popularity score for sorting (higher = more popular)';
COMMENT ON COLUMN categories.keywords IS 'Search keywords for this category';
