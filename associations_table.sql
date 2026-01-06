-- ========================================
-- إضافة جدول الجمعيات (associations)
-- ========================================

CREATE TABLE IF NOT EXISTS associations (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT DEFAULT '',
    category TEXT DEFAULT '',
    email TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    website TEXT DEFAULT '',
    status TEXT NOT NULL CHECK (status IN ('new', 'contacted', 'not_contacted', 'response_rate')) DEFAULT 'new',
    response_rate INTEGER DEFAULT 0 CHECK (response_rate >= 0 AND response_rate <= 100),
    trust_score INTEGER DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_associations_status ON associations(status);
CREATE INDEX IF NOT EXISTS idx_associations_city ON associations(city);
CREATE INDEX IF NOT EXISTS idx_associations_category ON associations(category);

-- تطبيق الـ trigger لتحديث updated_at تلقائياً
CREATE TRIGGER update_associations_updated_at BEFORE UPDATE ON associations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- إضافة بيانات تجريبية (اختياري)
INSERT INTO associations (name, city, category, email, phone, status) 
VALUES 
    ('جمعية البركة الخيرية', 'الرياض', 'خيرية', 'info@albaraka.org', '0501234567', 'new'),
    ('جمعية الأمل للأيتام', 'جدة', 'أيتام', 'contact@alamal.org', '0509876543', 'contacted'),
    ('جمعية النور الاجتماعية', 'الدمام', 'اجتماعية', 'info@alnoor.org', '0551234567', 'not_contacted')
ON CONFLICT DO NOTHING;
