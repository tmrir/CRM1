import React, { useMemo } from 'react';
import type { Task, Project, Employee, TaskStatus } from '../types';
import { TaskCard } from './TasksView'; // Re-using the enhanced TaskCard

interface PublicTaskViewProps {
  project: Project;
  tasks: Task[];
  employees: Employee[];
}

type KanbanColumn = 'overdue' | TaskStatus;

const columnConfig: Record<KanbanColumn, { title: string; color: string }> = {
  overdue: { title: 'متأخرة', color: 'border-red-500' },
  todo: { title: 'قيد التنفيذ', color: 'border-blue-500' },
  inprogress: { title: 'جاري العمل', color: 'border-yellow-500' },
  done: { title: 'مكتملة', color: 'border-green-500' },
};

const PublicTaskView: React.FC<PublicTaskViewProps> = ({ project, tasks, employees }) => {
  const allProjects = [project]; // TaskCard expects an array of projects

  const tasksByColumn = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdue = tasks.filter(t => new Date(t.due_date) < today && t.status !== 'done');
    const done = tasks.filter(t => t.status === 'done');
    const inprogress = tasks.filter(t => t.status === 'inprogress' && !overdue.includes(t));
    const todo = tasks.filter(t => t.status === 'todo' && !overdue.includes(t));

    return {
      overdue,
      todo,
      inprogress,
      done
    };
  }, [tasks]);

  return (
    <div className="min-h-screen bg-slate-900 p-4 sm:p-6 lg:p-8" dir="rtl">
        <header className="text-center mb-8 max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-white">{project.name}</h1>
            <p className="text-slate-400 mt-2 text-lg">عرض عام - للقراءة فقط</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {(Object.keys(columnConfig) as KanbanColumn[]).map(column => (
                <div key={column} className="bg-slate-800/50 rounded-lg p-4">
                    <h3 className={`text-lg font-bold text-white mb-4 pb-2 border-b-2 ${columnConfig[column].color}`}>{columnConfig[column].title}</h3>
                    <div className="max-h-[70vh] overflow-y-auto pr-2">
                        {(tasksByColumn as any)[column].map((task: Task) => (
                            <TaskCard 
                                key={task.id} 
                                task={task} 
                                employees={employees} 
                                projects={allProjects} 
                                isReadOnly={true} 
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
        
        <footer className="text-center mt-12 text-sm text-slate-500">
            <p>Powered by Team-Task Manager</p>
        </footer>
    </div>
  );
};

export default PublicTaskView;