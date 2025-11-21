-- Add INSERT policy for service_categories table
CREATE POLICY "Users can insert categories for their own services"
ON service_categories
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM services
    WHERE services.id = service_categories.service_id
    AND services.seller_id = auth.uid()
  )
);
