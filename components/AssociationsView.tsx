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

// 🔥 INITIAL MOCK DATA - بيانات تجريبية للعرض
const INITIAL_ASSOCIATIONS: Association[] = [
    {
        id: 1,
        region: 'المنطقة الوسطى',
        name: 'جمعية البر الخيرية',
        phone: '0112345678',
        city: 'الرياض',
        mainCategory: 'خيرية',
        subCategory: 'مساعدات اجتماعية',
        donationLink: 'https://albirr.org/donate',
        targetAudience: 'الأسر المحتاجة',
        responseStatus: 'مستجيب',
        contact: 'أحمد محمد',
        email: 'info@albirr.org',
        website: 'https://albirr.org',
        status: 'contacted',
        created_at: new Date().toISOString()
    },
    {
        id: 2,
        region: 'المنطقة الغربية',
        name: 'جمعية الإحسان',
        phone: '0123456789',
        city: 'جدة',
        mainCategory: 'اجتماعية',
        subCategory: 'رعاية الأيتام',
        donationLink: 'https://ihsan.org/donate',
        targetAudience: 'الأيتام',
        responseStatus: 'لم يستجب',
        contact: 'محمد أحمد',
        email: 'contact@ihsan.org',
        status: 'not_contacted',
        created_at: new Date().toISOString()
    },
    {
        id: 3,
        region: 'المنطقة الشرقية',
        name: 'جمعية التعاون',
        phone: '0134567890',
        city: 'الدمام',
        mainCategory: 'تعليمية',
        subCategory: 'دعم الطلاب',
        donationLink: 'https://taawon.org/donate',
        targetAudience: 'الطلاب',
        responseStatus: 'مستجيب',
        contact: 'عبدالله خالد',
        email: 'info@taawon.org',
        status: 'response_rate',
        response_rate: 75,
        created_at: new Date().toISOString()
    },
    {
        id: 4,
        region: 'المنطقة الغربية',
        name: 'جمعية الأمل',
        phone: '0145678901',
        city: 'مكة المكرمة',
        mainCategory: 'صحية',
        subCategory: 'رعاية صحية',
        donationLink: 'https://alamal.org/donate',
        targetAudience: 'المرضى',
        responseStatus: 'مستجيب',
        contact: 'فهد سالم',
        email: 'support@alamal.org',
        status: 'contacted',
        created_at: new Date().toISOString()
    },
    {
        id: 5,
        region: 'المنطقة الغربية',
        name: 'جمعية النور',
        phone: '0156789012',
        city: 'المدينة المنورة',
        mainCategory: 'ثقافية',
        subCategory: 'ثقافة عامة',
        donationLink: 'https://alnoor.org/donate',
        targetAudience: 'الشباب',
        responseStatus: 'جديد',
        contact: 'خالد العتيبي',
        email: 'info@alnoor.org',
        status: 'new',
        created_at: new Date().toISOString()
    },
    {
        id: 6,
        region: 'منطقة عسير',
        name: 'جمعية عسير الخيرية',
        phone: '0172345678',
        city: 'أبها',
        mainCategory: 'خيرية',
        subCategory: 'مساعدات شهرية',
        donationLink: 'https://aseercharity.org/donate',
        targetAudience: 'الأسر الفقيرة',
        responseStatus: 'مستجيب',
        contact: 'سعد العتيبي',
        email: 'info@aseercharity.org',
        status: 'contacted',
        created_at: new Date().toISOString()
    },
    {
        id: 7,
        region: 'منطقة تبوك',
        name: 'جمعية تبوك للتنمية',
        phone: '0143456789',
        city: 'تبوك',
        mainCategory: 'تنموية',
        subCategory: 'تنمية مجتمعية',
        donationLink: 'https://taboukdev.org/donate',
        targetAudience: 'المجتمع المحلي',
        responseStatus: 'لم يستجب',
        contact: 'ناصر السالم',
        email: 'contact@taboukdev.org',
        status: 'not_contacted',
        created_at: new Date().toISOString()
    },
    {
        id: 8,
        region: 'منطقة حائل',
        name: 'جمعية حائل الخيرية',
        phone: '0164567890',
        city: 'حائل',
        mainCategory: 'خيرية',
        subCategory: 'إغاثة',
        donationLink: 'https://haelcharity.org/donate',
        targetAudience: 'المحتاجين',
        responseStatus: 'مستجيب',
        contact: 'عبدالرحمن القحطاني',
        email: 'info@haelcharity.org',
        status: 'response_rate',
        response_rate: 85,
        created_at: new Date().toISOString()
    },
    {
        id: 9,
        region: 'منطقة القصيم',
        name: 'جمعية القصيم الخيرية',
        phone: '0165678901',
        city: 'بريدة',
        mainCategory: 'خيرية',
        subCategory: 'زكاة',
        donationLink: 'https://qassimcharity.org/donate',
        targetAudience: 'المستحقين للزكاة',
        responseStatus: 'مستجيب',
        contact: 'فهد الدوسري',
        email: 'info@qassimcharity.org',
        status: 'contacted',
        created_at: new Date().toISOString()
    },
    {
        id: 10,
        region: 'منطقة جازان',
        name: 'جمعية جازان الخيرية',
        phone: '0176789012',
        city: 'جازان',
        mainCategory: 'خيرية',
        subCategory: 'مساعدات غذائية',
        donationLink: 'https://jazancharity.org/donate',
        targetAudience: 'الأسر المحتاجة',
        responseStatus: 'جديد',
        contact: 'أحمد الحازمي',
        email: 'info@jazancharity.org',
        status: 'new',
        created_at: new Date().toISOString()
    },
    {
        id: 11,
        region: 'منطقة نجران',
        name: 'جمعية نجران الخيرية',
        phone: '0177890123',
        city: 'نجران',
        mainCategory: 'خيرية',
        subCategory: 'مساعدات تعليمية',
        donationLink: 'https://najrancharity.org/donate',
        targetAudience: 'الطلاب المحتاجين',
        responseStatus: 'مستجيب',
        contact: 'محمد الشهراني',
        email: 'info@najrancharity.org',
        status: 'contacted',
        created_at: new Date().toISOString()
    },
    {
        id: 12,
        region: 'منطقة الباحة',
        name: 'جمعية الباحة الخيرية',
        phone: '0178901234',
        city: 'الباحة',
        mainCategory: 'خيرية',
        subCategory: 'رعاية أسر',
        donationLink: 'https://bahacharity.org/donate',
        targetAudience: 'الأسر',
        responseStatus: 'لم يستجب',
        contact: 'خالد الغامدي',
        email: 'info@bahacharity.org',
        status: 'not_contacted',
        created_at: new Date().toISOString()
    },
    {
        id: 13,
        region: 'منطقة الجوف',
        name: 'جمعية الجوف الخيرية',
        phone: '0149012345',
        city: 'سكاكا',
        mainCategory: 'خيرية',
        subCategory: 'مساعدات عامة',
        donationLink: 'https://joufcharity.org/donate',
        targetAudience: 'المحتاجين',
        responseStatus: 'مستجيب',
        contact: 'عبدالله الحربي',
        email: 'info@joufcharity.org',
        status: 'response_rate',
        response_rate: 90,
        created_at: new Date().toISOString()
    },
    {
        id: 14,
        region: 'منطقة الحدود الشمالية',
        name: 'جمعية الحدود الشمالية',
        phone: '0140123456',
        city: 'عرعر',
        mainCategory: 'خيرية',
        subCategory: 'خدمات مجتمعية',
        donationLink: 'https://northerncharity.org/donate',
        targetAudience: 'سكان المنطقة',
        responseStatus: 'جديد',
        contact: 'فهد الشمري',
        email: 'info@northerncharity.org',
        status: 'new',
        created_at: new Date().toISOString()
    }
];

