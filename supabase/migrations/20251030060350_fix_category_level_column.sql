-- Fix categories.level column to allow NULL or set default
-- The level column represents category hierarchy depth

-- Make level column nullable (or set a default value of 0)
ALTER TABLE categories ALTER COLUMN level DROP NOT NULL;

-- Alternatively, if you want to keep NOT NULL, set a default:
-- ALTER TABLE categories ALTER COLUMN level SET DEFAULT 0;

-- Update any existing NULL values to 0
UPDATE categories SET level = 0 WHERE level IS NULL;

-- Add comment
COMMENT ON COLUMN categories.level IS 'Hierarchy depth level (0=top-level, 1=sub-category, etc.)';
