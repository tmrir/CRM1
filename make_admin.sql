-- تحديث دور المستخدم إلى Admin
-- استبدل 'user@example.com' بالبريد الإلكتروني للمستخدم الجديد

UPDATE employees 
SET role = 'Admin' 
WHERE email = 'user@example.com';

-- أو إذا كنت تعرف UUID المستخدم
UPDATE employees 
SET role = 'Admin' 
WHERE id = 'USER_UUID_HERE';
