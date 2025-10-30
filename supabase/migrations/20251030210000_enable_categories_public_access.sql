-- Enable RLS on categories table
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read active categories (public data)
CREATE POLICY "Anyone can view active categories"
    ON public.categories FOR SELECT
    TO public
    USING (is_active = true);

-- Only authenticated users can view all categories (including inactive)
CREATE POLICY "Authenticated users can view all categories"
    ON public.categories FOR SELECT
    TO authenticated
    USING (true);
