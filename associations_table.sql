-- ========================================
-- تحديث جدول الجمعيات ليتوافق مع الهيكل الجديد
-- ========================================

-- حذف الجدول القديم إذا كان موجوداً
DROP TABLE IF EXISTS associations CASCADE;

-- إنشاء جدول الجمعيات بالهيكل الجديد
CREATE TABLE IF NOT EXISTS associations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    city TEXT NOT NULL,
    region TEXT NOT NULL,
    main_category TEXT NOT NULL,
    sub_category TEXT,
    donation_link TEXT,
    target_audience TEXT DEFAULT 'General',
    response_status TEXT DEFAULT 'جديد',
    contact TEXT,
    email TEXT,
    website TEXT,
    status TEXT NOT NULL CHECK (status IN ('new', 'contacted', 'not_contacted', 'response_rate')) DEFAULT 'new',
    response_rate INTEGER CHECK (response_rate >= 0 AND response_rate <= 100),
    trust_score INTEGER DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- إنشاء فهارس لتحسين الأداء
-- ========================================

CREATE INDEX IF NOT EXISTS idx_associations_name ON associations(name);
CREATE INDEX IF NOT EXISTS idx_associations_phone ON associations(phone);
CREATE INDEX IF NOT EXISTS idx_associations_city ON associations(city);
CREATE INDEX IF NOT EXISTS idx_associations_region ON associations(region);
CREATE INDEX IF NOT EXISTS idx_associations_status ON associations(status);
CREATE INDEX IF NOT EXISTS idx_associations_main_category ON associations(main_category);

-- ========================================
-- إنشاء trigger لتحديث updated_at تلقائياً
-- ========================================

CREATE TRIGGER update_associations_updated_at BEFORE UPDATE ON associations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- إضافة بيانات أولية للجمعيات من جميع مناطق المملكة
-- ========================================

