import React, { useState } from 'react';

const systemFeaturesReport = `
# تقرير شامل عن ميزات نظام Team-Task Manager

## 1. الملخص التنفيذي
نظام Team-Task Manager هو حل متخصص ومبسط لإدارة المشاريع وفرق العمل بكفاءة عالية. تم تصميم النظام ليكون الأداة المركزية لتنظيم المهام، ومتابعة تقدم المشاريع، وتعزيز التعاون بين أعضاء الفريق. يركز النظام على البساطة والوضوح، ويوفر الأدوات الأساسية التي تحتاجها الفرق لإنجاز أعمالها دون التعقيدات الموجودة في أنظمة ERP التقليدية.

---

## 2. لوحة التحكم الرئيسية (Dashboard)
توفر لوحة التحكم نظرة سريعة ومركزة على أهم مؤشرات الأداء المتعلقة بالمشاريع والمهام.
- **بطاقات الأداء الرئيسية (KPIs):** عرض فوري لعدد المشاريع الكلي، المهام النشطة، المهام المتأخرة، وعدد أعضاء الفريق.
- **نظرة عامة على المشاريع:** قائمة بجميع المشاريع الحالية مع مؤشر مرئي لنسبة الإنجاز لكل مشروع.
- **قوائم المهام الذكية:** عرض تلقائي للمهام المستحقة "اليوم" والمهام "المتأخرة" التي تحتاج إلى اهتمام فوري.

---

## 3. إدارة المشاريع
نظام مرن لإنشاء وتنظيم جميع مشاريع الفريق.
- **إنشاء المشاريع:** إمكانية إضافة مشاريع جديدة مع تحديد اسم ووصف لكل مشروع.
- **تتبع التقدم:** يتم حساب نسبة إنجاز كل مشروع تلقائيًا بناءً على حالة المهام المرتبطة به.
- **واجهة مركزية:** عرض جميع المشاريع في مكان واحد، مما يسهل على المدراء متابعة سير العمل العام.

---

## 4. إدارة المهام (Kanban Board)
قلب النظام، مصمم لتسهيل متابعة المهام اليومية.
- **لوحة كانبان (Kanban):** عرض مرئي للمهام مصنفة حسب حالتها (قيد التنفيذ، جاري العمل, مكتملة).
- **تفاصيل المهمة:** يمكن لكل مهمة أن تحتوي على وصف مفصل، أولوية (عالية، متوسطة، منخفضة)، تاريخ ووقت استحقاق، وتعيينها لعضو فريق معين.
- **المهام الفرعية (Sub-tasks):** إمكانية تقسيم المهام الكبيرة إلى خطوات أصغر قابلة للتنفيذ، مع تتبع نسبة الإنجاز للمهمة الرئيسية.
- **الربط بالمشاريع:** ربط كل مهمة بمشروع محدد لضمان تنظيم العمل.

---

## 5. إدارة الفريق والصلاحيات
أدوات بسيطة لإدارة أعضاء الفريق وأدوارهم.
- **إدارة الأعضاء:** إضافة أعضاء الفريق وتحديث معلوماتهم.
- **أدوار المستخدمين:** تحديد دور كل عضو (مدير أو عضو) للتحكم في صلاحيات الإضافة والتعديل.
- **تعيين المهام:** سهولة إسناد المهام لأي عضو في الفريق مباشرة من خلال نموذج إضافة المهمة.

---

## 6. التقويم التفاعلي
أداة مرئية لتخطيط الوقت وإدارة المواعيد النهائية.
- **عرض شهري:** رؤية شاملة لجميع المهام المجدولة خلال الشهر.
- **إضافة سريعة:** إمكانية إضافة مهام جديدة مباشرة من التقويم بالضغط على اليوم المطلوب.
- **وضوح المواعيد:** تمييز اليوم الحالي وتوفير لمحة سريعة عن كثافة العمل في الأيام المختلفة.

---

## 7. التقارير الذكية
توليد تقارير تلقائية لقياس أداء الفريق والمشاريع.
- **تقرير أداء الموظفين:** جدول يوضح أداء كل موظف بناءً على عدد المهام المسندة إليه، ومعدل إنجازه للمهام في الوقت المحدد.
- **تقرير حالة المشاريع:** جدول يلخص حالة كل مشروع، بما في ذلك نسبة التقدم، وعدد المهام الإجمالي والمكتملة والمتأخرة.
- **تصدير البيانات:** إمكانية تصدير جميع التقارير إلى ملفات Excel أو PDF قابلة للطباعة لمشاركتها أو أرشفتها.

---

## 8. نظام الإشعارات
آلية استباقية لإبقاء الفريق على اطلاع دائم.
- **تنبيهات المتصفح:** إرسال إشعارات تلقائية لتذكير المستخدمين بالمهام التي تقترب من موعد استحقاقها أو التي تجاوزته بالفعل، مما يساعد على تقليل التأخير.
`;

const SystemReportView: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [report, setReport] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);

    const handleGenerateReport = () => {
        setIsLoading(true);
        setReport('');
        
        setTimeout(() => {
            setReport(systemFeaturesReport.trim());
            setIsLoading(false);
        }, 500);
    };

    const handleCopy = () => {
        if (report) {
            navigator.clipboard.writeText(report);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">تقرير ميزات النظام</h2>
            <p className="text-slate-400 mb-8">
                احصل على تقرير مفصل يصف جميع الميزات والقدرات المتاحة في نظام Team-Task Manager. هذا التقرير مثالي لمشاركته مع فريقك أو أصحاب المصلحة.
            </p>
            <div className="text-center mb-8">
                <button
                    onClick={handleGenerateReport}
                    disabled={isLoading}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg text-base transition-colors disabled:bg-slate-600 disabled:cursor-wait flex items-center gap-2 mx-auto"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <span>جاري إنشاء التقرير...</span>
                        </>
                    ) : (
                        <span>إنشاء تقرير الميزات</span>
                    )}
                </button>
            </div>

            {report && (
                <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
                    <div className="relative">
                        <textarea
                            readOnly
                            value={report}
                            className="w-full h-[500px] p-4 bg-slate-900 border border-slate-700 rounded-md text-slate-300 text-sm leading-7 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            aria-label="تقرير ميزات النظام"
                        />
                        <button
                            onClick={handleCopy}
                            className="absolute top-3 left-3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-1 px-3 rounded-md text-xs transition-colors"
                        >
                            {copySuccess ? 'تم النسخ!' : 'نسخ'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SystemReportView;
