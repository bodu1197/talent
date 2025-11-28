-- =============================================
-- service_packages RLS 정책 수정
-- 문제: services.seller_id = auth.uid() 체크가 잘못됨
-- 수정: sellers 테이블을 통해 user_id 비교
-- =============================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS service_packages_insert_policy ON service_packages;
DROP POLICY IF EXISTS service_packages_update_policy ON service_packages;
DROP POLICY IF EXISTS service_packages_delete_policy ON service_packages;

-- 새로운 INSERT 정책: sellers 테이블을 통해 user_id 비교
CREATE POLICY service_packages_insert_policy ON service_packages
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM services s
    JOIN sellers sel ON s.seller_id = sel.id
    WHERE s.id = service_packages.service_id
    AND sel.user_id = auth.uid()
  )
);

-- 새로운 UPDATE 정책
CREATE POLICY service_packages_update_policy ON service_packages
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM services s
    JOIN sellers sel ON s.seller_id = sel.id
    WHERE s.id = service_packages.service_id
    AND sel.user_id = auth.uid()
  )
);

-- 새로운 DELETE 정책
CREATE POLICY service_packages_delete_policy ON service_packages
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM services s
    JOIN sellers sel ON s.seller_id = sel.id
    WHERE s.id = service_packages.service_id
    AND sel.user_id = auth.uid()
  )
);
