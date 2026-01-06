import React, { useState, useMemo, useEffect } from 'react';
import type { Association, AssociationStatus } from '../types';
import Modal from './Modal';

interface AssociationsViewProps {
    // In a real app, these would come from props or a store. 
    // For now I'll manage local state or accept them if App.tsx passes them.
    // Assuming standard prop structure for consistency.
}

// 🔥 INITIAL MOCK DATA - بيانات تجريبية للعرض
const INITIAL_ASSOCIATIONS: Association[] = [
    {
        id: 1,
        name: 'جمعية البر الخيرية',
        city: 'الرياض',
        category: 'خيرية',
        email: 'info@albirr.org',
        phone: '0112345678',
        website: 'https://albirr.org',
        status: 'contacted',
        created_at: new Date().toISOString()
    },
    {
        id: 2,
        name: 'جمعية الإحسان',
        city: 'جدة',
        category: 'اجتماعية',
        email: 'contact@ihsan.org',
        phone: '0123456789',
        status: 'not_contacted',
        created_at: new Date().toISOString()
    },
    {
        id: 3,
        name: 'جمعية التعاون',
        city: 'الدمام',
        category: 'تعليمية',
        email: 'info@taawon.org',
        phone: '0134567890',
        status: 'response_rate',
        response_rate: 75,
        created_at: new Date().toISOString()
    },
    {
        id: 4,
        name: 'جمعية الأمل',
        city: 'مكة المكرمة',
        category: 'صحية',
        email: 'support@alamal.org',
        phone: '0145678901',
        status: 'contacted',
        created_at: new Date().toISOString()
    },
    {
        id: 5,
        name: 'جمعية النور',
        city: 'المدينة المنورة',
        category: 'ثقافية',
        email: 'info@alnoor.org',
        phone: '0156789012',
        status: 'new',
        created_at: new Date().toISOString()
    }
];

