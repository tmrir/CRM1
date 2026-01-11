-- ========================================
-- إنشاء الجداول المطلوبة لتطبيق CRM
-- ========================================

-- 1. جدول الموظفين (employees)
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Corresponds to Supabase Auth user UUID
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT DEFAULT '',
    role TEXT NOT NULL CHECK (role IN ('Admin', 'Member', 'Supervisor')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. جدول المشاريع (projects)
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    is_public BOOLEAN DEFAULT FALSE,
    public_id TEXT UNIQUE DEFAULT gen_random_uuid()::text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. جدول المهام (tasks)
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('todo', 'inprogress', 'done')) DEFAULT 'todo',
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    due_date DATE NOT NULL,
    due_time TIME,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    sub_tasks JSONB DEFAULT '[]'::jsonb, -- Array of subtasks
    extension_count INTEGER DEFAULT 0,
    assistance_requested BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- إنشاء مستخدم افتراضي للدخول
-- ========================================

-- إضافة مستخدم admin افتراضي
INSERT INTO employees (id, name, username, email, avatar_url, role) 
VALUES (
    gen_random_uuid(),
    'مدير النظام',
    'admin',
    'admin@crm.com',
    '',
    'Admin'
) ON CONFLICT (email) DO NOTHING;

-- ========================================
-- إنشاء فهارس لتحسين الأداء
-- ========================================

-- فهارس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_username ON employees(username);
CREATE INDEX IF NOT EXISTS idx_tasks_employee_id ON tasks(employee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_projects_public_id ON projects(public_id) WHERE is_public = TRUE;

-- ========================================
-- إنشاء trigger لتحديث updated_at تلقائياً
-- ========================================

-- دالة لتحديث updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- تطبيق الـ trigger على الجداول
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- إضافة بعض البيانات الأولية (اختياري)
-- ========================================

-- إضافة مشروع تجريبي
INSERT INTO projects (name, description, progress) 
VALUES ('مشروع تجريبي', 'هذا مشروع تجريبي لاختبار النظام', 25)
ON CONFLICT DO NOTHING;

-- إضافة مهمة تجريبية
INSERT INTO tasks (description, status, priority, due_date, employee_id, project_id)
SELECT 
    'مهمة تجريبية أولى',
    'todo',
    'medium',
    CURRENT_DATE + INTERVAL '7 days',
    id,
    1
FROM employees 
WHERE username = 'admin' 
LIMIT 1
ON CONFLICT DO NOTHING;

-- ========================================
-- تم إنشاء الجداول بنجاح!
-- ========================================
