INSERT INTO admins (user_id, role, department, notes)
SELECT id, 'super_admin', 'IT', '시스템 최고 관리자'
FROM users
WHERE email = 'ohyus1197@gmail.com';

SELECT * FROM admins;