const AssociationsView: React.FC<AssociationsViewProps> = () => {
    // 🔥 DYNAMIC STATE with database persistence
    const [associations, setAssociations] = useState<Association[]>([]);
    useEffect(() => {
        const loadAssociations = async () => {
            try {
                const data = await fetchAssociations();
                setAssociations(data);
            } catch (error) {
                console.error('Error loading associations:', error);
                showNotification('❌ خطأ في تحميل البيانات');
            }
        };

        loadAssociations();
    }, []);

    // 🔥 AUTO-SAVE to database whenever associations change
    useEffect(() => {
        const saveAssociations = async () => {
            try {
                await saveAssociationsToDatabase(associations);
            } catch (error) {
                console.error('Error saving associations:', error);
                showNotification('❌ خطأ في حفظ البيانات');
            }
        };

        saveAssociations();
            localStorage.setItem('crm_associations', JSON.stringify(associations));
        }
    }, [associations]);

    // UI State
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [filterStatus, setFilterStatus] = useState<AssociationStatus | 'all'>('all');
    const [filterCity, setFilterCity] = useState('');
    const [filterRegion, setFilterRegion] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Selection State
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [bulkResponseRate, setBulkResponseRate] = useState<number>(50);

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

    // Phone Search State
    const [phoneSearchText, setPhoneSearchText] = useState('');
    const [phoneSearchResults, setPhoneSearchResults] = useState<Association[]>([]);
    const [isPhoneSearchOpen, setIsPhoneSearchOpen] = useState(false);
    const [selectedPhoneIds, setSelectedPhoneIds] = useState<number[]>([]);

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

    // 🔥 NEW: Reset data to include all regions
    const resetToAllRegions = () => {
        setAssociations(INITIAL_ASSOCIATIONS);
        showNotification('✅ تم استعادة البيانات لتشمل جميع مناطق المملكة');
    };

    // 🔥 NEW: Fix invalid donation links
    const fixDonationLinks = () => {
        const updatedAssociations = associations.map(assoc => {
            // Fix common invalid donation links
            if (assoc.donationLink === 'رابط التبرع' || 
                assoc.donationLink === 'الموقع الرسمي' || 
                assoc.donationLink === 'غير متوفر' ||
                !assoc.donationLink.startsWith('http')) {
                
                // Generate a proper donation link based on the association name
                const cleanName = assoc.name.replace(/جمعية\s+/gi, '').replace(/\s+/g, '').toLowerCase();
                const properLink = `https://${cleanName}.org/donate`;
                return { ...assoc, donationLink: properLink };
            }
            return assoc;
        });
        
        const changedCount = updatedAssociations.filter((a, i) => a.donationLink !== associations[i].donationLink).length;
        if (changedCount > 0) {
            setAssociations(updatedAssociations);
            showNotification(`✅ تم إصلاح ${changedCount} رابط تبرع`);
        } else {
            showNotification('✅ جميع روابط التبرع صحيحة');
        }
    };

    // 🔥 NEW: Fix existing contacts that are "غير محدد"
    const fixContactFields = () => {
        const updatedAssociations = associations.map(assoc => {
            if (assoc.contact === 'غير محدد' || !assoc.contact) {
                return { ...assoc, contact: assoc.phone };
            }
            return assoc;
        });
        
        const changedCount = updatedAssociations.filter((a, i) => a.contact !== associations[i].contact).length;
        if (changedCount > 0) {
            setAssociations(updatedAssociations);
            showNotification(`✅ تم تحديث ${changedCount} جمعية لعرض رقم الجوال في حقل الاتصال`);
        } else {
            showNotification('✅ جميع حقول الاتصال محدثة بالفعل');
        }
    };

    // 🔥 NEW: Show notification helper
    const showNotification = (message: string) => {
        setNotification(message);
        setTimeout(() => setNotification(''), 3000);
    };

    // 🔥 NEW: Quick add single association
    const handleQuickAddSingle = () => {
        const phoneNumber = `05${Math.floor(Math.random() * 100000000)}`;
        const newAssociation: Association = {
            id: Date.now(),
            region: 'المنطقة الوسطى',
            name: `جمعية جديدة ${associations.length + 1}`,
            phone: phoneNumber,
            city: 'الرياض',
            mainCategory: 'عامة',
            subCategory: 'عامة',
            donationLink: '',
            targetAudience: 'عامة',
            responseStatus: 'جديد',
            contact: phoneNumber, // Copy phone number to contact
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
            // Updated parsing logic: Name | Phone | City | MainCategory | DonationLink | TargetAudience | ResponseStatus | Contact
            const parts = line.split(/[|\t,]+/).map(s => s.trim());
            const phoneNumber = parts[1] || '';
            return {
                id: Date.now() + index,
                region: 'المنطقة الوسطى', // Default value
                name: parts[0] || 'Unknown',
                phone: phoneNumber,
                city: parts[2] || '',
                mainCategory: parts[3] || '',
                subCategory: 'عامة', // Default value
                donationLink: parts[4] || '',
                targetAudience: parts[5] || '',
                responseStatus: parts[6] || 'جديد',
                contact: parts[7] || phoneNumber, // Copy phone number to contact if not provided
                email: parts[8] || '',
                status: targetStatus, // CRITICAL FIX: Use selected target status
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
        const phoneNumber = "0500000000";
        const dummy: Association = {
            id: Date.now(),
            region: 'المنطقة الوسطى',
            name: "New Imported Association",
            phone: phoneNumber,
            city: "Riyadh",
            mainCategory: "Charity",
            subCategory: "General",
            donationLink: "",
            targetAudience: "General",
            responseStatus: "جديد",
            contact: phoneNumber, // Copy phone number to contact
            email: "info@example.com",
            status: targetStatus // Respect target status here too
        };
        setAssociations(prev => [...prev, dummy]);
    };

    const filteredAssociations = associations.filter(a => {
        const assocRegion = (a.region || '').trim();
        const selectedRegion = (filterRegion || '').trim();
        const matchStatus = filterStatus === 'all' || a.status === filterStatus;
        const matchSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
            assocRegion.toLowerCase().includes(searchTerm.toLowerCase());
        const matchRegion = !selectedRegion || assocRegion === selectedRegion;
        return matchStatus && matchSearch && matchRegion;
    });

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
        if (selectedIds.length === 0) {
            showNotification('⚠️ الرجاء تحديد جمعيات أولاً');
            return;
        }
        
        if (target === 'response_rate') {
            setMoveTarget('response_rate');
            setIsMoveModalOpen(true);
        } else {
            // Move immediately and remove response_rate if moving to not_contacted
            setAssociations(prev => prev.map(a =>
                selectedIds.includes(a.id) ? { 
                    ...a, 
                    status: target,
                    ...(target === 'not_contacted' && { response_rate: undefined })
                } : a
            ));
            setSelectedIds([]);
            showNotification(`✅ تم نقل ${selectedIds.length} جمعية إلى ${target === 'contacted' ? 'تم التواصل' : 'لم يتم التواصل'}`);
        }
    };

    const confirmMoveResponseRate = () => {
        setAssociations(prev => prev.map(a =>
            selectedIds.includes(a.id) ? { ...a, status: 'response_rate', response_rate: responseRateInput } : a
        ));
        setIsMoveModalOpen(false);
        setSelectedIds([]);
        setResponseRateInput(0);
        showNotification(`✅ تم نقل ${selectedIds.length} جمعية إلى "معدل الاستجابة" بنجاح`);
    };

    const confirmMovePhoneResponseRate = () => {
        setAssociations(prev => prev.map(a =>
            selectedPhoneIds.includes(a.id) ? { ...a, status: 'response_rate', response_rate: responseRateInput } : a
        ));
        setIsMoveModalOpen(false);
        setSelectedPhoneIds([]);
        setResponseRateInput(0);
        setIsPhoneSearchOpen(false);
        showNotification(`✅ تم نقل ${selectedPhoneIds.length} جمعية إلى "معدل الاستجابة" بنجاح`);
    };

    const handleRefresh = () => {
        window.location.reload();
    };

    // 🔥 NEW: Phone search functionality
    const handlePhoneSearch = () => {
        if (!phoneSearchText.trim()) {
            showNotification('⚠️ الرجاء إدخال أرقام جوال للبحث');
            return;
        }

        // Clean and extract phone numbers from input
        const phoneNumbers = phoneSearchText
            .split(/[\n,\s|]+/)
            .map(phone => phone.trim())
            .filter(phone => phone.length > 0)
            .map(phone => {
                // Remove numbering (like "1.", "2.", etc.) and common prefixes
                phone = phone.replace(/^\d+\.\s*/, ''); // Remove "1. ", "2. ", etc.
                phone = phone.replace(/^0?5/, ''); // Remove leading "05" or "5"
                phone = phone.replace(/[-\s]/g, ''); // Remove dashes and spaces
                return phone;
            })
            .filter(phone => phone.length >= 7); // Keep only reasonable phone numbers

        const foundAssociations: Association[] = [];
        
        phoneNumbers.forEach(searchPhone => {
            // Try different matching strategies
            const found = associations.find(assoc => {
                if (!assoc.phone) return false;
                
                // Clean stored phone number for comparison
                let cleanStoredPhone = assoc.phone.replace(/^0?5/, '').replace(/[-\s]/g, '');
                
                // Remove any numbering from stored phone if it exists
                cleanStoredPhone = cleanStoredPhone.replace(/^\d+\.\s*/, '');
                
                // Try exact match
                if (cleanStoredPhone === searchPhone) return true;
                
                // Try partial match (search phone contains stored phone or vice versa)
                if (cleanStoredPhone.includes(searchPhone) || searchPhone.includes(cleanStoredPhone)) return true;
                
                // Try matching with original numbers (without cleaning)
                if (assoc.phone.includes(searchPhone) || searchPhone.includes(assoc.phone)) return true;
                
                // Try matching with 05 prefix
                const withPrefix = '05' + searchPhone;
                if (assoc.phone.includes(withPrefix) || withPrefix.includes(assoc.phone)) return true;
                
                return false;
            });
            
            if (found && !foundAssociations.some(a => a.id === found.id)) {
                foundAssociations.push(found);
            }
        });

        if (foundAssociations.length === 0) {
            showNotification('⚠️ لم يتم العثور على جمعيات مطابقة للأرقام المدخلة');
            // Still open the search section to show results
            setPhoneSearchResults([]);
            setSelectedPhoneIds([]);
            setIsPhoneSearchOpen(true);
            return;
        }

        setPhoneSearchResults(foundAssociations);
        setSelectedPhoneIds(foundAssociations.map(a => a.id));
        setIsPhoneSearchOpen(true);
        showNotification(`✅ تم العثور على ${foundAssociations.length} جمعية مطابقة من ${phoneNumbers.length} رقم`);
    };

    const handleSelectAllPhoneResults = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedPhoneIds(phoneSearchResults.map(a => a.id));
        } else {
            setSelectedPhoneIds([]);
        }
    };

    const handleSelectPhoneOne = (id: number) => {
        if (selectedPhoneIds.includes(id)) {
            setSelectedPhoneIds(selectedPhoneIds.filter(i => i !== id));
        } else {
            setSelectedPhoneIds([...selectedPhoneIds, id]);
        }
    };

    const handleMovePhoneResults = (status: AssociationStatus) => {
        if (selectedPhoneIds.length === 0) {
            showNotification('⚠️ الرجاء تحديد جمعيات أولاً');
            return;
        }
        
        if (status === 'response_rate') {
            setMoveTarget(status);
            setIsMoveModalOpen(true);
        } else {
            setAssociations(prev => prev.map(a =>
                selectedPhoneIds.includes(a.id) ? { 
                    ...a, 
                    status: status,
                    ...(status === 'not_contacted' && { response_rate: undefined })
                } : a
            ));
            setSelectedPhoneIds([]);
            setIsPhoneSearchOpen(false);
            showNotification(`✅ تم نقل ${selectedPhoneIds.length} جمعية إلى ${status === 'contacted' ? 'تم التواصل' : status === 'not_contacted' ? 'لم يتم التواصل' : 'جديد'}`);
        }
    };
    const handleRemoveDuplicates = () => {
        const seen = new Set<string>();
        const unique = associations.filter(assoc => {
            const key = `${assoc.name.toLowerCase().trim()}|${assoc.phone.trim()}|${assoc.email?.toLowerCase().trim() || ''}`;
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
                filtered = associations.filter(a => a.mainCategory !== deleteCategory);
                break;
            case 'city':
                filtered = associations.filter(a => a.city !== deleteCity);
                break;
            case 'search':
                filtered = associations.filter(a => 
                    !a.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                    !a.city.toLowerCase().includes(searchTerm.toLowerCase()) &&
                    !a.region.toLowerCase().includes(searchTerm.toLowerCase())
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
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-800 p-4 rounded-xl relative z-10">
                <div className="flex flex-wrap items-center gap-2">
                    {/* 🔥 NEW: Phone Search Button */}
                    <button
                        onClick={() => setIsPhoneSearchOpen(!isPhoneSearchOpen)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all shadow-lg hover:shadow-purple-500/50 font-medium"
                    >
                        📱 بحث بالجوال
                    </button>
                    {/* 🔥 NEW: Reset Regions Button */}
                    <button
                        onClick={resetToAllRegions}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg hover:from-indigo-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-indigo-500/50 font-medium"
                    >
                        🗺️ استعادة جميع المناطق
                    </button>
                    {/* 🔥 NEW: Fix Donation Links Button */}
                    <button
                        onClick={fixDonationLinks}
                        className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-teal-500/50 font-medium"
                    >
                        🔧 إصلاح روابط التبرع
                    </button>
                    {/* 🔥 NEW: Fix Contact Fields Button */}
                    <button
                        onClick={fixContactFields}
                        className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-yellow-500/50 font-medium"
                    >
                        👤 إصلاح حقول الاتصال
                    </button>
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
                                        setAssociations(prev => prev.map(a =>
                                            selectedIds.includes(a.id) ? { ...a, status: 'response_rate', response_rate: bulkResponseRate } : a
                                        ));
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
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto relative z-20">
                    {/* 🔥 NEW: Region Filter */}
                    <select
                        value={filterRegion}
                        onChange={(e) => setFilterRegion(e.target.value)}
                        className="px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-auto relative z-20"
                    >
                        <option value="">جميع المناطق</option>
                        {[
                            ...new Set(
                                associations
                                    .map(a => (a.region || '').trim())
                                    .filter(Boolean)
                            )
                        ]
                            .sort()
                            .map(region => (
                                <option key={region} value={region}>{region}</option>
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

            {/* Phone Search Section */}
            {isPhoneSearchOpen && (
                <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700 animate-fadeIn">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-white">بحث بالجوال ونقل مجمّع</h3>
                        <button
                            onClick={() => setIsPhoneSearchOpen(false)}
                            className="text-slate-400 hover:text-white text-xl"
                        >
                            ×
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-slate-300 mb-2">أدخل أرقام الجوال (كل رقم في سطر أو مفصول بفاصلة):</label>
                            <textarea
                                placeholder="0501234567&#10;0559876543&#10;0123456789"
                                className="w-full h-32 px-4 py-3 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                                value={phoneSearchText}
                                onChange={(e) => setPhoneSearchText(e.target.value)}
                            ></textarea>
                            <button onClick={handlePhoneSearch} className="mt-2 w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                                🔍 بحث عن الأرقام
                            </button>
                        </div>
                        <div>
                            {phoneSearchResults.length > 0 && (
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm text-slate-300">نتائج البحث ({phoneSearchResults.length}):</label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                onChange={handleSelectAllPhoneResults}
                                                checked={selectedPhoneIds.length === phoneSearchResults.length && phoneSearchResults.length > 0}
                                                className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-purple-500 focus:ring-purple-500"
                                            />
                                            <span className="text-slate-300 text-sm">تحديد الكل</span>
                                        </label>
                                    </div>
                                    <div className="max-h-40 overflow-y-auto bg-slate-700 rounded-lg p-2">
                                        {phoneSearchResults.map(assoc => (
                                            <div key={assoc.id} className="flex items-center gap-2 p-2 hover:bg-slate-600 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPhoneIds.includes(assoc.id)}
                                                    onChange={() => handleSelectPhoneOne(assoc.id)}
                                                    className="w-4 h-4 rounded bg-slate-600 border-slate-500 text-purple-500 focus:ring-purple-500"
                                                />
                                                <span className="text-white text-sm">{assoc.name}</span>
                                                <span className="text-slate-400 text-sm">- {assoc.phone}</span>
                                                <span className="text-slate-500 text-xs">({assoc.city})</span>
                                                <span className="text-slate-400 text-xs">
                                                    - 👤 {assoc.contact === 'غير محدد' || !assoc.contact ? assoc.phone : assoc.contact}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    {selectedPhoneIds.length > 0 && (
                                        <div className="mt-3 space-y-2">
                                            <p className="text-sm text-slate-300">نقل المحدد ({selectedPhoneIds.length}) إلى:</p>
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => handleMovePhoneResults('contacted')}
                                                    className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 text-xs"
                                                >
                                                    تم التواصل
                                                </button>
                                                <button
                                                    onClick={() => handleMovePhoneResults('not_contacted')}
                                                    className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-xs"
                                                >
                                                    لم يتم التواصل
                                                </button>
                                                <button
                                                    onClick={() => handleMovePhoneResults('response_rate')}
                                                    className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30 text-xs"
                                                >
                                                    معدل الاستجابة
                                                </button>
                                                <button
                                                    onClick={() => handleMovePhoneResults('new')}
                                                    className="px-3 py-1 bg-slate-600/20 text-slate-400 rounded hover:bg-slate-600/30 text-xs"
                                                >
                                                    جديد
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
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
                                const data = filteredAssociations.map(a => a.donationLink || '').filter(v => v).join('\n');
                                navigator.clipboard.writeText(data);
                                alert('تم نسخ روابط التبرع بنجاح!');
                            }}
                            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm whitespace-nowrap">
                            🔗 نسخ جميع روابط التبرع
                        </button>
                        <button
                            onClick={() => {
                                const data = filteredAssociations.map(a => a.contact).filter(v => v).join('\n');
                                navigator.clipboard.writeText(data);
                                alert('تم نسخ أسماء الأشخاص المسؤولين بنجاح!');
                            }}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm whitespace-nowrap">
                            👤 نسخ جميع أسماء المسؤولين
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
                                placeholder="انسخ البيانات والصقها هنا...&#10;مثال: جمعية البركة | 0112345678 | الرياض | خيرية | https://baraka.org/donate | الأسر المحتاجة | مستجيب | أحمد محمد"
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
                                <th className="px-6 py-4">رقم الجوال</th>
                                <th className="px-6 py-4">المدينة</th>
                                <th className="px-6 py-4">التصنيف النوعي</th>
                                <th className="px-6 py-4">رابط التبرع/الموقع</th>
                                <th className="px-6 py-4">الفئة المستهدفة</th>
                                <th className="px-6 py-4">حالة الاستجابة</th>
                                <th className="px-6 py-4">الاتصال</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAssociations.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-16 text-center">
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
                                        <td className="px-6 py-4">{assoc.phone}</td>
                                        <td className="px-6 py-4">{assoc.city}</td>
                                        <td className="px-6 py-4 text-xs">
                                            <span className="bg-slate-700 px-2 py-1 rounded">{assoc.mainCategory}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {assoc.donationLink && assoc.donationLink.startsWith('http') ? (
                                                <a href={assoc.donationLink} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline">
                                                    🔗 رابط
                                                </a>
                                            ) : assoc.donationLink ? (
                                                <span className="text-slate-500 text-xs" title={assoc.donationLink}>
                                                    🔗 غير صالح
                                                </span>
                                            ) : (
                                                <span className="text-slate-500">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">{assoc.targetAudience}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs 
                                                ${assoc.responseStatus === 'مستجيب' ? 'bg-emerald-500/20 text-emerald-400' :
                                                    assoc.responseStatus === 'لم يستجب' ? 'bg-red-500/20 text-red-400' : 'bg-slate-600/20 text-slate-400'}`}>
                                                {assoc.responseStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2 text-slate-400">
                                                <span title={assoc.contact === 'غير محدد' || !assoc.contact ? assoc.phone : assoc.contact}>
                                                    👤 {assoc.contact === 'غير محدد' || !assoc.contact ? assoc.phone : assoc.contact}
                                                </span>
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
                        <button onClick={() => {
                            if (selectedPhoneIds.length > 0) {
                                confirmMovePhoneResponseRate();
                            } else {
                                confirmMoveResponseRate();
                            }
                        }} className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">تأكيد ونقل</button>
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
                                {[...new Set(associations.map(a => a.mainCategory))].map(cat => (
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
