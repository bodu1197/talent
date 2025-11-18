-- Add bank transfer related fields to advertising_payments
ALTER TABLE advertising_payments
ADD COLUMN IF NOT EXISTS depositor_phone TEXT,
ADD COLUMN IF NOT EXISTS depositor_email TEXT,
ADD COLUMN IF NOT EXISTS business_registration_number TEXT,
ADD COLUMN IF NOT EXISTS tax_invoice_requested BOOLEAN DEFAULT false;

-- Add package_type to advertising_subscriptions
ALTER TABLE advertising_subscriptions
ADD COLUMN IF NOT EXISTS package_type TEXT CHECK (package_type IN ('basic', 'standard', 'premium'));

-- Update existing rows to have a default package_type based on monthly_price
UPDATE advertising_subscriptions
SET package_type = CASE
  WHEN monthly_price <= 100000 THEN 'basic'
  WHEN monthly_price <= 200000 THEN 'standard'
  ELSE 'premium'
END
WHERE package_type IS NULL;
