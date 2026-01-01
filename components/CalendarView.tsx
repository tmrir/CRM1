import React, { useState, useMemo } from 'react';
import type { Task, Project, Employee, User } from '../types';
import Modal from './Modal';
import AddTaskForm from './AddTaskForm';
import ExportButtons from './ExportButtons';
import { exportToPrintableView, exportToExcel, hasPermission } from '../utils/exportHelpers';

interface CalendarViewProps {
  tasks: Task[];
  projects: Project[];
  employees: Employee[];
  onSaveTask: (taskData: Omit<Task, 'id'>, id?: number) => void;
  onDeleteTask: (taskId: number) => void;
  currentUser: User;
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, projects, employees, onSaveTask, onDeleteTask, currentUser }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);


  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDay = startOfMonth.getDay(); // 0 = Sunday, 1 = Monday...
  const daysInMonth = endOfMonth.getDate();
  const today = new Date();
  today.setHours(0,0,0,0);


  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const handleOpenAddModal = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setEditingTask({
        id: Date.now(),
        description: '',
        status: 'todo',
        priority: 'medium',
        due_date: date.toISOString().split('T')[0],
        due_time: '',
        employee_id: null,
        project_id: null,
        sub_tasks: []
    });
    setIsModalOpen(true);
  };
  
  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  }

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleSave = (taskData: Omit<Task, 'id'>) => {
    onSaveTask(taskData, editingTask?.id);
    handleCloseModal();
  };

  const handleDeleteAndClose = (taskId: number) => {
    onDeleteTask(taskId);
    handleCloseModal();
  };

  const tasksForCurrentMonth = useMemo(() => {
    return tasks.filter(task => {
        if (!task.due_date) return false;
        const taskDate = new Date(task.due_date);
        return taskDate.getFullYear() === currentDate.getFullYear() &&
               taskDate.getMonth() === currentDate.getMonth();
    }).sort((a,b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  }, [tasks, currentDate]);

  const handleExcelExport = () => {
    const dataToExport = tasksForCurrentMonth.map(task => ({
        'التاريخ': task.due_date,
        'الوقت': task.due_time || '',
        'الوصف': task.description,
        'الموظف المسؤول': employees.find(e => e.id === task.employee_id)?.name || 'غير معين',
        'الحالة': task.status
    }));
    const monthName = currentDate.toLocaleString('ar-EG', { month: 'long', year: 'numeric' });
    exportToExcel(dataToExport, `calendar_report_${monthName}`);
  };

  const handlePdfExport = () => {
    const monthName = currentDate.toLocaleString('ar-EG', { month: 'long', year: 'numeric' });
    const title = `تقرير مهام شهر ${monthName}`;
    const tableHtml = `
        <table>
            <thead>
                <tr>
                    <th>التاريخ</th>
                    <th>الوقت</th>
                    <th>الوصف</th>
                    <th>الموظف</th>
                    <th>الحالة</th>
                </tr>
            </thead>
            <tbody>
                ${tasksForCurrentMonth.map(task => `
                    <tr>
                        <td>${task.due_date}</td>
                        <td>${task.due_time || ''}</td>
                        <td>${task.description}</td>
                        <td>${employees.find(e => e.id === task.employee_id)?.name || 'غير معين'}</td>
                        <td>${task.status}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    exportToPrintableView(title, tableHtml);
  };

  const renderDays = () => {
    const days = [];
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`blank-${i}`} className="border border-slate-800"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateString = date.toISOString().split('T')[0];
      const tasksForDay = tasks.filter(task => task.due_date === dateString);
      const isToday = date.toDateString() === today.toDateString();

      days.push(
        <div key={day} className={`border border-slate-800 p-2 flex flex-col min-h-[120px] ${isToday ? 'bg-slate-700/50' : ''}`}>
          <div className="flex justify-between items-start">
            <time dateTime={dateString} className={`font-semibold ${isToday ? 'text-cyan-400' : 'text-white'}`}>{day}</time>
            {tasksForDay.length > 0 && (
                <span className="bg-cyan-600 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                    {tasksForDay.length}
                </span>
            )}
          </div>
          <div className="flex-1 mt-1 space-y-1 overflow-y-auto">
            {tasksForDay.map(task => {
                 const canEdit = hasPermission(currentUser, 'editAnyTask') || task.employee_id === currentUser.id;
                 return (
                     <div 
                        key={task.id} 
                        onClick={() => canEdit && handleOpenEditModal(task)} 
                        className={`text-xs bg-cyan-900/70 text-cyan-200 p-1 rounded truncate ${canEdit ? 'cursor-pointer hover:bg-cyan-800' : 'cursor-default'}`} 
                        title={task.description}>
                        {task.due_time && <span className="font-bold me-1">{task.due_time}</span>}
                        {task.description}
                     </div>
                 )
            })}
          </div>
          {hasPermission(currentUser, 'createTasks') && (
            <button onClick={() => handleOpenAddModal(day)} className="mt-1 text-xs text-center text-slate-400 hover:text-white transition-colors w-full">+ إضافة</button>
          )}
        </div>
      );
    }
    return days;
  };

  return (
    <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h2 className="text-3xl font-bold text-white">التقويم</h2>
            <div className="flex items-center gap-4">
                <button onClick={handlePrevMonth} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 transition-colors">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                 <h3 className="text-xl font-semibold text-white w-40 text-center">
                    {currentDate.toLocaleString('ar-EG', { month: 'long', year: 'numeric' })}
                </h3>
                <button onClick={handleNextMonth} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 transition-colors">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
            </div>
             {hasPermission(currentUser, 'exportData') && <ExportButtons onPdfExport={handlePdfExport} onExcelExport={handleExcelExport} />}
        </div>
        
        <div className="bg-slate-800 rounded-xl shadow-lg">
            <div className="grid grid-cols-7 text-center font-bold text-slate-300 p-4 border-b border-slate-700">
                {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map(day => <div key={day}>{day}</div>)}
            </div>
             <div className="grid grid-cols-7">
                {renderDays()}
            </div>
        </div>

        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingTask && editingTask.description ? 'تعديل المهمة' : 'إضافة مهمة جديدة'}>
            <AddTaskForm
                onSave={handleSave}
                onClose={handleCloseModal}
                initialData={editingTask}
                projects={projects}
                employees={employees}
                currentUser={currentUser}
                onDelete={handleDeleteAndClose}
            />
        </Modal>
    </div>
  );
};

export default CalendarView;