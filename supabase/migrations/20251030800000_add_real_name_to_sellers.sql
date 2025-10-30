-- Add real_name column to sellers table (from identity verification)
ALTER TABLE sellers
ADD COLUMN IF NOT EXISTS real_name text;

-- Add comment
COMMENT ON COLUMN sellers.real_name IS 'Real name from NICE identity verification';
