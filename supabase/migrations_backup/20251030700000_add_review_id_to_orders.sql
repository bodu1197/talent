-- Add review_id column to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS review_id uuid REFERENCES reviews(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS orders_review_id_idx ON orders(review_id);

-- Add comment
COMMENT ON COLUMN orders.review_id IS 'Reference to review if buyer has written one for this order';
