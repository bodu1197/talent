INSERT INTO public.admins (user_id, role, department)
SELECT id, 'super_admin', 'Management'
FROM auth.users
WHERE email = 'ohyus1197@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';
