-- أولاً: عرض جميع المستخدمين الحاليين
SELECT id, name, username, email, role, created_at 
FROM employees 
ORDER BY created_at;

-- ثانياً: جعل المستخدم الجديد admin
-- استبدل 'new_user@example.com' بالبريد الإلكتروني للمستخدم الجديد
UPDATE employees 
SET role = 'Admin' 
WHERE email = 'new_user@example.com';

-- ثالثاً: إزالة المستخدم القديم
-- استبدل 'old_user@example.com' بالبريد الإلكتروني للمستخدم القديم
DELETE FROM employees 
WHERE email = 'old_user@example.com';

-- التحقق من النتيجة النهائية
SELECT id, name, username, email, role 
FROM employees 
ORDER BY role, name;
