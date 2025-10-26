-- =====================================================
-- Enhance schema for project features
-- Date: 2025-10-26
-- Description: Add columns to seller_profiles, create service_packages table
-- =====================================================

-- =====================================================
-- 1. Create seller_profiles table if not exists
-- =====================================================

-- Create seller_profiles table
CREATE TABLE IF NOT EXISTS public.seller_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(255),
  description TEXT,
  skills TEXT,
  rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
  total_reviews INTEGER DEFAULT 0 CHECK (total_reviews >= 0),
  total_sales INTEGER DEFAULT 0 CHECK (total_sales >= 0),
  response_time VARCHAR(50),
  bank_name VARCHAR(100),
  bank_account VARCHAR(100),
  account_holder VARCHAR(100),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes if not exist
CREATE INDEX IF NOT EXISTS idx_seller_profiles_rating ON seller_profiles(rating DESC);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_total_sales ON seller_profiles(total_sales DESC);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_is_verified ON seller_profiles(is_verified);

-- Enable RLS
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if not exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'seller_profiles' AND policyname = 'seller_profiles_select_policy') THEN
    CREATE POLICY "seller_profiles_select_policy" ON seller_profiles FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'seller_profiles' AND policyname = 'seller_profiles_insert_policy') THEN
    CREATE POLICY "seller_profiles_insert_policy" ON seller_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'seller_profiles' AND policyname = 'seller_profiles_update_policy') THEN
    CREATE POLICY "seller_profiles_update_policy" ON seller_profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'seller_profiles' AND policyname = 'seller_profiles_delete_policy') THEN
    CREATE POLICY "seller_profiles_delete_policy" ON seller_profiles FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger
DROP TRIGGER IF EXISTS update_seller_profiles_updated_at ON seller_profiles;
CREATE TRIGGER update_seller_profiles_updated_at
  BEFORE UPDATE ON seller_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add column comments
COMMENT ON TABLE seller_profiles IS 'Seller profile information';
COMMENT ON COLUMN seller_profiles.skills IS 'Seller skills/tools (comma separated)';
COMMENT ON COLUMN seller_profiles.bank_name IS 'Settlement account bank name';
COMMENT ON COLUMN seller_profiles.bank_account IS 'Settlement account number';
COMMENT ON COLUMN seller_profiles.account_holder IS 'Settlement account holder name';

-- =====================================================
-- 2. Create ai_services table if not exists
-- =====================================================

