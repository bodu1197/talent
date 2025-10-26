-- admins 테이블에서 ohyus1197@gmail.com 확인
SELECT * FROM admins WHERE user_id IN (SELECT id FROM users WHERE email = 'ohyus1197@gmail.com');

-- 모든 admins 조회
SELECT
    a.*,
    u.email,
    u.name,
    u.user_type
FROM admins a
JOIN users u ON a.user_id = u.id;
