-- Fix advertising FK relationships and ensure sellers.user_id FK exists
-- This migration ensures proper FK constraints for advertising tables

-- First, ensure sellers table has proper FK to users
ALTER TABLE sellers
DROP CONSTRAINT IF EXISTS sellers_user_id_fkey;

ALTER TABLE sellers
ADD CONSTRAINT sellers_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fix advertising_subscriptions seller_id FK
ALTER TABLE advertising_subscriptions
DROP CONSTRAINT IF EXISTS advertising_subscriptions_seller_id_fkey;

ALTER TABLE advertising_subscriptions
ADD CONSTRAINT advertising_subscriptions_seller_id_fkey
FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE;

-- Fix advertising_payments seller_id FK
ALTER TABLE advertising_payments
DROP CONSTRAINT IF EXISTS advertising_payments_seller_id_fkey;

ALTER TABLE advertising_payments
ADD CONSTRAINT advertising_payments_seller_id_fkey
FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE;
