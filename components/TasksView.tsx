import React, { useState, useMemo, useEffect } from 'react';
import type { Task, TaskStatus, Project, Employee, User } from '../types';
import Modal from './Modal';
import AddTaskForm from './AddTaskForm';
import ExportButtons from './ExportButtons';
import { exportToPrintableView, exportToExcel, hasPermission } from '../utils/exportHelpers';

interface TasksViewProps {
    tasks: Task[];
    projects: Project[];
    employees: Employee[];
    onSave: (taskData: Omit<Task, 'id'>, id?: number) => void;
    onDelete: (taskId: number) => void;
    currentUser: User;
}

type KanbanColumn = 'overdue' | TaskStatus;

const columnConfig: Record<KanbanColumn, { title: string; color: string }> = {
  overdue: { title: 'متأخرة', color: 'border-red-500' },
  todo: { title: 'قيد التنفيذ', color: 'border-blue-500' },
  inprogress: { title: 'جاري العمل', color: 'border-yellow-500' },
  done: { title: 'مكتملة', color: 'border-green-500' },
};

const priorityConfig: Record<Task['priority'], { label: string; className: string }> = {
    low: { label: 'منخفضة', className: 'bg-slate-600' },
    medium: { label: 'متوسطة', className: 'bg-yellow-600' },
    high: { label: 'عالية', className: 'bg-red-600' },
};

export const TaskCard: React.FC<{ 
    task: Task; 
    onEdit?: (task: Task) => void; 
    employees: Employee[];
    projects: Project[];
    isReadOnly?: boolean;
    currentUser: User;
}> = ({ task, onEdit, employees, projects, isReadOnly = false, currentUser }) => {
    const assignee = employees.find(e => e.id === task.employee_id);
    const completedSubTasks = task.sub_tasks.filter(st => st.completed).length;
    const totalSubTasks = task.sub_tasks.length;
    const progressPercentage = totalSubTasks > 0 ? Math.round((completedSubTasks / totalSubTasks) * 100) : 0;
    const linkedProject = projects.find(p => p.id === task.project_id);
    
    const hasSubTasks = totalSubTasks > 0;
    const hasFooter = linkedProject || assignee;
    
    const [timeProgress, setTimeProgress] = useState(0);

    const canEdit = !isReadOnly && (hasPermission(currentUser, 'editAnyTask') || task.employee_id === currentUser.id);

    useEffect(() => {
        let intervalId: number | undefined;

        const calculateTimeProgress = () => {
            if (task.status === 'inprogress' && task.started_at && task.due_date) {
                const startTime = new Date(task.started_at).getTime();
                const dueDateTimeString = task.due_time ? `${task.due_date}T${task.due_time}` : `${task.due_date}T23:59:59`;
                const endTime = new Date(dueDateTimeString).getTime();
                const now = new Date().getTime();

                if (now < startTime || endTime <= startTime) {
                    setTimeProgress(0);
                    return;
                }

                const totalDuration = endTime - startTime;
                const elapsed = now - startTime;
                
                const progress = (elapsed / totalDuration) * 100;
                
                setTimeProgress(progress);
            } else {
                setTimeProgress(0);
            }
        };

        calculateTimeProgress();

        if (task.status === 'inprogress' && task.started_at && task.due_date) {
            intervalId = window.setInterval(calculateTimeProgress, 60000); // Update every minute
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [task.status, task.started_at, task.due_date, task.due_time]);

    const handleShareToWhatsapp = (e: React.MouseEvent) => {
        e.preventDefault(); 
        e.stopPropagation(); 

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(task.due_date);
        dueDate.setHours(0,0,0,0);
        const isOverdue = dueDate < today && task.status !== 'done';
        
        let message = '';
        const taskDetails = `\n\n*المهمة:* ${task.description}\n*المشروع:* ${linkedProject?.name || 'غير محدد'}`;
        const extensionCount = task.extension_count || 0;

        if (task.status === 'done') {
            message = `*شكراً لالتزامك!* 🎉\n\nتم إكمال المهمة بنجاح. نقدر جهودك في إنجازها.${taskDetails}`;
        } else if (isOverdue) {
             const reminderType = extensionCount > 0 ? 'تذكير ثانٍ' : 'تنبيه';
             const actionRequired = extensionCount > 0 
                ? 'يرجى الدخول لحسابك وفتح المهمة لتوضيح سبب التأخير وطلب المساعدة.'
                : 'يرجى الدخول لحسابك وفتح المهمة لطلب تمديد أو تحديث حالتها.';
            message = `*${reminderType} تأخير في مهمة* 😟\n\nلاحظنا أن المهمة التالية قد تجاوزت تاريخ استحقاقها. ${actionRequired}${taskDetails}`;

        } else if (task.status === 'todo') {
            message = `*تذكير ببدء مهمة* 👋\n\nهذه المهمة مسندة إليك ولم تبدأ بعد. يرجى البدء في العمل عليها وتغيير حالتها إلى "جاري العمل" ليعرف الفريق تقدمك.${taskDetails}`;
        } else { // 'inprogress'
             message = `*متابعة حالة مهمة* ⚙️\n\nهذا تحديث بخصوص المهمة التالية:\n*الحالة الحالية:* ${columnConfig[task.status].title}\n${taskDetails}\n\nيرجى الاستمرار في العمل الجيد!`;
        }

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    };

    const handleCardClick = () => {
        if (canEdit && onEdit) {
            onEdit(task);
        }
    };
    
    const hasTimeline = task.status === 'inprogress' && task.started_at && task.due_date;
    const hasMiddleSection = hasTimeline || hasSubTasks;
    
    const displayProgress = Math.round(timeProgress);
    const barWidth = Math.min(timeProgress, 100);
    const isTimeOver = timeProgress > 100;
    const barColor = isTimeOver ? 'bg-red-500' : 'bg-yellow-500';
    const textColor = isTimeOver ? 'text-red-400' : 'text-yellow-400';

    return (
      <div onClick={handleCardClick} className={`bg-slate-800 p-4 rounded-lg shadow-md mb-3 flex flex-col justify-between ${canEdit ? 'cursor-pointer hover:bg-slate-700/50' : 'cursor-default'}`}>
        <div>
            <div className="flex justify-between items-start">
              <p className="text-white font-semibold pr-2">{task.description}</p>
              {task.assistance_requested && (
                <span title="تحتاج مساعدة" className="flex-shrink-0 bg-yellow-500/20 text-yellow-400 text-xs font-bold px-2 py-1 rounded-full">تحتاج مساعدة</span>
              )}
            </div>
          <div className="flex items-center justify-between mt-3 text-xs">
            <span className={`px-2 py-1 rounded-full text-white ${priorityConfig[task.priority].className}`}>{priorityConfig[task.priority].label}</span>
            <div className="flex items-center gap-1 text-slate-400">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
               <span>{task.due_date} {task.due_time && `- ${task.due_time}`}</span>
            </div>
          </div>
          
           {hasMiddleSection && (
            <div className="mt-3 pt-3 border-t border-slate-700 space-y-3">
              {hasTimeline && (
                <div>
                    <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                        <span id={`timeline-label-${task.id}`}>الجدول الزمني</span>
                        <span className={textColor}>{displayProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-1.5" role="progressbar" title={`الوقت المنقضي ${displayProgress}%`} aria-labelledby={`timeline-label-${task.id}`} aria-valuenow={displayProgress} aria-valuemin={0} aria-valuemax={100}>
                        <div className={`${barColor} h-1.5 rounded-full transition-all duration-300`} style={{ width: `${barWidth}%` }}></div>
                    </div>
                </div>
              )}
              {hasSubTasks && (
                <div>
                    <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                        <span id={`subtasks-label-${task.id}`}>المهام الفرعية</span>
                        <span>{completedSubTasks}/{totalSubTasks}</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-1.5" role="progressbar" title={`اكتمل ${progressPercentage}%`} aria-labelledby={`subtasks-label-${task.id}`} aria-valuenow={completedSubTasks} aria-valuemin={0} aria-valuemax={totalSubTasks}>
                        <div className="bg-cyan-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                </div>
              )}
            </div>
          )}
        </div>

        {hasFooter && (
            <div className={`mt-3 pt-3 border-t border-slate-700 space-y-2`}>
                {linkedProject && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                        <span>مشروع: {linkedProject.name}</span>
                    </div>
                )}
                {assignee && (
                    <div className={`flex items-center justify-between ${linkedProject ? 'mt-2 pt-2 border-t border-slate-700/50' : ''}`}>
                         <div className="flex items-center gap-2">
                            <img src={assignee.avatar_url} alt={assignee.name} className="w-6 h-6 rounded-full" title={assignee.name} />
                            <span className="text-sm text-slate-200 font-medium">{assignee.name}</span>
                        </div>
                        {!isReadOnly && (
                            <a
                                onClick={handleShareToWhatsapp}
                                href="#"
                                title="مشاركة على واتساب"
                                className="text-green-400 hover:text-green-300 transition-colors p-1 rounded-full hover:bg-slate-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.269.654 4.515 1.965 6.451l-1.416 5.176 5.317-1.397z"/></svg>
                            </a>
                        )}
                    </div>
                )}
            </div>
        )}
      </div>
    );
};


const TasksView: React.FC<TasksViewProps> = ({ tasks, projects, employees, onSave, onDelete, currentUser }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const handleOpenAddModal = () => {
        setEditingTask(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (task: Task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTask(null);
    };

    const handleSave = (taskData: Omit<Task, 'id'>) => {
        onSave(taskData, editingTask?.id);
        handleCloseModal();
    };

    const handleDeleteAndClose = (taskId: number) => {
        onDelete(taskId);
        handleCloseModal();
    };

    const { overdueTasks, todoTasks, inprogressTasks, doneTasks } = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const overdue = tasks.filter(t => new Date(t.due_date) < today && t.status !== 'done');
        const done = tasks.filter(t => t.status === 'done');
        const inprogress = tasks.filter(t => t.status === 'inprogress' && !overdue.includes(t));
        const todo = tasks.filter(t => t.status === 'todo' && !overdue.includes(t));

        return { 
            overdueTasks: overdue, 
            todoTasks: todo, 
            inprogressTasks: inprogress, 
            doneTasks: done 
        };
    }, [tasks]);

    const tasksByColumn: Record<KanbanColumn, Task[]> = {
        overdue: overdueTasks,
        todo: todoTasks,
        inprogress: inprogressTasks,
        done: doneTasks
    };

    const handleExcelExport = () => {
        const dataToExport = tasks.map(task => ({
            'الوصف': task.description,
            'الحالة': columnConfig[task.status].title,
            'الأولوية': priorityConfig[task.priority].label,
            'تاريخ الاستحقاق': task.due_date,
            'وقت الاستحقاق': task.due_time || '',
            'الموظف المسؤول': employees.find(e => e.id === task.employee_id)?.name || 'غير معين',
            'المشروع': projects.find(p => p.id === task.project_id)?.name || 'لا يوجد',
            'المهام الفرعية المكتملة': `${task.sub_tasks.filter(st => st.completed).length}/${task.sub_tasks.length}`
        }));
        exportToExcel(dataToExport, 'tasks_report');
    };

    const handlePdfExport = () => {
       const tableHtml = `
            <table>
                <thead>
                    <tr>
                        <th>الوصف</th>
                        <th>الحالة</th>
                        <th>الأولوية</th>
                        <th>التاريخ</th>
                        <th>الموظف</th>
                        <th>المشروع</th>
                    </tr>
                </thead>
                <tbody>
                    ${tasks.map(task => `
                        <tr>
                            <td>${task.description}</td>
                            <td>${columnConfig[task.status].title}</td>
                            <td>${priorityConfig[task.priority].label}</td>
                            <td>${task.due_date} ${task.due_time || ''}</td>
                            <td>${employees.find(e => e.id === task.employee_id)?.name || 'غير معين'}</td>
                            <td>${projects.find(p => p.id === task.project_id)?.name || 'لا يوجد'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        exportToPrintableView('تقرير المهام', tableHtml);
    };
    
    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h2 className="text-3xl font-bold text-white">لوحة المهام</h2>
                <div className="flex items-center gap-2">
                  {hasPermission(currentUser, 'createTasks') && (
                    <button onClick={handleOpenAddModal} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg text-sm w-full sm:w-auto">إضافة مهمة جديدة</button>
                  )}
                  {hasPermission(currentUser, 'exportData') && <ExportButtons onPdfExport={handlePdfExport} onExcelExport={handleExcelExport} />}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {(Object.keys(columnConfig) as KanbanColumn[]).map(column => (
                    <div key={column} className="bg-slate-900 rounded-lg p-4">
                        <h3 className={`text-lg font-bold text-white mb-4 pb-2 border-b-2 ${columnConfig[column].color}`}>{columnConfig[column].title}</h3>
                        <div className="max-h-[70vh] overflow-y-auto pr-2">
                            {tasksByColumn[column].map(task => (
                                <TaskCard key={task.id} task={task} onEdit={handleOpenEditModal} employees={employees} projects={projects} currentUser={currentUser} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingTask ? 'تعديل المهمة' : 'إضافة مهمة جديدة'}>
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

export default TasksView;