import React, { useState, useEffect } from 'react';
import { requestNotificationPermission } from '../utils/exportHelpers';

const permissionsConfig = {
    canManageProjects: { label: 'إدارة المشاريع', description: 'السماح بإنشاء وتعديل وحذف المشاريع.' },
    canManageTasks: { label: 'إدارة كل المهام', description: 'السماح بإنشاء وتعديل وحذف أي مهمة في النظام.' },
    canManageTeam: { label: 'إدارة فريق العمل', description: 'السماح بإضافة وتعديل وحذف أعضاء الفريق.' },
    canViewReports: { label: 'عرض التقارير', description: 'السماح بالوصول إلى صفحة التقارير العامة.' },
    canAssignTasks: { label: 'إسناد المهام', description: 'السماح بإسناد المهام لأعضاء الفريق الآخرين.' },
};

type PermissionKey = keyof typeof permissionsConfig;
type Role = 'supervisor' | 'member';

const SettingsView: React.FC = () => {
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);
    const [permissions, setPermissions] = useState({
        supervisor: {
            canManageProjects: true,
            canManageTasks: true,
            canManageTeam: false,
            canViewReports: true,
            canAssignTasks: true,
        },
        member: {
            canManageProjects: false,
            canManageTasks: false,
            canManageTeam: false,
            canViewReports: false,
            canAssignTasks: false,
        },
    });
    
    useEffect(() => {
        if (typeof Notification !== 'undefined') {
          setNotificationPermission(Notification.permission);
        }
    }, []);

    const handleEnableNotifications = async () => {
        const permission = await requestNotificationPermission();
        setNotificationPermission(permission);
    };

    const handlePermissionChange = (role: Role, key: PermissionKey, value: boolean) => {
        setPermissions(prev => ({
            ...prev,
            [role]: {
                ...prev[role],
                [key]: value
            }
        }));
    };

    const PermissionRow: React.FC<{ pKey: PermissionKey; isChecked: boolean; onChange: (checked: boolean) => void; disabled?: boolean; role: string }> = 
      ({ pKey, isChecked, onChange, disabled = false, role }) => (
        <div className={`flex items-center justify-between p-4 rounded-lg ${disabled ? 'bg-slate-900/50' : 'bg-slate-900'}`}>
            <div>
                <h4 className="font-semibold text-white">{permissionsConfig[pKey].label}</h4>
                <p className="text-sm text-slate-400 mt-1">{permissionsConfig[pKey].description}</p>
            </div>
            <label htmlFor={`${pKey}-${role}`} className="relative inline-flex items-center cursor-pointer">
                <input 
                    type="checkbox" 
                    id={`${pKey}-${role}`} 
                    className="sr-only peer" 
                    checked={isChecked} 
                    onChange={(e) => onChange(e.target.checked)}
                    disabled={disabled}
                />
                <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-cyan-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600 peer-disabled:cursor-not-allowed peer-disabled:bg-slate-600"></div>
            </label>
        </div>
    );

    return (
        <div>
            <h2 className="text-3xl font-bold text-white mb-8">الإعدادات</h2>

            <div className="space-y-8">
                 {/* Permissions Management */}
                <div className="bg-slate-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-white mb-6">إدارة الصلاحيات</h3>
                    <div className="space-y-6">
                        {/* Admin Permissions */}
                        <div>
                            <h4 className="text-lg font-semibold text-cyan-400 mb-4">صلاحيات المدير (Admin)</h4>
                            <div className="space-y-3">
                                {(Object.keys(permissionsConfig) as PermissionKey[]).map(key => (
                                    <PermissionRow key={`admin-${key}`} pKey={key} isChecked={true} onChange={() => {}} disabled={true} role="admin" />
                                ))}
                            </div>
                        </div>

                        {/* Supervisor Permissions */}
                        <div>
                             <h4 className="text-lg font-semibold text-yellow-400 mb-4 pt-4 border-t border-slate-700">صلاحيات المشرف (Supervisor)</h4>
                             <div className="space-y-3">
                                {(Object.keys(permissionsConfig) as PermissionKey[]).map(key => (
                                    <PermissionRow 
                                        key={`supervisor-${key}`} 
                                        pKey={key} 
                                        isChecked={permissions.supervisor[key]} 
                                        onChange={(checked) => handlePermissionChange('supervisor', key, checked)}
                                        role="supervisor"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Member Permissions */}
                        <div>
                             <h4 className="text-lg font-semibold text-slate-300 mb-4 pt-4 border-t border-slate-700">صلاحيات العضو (Member)</h4>
                             <div className="space-y-3">
                                {(Object.keys(permissionsConfig) as PermissionKey[]).map(key => (
                                    <PermissionRow 
                                        key={`member-${key}`} 
                                        pKey={key} 
                                        isChecked={permissions.member[key]} 
                                        onChange={(checked) => handlePermissionChange('member', key, checked)}
                                        role="member" 
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="bg-slate-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-white mb-4">إعدادات الإشعارات</h3>
                    <div className="flex items-center justify-between bg-slate-900 p-4 rounded-lg">
                        <div>
                            <h4 className="font-semibold text-white">إشعارات المهام</h4>
                            <p className="text-sm text-slate-400 mt-1">احصل على تذكير للمهام القادمة والمتأخرة.</p>
                        </div>
                        <div>
                            {notificationPermission === 'granted' && (
                                <button className="px-4 py-2 rounded-lg font-semibold text-sm bg-green-500/20 text-green-400 cursor-default">
                                    تم التمكين
                                </button>
                            )}
                            {notificationPermission === 'default' && (
                                <button onClick={handleEnableNotifications} className="px-4 py-2 rounded-lg font-semibold text-sm transition-colors bg-cyan-600 text-white hover:bg-cyan-700">
                                    تمكين
                                </button>
                            )}
                            {notificationPermission === 'denied' && (
                                <button disabled className="px-4 py-2 rounded-lg font-semibold text-sm bg-red-500/20 text-red-400 cursor-not-allowed">
                                    تم الرفض
                                </button>
                            )}
                        </div>
                    </div>
                    {notificationPermission === 'denied' && (
                       <p className="text-xs text-red-400 mt-2">لقد قمت بحظر الإشعارات. يرجى تمكينها من إعدادات المتصفح الخاص بك.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsView;