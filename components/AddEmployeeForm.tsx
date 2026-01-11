import React, { useState, useEffect } from 'react';
import type { Employee } from '../types';

interface AddEmployeeFormProps {
  onSave: (employee: Omit<Employee, 'id' | 'avatar_url'> & { password?: string }) => void;
  onClose: () => void;
  initialData?: Employee | null;
}

const AddEmployeeForm: React.FC<AddEmployeeFormProps> = ({ onSave, onClose, initialData }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Employee['role']>('Member');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setEmail(initialData.email);
      setRole(initialData.role);
      setUsername(initialData.username);
      setPassword(''); // Always clear password field when editing
    } else {
      setName('');
      setEmail('');
      setRole('Member');
      setUsername('');
      setPassword('');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialData && !password) {
        alert('كلمة المرور مطلوبة للعضو الجديد.');
        return;
    }
    onSave({ name, email, role, username, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="employee-name" className="block text-sm font-medium text-slate-300 mb-2">الاسم الكامل</label>
          <input type="text" id="employee-name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
        </div>
        <div>
          <label htmlFor="employee-email" className="block text-sm font-medium text-slate-300 mb-2">البريد الإلكتروني</label>
          <input type="email" id="employee-email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
        </div>
        <div>
          <label htmlFor="employee-username" className="block text-sm font-medium text-slate-300 mb-2">اسم المستخدم</label>
          <input type="text" id="employee-username" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
        </div>
        <div>
          <label htmlFor="employee-password"className="block text-sm font-medium text-slate-300 mb-2">كلمة المرور</label>
          <input
            type="password"
            id="employee-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!initialData} // Required only for new employees
            placeholder={initialData ? 'اتركه فارغاً لعدم التغيير' : ''}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
           />
        </div>
      </div>
      <div>
        <label htmlFor="employee-role" className="block text-sm font-medium text-slate-300 mb-2">الدور</label>
        <select 
            id="employee-role" 
            value={role} 
            onChange={(e) => setRole(e.target.value as Employee['role'])} 
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
            <option value="Member">عضو</option>
            <option value="Supervisor">مشرف</option>
            <option value="Admin">مدير</option>
        </select>
      </div>
      <div className="flex justify-end gap-4 pt-4">
        <button type="button" onClick={onClose} className="px-6 py-2 rounded-md text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors">إلغاء</button>
        <button type="submit" className="px-6 py-2 rounded-md text-white bg-cyan-600 hover:bg-cyan-700 transition-colors">{initialData ? 'حفظ التغييرات' : 'إضافة العضو'}</button>
      </div>
    </form>
  );
};

export default AddEmployeeForm;