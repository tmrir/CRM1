import React, { useState, useEffect } from 'react';
import { 
    fetchAssociations, 
    createAssociation, 
    updateMultipleAssociations, 
    deleteMultipleAssociations,
    importAssociations,
    searchAssociations
} from '../services/associationService';
import { Association, AssociationStatus } from '../types';
import Modal from './Modal';

interface AssociationsViewProps {
    // In a real app, these would come from props or a store. 
    // For now I'll manage local state or accept them if App.tsx passes them.
    // Assuming standard prop structure for consistency.
}

const AssociationsView: React.FC<AssociationsViewProps> = () => {
    // 🔥 DYNAMIC STATE with database persistence
    const [associations, setAssociations] = useState<Association[]>([]);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [filterStatus, setFilterStatus] = useState<AssociationStatus | 'all'>('all');
    const [filterCity, setFilterCity] = useState('');
    const [filterRegion, setFilterRegion] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Selection State
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [bulkResponseRate, setBulkResponseRate] = useState<number>(50);

    // Quick Add State
    const [quickAddText, setQuickAddText] = useState('');
    const [targetStatus, setTargetStatus] = useState<AssociationStatus>('new');
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

    // Migration/Move State
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [moveTarget, setMoveTarget] = useState<AssociationStatus | null>(null);

    // Delete State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteMode, setDeleteMode] = useState<'all' | 'category' | 'city' | 'search' | 'selected'>('all');
    const [deleteCategory, setDeleteCategory] = useState('');
    const [deleteCity, setDeleteCity] = useState('');

    // Phone Search State
    const [phoneSearchText, setPhoneSearchText] = useState('');
    const [phoneSearchResults, setPhoneSearchResults] = useState<Association[]>([]);
    const [selectedPhoneIds, setSelectedPhoneIds] = useState<string[]>([]);
    const [isPhoneSearchOpen, setIsPhoneSearchOpen] = useState(false);

    // Response Rate Input State
    const [responseRateInput, setResponseRateInput] = useState<number>(0);

    // Notification State
    const [notification, setNotification] = useState<string>('');

    // Load associations from database on component mount
    useEffect(() => {
        const loadAssociations = async () => {
            try {
                const data = await fetchAssociations();
                setAssociations(data);
            } catch (error) {
                console.error('Error loading associations:', error);
                setNotification('❌ خطأ في تحميل البيانات');
            }
        };

        loadAssociations();
    }, []);

    // Auto-save to database whenever associations change
    useEffect(() => {
        // Data is automatically saved to database through service functions
        // No need for localStorage anymore
    }, [associations]);

    // Show notification function
    const showNotification = (message: string) => {
        setNotification(message);
        setTimeout(() => setNotification(''), 3000);
    };

    // Filter associations based on current filters
    const filteredAssociations = associations.filter(a => {
        const assocRegion = (a.region || '').trim();
        const selectedRegion = (filterRegion || '').trim();
        const matchStatus = filterStatus === 'all' || a.status === filterStatus;
        const matchSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
            assocRegion.toLowerCase().includes(searchTerm.toLowerCase());
        const matchRegion = !selectedRegion || assocRegion === selectedRegion;
        const matchCategory = !filterCategory || a.sub_category === filterCategory;
        return matchStatus && matchSearch && matchRegion && matchCategory;
    });

    // Get unique regions for dropdown
    const uniqueRegions = [...new Set(
        associations
            .map(a => (a.region || '').trim())
            .filter(Boolean)
    )].sort();

    // Get unique cities for dropdown
    const uniqueCities = [...new Set(
        associations.map(a => a.city).filter(Boolean)
    )].sort();

    // Get unique categories for dropdown
    const uniqueCategories = [...new Set(
        associations.map(a => a.main_category).filter(Boolean)
    )].sort();

    // Get unique subcategories for dropdown
    const uniqueSubCategories = [...new Set(
        associations.map(a => a.sub_category).filter(Boolean)
    )].sort();

    // Statistics
    const stats = {
        total: associations.length,
        new: associations.filter(a => a.status === 'new').length,
        contacted: associations.filter(a => a.status === 'contacted').length,
        notContacted: associations.filter(a => a.status === 'not_contacted').length,
        responseRate: associations.filter(a => a.status === 'response_rate').length
    };

    // 🔥 INTELLIGENT DATA PARSER
    const parseAssociationData = (input: string): Partial<Association> | null => {
        const parts = input.split(',').map(p => p.trim()).filter(p => p);
        if (parts.length < 2) return null;

        const result: Partial<Association> = {
            main_category: 'خيرية',
            sub_category: 'اجتماعية',
            target_audience: 'عام',
            response_status: 'جديد',
            status: 'new',
            trust_score: 0,
            region: 'المنطقة الوسطى'
        };

        // Define patterns for different field types
        const phonePattern = /^0[1-9]\d{8}$/;
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const urlPattern = /^https?:\/\/.+/;
        
        // Saudi cities and regions mapping
        const saudiCities = {
            'الرياض': 'المنطقة الوسطى', 'مكة': 'المنطقة الغربية', 'جدة': 'المنطقة الغربية',
            'المدينة': 'المنطقة الغربية', 'الدمام': 'المنطقة الشرقية', 'الخبر': 'المنطقة الشرقية',
            'الظهران': 'المنطقة الشرقية', 'أبها': 'منطقة عسير', 'خميس مشيط': 'منطقة عسير',
            'تبوك': 'منطقة تبوك', 'حائل': 'منطقة حائل', 'بريدة': 'منطقة القصيم',
            'عنيزة': 'منطقة القصيم', 'جازان': 'منطقة جازان', 'نجران': 'منطقة نجران',
            'الباحة': 'منطقة الباحة', 'الجوف': 'منطقة الجوف', 'عرعر': 'منطقة الحدود الشمالية'
        };

        // Categories mapping
        const categories = {
            'أيتام': 'أيتام', 'أطفال': 'أطفال', 'طفولة': 'أطفال', 'معاقين': 'معاقين', 'ذوي الاحتياجات': 'معاقين',
            'تعليم': 'تعليم', 'مدارس': 'تعليم', 'طلاب': 'تعليم', 'صحة': 'صحة', 'طبية': 'صحة',
            'مستشفى': 'صحة', 'علاج': 'صحة', 'كبار': 'كبار السن', 'مسنين': 'كبار السن',
            'إغاثة': 'طوارئ', 'طوارئ': 'طوارئ', 'إسعاف': 'طوارئ', 'مرأة': 'مرأة', 'نساء': 'مرأة',
            'سيدات': 'مرأة', 'شباب': 'شباب', 'شبابية': 'شباب', 'اجتماعي': 'اجتماعية', 'خيري': 'اجتماعية'
        };

        for (const part of parts) {
            // Check if it's a phone number
            if (phonePattern.test(part.replace(/[\s-]/g, ''))) {
                result.phone = part.replace(/[\s-]/g, '');
                result.contact = result.phone;
            }
            // Check if it's an email
            else if (emailPattern.test(part)) {
                result.email = part;
            }
            // Check if it's a URL
            else if (urlPattern.test(part)) {
                if (part.includes('donate') || part.includes('تبرع')) {
                    result.donation_link = part;
                } else {
                    result.website = part;
                }
            }
            // Check if it's a city and set region
            else if (saudiCities[part]) {
                result.city = part;
                result.region = saudiCities[part];
            }
            // Check if it's a category
            else if (categories[part]) {
                result.sub_category = categories[part];
            }
            // Check for response status
            else if (['جديد', 'تم التواصل', 'لم يتم التواصل', 'استجابة'].includes(part)) {
                if (part === 'جديد') result.status = 'new';
                else if (part === 'تم التواصل') result.status = 'contacted';
                else if (part === 'لم يتم التواصل') result.status = 'not_contacted';
                else if (part === 'استجابة') result.status = 'response_rate';
            }
            // Check for response rate
            else if (part.includes('%') || /^\d+$/.test(part)) {
                const rate = parseInt(part.replace('%', ''));
                if (rate >= 0 && rate <= 100) {
                    result.response_rate = rate;
                    result.status = 'response_rate';
                }
            }
            // Otherwise, treat as name
            else if (!result.name && part.length > 2) {
                result.name = part;
            }
        }

        // Validate required fields
        if (!result.name || !result.phone || !result.city) {
            return null;
        }

        return result;
    };

    // 🔥 QUICK ADD SINGLE
    const handleQuickAddSingle = () => {
        if (!quickAddText.trim()) return;
        
        const parsedData = parseAssociationData(quickAddText);
        if (!parsedData) {
            showNotification('⚠️ لم يتم التعرف على البيانات. الرجاء التأكد من وجود اسم وجوال ومدينة');
            return;
        }

        const newAssociation: Omit<Association, 'id' | 'created_at' | 'updated_at'> = {
            ...parsedData,
            status: targetStatus,
            response_status: 'جديد'
        } as Omit<Association, 'id' | 'created_at' | 'updated_at'>;

        createAssociation(newAssociation);
        setQuickAddText('');
        showNotification('✅ تمت إضافة الجمعية بنجاح');
    };

    // 🔥 QUICK ADD BULK
    const handleQuickAdd = async () => {
        if (!quickAddText.trim()) {
            showNotification('⚠️ الرجاء إدخال بيانات الجمعيات');
            return;
        }

        const lines = quickAddText.trim().split('\n');
        const newAssociations: Omit<Association, 'id' | 'created_at' | 'updated_at'>[] = [];
        let successCount = 0;
        let errorCount = 0;

        for (const line of lines) {
            const parsedData = parseAssociationData(line);
            if (parsedData) {
                newAssociations.push({
                    ...parsedData,
                    status: targetStatus,
                    response_status: 'جديد'
                } as Omit<Association, 'id' | 'created_at' | 'updated_at'>);
                successCount++;
            } else {
                errorCount++;
            }
        }

        if (newAssociations.length === 0) {
            showNotification('❌ لم يتم التعرف على أي بيانات صالحة');
            return;
        }

        try {
            // Create associations one by one
            for (const association of newAssociations) {
                await createAssociation(association);
            }
            setQuickAddText('');
            setIsQuickAddOpen(false);
            showNotification(`✅ تم إضافة ${successCount} جمعية بنجاح${errorCount > 0 ? ` (${errorCount} تم تجاهلها)` : ''}`);
        } catch (error) {
            showNotification('❌ حدث خطأ أثناء إضافة الجمعيات');
        }
    };

    // 🔥 PHONE SEARCH
    const handlePhoneSearch = async () => {
        if (!phoneSearchText.trim()) {
            showNotification('⚠️ الرجاء إدخال أرقام جوال للبحث');
            return;
        }

        // Clean and extract phone numbers from input
        const phoneNumbers = phoneSearchText
            .split(/[\n,\s|]+/)
            .map(p => p.replace(/[^\d]/g, '').trim())
            .filter(p => p.length >= 7); // Min 7 digits for Saudi numbers

        if (phoneNumbers.length === 0) {
            showNotification('⚠️ لم يتم العثور على أرقام جوال صالحة');
            return;
        }

        // Search for associations matching these phone numbers
        const results: Association[] = [];
        for (const phoneNumber of phoneNumbers) {
            const matches = associations.filter(a => 
                a.phone.includes(phoneNumber) || 
                phoneNumber.includes(a.phone.replace(/[^\d]/g, ''))
            );
            results.push(...matches);
        }

        // Remove duplicates
        const uniqueResults = results.filter((assoc, index, self) => 
            results.findIndex(a => a.id === assoc.id) === index
        );

        setPhoneSearchResults(uniqueResults);
        setIsPhoneSearchOpen(true);
        showNotification(`🔍 تم العثور على ${uniqueResults.length} جمعية تطابق أرقام الجوال`);
    };

    // 🔥 SELECTION HELPERS
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(filteredAssociations.map(a => a.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    // Phone search selection helpers
    const handleSelectPhoneAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedPhoneIds(phoneSearchResults.map(a => a.id));
        } else {
            setSelectedPhoneIds([]);
        }
    };

    const handleSelectPhoneOne = (id: string) => {
        if (selectedPhoneIds.includes(id)) {
            setSelectedPhoneIds(selectedPhoneIds.filter(i => i !== id));
        } else {
            setSelectedPhoneIds([...selectedPhoneIds, id]);
        }
    };

    // 🔥 MOVE OPERATIONS
    const handleMoveSelected = (target: AssociationStatus) => {
        if (selectedIds.length === 0) {
            showNotification('⚠️ الرجاء تحديد جمعيات أولاً');
            return;
        }
        
        if (target === 'response_rate') {
            setMoveTarget(target);
            setIsMoveModalOpen(true);
        } else {
            // Move immediately and remove response_rate if moving to not_contacted
            updateMultipleAssociations(selectedIds, { 
                status: target,
                ...(target === 'not_contacted' && { response_rate: undefined })
            });
            setSelectedIds([]);
            showNotification(`✅ تم نقل ${selectedIds.length} جمعية إلى ${target === 'contacted' ? 'تم التواصل' : 'لم يتم التواصل'}`);
        }
    };

    const confirmMoveResponseRate = () => {
        updateMultipleAssociations(selectedIds, { 
            status: 'response_rate', 
            response_rate: responseRateInput 
        });
        setIsMoveModalOpen(false);
        setSelectedIds([]);
        setResponseRateInput(0);
        showNotification(`✅ تم تعيين نسبة استجابة ${responseRateInput}% لـ ${selectedIds.length} جمعية`);
    };

    // Phone search move operations
    const handleMovePhoneResults = (status: AssociationStatus) => {
        if (selectedPhoneIds.length === 0) {
            showNotification('⚠️ الرجاء تحديد جمعيات أولاً');
            return;
        }
        
        if (status === 'response_rate') {
            setMoveTarget(status);
            setIsMoveModalOpen(true);
        } else {
            updateMultipleAssociations(selectedPhoneIds, { 
                status: status,
                ...(status === 'not_contacted' && { response_rate: undefined })
            });
            setSelectedPhoneIds([]);
            setIsPhoneSearchOpen(false);
            showNotification(`✅ تم نقل ${selectedPhoneIds.length} جمعية إلى ${status === 'contacted' ? 'تم التواصل' : status === 'not_contacted' ? 'لم يتم التواصل' : 'جديد'}`);
        }
    };

    const confirmMovePhoneResponseRate = () => {
        updateMultipleAssociations(selectedPhoneIds, { 
            status: 'response_rate', 
            response_rate: responseRateInput 
        });
        setIsMoveModalOpen(false);
        setSelectedPhoneIds([]);
        setResponseRateInput(0);
        setIsPhoneSearchOpen(false);
        showNotification(`✅ تم تعيين نسبة استجابة ${responseRateInput}% لـ ${selectedPhoneIds.length} جمعية`);
    };

    // 🔥 DELETE OPERATIONS
    const handleDelete = () => {
        let idsToDelete: string[] = [];
        
        switch (deleteMode) {
            case 'all':
                idsToDelete = associations.map(a => a.id);
                break;
            case 'category':
                if (!deleteCategory) return;
                idsToDelete = associations
                    .filter(a => a.main_category === deleteCategory)
                    .map(a => a.id);
                break;
            case 'city':
                if (!deleteCity) return;
                idsToDelete = associations
                    .filter(a => a.city === deleteCity)
                    .map(a => a.id);
                break;
            case 'search':
                if (!searchTerm.trim()) return;
                idsToDelete = filteredAssociations.map(a => a.id);
                break;
            case 'selected':
                idsToDelete = selectedIds;
                break;
        }

        if (idsToDelete.length === 0) {
            showNotification('⚠️ لا توجد جمعيات للحذف');
            return;
        }

        deleteMultipleAssociations(idsToDelete);
        setIsDeleteModalOpen(false);
        setDeleteMode('all');
        setDeleteCategory('');
        setDeleteCity('');
        setSelectedIds([]);
        showNotification(`🗑️ تم حذف ${idsToDelete.length} جمعية بنجاح`);
    };

    return (
        <div className="space-y-6">
            {/* 🔥 NOTIFICATION TOAST */}
            {notification && (
                <div className="fixed top-4 right-4 z-50 bg-slate-800 border border-cyan-500 text-white px-6 py-3 rounded-lg shadow-2xl animate-fadeIn">
                    {notification}
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">الإجمالي</h3>
                        <span className="text-2xl font-bold text-cyan-400">{stats.total}</span>
                    </div>
                </div>
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">جديد</h3>
                        <span className="text-2xl font-bold text-green-400">{stats.new}</span>
                    </div>
                </div>
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">تم التواصل</h3>
                        <span className="text-2xl font-bold text-blue-400">{stats.contacted}</span>
                    </div>
                </div>
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">لم يتم التواصل</h3>
                        <span className="text-2xl font-bold text-red-400">{stats.notContacted}</span>
                    </div>
                </div>
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">معدل الاستجابة</h3>
                        <span className="text-2xl font-bold text-emerald-400">{stats.responseRate}</span>
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
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
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={bulkResponseRate}
                                        onChange={(e) => setBulkResponseRate(Number(e.target.value))}
                                        className="w-16 px-2 py-1 bg-slate-700 text-white rounded text-xs text-center"
                                        placeholder="0-100"
                                    />
                                    <button 
                                        onClick={() => {
                                            if (selectedIds.length === 0) {
                                                showNotification('⚠️ الرجاء تحديد جمعيات أولاً');
                                                return;
                                            }
                                            updateMultipleAssociations(selectedIds, { 
                                                status: 'response_rate', 
                                                response_rate: bulkResponseRate 
                                            });
                                            setSelectedIds([]);
                                            showNotification(`✅ تم تعيين نسبة استجابة ${bulkResponseRate}% لـ ${selectedIds.length} جمعية`);
                                        }}
                                        className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30 text-xs"
                                    >
                                        تعيين نسبة الاستجابة
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
                        {/* Region Filter */}
                        <select
                            value={filterRegion}
                            onChange={(e) => setFilterRegion(e.target.value)}
                            className="px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-auto"
                        >
                            <option value="">جميع المناطق</option>
                            {uniqueRegions.map(region => (
                                <option key={region} value={region}>{region}</option>
                            ))}
                        </select>
                        {/* Category Filter */}
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-auto"
                        >
                            <option value="">جميع التصنيفات</option>
                            {uniqueSubCategories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            placeholder="بحث بالاسم أو المدينة..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 w-full sm:w-auto"
                        />
                    </div>
                </div>
                {/* Quick Add Section */}
                {isQuickAddOpen && (
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-600">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">إضافة جمعيات (ذكية)</h3>
                            <button onClick={() => setIsQuickAddOpen(false)} className="text-slate-400 hover:text-white text-2xl">×</button>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-lg font-semibold text-white mb-2">أدخل البيانات (بأي ترتيب)</h4>
                                <textarea
                                    placeholder="مثال:&#10;جمعية الأطفال, 0123456789, الرياض, أطفال, تم التواصل&#10;أو:&#10;0132345678, جمعية البر, جدة, إغاثة, 80%&#10;أو:&#10;https://charity.org, جمعية المساعدة, مكة, صحة, info@charity.org"
                                    value={quickAddText}
                                    onChange={(e) => setQuickAddText(e.target.value)}
                                    className="w-full h-32 px-4 py-3 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                                />
                                <div className="mt-2 text-xs text-slate-400">
                                    💡 النظام يتعرف تلقائياً على: الاسم، الجوال، المدينة، التصنيف، الحالة، الإيميل، الموقع، نسبة الاستجابة
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <select
                                        value={targetStatus}
                                        onChange={(e) => setTargetStatus(e.target.value as AssociationStatus)}
                                        className="px-3 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    >
                                        <option value="new">جديد</option>
                                        <option value="contacted">تم التواصل</option>
                                        <option value="not_contacted">لم يتم التواصل</option>
                                    </select>
                                    <button
                                        onClick={handleQuickAdd}
                                        className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                                    >
                                        📥 إضافة متعددة
                                    </button>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-white mb-2">أمثلة المدخلات:</h4>
                                <div className="space-y-2 text-sm text-slate-300">
                                    <div className="bg-slate-700 p-2 rounded">
                                        <strong>أساسي:</strong><br/>
                                        جمعية البر, 0123456789, الرياض
                                    </div>
                                    <div className="bg-slate-700 p-2 rounded">
                                        <strong>مع تصنيف:</strong><br/>
                                        جمعية الأيتام, 0132345678, جدة, أيتام
                                    </div>
                                    <div className="bg-slate-700 p-2 rounded">
                                        <strong>مع حالة:</strong><br/>
                                        جمعية الإغاثة, 0143456789, الدمام, إغاثة, تم التواصل
                                    </div>
                                    <div className="bg-slate-700 p-2 rounded">
                                        <strong>مع نسبة استجابة:</strong><br/>
                                        جمعية التعليم, 0156789012, تبوك, تعليم, 75%
                                    </div>
                                    <div className="bg-slate-700 p-2 rounded">
                                        <strong>مع إيميل وموقع:</strong><br/>
                                        جمعية المرأة, 0168901234, الرياض, مرأة, info@women.org, https://women.org
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Phone Search Section */}
                {isPhoneSearchOpen && (
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-600">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">البحث برقم الجوال</h3>
                            <button onClick={() => setIsPhoneSearchOpen(false)} className="text-slate-400 hover:text-white text-2xl">×</button>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-lg font-semibold text-white mb-2">البحث</h4>
                                <textarea
                                    placeholder="أدخل أرقام الجوال للبحث (واحد في كل سطر أو مفصولة بفواصل)"
                                    value={phoneSearchText}
                                    onChange={(e) => setPhoneSearchText(e.target.value)}
                                    className="w-full h-32 px-4 py-3 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                                />
                                <button
                                    onClick={handlePhoneSearch}
                                    className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors mt-2"
                                >
                                    🔍 بحث
                                </button>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-white mb-2">النتائج ({phoneSearchResults.length})</h4>
                                <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
                                    {phoneSearchResults.length === 0 ? (
                                        <p className="text-slate-400">لا توجد نتائج</p>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-2 mb-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPhoneIds.length === phoneSearchResults.length}
                                                    onChange={handleSelectPhoneAll}
                                                    className="w-4 h-4 rounded bg-slate-600 border-slate-500 text-purple-500 focus:ring-purple-500"
                                                />
                                                <span className="text-white text-sm">تحديد الكل ({selectedPhoneIds.length})</span>
                                            </div>
                                            {phoneSearchResults.map(assoc => (
                                                <div key={assoc.id} className="flex items-center gap-2 p-2 bg-slate-700 rounded">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPhoneIds.includes(assoc.id)}
                                                        onChange={() => handleSelectPhoneOne(assoc.id)}
                                                        className="w-4 h-4 rounded bg-slate-600 border-slate-500 text-purple-500 focus:ring-purple-500"
                                                    />
                                                    <span className="text-white text-sm">{assoc.name}</span>
                                                    <span className="text-cyan-400 text-xs">{assoc.phone}</span>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleMovePhoneResults('contacted')} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 text-xs">تم التواصل</button>
                                    <button onClick={() => handleMovePhoneResults('not_contacted')} className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-xs">لم يتم التواصل</button>
                                    <button onClick={() => handleMovePhoneResults('response_rate')} className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30 text-xs">معدل الاستجابة</button>
                                    <button onClick={() => handleMovePhoneResults('new')} className="px-3 py-1 bg-slate-600/20 text-slate-400 rounded hover:bg-slate-600/30 text-xs">جديد</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Move Confirmation Modal */}
                {isMoveModalOpen && (
                    <Modal isOpen={isMoveModalOpen} onClose={() => setIsMoveModalOpen(false)}>
                        <div className="bg-slate-800 rounded-xl p-6 border border-slate-600 max-w-md w-full">
                            <h3 className="text-xl font-bold text-white mb-4">
                                تعيين نسبة الاستجابة لـ {selectedIds.length} جمعيات
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        نسبة الاستجابة (0-100)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={responseRateInput}
                                        onChange={(e) => setResponseRateInput(Number(e.target.value))}
                                        className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        placeholder="أدخل نسبة الاستجابة"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsMoveModalOpen(false)}
                                        className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        onClick={selectedPhoneIds.length > 0 ? confirmMovePhoneResponseRate : confirmMoveResponseRate}
                                        className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                                    >
                                        تأكيد
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Modal>
                )}

                {/* Table */}
                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-900 border-b border-slate-700">
                                    <th className="px-6 py-4 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.length === filteredAssociations.length}
                                            onChange={handleSelectAll}
                                            className="w-4 h-4 rounded bg-slate-600 border-slate-500 text-purple-500 focus:ring-purple-500"
                                        />
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">الاسم</th>
                                    <th className="px-6 py-4 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">الجوال</th>
                                    <th className="px-6 py-4 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">المدينة</th>
                                    <th className="px-6 py-4 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">المنطقة</th>
                                    <th className="px-6 py-4 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">الفئة</th>
                                    <th className="px-6 py-4 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">الحالة</th>
                                    <th className="px-6 py-4 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">نسبة الاستجابة</th>
                                    <th className="px-6 py-4 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAssociations.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center gap-4">
                                                <div className="text-6xl text-slate-500">📭</div>
                                                <div className="text-slate-400">
                                                    <p className="text-lg font-medium">لا توجد جمعيات</p>
                                                    <p className="text-sm">جرب إضافة جمعيات جديدة أو تعديل الفلاتر</p>
                                                </div>
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
                                                    className="w-4 h-4 rounded bg-slate-600 border-slate-500 text-purple-500 focus:ring-purple-500"
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-white font-medium">{assoc.name}</td>
                                            <td className="px-6 py-4 text-white">{assoc.phone}</td>
                                            <td className="px-6 py-4 text-white">{assoc.city}</td>
                                            <td className="px-6 py-4 text-white">{assoc.region}</td>
                                            <td className="px-6 py-4 text-white">{assoc.main_category}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    assoc.status === 'new' ? 'bg-green-500/20 text-green-400' :
                                                    assoc.status === 'contacted' ? 'bg-blue-500/20 text-blue-400' :
                                                    assoc.status === 'not_contacted' ? 'bg-red-500/20 text-red-400' :
                                                    'bg-emerald-500/20 text-emerald-400'
                                                }`}>
                                                    {assoc.status === 'new' ? 'جديد' :
                                                     assoc.status === 'contacted' ? 'تم التواصل' :
                                                     assoc.status === 'not_contacted' ? 'لم يتم التواصل' :
                                                     'معدل الاستجابة'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-white">
                                                {assoc.response_rate !== undefined && assoc.response_rate !== null ? (
                                                    <span className="text-emerald-400 font-medium">{assoc.response_rate}%</span>
                                                ) : (
                                                    <span className="text-slate-500">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleSelectOne(assoc.id)}
                                                        className="text-purple-400 hover:text-purple-300 text-sm"
                                                    >
                                                        📝 تعديل
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedIds([assoc.id]);
                                                            setDeleteMode('selected');
                                                            setIsDeleteModalOpen(true);
                                                        }}
                                                        className="text-red-400 hover:text-red-300 text-sm"
                                                    >
                                                        🗑️ حذف
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssociationsView;
