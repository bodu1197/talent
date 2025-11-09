-- Fix services.seller_id foreign key to reference sellers.id instead of users.id

-- Drop incorrect foreign key
ALTER TABLE "public"."services"
DROP CONSTRAINT IF EXISTS "services_seller_id_fkey";

-- Add correct foreign key
ALTER TABLE "public"."services"
ADD CONSTRAINT "services_seller_id_fkey"
FOREIGN KEY ("seller_id")
REFERENCES "public"."sellers"("id")
ON DELETE CASCADE;

COMMENT ON CONSTRAINT "services_seller_id_fkey" ON "public"."services"
IS 'Foreign key to sellers table (not users table)';
