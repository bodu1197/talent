-- ============================================
-- Add RLS policies for errand_applications table
-- ============================================
-- Problem: RLS is enabled on errand_applications but no policies exist
-- This causes all INSERT/UPDATE/DELETE operations to fail
--
-- Solution: Add proper RLS policies for:
-- 1. SELECT: Anyone can view applications for public errands
-- 2. INSERT: Only authenticated helpers (with helper_profiles) can apply
-- 3. UPDATE: Only the requester or the helper who applied can update
-- 4. DELETE: Only the helper who applied can withdraw (soft delete via status)
-- ============================================

-- First, ensure RLS is enabled
ALTER TABLE errand_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS errand_applications_select_policy ON errand_applications;
DROP POLICY IF EXISTS errand_applications_insert_policy ON errand_applications;
DROP POLICY IF EXISTS errand_applications_update_policy ON errand_applications;
DROP POLICY IF EXISTS errand_applications_delete_policy ON errand_applications;

-- SELECT: Anyone can view applications (needed for requester to see who applied)
CREATE POLICY errand_applications_select_policy ON errand_applications
  FOR SELECT
  USING (true);

-- INSERT: Only authenticated users with a helper_profile can apply
-- The helper_id must match the authenticated user's helper_profile.id
CREATE POLICY errand_applications_insert_policy ON errand_applications
  FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM helper_profiles WHERE id = helper_id)
  );

-- UPDATE: Requester of the errand OR the helper who applied can update
-- Requester needs to update status (accept/reject)
-- Helper needs to update their application details
CREATE POLICY errand_applications_update_policy ON errand_applications
  FOR UPDATE
  USING (
    -- Helper who applied
    auth.uid() = (SELECT user_id FROM helper_profiles WHERE id = helper_id)
    OR
    -- Requester of the errand
    auth.uid() = (
      SELECT p.user_id
      FROM errands e
      JOIN profiles p ON e.requester_id = p.id
      WHERE e.id = errand_id
    )
  );

-- DELETE: Only the helper who applied can delete (though we use status for soft delete)
CREATE POLICY errand_applications_delete_policy ON errand_applications
  FOR DELETE
  USING (
    auth.uid() = (SELECT user_id FROM helper_profiles WHERE id = helper_id)
  );

-- ============================================
-- Also add RLS policies for errand_stops table
-- ============================================
ALTER TABLE errand_stops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS errand_stops_select_policy ON errand_stops;
DROP POLICY IF EXISTS errand_stops_insert_policy ON errand_stops;
DROP POLICY IF EXISTS errand_stops_update_policy ON errand_stops;
DROP POLICY IF EXISTS errand_stops_delete_policy ON errand_stops;

-- SELECT: Anyone can view stops for public errands
CREATE POLICY errand_stops_select_policy ON errand_stops
  FOR SELECT
  USING (true);

-- INSERT: Only the requester of the errand can add stops
CREATE POLICY errand_stops_insert_policy ON errand_stops
  FOR INSERT
  WITH CHECK (
    auth.uid() = (
      SELECT p.user_id
      FROM errands e
      JOIN profiles p ON e.requester_id = p.id
      WHERE e.id = errand_id
    )
  );

-- UPDATE: Only the requester of the errand can update stops
CREATE POLICY errand_stops_update_policy ON errand_stops
  FOR UPDATE
  USING (
    auth.uid() = (
      SELECT p.user_id
      FROM errands e
      JOIN profiles p ON e.requester_id = p.id
      WHERE e.id = errand_id
    )
  );

-- DELETE: Only the requester of the errand can delete stops
CREATE POLICY errand_stops_delete_policy ON errand_stops
  FOR DELETE
  USING (
    auth.uid() = (
      SELECT p.user_id
      FROM errands e
      JOIN profiles p ON e.requester_id = p.id
      WHERE e.id = errand_id
    )
  );

-- ============================================
-- Comments
-- ============================================
COMMENT ON POLICY errand_applications_select_policy ON errand_applications IS 'Anyone can view applications';
COMMENT ON POLICY errand_applications_insert_policy ON errand_applications IS 'Only helpers with valid helper_profiles can apply';
COMMENT ON POLICY errand_applications_update_policy ON errand_applications IS 'Requester or helper can update applications';
COMMENT ON POLICY errand_applications_delete_policy ON errand_applications IS 'Only the helper who applied can delete';

COMMENT ON POLICY errand_stops_select_policy ON errand_stops IS 'Anyone can view errand stops';
COMMENT ON POLICY errand_stops_insert_policy ON errand_stops IS 'Only requester can add stops';
COMMENT ON POLICY errand_stops_update_policy ON errand_stops IS 'Only requester can update stops';
COMMENT ON POLICY errand_stops_delete_policy ON errand_stops IS 'Only requester can delete stops';