const AssociationsView: React.FC<AssociationsViewProps> = () => {
    // 🔥 DYNAMIC STATE with localStorage persistence
    const [associations, setAssociations] = useState<Association[]>(() => {
        // Load from localStorage on first render
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('crm_associations');
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (e) {
                    console.error('Failed to parse saved associations:', e);
                }
            }
        }
        // Return initial mock data if nothing saved
        return INITIAL_ASSOCIATIONS;
    });

    // 🔥 AUTO-SAVE to localStorage whenever associations change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('crm_associations', JSON.stringify(associations));
        }
    }, [associations]);

    // UI State
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [filterStatus, setFilterStatus] = useState<AssociationStatus | 'all'>('all');
    const [filterCity, setFilterCity] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Selection State
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // Quick Add State
    const [quickAddText, setQuickAddText] = useState('');
    const [targetStatus, setTargetStatus] = useState<AssociationStatus>('new');
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
    const [notification, setNotification] = useState<string>(''); // 🔥 NEW: Notification state

    // Migration/Move State
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [moveTarget, setMoveTarget] = useState<AssociationStatus | null>(null);
    const [responseRateInput, setResponseRateInput] = useState<number>(0);

    // Delete/Refresh State
    const [deleteMode, setDeleteMode] = useState<'all' | 'category' | 'city' | 'search' | 'selected'>('all');
    const [deleteCategory, setDeleteCategory] = useState('');
    const [deleteCity, setDeleteCity] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Stats
    const stats = useMemo(() => {
        return {
            total: associations.length,
            contacted: associations.filter(a => a.status === 'contacted').length,
            notContacted: associations.filter(a => a.status === 'not_contacted').length,
            responseRate: associations.filter(a => a.status === 'response_rate').length,
            avgResponse: 0 // Calculate if needed
        };
    }, [associations]);

    // 🔥 NEW: Show notification helper
    const showNotification = (message: string) => {
        setNotification(message);
        setTimeout(() => setNotification(''), 3000);
    };

    // 🔥 NEW: Quick add single association
    const handleQuickAddSingle = () => {
        const newAssociation: Association = {
            id: Date.now(),
            name: `جمعية جديدة ${associations.length + 1}`,
            city: 'الرياض',
            category: 'عامة',
            email: `info${associations.length + 1}@example.org`,
            phone: `05${Math.floor(Math.random() * 100000000)}`,
            status: 'contacted', // Add to "تم التواصل"
            created_at: new Date().toISOString()
        };

        setAssociations(prev => [...prev, newAssociation]);
        showNotification('✅ تمت إضافة جمعية جديدة إلى "تم التواصل" بنجاح!');
    };

    // Handlers
    const handleQuickAdd = () => {
        if (!quickAddText.trim()) {
            showNotification('⚠️ الرجاء إدخال بيانات للإضافة');
            return;
        }

        const lines = quickAddText.split('\n').filter(line => line.trim());
        const newAssociations: Association[] = lines.map((line, index) => {
            // Basic parsing logic: Name | City | Category | Email | Phone
            const parts = line.split(/[|\t,]+/).map(s => s.trim());
            return {
                id: Date.now() + index,
                name: parts[0] || 'Unknown',
                city: parts[1] || '',
                category: parts[2] || '',
                email: parts[3] || '',
                phone: parts[4] || '',
                status: targetStatus, // CRITICAL FIX: Use the selected target status
                created_at: new Date().toISOString()
            };
        }).filter(a => a.name !== 'Unknown');

        if (newAssociations.length === 0) {
            showNotification('⚠️ لم يتم العثور على بيانات صالحة');
            return;
        }

        setAssociations(prev => [...prev, ...newAssociations]);
        setQuickAddText('');
        setIsQuickAddOpen(false);

        // 🔥 CLEAR SUCCESS FEEDBACK
        const statusLabel = targetStatus === 'contacted' ? 'تم التواصل' :
            targetStatus === 'not_contacted' ? 'لم يتم التواصل' :
                targetStatus === 'response_rate' ? 'معدل الاستجابة' : 'جديد';
        showNotification(`✅ تمت إضافة ${newAssociations.length} جمعية إلى "${statusLabel}" بنجاح!`);
    };

    const handleImportPDF = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Placeholder for PDF import logic
        // For now, just simulate adding generic data
        alert("PDF Import logic would go here. Using dummy data for demo.");
        const dummy: Association = {
            id: Date.now(),
            name: "New Imported Association",
            city: "Riyadh",
            category: "Charity",
            email: "info@example.com",
            phone: "0500000000",
            status: targetStatus // Respect target status here too
        };
        setAssociations(prev => [...prev, dummy]);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(filteredAssociations.map(a => a.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleMoveSelected = (target: AssociationStatus) => {
        if (target === 'response_rate') {
            setMoveTarget('response_rate');
            setIsMoveModalOpen(true);
        } else {
            // Move immediately
            setAssociations(prev => prev.map(a =>
                selectedIds.includes(a.id) ? { ...a, status: target } : a
            ));
            setSelectedIds([]);
        }
    };

    const confirmMoveResponseRate = () => {
        setAssociations(prev => prev.map(a =>
            selectedIds.includes(a.id) ? { ...a, status: 'response_rate', response_rate: responseRateInput } : a
        ));
        setIsMoveModalOpen(false);
        setSelectedIds([]);
        setResponseRateInput(0);
    };

    // 🔥 NEW: Refresh data (reload from localStorage)
    const handleRefresh = () => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('crm_associations');
            if (saved) {
                try {
                    setAssociations(JSON.parse(saved));
                    showNotification('🔄 تم تحديث البيانات بنجاح');
                } catch (e) {
                    showNotification('❌ خطأ في تحديث البيانات');
                }
            }
        }
    };

    // 🔥 NEW: Remove duplicates
    const handleRemoveDuplicates = () => {
        const seen = new Set<string>();
        const unique = associations.filter(assoc => {
            const key = `${assoc.name.toLowerCase().trim()}|${assoc.email.toLowerCase().trim()}|${assoc.phone.trim()}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
        const removedCount = associations.length - unique.length;
        setAssociations(unique);
        showNotification(removedCount > 0 ? `🗑️ تم حذف ${removedCount} تكرار بنجاح` : '✅ لا يوجد تكرار');
    };

    // 🔥 NEW: Delete data based on criteria
    const handleDelete = () => {
        let filtered = [...associations];
        
        switch (deleteMode) {
            case 'category':
                filtered = associations.filter(a => a.category !== deleteCategory);
                break;
            case 'city':
                filtered = associations.filter(a => a.city !== deleteCity);
                break;
            case 'search':
                filtered = associations.filter(a => 
                    !a.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                    !a.city.toLowerCase().includes(searchTerm.toLowerCase())
                );
                break;
            case 'selected':
                filtered = associations.filter(a => !selectedIds.includes(a.id));
                setSelectedIds([]);
                break;
            case 'all':
                filtered = [];
                break;
        }
        
        const deletedCount = associations.length - filtered.length;
        setAssociations(filtered);
        setIsDeleteModalOpen(false);
        showNotification(`🗑️ تم حذف ${deletedCount} جمعية بنجاح`);
    };

    const filteredAssociations = associations.filter(a => {
        const matchStatus = filterStatus === 'all' || a.status === filterStatus;
        const matchSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.city.toLowerCase().includes(searchTerm.toLowerCase());
        return matchStatus && matchSearch;
    });

    return (
        <div className="space-y-6">
            {/* 🔥 NOTIFICATION TOAST */}
            {notification && (
                <div className="fixed top-4 right-4 z-50 bg-slate-800 border border-cyan-500 text-white px-6 py-3 rounded-lg shadow-2xl animate-fadeIn">
                    {notification}
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div onClick={() => setFilterStatus('all')} className="bg-slate-800 p-5 rounded-xl shadow-lg flex items-center gap-4 cursor-pointer hover:bg-slate-700/50 transition-colors">
                    <div className="p-3 rounded-full bg-purple-500/20 text-purple-400">
                        <div className="w-6 h-6 bg-current rounded-full opacity-20"></div>
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-medium">إجمالي الجمعيات</p>
                        <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
                    </div>
                </div>
                <div onClick={() => setFilterStatus('contacted')} className="bg-slate-800 p-5 rounded-xl shadow-lg flex items-center gap-4 cursor-pointer hover:bg-slate-700/50 transition-colors">
                    <div className="p-3 rounded-full bg-cyan-500/20 text-cyan-400">
                        <div className="w-6 h-6 bg-current rounded-full opacity-20"></div>
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-medium">تم التواصل</p>
                        <p className="text-2xl font-bold text-white mt-1">{stats.contacted}</p>
                    </div>
                </div>
                <div onClick={() => setFilterStatus('not_contacted')} className="bg-slate-800 p-5 rounded-xl shadow-lg flex items-center gap-4 cursor-pointer hover:bg-slate-700/50 transition-colors">
                    <div className="p-3 rounded-full bg-red-500/20 text-red-400">
                        <div className="w-6 h-6 bg-current rounded-full opacity-20"></div>
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-medium">لم يتم التواصل</p>
                        <p className="text-2xl font-bold text-white mt-1">{stats.notContacted}</p>
                    </div>
                </div>
                <div onClick={() => setFilterStatus('response_rate')} className="bg-slate-800 p-5 rounded-xl shadow-lg flex items-center gap-4">
                    <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-400">
                        <div className="w-6 h-6 bg-current rounded-full opacity-20"></div>
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-medium">معدل الاستجابة</p>
                        <p className="text-2xl font-bold text-white mt-1">{stats.responseRate}</p>
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-800 p-4 rounded-xl">
                <div className="flex items-center gap-2 flex-wrap">
                    {/* 🔥 NEW: Refresh Button */}
                    <button
                        onClick={handleRefresh}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all shadow-lg hover:shadow-emerald-500/50 font-medium"
                    >
                        🔄 تحديث البيانات
                    </button>
                    {/* 🔥 NEW: Remove Duplicates Button */}
                    <button
                        onClick={handleRemoveDuplicates}
                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-orange-500/50 font-medium"
                    >
                        🗑️ مسح التكرار
                    </button>
                    {/* 🔥 NEW: Delete Data Button */}
                    <button
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-500 text-white rounded-lg hover:from-red-700 hover:to-pink-600 transition-all shadow-lg hover:shadow-red-500/50 font-medium"
                    >
                        🗑️ مسح البيانات
                    </button>
                    {/* 🔥 NEW: Quick Add Single Button */}
                    <button
                        onClick={handleQuickAddSingle}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-cyan-500/50 font-medium"
                    >
                        ⚡ + إضافة سريعة
                    </button>
                    <button onClick={() => setIsQuickAddOpen(!isQuickAddOpen)} className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors">
                        📋 إضافة متعددة / استيراد
                    </button>
                    {selectedIds.length > 0 && (
                        <div className="flex items-center gap-2 mr-4">
                            <span className="text-slate-300 text-sm">تحديد: {selectedIds.length}</span>
                            <button onClick={() => handleMoveSelected('contacted')} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 text-xs">نقل إلى تم التواصل</button>
                            <button onClick={() => handleMoveSelected('not_contacted')} className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-xs">نقل إلى لم يتم التواصل</button>
                            <button onClick={() => handleMoveSelected('response_rate')} className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30 text-xs">نقل إلى معدل الاستجابة</button>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="بحث..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 w-full"
                    />
                </div>
            </div>

            {/* Copy Column Buttons */}
            <div className="bg-slate-800 p-4 rounded-xl">
                <div className="flex flex-wrap items-center gap-4">
                    <span className="text-white font-medium whitespace-nowrap">نسخ الأعمدة:</span>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => {
                                const data = filteredAssociations.map(a => a.phone).filter(v => v).join('\n');
                                navigator.clipboard.writeText(data);
                                alert('تم نسخ أرقام الجوال بنجاح!');
                            }}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm whitespace-nowrap">
                            📱 نسخ جميع أرقام الجوال
                        </button>
                        <button
                            onClick={() => {
                                const data = filteredAssociations.map(a => a.email).filter(v => v).join('\n');
                                navigator.clipboard.writeText(data);
                                alert('تم نسخ البريد الإلكتروني بنجاح!');
                            }}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm whitespace-nowrap">
                            📧 نسخ جميع البريد الإلكتروني
                        </button>
                        <button
                            onClick={() => {
                                const data = filteredAssociations.map(a => a.website || '').filter(v => v).join('\n');
                                navigator.clipboard.writeText(data);
                                alert('تم نسخ المواقع الإلكترونية بنجاح!');
                            }}
                            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm whitespace-nowrap">
                            🌐 نسخ جميع المواقع الإلكترونية
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Add Section */}
            {isQuickAddOpen && (
                <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700 animate-fadeIn">
                    <h3 className="text-lg font-bold text-white mb-4">إضافة سريعة / استيراد</h3>

                    {/* ROOT FIX: Options for storage location */}
                    <div className="mb-4 space-y-2">
                        <p className="text-sm text-slate-400 mb-2 font-medium">أين يتم تخزين البيانات المضافة؟</p>
                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="targetStatus"
                                    className="accent-cyan-500 w-4 h-4"
                                    checked={targetStatus === 'contacted'}
                                    onChange={() => setTargetStatus('contacted')}
                                />
                                <span className="text-slate-300 text-sm">في قسم تم التواصل</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="targetStatus"
                                    className="accent-cyan-500 w-4 h-4"
                                    checked={targetStatus === 'not_contacted'}
                                    onChange={() => setTargetStatus('not_contacted')}
                                />
                                <span className="text-slate-300 text-sm">في قسم لم يتم التواصل</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="targetStatus"
                                    className="accent-cyan-500 w-4 h-4"
                                    checked={targetStatus === 'response_rate'}
                                    onChange={() => setTargetStatus('response_rate')}
                                />
                                <span className="text-slate-300 text-sm">في قسم معدل الاستجابة</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="targetStatus"
                                    className="accent-cyan-500 w-4 h-4"
                                    checked={targetStatus === 'new'}
                                    onChange={() => setTargetStatus('new')}
                                />
                                <span className="text-slate-300 text-sm">جديد (الكل)</span>
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <textarea
                                placeholder="انسخ البيانات والصقها هنا...&#10;مثال: جمعية البركة | الرياض | خيرية | info@baraka.org"
                                className="w-full h-32 px-4 py-3 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
                                value={quickAddText}
                                onChange={(e) => setQuickAddText(e.target.value)}
                            ></textarea>
                            <button onClick={handleQuickAdd} className="mt-2 w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors">
                                إضافة البيانات
                            </button>
                        </div>
                        <div className="border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center p-6 bg-slate-700/30">
                            <svg className="w-10 h-10 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                            <p className="text-slate-400 text-sm mb-2">استيراد ملفات (PDF/Excel)</p>
                            <input type="file" id="file-upload" className="hidden" onChange={handleImportPDF} />
                            <label htmlFor="file-upload" className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg cursor-pointer text-sm">
                                اختيار ملف
                            </label>
                            <p className="mt-2 text-xs text-slate-500">سيتم تطبيق خيار مكان التخزين المحدد أعلاه.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right text-slate-400">
                        <thead className="text-xs text-slate-300 uppercase bg-slate-900">
                            <tr>
                                <th className="px-4 py-3 w-10">
                                    <input type="checkbox" onChange={handleSelectAll} className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-cyan-500 focus:ring-cyan-500" />
                                </th>
                                <th className="px-6 py-4">اسم الجمعية</th>
                                <th className="px-6 py-4">المدينة</th>
                                <th className="px-6 py-4">الفئة</th>
                                <th className="px-6 py-4">الحالة</th>
                                <th className="px-6 py-4">معدل الاستجابة</th>
                                <th className="px-6 py-4">الاتصال</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAssociations.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <div className="text-6xl">📋</div>
                                            <p className="text-slate-400 text-lg font-medium">لا توجد جمعيات</p>
                                            <p className="text-slate-500 text-sm">استخدم زر "⚡ + إضافة سريعة" لإضافة جمعية جديدة</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredAssociations.map(assoc => (
                                    <tr key={assoc.id} className="bg-slate-800 border-b border-slate-700 hover:bg-slate-700/50">
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(assoc.id)}
                                                onChange={() => handleSelectOne(assoc.id)}
                                                className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-cyan-500 focus:ring-cyan-500"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-white font-medium">{assoc.name}</td>
                                        <td className="px-6 py-4">{assoc.city}</td>
                                        <td className="px-6 py-4 text-xs">
                                            <span className="bg-slate-700 px-2 py-1 rounded">{assoc.category}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs 
                                                ${assoc.status === 'contacted' ? 'bg-cyan-500/20 text-cyan-400' :
                                                    assoc.status === 'response_rate' ? 'bg-emerald-500/20 text-emerald-400' :
                                                        assoc.status === 'not_contacted' ? 'bg-red-500/20 text-red-400' : 'bg-slate-600/20 text-slate-400'}`}>
                                                {assoc.status === 'contacted' ? 'تم التواصل' :
                                                    assoc.status === 'response_rate' ? 'مستجيب' :
                                                        assoc.status === 'not_contacted' ? 'لم يتم التواصل' : 'جديد'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {assoc.status === 'response_rate' && (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 bg-slate-600 h-1.5 rounded-full overflow-hidden">
                                                        <div className="bg-emerald-500 h-full" style={{ width: `${assoc.response_rate || 0}%` }}></div>
                                                    </div>
                                                    <span className="text-xs">{assoc.response_rate}%</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2 text-slate-400">
                                                {assoc.phone && <span title={assoc.phone}>📱</span>}
                                                {assoc.email && <span title={assoc.email}>📧</span>}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Move Modal */}
            <Modal isOpen={isMoveModalOpen} onClose={() => setIsMoveModalOpen(false)} title="تحديد نسبة الاستجابة">
                <div className="p-4">
                    <label className="block text-sm text-slate-300 mb-2">حدد نسبة الاستجابة للجمعيات المختارة:</label>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={responseRateInput}
                        onChange={(e) => setResponseRateInput(Number(e.target.value))}
                        className="w-full accent-cyan-500 mb-2"
                    />
                    <div className="text-center text-white font-bold text-xl mb-6">{responseRateInput}%</div>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setIsMoveModalOpen(false)} className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-500">إلغاء</button>
                        <button onClick={confirmMoveResponseRate} className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">تأكيد ونقل</button>
                    </div>
                </div>
            </Modal>
            {/* Delete Modal */}
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="مسح البيانات">
                <div className="p-4 space-y-4">
                    <p className="text-sm text-slate-300">اختر طريقة مسح البيانات:</p>
                    
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="deleteMode"
                                className="accent-red-500 w-4 h-4"
                                checked={deleteMode === 'all'}
                                onChange={() => setDeleteMode('all')}
                            />
                            <span className="text-slate-300 text-sm">مسح كل البيانات</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="deleteMode"
                                className="accent-red-500 w-4 h-4"
                                checked={deleteMode === 'category'}
                                onChange={() => setDeleteMode('category')}
                            />
                            <span className="text-slate-300 text-sm">مسح حسب الفئة</span>
                        </label>
                        {deleteMode === 'category' && (
                            <select
                                value={deleteCategory}
                                onChange={(e) => setDeleteCategory(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                <option value="">اختر الفئة</option>
                                {[...new Set(associations.map(a => a.category))].map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        )}
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="deleteMode"
                                className="accent-red-500 w-4 h-4"
                                checked={deleteMode === 'city'}
                                onChange={() => setDeleteMode('city')}
                            />
                            <span className="text-slate-300 text-sm">مسح حسب المدينة</span>
                        </label>
                        {deleteMode === 'city' && (
                            <select
                                value={deleteCity}
                                onChange={(e) => setDeleteCity(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                <option value="">اختر المدينة</option>
                                {[...new Set(associations.map(a => a.city))].map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        )}
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="deleteMode"
                                className="accent-red-500 w-4 h-4"
                                checked={deleteMode === 'search'}
                                onChange={() => setDeleteMode('search')}
                            />
                            <span className="text-slate-300 text-sm">مسح نتائج البحث الحالية</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="deleteMode"
                                className="accent-red-500 w-4 h-4"
                                checked={deleteMode === 'selected'}
                                onChange={() => setDeleteMode('selected')}
                            />
                            <span className="text-slate-300 text-sm">مسح المحدد ({selectedIds.length})</span>
                        </label>
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-500">إلغاء</button>
                        <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">تأكيد المسح</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AssociationsView;
