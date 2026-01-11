import React, { useState } from 'react';
import type { Employee, User } from '../types';
import Modal from './Modal';
import AddEmployeeForm from './AddEmployeeForm';
import ExportButtons from './ExportButtons';
import { exportToPrintableView, exportToExcel, hasPermission } from '../utils/exportHelpers';

interface TeamViewProps {
  employees: Employee[];
  onSaveEmployee: (employeeData: Omit<Employee, 'id' | 'avatar_url'> & { password?: string }, id?: string) => void;
  onDeleteEmployee: (employeeId: string) => void;
  currentUser: User;
}

const TeamView: React.FC<TeamViewProps> = ({ employees, onSaveEmployee, onDeleteEmployee, currentUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const canManage = hasPermission(currentUser, 'manageTeam');

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
  };

  const handleSave = (employeeData: Omit<Employee, 'id' | 'avatar_url'> & { password?: string }) => {
    onSaveEmployee(employeeData, editingEmployee?.id);
    handleCloseModal();
  };
  
  const roleDisplay: Record<Employee['role'], { text: string; className: string }> = {
    Admin: { text: 'مدير', className: 'bg-cyan-500/20 text-cyan-400' },
    Supervisor: { text: 'مشرف', className: 'bg-yellow-500/20 text-yellow-400' },
    Member: { text: 'عضو', className: 'bg-slate-600/20 text-slate-300' },
  };

  const handleExcelExport = () => {
    const dataToExport = employees.map(emp => ({
      'الاسم': emp.name,
      'اسم المستخدم': emp.username,
      'البريد الإلكتروني': emp.email,
      'الدور': roleDisplay[emp.role].text,
    }));
    exportToExcel(dataToExport, 'employees_report');
  };

  const handlePdfExport = () => {
    const tableHtml = `
      <table>
        <thead>
          <tr>
            <th>الاسم</th>
            <th>اسم المستخدم</th>
            <th>البريد الإلكتروني</th>
            <th>الدور</th>
          </tr>
        </thead>
        <tbody>
          ${employees.map(emp => `
            <tr>
              <td>${emp.name}</td>
              <td>${emp.username}</td>
              <td>${emp.email}</td>
              <td>${roleDisplay[emp.role].text}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    exportToPrintableView('تقرير الموظفين', tableHtml);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold text-white">إدارة فريق العمل</h2>
        <div className="flex items-center gap-2">
            {canManage && (
              <button
                onClick={handleOpenAddModal}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
              >
                إضافة عضو جديد
              </button>
            )}
            {hasPermission(currentUser, 'exportData') && <ExportButtons onPdfExport={handlePdfExport} onExcelExport={handleExcelExport} />}
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right text-slate-400">
            <thead className="text-xs text-slate-300 uppercase bg-slate-900">
              <tr>
                <th scope="col" className="px-6 py-4">العضو</th>
                <th scope="col" className="px-6 py-4">الدور</th>
                {canManage && <th scope="col" className="px-6 py-4 text-center">إجراءات</th>}
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} className="bg-slate-800 border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img className="w-10 h-10 rounded-full" src={employee.avatar_url} alt={employee.name} />
                      <div>
                        <div className="text-base font-semibold text-white">{employee.name}</div>
                        <div className="font-normal text-slate-400">{employee.username} | {employee.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${roleDisplay[employee.role].className}`}>
                      {roleDisplay[employee.role].text}
                    </span>
                  </td>
                  {canManage && (
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleOpenEditModal(employee)} className="font-medium text-cyan-400 hover:underline">تعديل</button>
                        <span className="text-slate-600">|</span>
                        <button onClick={() => onDeleteEmployee(employee.id)} className="font-medium text-red-400 hover:underline">حذف</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingEmployee ? 'تعديل بيانات العضو' : 'إضافة عضو جديد'}>
        <AddEmployeeForm
          onSave={handleSave}
          onClose={handleCloseModal}
          initialData={editingEmployee}
        />
      </Modal>
    </div>
  );
};

export default TeamView;