-- Enable RLS for company_info table
ALTER TABLE public.company_info ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for company_info (public read access since it's company information)
CREATE POLICY "Allow public read access to company info"
ON public.company_info
FOR SELECT
TO public
USING (true);

-- Allow authenticated users with admin role to update company info
CREATE POLICY "Allow admins to update company info"
ON public.company_info
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.admins
    WHERE admins.user_id = auth.uid()
    AND admins.role = 'super_admin'
  )
);

-- Allow admins to insert company info
CREATE POLICY "Allow admins to insert company info"
ON public.company_info
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.admins
    WHERE admins.user_id = auth.uid()
    AND admins.role = 'super_admin'
  )
);

-- Allow admins to delete company info
CREATE POLICY "Allow admins to delete company info"
ON public.company_info
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.admins
    WHERE admins.user_id = auth.uid()
    AND admins.role = 'super_admin'
  )
);
