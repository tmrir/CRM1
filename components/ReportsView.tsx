import React, { useMemo } from 'react';
import type { Employee, Project, Task, User } from '../types';
import ExportButtons from './ExportButtons';
import { exportToPrintableView, exportToExcel, hasPermission } from '../utils/exportHelpers';

interface ReportsViewProps {
  employees: Employee[];
  projects: Project[];
  tasks: Task[];
  currentUser: User;
}

const ReportsView: React.FC<ReportsViewProps> = ({ employees, projects, tasks, currentUser }) => {

    const projectReportsData = useMemo(() => {
        return projects.map(project => {
            const projectTasks = tasks.filter(t => t.project_id === project.id);
            const completed = projectTasks.filter(t => t.status === 'done').length;
            const overdue = projectTasks.filter(t => new Date(t.due_date) < new Date() && t.status !== 'done').length;
            return {
                ...project,
                totalTasks: projectTasks.length,
                completed,
                overdue,
            };
        });
    }, [projects, tasks]);

    const employeePerformance = useMemo(() => {
        return employees.map(employee => {
            const assignedTasks = tasks.filter(t => t.employee_id === employee.id);
            const completedTasks = assignedTasks.filter(t => t.status === 'done');
            const overdue = assignedTasks.filter(t => new Date(t.due_date) < new Date() && t.status !== 'done').length;
            const completionRate = assignedTasks.length > 0 ? (completedTasks.length / assignedTasks.length) * 100 : 0;
            
            return {
                ...employee,
                tasksCount: assignedTasks.length,
                completedTasksCount: completedTasks.length,
                overdueCount: overdue.length,
                completionRate: completionRate.toFixed(1),
            };
        });
    }, [employees, tasks]);
    
    const handleExcelExport = () => {
        const wb = window.XLSX.utils.book_new();

        const projectData = projectReportsData.map(p => ({
            'المشروع': p.name,
            'نسبة الإنجاز': `${p.progress}%`,
            'إجمالي المهام': p.totalTasks,
            'المهام المكتملة': p.completed,
            'المهام المتأخرة': p.overdue,
        }));
        const wsProjects = window.XLSX.utils.json_to_sheet(projectData);
        window.XLSX.utils.book_append_sheet(wb, wsProjects, 'تقارير المشاريع');

        const employeeData = employeePerformance.map(e => ({
            'الموظف': e.name,
            'المهام المسندة': e.tasksCount,
            'المهام المكتملة': e.completedTasksCount,
            'المهام المتأخرة': e.overdueCount,
            'معدل الإنجاز': `${e.completionRate}%`,
        }));
        const wsEmployees = window.XLSX.utils.json_to_sheet(employeeData);
        window.XLSX.utils.book_append_sheet(wb, wsEmployees, 'أداء الموظفين');

        window.XLSX.writeFile(wb, 'performance_reports.xlsx');
    };

    const handlePdfExport = () => {
        const projectTable = `
            <h3>تقارير المشاريع</h3>
            <table>
                <thead>
                    <tr><th>المشروع</th><th>الإنجاز</th><th>إجمالي المهام</th><th>المكتملة</th><th>المتأخرة</th></tr>
                </thead>
                <tbody>
                    ${projectReportsData.map(p => `
                        <tr><td>${p.name}</td><td>${p.progress}%</td><td>${p.totalTasks}</td><td>${p.completed}</td><td>${p.overdue}</td></tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        const employeeTable = `
            <h3 style="margin-top: 2rem;">أداء الموظفين</h3>
            <table>
                <thead>
                    <tr><th>الموظف</th><th>المهام المسندة</th><th>المكتملة</th><th>المتأخرة</th><th>معدل الإنجاز</th></tr>
                </thead>
                <tbody>
                    ${employeePerformance.map(e => `
                        <tr><td>${e.name}</td><td>${e.tasksCount}</td><td>${e.completedTasksCount}</td><td>${e.overdueCount}</td><td>${e.completionRate}%</td></tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        const tableStyles = `<style>
            h3 { font-size: 1.25rem; font-weight: bold; margin-bottom: 1rem; color: #111827; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #e5e7eb; padding: 0.75rem; text-align: right; }
            th { background-color: #f3f4f6; color: #1f2937; }
        </style>`;

        exportToPrintableView('تقارير الأداء', `${tableStyles}${projectTable}${employeeTable}`);
    };

    return (
         <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h2 className="text-3xl font-bold text-white">التقارير</h2>
                {hasPermission(currentUser, 'exportData') && <ExportButtons onPdfExport={handlePdfExport} onExcelExport={handleExcelExport} />}
            </div>

            <div className="space-y-8">
                {/* Projects Report Section */}
                <div>
                    <h3 className="text-xl font-bold text-white mb-4">تقارير المشاريع</h3>
                    <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-right text-slate-400">
                                <thead className="text-xs text-slate-300 uppercase bg-slate-900">
                                    <tr>
                                        <th scope="col" className="px-6 py-4">المشروع</th>
                                        <th scope="col" className="px-6 py-4">نسبة الإنجاز</th>
                                        <th scope="col" className="px-6 py-4">إجمالي المهام</th>
                                        <th scope="col" className="px-6 py-4">المهام المكتملة</th>
                                        <th scope="col" className="px-6 py-4">المهام المتأخرة</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projectReportsData.map(proj => (
                                        <tr key={proj.id} className="bg-slate-800 border-b border-slate-700">
                                            <td className="px-6 py-4 font-medium text-white">{proj.name}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-full bg-slate-600 rounded-full h-2"><div className="bg-cyan-500 h-2 rounded-full" style={{width: `${proj.progress}%`}}></div></div>
                                                    <span className="font-semibold text-cyan-400">{proj.progress}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">{proj.totalTasks}</td>
                                            <td className="px-6 py-4 text-green-400">{proj.completed}</td>
                                            <td className="px-6 py-4 text-red-400">{proj.overdue}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Employee Performance Section */}
                <div>
                    <h3 className="text-xl font-bold text-white mb-4">أداء الموظفين</h3>
                    <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-right text-slate-400">
                                <thead className="text-xs text-slate-300 uppercase bg-slate-900">
                                    <tr>
                                        <th scope="col" className="px-6 py-4">الموظف</th>
                                        <th scope="col" className="px-6 py-4">المهام المسندة</th>
                                        <th scope="col" className="px-6 py-4">المهام المكتملة</th>
                                        <th scope="col" className="px-6 py-4">المهام المتأخرة</th>
                                        <th scope="col" className="px-6 py-4">معدل الإنجاز</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employeePerformance.map(emp => (
                                        <tr key={emp.id} className="bg-slate-800 border-b border-slate-700">
                                            <td className="px-6 py-4 font-medium text-white">{emp.name}</td>
                                            <td className="px-6 py-4">{emp.tasksCount}</td>
                                            <td className="px-6 py-4 text-green-400">{emp.completedTasksCount}</td>
                                            <td className="px-6 py-4 text-red-400">{emp.overdueCount}</td>
                                            <td className="px-6 py-4 font-semibold text-cyan-400">{emp.completionRate}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsView;