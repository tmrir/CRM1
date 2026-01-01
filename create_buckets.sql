-- ========================================
-- إنشاء Bucket في Supabase Storage
-- ========================================

-- ملاحظة: هذه الأوامر يجب تنفيذها من لوحة تحكم Supabase
-- وليس عبر SQL Editor العادي

-- ========================================
-- الطريقة الأولى: من لوحة تحكم Supabase
-- ========================================

-- 1. اذهب إلى Storage في القائمة الجانبية
-- 2. اضغط على "Create a new bucket"
-- 3. أدخل اسم الـ bucket (مثال: avatars)
-- 4. اختر Public أو Private
-- 5. اضغط على "Save"

-- ========================================
-- الطريقة الثانية: عبر SQL (باستخدام RLSQL)
-- ========================================

-- إنشاء bucket عام للصور الرمزية
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 1048576, ARRAY['image/jpeg', 'image/png', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- إنشاء bucket للمستندات
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('documents', 'documents', false, 10485760, ARRAY['application/pdf', 'application/msword', 'text/plain'])
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- إضافة صلاحيات الوصول للـ Buckets
-- ========================================

-- صلاحيات قراءة وكتابة لـ bucket الصور الرمزية
CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can view public avatars" ON storage.objects
FOR SELECT USING (
  bucket_id = 'avatars' AND 
  (storage.objectname() = auth.uid()::text OR public)
);

-- صلاحيات قراءة وكتابة لـ bucket المستندات
CREATE POLICY "Users can upload their own documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'documents' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can view their own documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'documents' AND 
  storage.objectname() = auth.uid()::text
);
