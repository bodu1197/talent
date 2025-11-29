-- Add RLS policies for service_views and service_favorites tables
-- Allow service owners to read statistics for their own services

-- Policy for service_views table
-- Allows service owners to view their service's view statistics
CREATE POLICY "service_owner_can_view_stats" ON service_views
  FOR SELECT
  USING (
    service_id IN (
      SELECT s.id FROM services s
      INNER JOIN sellers sel ON s.seller_id = sel.id
      WHERE sel.user_id = auth.uid()
    )
  );

-- Policy for service_favorites table
-- Allows service owners to view their service's favorite statistics
CREATE POLICY "service_owner_can_view_favorites" ON service_favorites
  FOR SELECT
  USING (
    service_id IN (
      SELECT s.id FROM services s
      INNER JOIN sellers sel ON s.seller_id = sel.id
      WHERE sel.user_id = auth.uid()
    )
  );
