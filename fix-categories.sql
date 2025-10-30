-- Fix categories table: set proper level values and enable RLS

-- Step 1: Update level for all categories based on parent_id hierarchy
-- Level 1: No parent (top level categories)
UPDATE public.categories
SET level = 1
WHERE parent_id IS NULL;

-- Level 2: Parent is level 1
UPDATE public.categories c
SET level = 2
WHERE c.parent_id IN (
  SELECT id FROM public.categories WHERE level = 1
);

-- Level 3: Parent is level 2
UPDATE public.categories c
SET level = 3
WHERE c.parent_id IN (
  SELECT id FROM public.categories WHERE level = 2
);

-- Step 2: Enable RLS on categories table
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view active categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can view all categories" ON public.categories;

-- Step 4: Create new RLS policies
-- Allow everyone to read active categories (public data for browsing)
CREATE POLICY "Anyone can view active categories"
    ON public.categories FOR SELECT
    TO public
    USING (is_active = true);

-- Authenticated users can view all categories (including inactive ones for admin)
CREATE POLICY "Authenticated users can view all categories"
    ON public.categories FOR SELECT
    TO authenticated
    USING (true);

-- Step 5: Verify results
SELECT
  level,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE is_active = true) as active_count
FROM public.categories
WHERE level IS NOT NULL
GROUP BY level
ORDER BY level;

-- Step 6: Show sample level 1 categories
SELECT id, name, slug, level, is_active
FROM public.categories
WHERE level = 1 AND is_active = true
ORDER BY display_order
LIMIT 20;
