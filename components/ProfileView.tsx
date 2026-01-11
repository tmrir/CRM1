

import React, { useState, useEffect, useRef } from 'react';
import type { User } from '../types';
import ExportButtons from './ExportButtons';
import { exportToExcel, exportToPrintableView, hasPermission } from '../utils/exportHelpers';

interface ProfileViewProps {
    currentUser: User;
    onSave: (data: { name: string; email: string; username: string; }) => void;
    onUpdateAvatar: (file: File) => Promise<void>;
}

const ProfileView: React.FC<ProfileViewProps> = ({ currentUser, onSave, onUpdateAvatar }) => {
    const [name, setName] = useState(currentUser.name);
    const [email, setEmail] = useState(currentUser.email);
    const [username, setUsername] = useState(currentUser.username);
    const [isSaved, setIsSaved] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);


    useEffect(() => {
        setName(currentUser.name);
        setEmail(currentUser.email);
        setUsername(currentUser.username);
    }, [currentUser]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, email, username });
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000); // Hide message after 3 seconds
    };
    
    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            await onUpdateAvatar(file);
        } catch (error) {
            console.error("Failed to update avatar", error);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };
    
    const handleExcelExport = () => {
        const dataToExport = [{
            'الاسم': currentUser.name,
            'اسم المستخدم': currentUser.username,
            'البريد الإلكتروني': currentUser.email,
            'الدور': currentUser.role,
        }];
        exportToExcel(dataToExport, `profile_${currentUser.name}`);
    };

    const handlePdfExport = () => {
        const contentHtml = `
          <div style="text-align: center; margin-bottom: 2rem;">
            <img src="${currentUser.avatar_url}" alt="${currentUser.name}" style="width: 100px; height: 100px; border-radius: 50%; margin: 0 auto; border: 2px solid #ddd;" />
          </div>
          <table style="width: 100%; max-width: 500px; margin: 0 auto; border-collapse: collapse; font-size: 1.1rem;">
            <tbody>
              <tr style="background-color: #f9f9f9;">
                <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">الاسم</th>
                <td style="border: 1px solid #ddd; padding: 12px;">${currentUser.name}</td>
              </tr>
              <tr>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: right; background-color: #f9f9f9;">اسم المستخدم</th>
                <td style="border: 1px solid #ddd; padding: 12px;">${currentUser.username}</td>
              </tr>
              <tr style="background-color: #f9f9f9;">
                <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">البريد الإلكتروني</th>
                <td style="border: 1px solid #ddd; padding: 12px;">${currentUser.email}</td>
              </tr>
              <tr>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: right; background-color: #f9f9f9;">الدور</th>
                <td style="border: 1px solid #ddd; padding: 12px;">${currentUser.role}</td>
              </tr>
            </tbody>
          </table>
        `;
        exportToPrintableView(`ملف ${currentUser.name}`, contentHtml);
    };


    return (
        <div>
            <h2 className="text-3xl font-bold text-white mb-8">ملفي الشخصي</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-slate-800 p-6 rounded-xl shadow-lg text-center">
                        <div className="relative w-32 h-32 mx-auto mb-4 group">
                             <img 
                                src={currentUser.avatar_url} 
                                alt={currentUser.name} 
                                className="w-32 h-32 rounded-full border-4 border-slate-700 object-cover" 
                            />
                            <div 
                                onClick={handleAvatarClick}
                                className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center cursor-pointer transition-all duration-300"
                            >
                                {!isUploading && (
                                    <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                )}
                            </div>
                            {isUploading && (
                                <div className="absolute inset-0 rounded-full bg-black bg-opacity-70 flex items-center justify-center">
                                    <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelected}
                            className="hidden"
                            accept="image/png, image/jpeg, image/gif"
                        />
                        <h3 className="text-2xl font-bold text-white">{currentUser.name}</h3>
                        <p className="text-slate-400">{currentUser.username} | {currentUser.email}</p>
                        <span className="mt-4 inline-block px-3 py-1 text-sm font-medium rounded-full bg-cyan-500/20 text-cyan-400">{currentUser.role}</span>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-xl shadow-lg space-y-6">
                        <div className="flex justify-between items-center">
                           <h3 className="text-xl font-semibold text-white">تعديل معلومات الحساب</h3>
                           {hasPermission(currentUser, 'exportData') && <ExportButtons onPdfExport={handlePdfExport} onExcelExport={handleExcelExport} />}
                        </div>
                        <div>
                            <label htmlFor="profile-name" className="block text-sm font-medium text-slate-300 mb-2">الاسم الكامل</label>
                            <input type="text" id="profile-name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                        </div>
                         <div>
                            <label htmlFor="profile-username" className="block text-sm font-medium text-slate-300 mb-2">اسم المستخدم</label>
                            <input type="text" id="profile-username" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                        </div>
                        <div>
                            <label htmlFor="profile-email" className="block text-sm font-medium text-slate-300 mb-2">البريد الإلكتروني</label>
                            <input type="email" id="profile-email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                        </div>
                        <div className="pt-2 flex justify-end items-center gap-4">
                           {isSaved && <p className="text-green-400 text-sm">تم حفظ التغييرات بنجاح!</p>}
                           <button type="submit" className="px-6 py-2 rounded-md text-white bg-cyan-600 hover:bg-cyan-700 transition-colors">حفظ التغييرات</button>
                        </div>
                    </form>
                     <div className="bg-slate-800 p-6 rounded-xl shadow-lg mt-8 space-y-6">
                        <h3 className="text-xl font-semibold text-white">تغيير كلمة المرور</h3>
                         <p className="text-slate-400 text-sm">هذه ميزة وهمية لأغراض العرض التوضيحي.</p>
                        <div>
                            <label htmlFor="current-password" className="block text-sm font-medium text-slate-300 mb-2">كلمة المرور الحالية</label>
                            <input type="password" id="current-password" disabled className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                        </div>
                         <div>
                            <label htmlFor="new-password" className="block text-sm font-medium text-slate-300 mb-2">كلمة المرور الجديدة</label>
                            <input type="password" id="new-password" disabled className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                        </div>
                        <div className="pt-2 flex justify-end">
                           <button type="button" disabled className="px-6 py-2 rounded-md text-white bg-slate-600 cursor-not-allowed">تحديث كلمة المرور</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileView;