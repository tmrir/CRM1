import React, { useState, useEffect } from 'react';
import type { Task, TaskStatus, TaskPriority, Project, Employee, SubTask, User } from '../types';
import { hasPermission } from '../utils/exportHelpers';

interface AddTaskFormProps {
  onSave: (task: Omit<Task, 'id'>) => void;
  onClose: () => void;
  initialData?: Task | null;
  projects: Project[];
  employees: Employee[];
  currentUser: User;
  onDelete?: (id: number) => void;
}

const isTaskOverdue = (task: Task): boolean => {
    if (!task.due_date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.due_date);
    dueDate.setHours(0,0,0,0);
    return dueDate < today && task.status !== 'done';
}


const AddTaskForm: React.FC<AddTaskFormProps> = ({ onSave, onClose, initialData, projects, employees, currentUser, onDelete }) => {
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [due_date, setDueDate] = useState('');
  const [due_time, setDueTime] = useState('');
  const [employee_id, setEmployeeId] = useState<string | null>(null);
  const [project_id, setProjectId] = useState<number | null>(null);
  const [sub_tasks, setSubTasks] = useState<SubTask[]>([]);
  const [newSubTaskText, setNewSubTaskText] = useState('');
  const [extension_count, setExtensionCount] = useState(0);
  const [assistance_requested, setAssistanceRequested] = useState(false);

  const canAssign = hasPermission(currentUser, 'assignTasks');

  useEffect(() => {
    if (initialData) {
      setDescription(initialData.description);
      setStatus(initialData.status);
      setPriority(initialData.priority);
      setDueDate(initialData.due_date);
      setDueTime(initialData.due_time || '');
      setEmployeeId(initialData.employee_id);
      setProjectId(initialData.project_id);
      setSubTasks(initialData.sub_tasks || []);
      setExtensionCount(initialData.extension_count || 0);
      setAssistanceRequested(initialData.assistance_requested || false);
    } else {
      const resetState = {
        description: '', status: 'todo', priority: 'medium',
        due_date: '', due_time: '', employee_id: null, project_id: null,
        sub_tasks: [], extension_count: 0, assistance_requested: false
      };
      setDescription(resetState.description);
      setStatus(resetState.status);
      setPriority(resetState.priority);
      setDueDate(resetState.due_date);
      setDueTime(resetState.due_time || '');
      setProjectId(resetState.project_id);
      setSubTasks(resetState.sub_tasks);
      setExtensionCount(resetState.extension_count);
      setAssistanceRequested(resetState.assistance_requested);
      
      // If the user is a member creating a new task, assign it to them by default
      if (currentUser.role === 'Member') {
        setEmployeeId(currentUser.id);
      } else {
        setEmployeeId(resetState.employee_id);
      }
    }
  }, [initialData, currentUser]);
  
  const handleAddSubTask = () => {
    if (newSubTaskText.trim() === '') return;
    const newSubTask: SubTask = {
      id: Date.now(),
      description: newSubTaskText.trim(),
      completed: false,
    };
    setSubTasks([...sub_tasks, newSubTask]);
    setNewSubTaskText('');
  };

  const handleToggleSubTask = (id: number) => {
    setSubTasks(sub_tasks.map(st => st.id === id ? { ...st, completed: !st.completed } : st));
  };
  
  const handleRemoveSubTask = (id: number) => {
    setSubTasks(sub_tasks.filter(st => st.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const taskToSave: Omit<Task, 'id'> = {
        description, status, priority, due_date, due_time,
        employee_id, project_id, sub_tasks, extension_count, assistance_requested,
        started_at: initialData?.started_at,
        completed_at: initialData?.completed_at,
    };
    onSave(taskToSave);
  };
  
  const handleRequestExtension = () => {
    const newDueDate = new Date(due_date);
    newDueDate.setDate(newDueDate.getDate() + 1);
    const newDueDateString = newDueDate.toISOString().split('T')[0];
    setDueDate(newDueDateString);
    setExtensionCount(1);
    const taskToSave: Omit<Task, 'id'> = {
        description, status, priority, due_date: newDueDateString, due_time,
        employee_id, project_id, sub_tasks, extension_count: 1, assistance_requested,
        started_at: initialData?.started_at,
        completed_at: initialData?.completed_at,
    };
    onSave(taskToSave);
  };
  
  const handleRequestAssistance = () => {
    setAssistanceRequested(true);
    const taskToSave: Omit<Task, 'id'> = {
        description, status, priority, due_date, due_time,
        employee_id, project_id, sub_tasks, extension_count, assistance_requested: true,
        started_at: initialData?.started_at,
        completed_at: initialData?.completed_at,
    };
    onSave(taskToSave);
  };

  const handleDelete = () => {
      if (initialData && onDelete) {
          if (window.confirm('هل أنت متأكد من رغبتك في حذف هذه المهمة نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.')) {
              onDelete(initialData.id);
          }
      }
  };

  const showDelayManagement = initialData && isTaskOverdue(initialData);
  const canDelete = hasPermission(currentUser, 'deleteAnyTask');

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
       <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">وصف المهمة</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"></textarea>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-300 mb-2">الحالة</label>
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                <option value="todo">قيد التنفيذ</option>
                <option value="inprogress">جاري العمل</option>
                <option value="done">مكتملة</option>
            </select>
        </div>
        <div>
            <label htmlFor="priority" className="block text-sm font-medium text-slate-300 mb-2">الأولوية</label>
            <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                <option value="low">منخفضة</option>
                <option value="medium">متوسطة</option>
                <option value="high">عالية</option>
            </select>
        </div>
         <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-slate-300 mb-2">تاريخ الاستحقاق</label>
          <input type="date" id="dueDate" value={due_date} onChange={(e) => setDueDate(e.target.value)} required className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
        </div>
        <div>
          <label htmlFor="dueTime" className="block text-sm font-medium text-slate-300 mb-2">وقت الاستحقاق (اختياري)</label>
          <input type="time" id="dueTime" value={due_time} onChange={(e) => setDueTime(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
        </div>
        <div>
            <label htmlFor="employeeId" className="block text-sm font-medium text-slate-300 mb-2">الموظف المسؤول</label>
            <select 
                id="employeeId" 
                value={employee_id ?? ''} 
                onChange={(e) => setEmployeeId(e.target.value || null)} 
                disabled={!canAssign}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:bg-slate-800 disabled:cursor-not-allowed"
            >
                <option value="">غير معين</option>
                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
            </select>
        </div>
        <div>
            <label htmlFor="projectId" className="block text-sm font-medium text-slate-300 mb-2">ربط بمشروع</label>
            <select id="projectId" value={project_id ?? ''} onChange={(e) => setProjectId(e.target.value ? Number(e.target.value) : null)} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                <option value="">بدون مشروع</option>
                 {projects.map(proj => <option key={proj.id} value={proj.id}>{proj.name}</option>)}
            </select>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-white mb-3 pt-4 border-t border-slate-700">المهام الفرعية</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
          {sub_tasks.map((subTask) => (
            <div key={subTask.id} className="flex items-center gap-3 bg-slate-900 p-2 rounded-md">
              <input
                type="checkbox"
                checked={subTask.completed}
                onChange={() => handleToggleSubTask(subTask.id)}
                className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-cyan-500 focus:ring-cyan-600"
              />
              <span className={`flex-1 text-sm ${subTask.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                {subTask.description}
              </span>
              <button type="button" onClick={() => handleRemoveSubTask(subTask.id)} className="text-red-500 hover:text-red-400 p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3">
          <input
            type="text"
            value={newSubTaskText}
            onChange={(e) => setNewSubTaskText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubTask())}
            placeholder="إضافة مهمة فرعية جديدة..."
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <button type="button" onClick={handleAddSubTask} className="px-4 py-2 rounded-md text-white bg-cyan-600 hover:bg-cyan-700 transition-colors flex-shrink-0">
            إضافة
          </button>
        </div>
      </div>
      
      {showDelayManagement && (
          <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-lg space-y-4">
              <h4 className="text-lg font-semibold text-red-300">إدارة تأخير المهمة</h4>
              {extension_count === 0 ? (
                  <div>
                      <p className="text-sm text-slate-300 mb-3">هذه المهمة متأخرة. يمكنك طلب تمديد تلقائي لمدة 24 ساعة.</p>
                      <button type="button" onClick={handleRequestExtension} className="w-full px-6 py-2 rounded-md text-white bg-yellow-600 hover:bg-yellow-700 transition-colors">
                          طلب تمديد 24 ساعة
                      </button>
                  </div>
              ) : (
                  <div>
                      <p className="text-sm text-slate-300 mb-3">لقد تم تمديد هذه المهمة من قبل. إذا كنت لا تزال تواجه صعوبات، يرجى طلب المساعدة من مشرفك.</p>
                      {assistance_requested ? (
                         <p className="text-green-400 font-semibold text-center">تم إرسال طلب المساعدة بنجاح. سيقوم المشرف بمراجعة المهمة.</p>
                      ) : (
                         <button type="button" onClick={handleRequestAssistance} className="w-full px-6 py-2 rounded-md text-white bg-orange-600 hover:bg-orange-700 transition-colors">
                            طلب إضافة مساعد
                         </button>
                      )}
                  </div>
              )}
          </div>
      )}

      <div className="flex justify-between items-center gap-4 pt-4 border-t border-slate-700">
        <div>
            {canDelete && initialData && onDelete && (
                <button type="button" onClick={handleDelete} className="px-6 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors">حذف المهمة</button>
            )}
        </div>
        <div className="flex gap-4">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-md text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors">إلغاء</button>
            <button type="submit" className="px-6 py-2 rounded-md text-white bg-cyan-600 hover:bg-cyan-700 transition-colors">{initialData ? 'حفظ التغييرات' : 'إضافة المهمة'}</button>
        </div>
      </div>
    </form>
  );
};

export default AddTaskForm;