INSERT INTO associations (name, phone, city, region, main_category, sub_category, donation_link, target_audience, response_status, contact, email, website, status) 
VALUES 
    ('جمعية البر الخيرية', '0123456789', 'الرياض', 'المنطقة الوسطى', 'خيرية', 'اجتماعية', 'https://albir.org/donate', 'عام', 'جديد', 'أحمد محمد', 'info@albir.org', 'https://albir.org', 'new'),
    ('جمعية الأطفال المحتاجين', '0132345678', 'جدة', 'المنطقة الوسطى', 'خيرية', 'أطفال', 'https://children.org/donate', 'أطفال', 'جديد', 'فاطمة أحمد', 'info@children.org', 'https://children.org', 'new'),
    ('جمعية المساعدة الطبية', '0143456789', 'الدمام', 'المنطقة الغربية', 'طبية', 'صحة', 'https://medical.org/donate', 'مرضى', 'جديد', 'د. خالد', 'info@medical.org', 'https://medical.org', 'new'),
    ('جمعية الأيتام السعوديين', '0174567890', 'أبها', 'منطقة عسير', 'خيرية', 'أيتام', 'https://orphans.org/donate', 'أيتام', 'جديد', 'محمد علي', 'info@orphans.org', 'https://orphans.org', 'new'),
    ('جمعية تبوك للتنمية', '0145678901', 'تبوك', 'منطقة تبوك', 'تنمية', 'مجتمعية', 'https://tabuk.org/donate', 'عام', 'جديد', 'عبدالله سالم', 'info@tabuk.org', 'https://tabuk.org', 'new'),
    ('جمعية حائل الخيرية', '0166789012', 'حائل', 'منطقة حائل', 'خيرية', 'اجتماعية', 'https://hael.org/donate', 'عام', 'جديد', 'خالد العتيبي', 'info@hael.org', 'https://hael.org', 'new'),
    ('جمعية القصيم الخيرية', '0167890123', 'بريدة', 'منطقة القصيم', 'خيرية', 'اجتماعية', 'https://qassim.org/donate', 'عام', 'جديد', 'ناصر العبدالله', 'info@qassim.org', 'https://qassim.org', 'new'),
    ('جمعية جازان للإغاثة', '0178901234', 'جازان', 'منطقة جازان', 'إغاثة', 'طوارئ', 'https://jazan.org/donate', 'متضررين', 'جديد', 'سالم أحمد', 'info@jazan.org', 'https://jazan.org', 'new'),
    ('جمعية نجران الخيرية', '0179012345', 'نجران', 'منطقة نجران', 'خيرية', 'اجتماعية', 'https://najran.org/donate', 'عام', 'جديد', 'عبدالعزيز محمد', 'info@najran.org', 'https://najran.org', 'new'),
    ('جمعية الباحة للتنمية', '0170123456', 'الباحة', 'منطقة الباحة', 'تنمية', 'مجتمعية', 'https://bahah.org/donate', 'عام', 'جديد', 'محمد الغامدي', 'info@bahah.org', 'https://bahah.org', 'new'),
    ('جمعية الجوف الخيرية', '0141234567', 'الجوف', 'منطقة الجوف', 'خيرية', 'اجتماعية', 'https://jouf.org/donate', 'عام', 'جديد', 'عبدالرحمن السعيد', 'info@jouf.org', 'https://jouf.org', 'new'),
    ('جمعية الحدود الشمالية', '0142345678', 'عرعر', 'منطقة الحدود الشمالية', 'خيرية', 'اجتماعية', 'https://north.org/donate', 'عام', 'جديد', 'فهد الشمري', 'info@north.org', 'https://north.org', 'new'),
    ('جمعية رعاية الأيتام بالرياض', '0113456789', 'الرياض', 'المنطقة الوسطى', 'خيرية', 'أيتام', 'https://orphans-riyadh.org/donate', 'أيتام', 'جديد', 'سعود العبدالله', 'info@orphans-riyadh.org', 'https://orphans-riyadh.org', 'new'),
    ('جمعية المساعدة للمعاقين', '0124567890', 'الرياض', 'المنطقة الوسطى', 'خيرية', 'معاقين', 'https://disabled.org/donate', 'معاقين', 'جديد', 'نورة أحمد', 'info@disabled.org', 'https://disabled.org', 'new'),
    ('جمعية المساعدة التعليمية', '0135678901', 'مكة', 'المنطقة الغربية', 'تعليمية', 'تعليم', 'https://education.org/donate', 'طلاب', 'جديد', 'عبدالله محمد', 'info@education.org', 'https://education.org', 'new'),
    ('جمعية رعاية كبار السن', '0146789012', 'المدينة', 'المنطقة الغربية', 'خيرية', 'كبار السن', 'https://elderly.org/donate', 'كبار السن', 'جديد', 'فاطمة علي', 'info@elderly.org', 'https://elderly.org', 'new'),
    ('جمعية الإغاثة الإنسانية', '0157890123', 'الدمام', 'المنطقة الشرقية', 'إغاثة', 'طوارئ', 'https://humanitarian.org/donate', 'متضررين', 'جديد', 'خالد سالم', 'info@humanitarian.org', 'https://humanitarian.org', 'new'),
    ('جمعية دعم المرأة', '0168901234', 'الرياض', 'المنطقة الوسطى', 'تنمية', 'مرأة', 'https://women.org/donate', 'نساء', 'جديد', 'مريم أحمد', 'info@women.org', 'https://women.org', 'new'),
    ('جمعية الشباب والتطوير', '0179012345', 'جدة', 'المنطقة الغربية', 'تنمية', 'شباب', 'https://youth.org/donate', 'شباب', 'جديد', 'عبدالرحمن خالد', 'info@youth.org', 'https://youth.org', 'new')
ON CONFLICT DO NOTHING;

-- ========================================
-- تم إنشاء جدول الجمعيات بنجاح!
-- ========================================
