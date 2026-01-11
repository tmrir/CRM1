-- أولاً: عرض جميع المستخدمين الحاليين
SELECT id, name, username, email, role, created_at 
FROM employees 
ORDER BY created_at;

-- ثم: تحديث دور المستخدم المطلوب إلى Admin
-- استبدل 'user@example.com' بالبريد الإلكتروني الصحيح
UPDATE employees 
SET role = 'Admin' 
WHERE email = 'user@example.com';

-- التحقق من التحديث
SELECT id, name, username, email, role 
FROM employees 
WHERE email = 'user@example.com';
