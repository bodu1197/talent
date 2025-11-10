-- Add revision tracking fields to orders table

-- Add revision_reason column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'revision_reason'
  ) THEN
    ALTER TABLE orders ADD COLUMN revision_reason TEXT;
  END IF;
END $$;

-- Add revision_requested_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'revision_requested_at'
  ) THEN
    ALTER TABLE orders ADD COLUMN revision_requested_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Add comment
COMMENT ON COLUMN orders.revision_reason IS '수정 요청 사유';
COMMENT ON COLUMN orders.revision_requested_at IS '수정 요청 시간';
