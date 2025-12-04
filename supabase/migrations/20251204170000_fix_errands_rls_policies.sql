-- ============================================
-- Fix errands RLS policies to use profiles.user_id
-- ============================================
-- Problem: RLS policies were checking auth.uid() = requester_id
-- but requester_id references profiles.id (not auth.users.id)
-- This caused INSERT to fail with RLS violation
--
-- Solution: Check auth.uid() against the user_id from profiles table
-- ============================================

-- Fix INSERT policy
DROP POLICY IF EXISTS errands_insert_policy ON errands;
CREATE POLICY errands_insert_policy ON errands
  FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM profiles WHERE id = requester_id)
  );

-- Fix UPDATE policy
DROP POLICY IF EXISTS errands_update_policy ON errands;
CREATE POLICY errands_update_policy ON errands
  FOR UPDATE
  USING (
    auth.uid() = (SELECT user_id FROM profiles WHERE id = requester_id)
    OR auth.uid() = (SELECT user_id FROM profiles WHERE id = helper_id)
  );

-- Fix DELETE policy
DROP POLICY IF EXISTS errands_delete_policy ON errands;
CREATE POLICY errands_delete_policy ON errands
  FOR DELETE
  USING (
    auth.uid() = (SELECT user_id FROM profiles WHERE id = requester_id)
    AND status = 'OPEN'
  );

-- SELECT policy remains unchanged (allows all to read)
-- errands_select_policy: USING (true)

-- ============================================
-- Comments
-- ============================================
COMMENT ON POLICY errands_insert_policy ON errands IS 'Users can only create errands for themselves (via profiles.user_id)';
COMMENT ON POLICY errands_update_policy ON errands IS 'Requester or helper can update their errands';
COMMENT ON POLICY errands_delete_policy ON errands IS 'Only requester can delete OPEN errands';