-- Create ai_services table
CREATE TABLE IF NOT EXISTS public.ai_services (
  service_id UUID PRIMARY KEY REFERENCES services(id) ON DELETE CASCADE,
  ai_tool VARCHAR(255) NOT NULL,
  version VARCHAR(50),
  features TEXT[] DEFAULT '{}',
  sample_prompts TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_ai_services_ai_tool ON ai_services(ai_tool);

-- Enable RLS
ALTER TABLE public.ai_services ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if not exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_services' AND policyname = 'ai_services_select_policy') THEN
    CREATE POLICY "ai_services_select_policy" ON ai_services FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_services' AND policyname = 'ai_services_insert_policy') THEN
    CREATE POLICY "ai_services_insert_policy" ON ai_services FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM services
          WHERE services.id = service_id
          AND services.seller_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_services' AND policyname = 'ai_services_update_policy') THEN
    CREATE POLICY "ai_services_update_policy" ON ai_services FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM services
          WHERE services.id = service_id
          AND services.seller_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM services
          WHERE services.id = service_id
          AND services.seller_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_services' AND policyname = 'ai_services_delete_policy') THEN
    CREATE POLICY "ai_services_delete_policy" ON ai_services FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM services
          WHERE services.id = service_id
          AND services.seller_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Add trigger
DROP TRIGGER IF EXISTS update_ai_services_updated_at ON ai_services;
CREATE TRIGGER update_ai_services_updated_at
  BEFORE UPDATE ON ai_services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE ai_services IS 'AI service additional information';
COMMENT ON COLUMN ai_services.ai_tool IS 'AI tool name (e.g. ChatGPT, Midjourney)';
COMMENT ON COLUMN ai_services.version IS 'AI tool version';
COMMENT ON COLUMN ai_services.features IS 'AI service features list';
COMMENT ON COLUMN ai_services.sample_prompts IS 'Sample prompts list';

-- =====================================================
-- 3. Create service_packages table
-- =====================================================

-- Service packages table (BASIC/STANDARD/PREMIUM)
CREATE TABLE IF NOT EXISTS public.service_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  package_type TEXT NOT NULL CHECK (package_type IN ('BASIC', 'STANDARD', 'PREMIUM')),

  -- Package information
  name VARCHAR(100) NOT NULL,
  description TEXT,

  -- Pricing and work information
  price INTEGER NOT NULL CHECK (price > 0),
  delivery_days INTEGER NOT NULL CHECK (delivery_days > 0),
  revision_count INTEGER DEFAULT 1 CHECK (revision_count >= 0),

  -- Included features
  features TEXT[] DEFAULT '{}',

  -- Additional options
  is_express_available BOOLEAN DEFAULT FALSE,
  express_days INTEGER CHECK (express_days > 0),
  express_price INTEGER CHECK (express_price > 0),

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One package type per service
  UNIQUE(service_id, package_type)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_service_packages_service ON public.service_packages(service_id);
CREATE INDEX IF NOT EXISTS idx_service_packages_type ON public.service_packages(package_type);
CREATE INDEX IF NOT EXISTS idx_service_packages_active ON public.service_packages(is_active);

-- Add table comments
COMMENT ON TABLE service_packages IS 'Service package information (BASIC/STANDARD/PREMIUM)';
COMMENT ON COLUMN service_packages.service_id IS 'Service ID';
COMMENT ON COLUMN service_packages.package_type IS 'Package type (BASIC/STANDARD/PREMIUM)';
COMMENT ON COLUMN service_packages.features IS 'Included features/items';

-- Add updated_at trigger
CREATE TRIGGER update_service_packages_updated_at
  BEFORE UPDATE ON public.service_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. RLS Policies for service_packages
-- =====================================================

-- Enable RLS
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;

-- Active packages are viewable by everyone
CREATE POLICY "Active packages are viewable by everyone"
  ON public.service_packages FOR SELECT
  USING (
    is_active = true
    OR EXISTS (
      SELECT 1 FROM public.services s
      WHERE s.id = service_id
      AND s.seller_id = auth.uid()
    )
  );

-- Service owners can create packages
CREATE POLICY "Service owners can create packages"
  ON public.service_packages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.services s
      WHERE s.id = service_id
      AND s.seller_id = auth.uid()
    )
  );

-- Service owners can update packages
CREATE POLICY "Service owners can update packages"
  ON public.service_packages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.services s
      WHERE s.id = service_id
      AND s.seller_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.services s
      WHERE s.id = service_id
      AND s.seller_id = auth.uid()
    )
  );

-- Service owners can delete packages
CREATE POLICY "Service owners can delete packages"
  ON public.service_packages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.services s
      WHERE s.id = service_id
      AND s.seller_id = auth.uid()
    )
  );

-- =====================================================
-- 5. Add package type column to orders
-- =====================================================

-- Add selected package type column to orders
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS package_type TEXT CHECK (package_type IN ('BASIC', 'STANDARD', 'PREMIUM'));

COMMENT ON COLUMN orders.package_type IS 'Selected service package type when ordering';

-- =====================================================
-- 6. Update schema version
-- =====================================================

INSERT INTO public.schema_migrations (version) VALUES ('005_enhance_schema_for_project')
ON CONFLICT (version) DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Schema enhancement completed successfully!';
  RAISE NOTICE '- seller_profiles: Added skills, bank_name, bank_account, account_holder columns';
  RAISE NOTICE '- service_packages table created (BASIC/STANDARD/PREMIUM)';
  RAISE NOTICE '- orders table: Added package_type column';
END $$;
