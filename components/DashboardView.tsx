import React from 'react';
import type { Task, Project, Employee } from '../types';

type View = 'dashboard' | 'projects' | 'tasks' | 'calendar' | 'reports' | 'settings' | 'profile';

interface DashboardViewProps {
    projects: Project[];
    tasks: Task[];
    employees: Employee[];
    setCurrentView: (view: View) => void;
}

const InfoCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string; onClick?: () => void; }> = ({ title, value, icon, color, onClick }) => (
    <div onClick={onClick} className={`bg-slate-800 p-5 rounded-xl shadow-lg flex items-center gap-4 ${onClick ? 'cursor-pointer hover:bg-slate-700/50 transition-colors' : ''}`}>
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-slate-400 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
    </div>
);

const TaskList: React.FC<{ title: string; tasks: Task[]; onClick: () => void; icon: React.ReactNode; color: string; }> = ({ title, tasks, onClick, icon, color }) => {
    return (
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
            <h3 className={`text-lg font-bold text-white mb-4 flex items-center gap-2 ${color}`}>{icon} {title}</h3>
            {tasks.length > 0 ? (
                 <ul className="space-y-3 max-h-60 overflow-y-auto">
                    {tasks.map(task => (
                        <li key={task.id} onClick={onClick} className="bg-slate-900/50 p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-slate-700/50">
                            <div>
                                <p className="text-white text-sm">{task.description}</p>
                                <p className="text-slate-400 text-xs mt-1">{task.due_date}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-white text-xs ${task.priority === 'high' ? 'bg-red-600' : 'bg-yellow-600'}`}>{task.priority === 'high' ? 'عالية' : 'متوسطة'}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-slate-400 text-sm">لا توجد مهام.</p>
            )}
        </div>
    );
};

const DashboardView: React.FC<DashboardViewProps> = ({ projects, tasks, employees, setCurrentView }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeTasks = tasks.filter(t => t.status !== 'done').length;
    const overdueTasks = tasks.filter(t => new Date(t.due_date) < today && t.status !== 'done');
    const todaysTasks = tasks.filter(t => t.due_date === today.toISOString().split('T')[0] && t.status !== 'done');
    
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <InfoCard onClick={() => setCurrentView('projects')} title="إجمالي المشاريع" value={projects.length} color="bg-purple-500/20" icon={<svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>}/>
                <InfoCard onClick={() => setCurrentView('tasks')} title="المهام النشطة" value={activeTasks} color="bg-sky-500/20" icon={<svg className="w-6 h-6 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>}/>
                <InfoCard onClick={() => setCurrentView('tasks')} title="المهام المتأخرة" value={overdueTasks.length} color="bg-red-500/20" icon={<svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>}/>
                <InfoCard onClick={() => setCurrentView('team')} title="أعضاء الفريق" value={employees.length} color="bg-emerald-500/20" icon={<svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.125-1.274-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.125-1.274.356-1.857m0 0a3.001 3.001 0 015.656 0M9.5 8a3.5 3.5 0 117 0 3.5 3.5 0 01-7 0z"></path></svg>}/>
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-slate-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-bold text-white mb-4">تقدم المشاريع</h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {projects.map(project => (
                             <div key={project.id} onClick={() => setCurrentView('projects')} className="cursor-pointer">
                                <div className="flex justify-between items-center text-sm text-slate-300 mb-1">
                                    <span>{project.name}</span>
                                    <span>{project.progress}%</span>
                                </div>
                                <div className="w-full bg-slate-600 rounded-full h-2.5">
                                    <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                 <div className="lg:col-span-2 space-y-6">
                    <TaskList 
                        onClick={() => setCurrentView('tasks')} 
                        title="مهام اليوم" 
                        tasks={todaysTasks} 
                        icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>}
                        color="text-cyan-400"
                    />
                    <TaskList 
                        onClick={() => setCurrentView('tasks')} 
                        title="مهام متأخرة" 
                        tasks={overdueTasks} 
                        icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>}
                        color="text-red-400"
                    />
                </div>
            </div>
        </div>
    );
};

export default DashboardView;