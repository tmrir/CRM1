# ========================================
# متغيرات البيئة لـ Vercel - Environment Variables
# ========================================

# 📋 قائمة متغيرات البيئة المطلوبة للنشر على Vercel

## 🔑 متغيرات Supabase الأساسية
NEXT_PUBLIC_SUPABASE_URL=https://spoceoewsaygajjoviip.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_yn10ajMhBgi2cOnX2x6kfA_KZFYYJLa
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwb2Nlb2V3c2F5Z2Fqam92aWlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzI3MjM4MiwiZXhwIjoyMDgyODQ4MzgyfQ.zCZCPNPr3Zwlbg3V3VsmnxieNsXTS2gTTv_2DXEQtBU

## 🗄️ متغيرات قاعدة البيانات PostgreSQL
POSTGRES_URL=postgresql://postgres:Hego!@34Hego@db.spoceoewsaygajjoviip.supabase.co:5432/postgres
POSTGRES_HOST=db.spoceoewsaygajjoviip.supabase.co
POSTGRES_USER=postgres
POSTGRES_PASSWORD=[YOUR-PASSWORD]
POSTGRES_DATABASE=postgres

## 🔐 متغيرات JWT
SUPABASE_JWT_SECRET=nJ6wDUNn0otAkL86hfudDGBZfgEw0jEPIT5tiiz7qzva5ZIG4x/GrGn484Zkhktcgz5CAFwMDcUgcGeZIwttCQ==

## 🌐 متغيرات إضافية (اختيارية)
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
NODE_ENV=production

# ========================================
# 📝 ملاحظات هامة:
# ========================================

# 1. استبدل [YOUR-PASSWORD] بكلمة المرور الحقيقية لقاعدة البيانات
# 2. استبدل https://your-app-name.vercel.app برابط تطبيقك الفعلي بعد النشر
# 3. المتغيرات التي تبدأ بـ NEXT_PUBLIC_ متاحة في المتصفح (Client-side)
# 4. المتغيرات الأخرى متاحة فقط في الخادم (Server-side)
# 5. احفظ هذه المتغيرات في مكان آمن ولا تشاركها

# ========================================
# 🚀 خطوات الإضافة في Vercel:
# ========================================

# 1. اذهب إلى dashboard.vercel.com
# 2. اختر مشروعك
# 3. اذهب إلى Settings > Environment Variables
# 4. أضف كل متغير على حدة:
#    - Name: اسم المتغير (مثال: NEXT_PUBLIC_SUPABASE_URL)
#    - Value: القيمة المقابلة
#    - Environment: Production, Preview, Development
# 5. اضغط على Save
# 6. أعد بناء المشروع (Redeploy)
