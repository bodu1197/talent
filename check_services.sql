-- 등록된 서비스와 seller 정보 확인
SELECT
  s.id,
  s.title,
  s.seller_id,
  s.status,
  s.created_at,
  sel.id as seller_table_id,
  sel.user_id,
  sel.business_name
FROM services s
LEFT JOIN sellers sel ON s.seller_id = sel.id
ORDER BY s.created_at DESC
LIMIT 10;
