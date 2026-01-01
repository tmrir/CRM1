import React, { useState } from 'react';
import type { Project, Task, User } from '../types';
import Modal from './Modal';
import { hasPermission } from '../utils/exportHelpers';

type View = 'dashboard' | 'projects' | 'tasks' | 'calendar' | 'reports' | 'settings' | 'profile';

interface AddProjectFormProps {
  onSave: (project: Omit<Project, 'id' | 'progress'>) => void;
  onClose: () => void;
  initialData?: Project | null;
}

const AddProjectForm: React.FC<AddProjectFormProps> = ({ onSave, onClose, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, description });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="project-name" className="block text-sm font-medium text-slate-300 mb-2">اسم المشروع</label>
        <input
          type="text"
          id="project-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>
      <div>
        <label htmlFor="project-description" className="block text-sm font-medium text-slate-300 mb-2">وصف المشروع</label>
        <textarea
          id="project-description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
        ></textarea>
      </div>
      <div className="flex justify-end gap-4 pt-4">
        <button type="button" onClick={onClose} className="px-6 py-2 rounded-md text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors">إلغاء</button>
        <button type="submit" className="px-6 py-2 rounded-md text-white bg-cyan-600 hover:bg-cyan-700 transition-colors">{initialData ? 'حفظ التغييرات' : 'إنشاء المشروع'}</button>
      </div>
    </form>
  );
};

const ShareProjectModal: React.FC<{
    project: Project;
    onSave: (id: number, data: Partial<Project>) => void;
    onClose: () => void;
}> = ({ project, onSave, onClose }) => {
    const [isPublic, setIsPublic] = useState(project.is_public || false);
    const [copySuccess, setCopySuccess] = useState('');

    const handleToggleSharing = () => {
        const newIsPublic = !isPublic;
        setIsPublic(newIsPublic);
        let dataToSave: Partial<Project> = { is_public: newIsPublic };
        if (newIsPublic && !project.public_id) {
            dataToSave.public_id = Date.now().toString(36) + Math.random().toString(36).substring(2);
        }
        onSave(project.id, dataToSave);
    };
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?publicProjectId=${project.public_id}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl).then(() => {
            setCopySuccess('تم النسخ!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess('فشل النسخ');
            setTimeout(() => setCopySuccess(''), 2000);
        });
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`مشاركة مشروع: ${project.name}`}>
            <div className="space-y-6">
                <div className="flex items-center justify-between bg-slate-900 p-4 rounded-lg">
                    <div>
                        <h4 className="font-semibold text-white">رابط المشاركة العام</h4>
                        <p className="text-sm text-slate-400 mt-1">{isPublic ? 'أي شخص لديه الرابط يمكنه العرض' : 'المشاركة متوقفة'}</p>
                    </div>
                    <label htmlFor="share-toggle" className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="share-toggle" className="sr-only peer" checked={isPublic} onChange={handleToggleSharing} />
                        <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-cyan-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                    </label>
                </div>
                {isPublic && project.public_id && (
                    <div className="space-y-2">
                        <label htmlFor="share-url" className="block text-sm font-medium text-slate-300">رابط العرض العام</label>
                        <div className="flex gap-2">
                            <input id="share-url" type="text" readOnly value={shareUrl} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-slate-400 text-sm" />
                            <button onClick={handleCopy} className="px-4 py-2 rounded-md text-white bg-cyan-600 hover:bg-cyan-700 transition-colors text-sm w-28 text-center">
                                {copySuccess || 'نسخ'}
                            </button>
                        </div>
                    </div>
                )}
                 <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className="px-6 py-2 rounded-md text-white bg-slate-700 hover:bg-slate-600 transition-colors">إغلاق</button>
                </div>
            </div>
        </Modal>
    );
};


interface ProjectsViewProps {
  projects: Project[];
  tasks: Task[];
  onSave: (projectData: Partial<Omit<Project, 'id' | 'progress'>>, id?: number) => void;
  onDelete: (projectId: number) => void;
  setCurrentView: (view: View) => void;
  currentUser: User;
}

const ProjectsView: React.FC<ProjectsViewProps> = ({ projects, tasks, onSave, onDelete, setCurrentView, currentUser }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [sharingProject, setSharingProject] = useState<Project | null>(null);

    const canManage = hasPermission(currentUser, 'manageProjects');

    const handleOpenAddModal = () => {
        setEditingProject(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (project: Project, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingProject(project);
        setIsModalOpen(true);
    };
    
    const handleDelete = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا المشروع وجميع مهامه المرتبطة به؟')) {
            onDelete(id);
        }
    };

    const handleSave = (projectData: Omit<Project, 'id' | 'progress'>) => {
        onSave(projectData, editingProject?.id);
        setIsModalOpen(false);
        setEditingProject(null);
    };
    
    const handleUpdateSharing = (id: number, data: Partial<Project>) => {
        onSave(data, id);
        setSharingProject(prev => prev ? {...prev, ...data} : null);
    }

    const countTasks = (projectId: number) => {
        return tasks.filter(task => task.project_id === projectId).length;
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h2 className="text-3xl font-bold text-white">المشاريع</h2>
                {canManage && (
                    <button
                        onClick={handleOpenAddModal}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors w-full sm:w-auto"
                    >
                        إضافة مشروع جديد
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                    <div 
                        key={project.id} 
                        onClick={() => setCurrentView('tasks')} // Simplified: just go to task board
                        className="bg-slate-800 p-6 rounded-xl shadow-lg flex flex-col justify-between cursor-pointer hover:bg-slate-700/50 transition-transform hover:-translate-y-1"
                    >
                        <div>
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-bold text-white mb-2">{project.name}</h3>
                                {canManage && (
                                    <div className="flex items-center gap-1">
                                        <button onClick={(e) => { e.stopPropagation(); setSharingProject(project); }} title="مشاركة" className="text-slate-400 hover:text-green-400 p-1"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path></svg></button>
                                        <button onClick={(e) => handleOpenEditModal(project, e)} title="تعديل" className="text-slate-400 hover:text-cyan-400 p-1"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"></path></svg></button>
                                        <button onClick={(e) => handleDelete(project.id, e)} title="حذف" className="text-slate-400 hover:text-red-400 p-1"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd"></path></svg></button>
                                    </div>
                                )}
                            </div>
                            <p className="text-slate-400 text-sm mb-4 h-10 overflow-hidden">{project.description}</p>
                        </div>
                        <div>
                            <div className="flex justify-between items-center text-sm text-slate-300 mb-1">
                                <span>التقدم</span>
                                <span>{countTasks(project.id)} مهام</span>
                            </div>
                             <div className="w-full bg-slate-600 rounded-full h-2.5">
                                <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProject ? 'تعديل المشروع' : 'إضافة مشروع جديد'}>
                <AddProjectForm
                    onSave={handleSave}
                    onClose={() => setIsModalOpen(false)}
                    initialData={editingProject}
                />
            </Modal>
            {sharingProject && (
                <ShareProjectModal 
                    project={sharingProject}
                    onClose={() => setSharingProject(null)}
                    onSave={handleUpdateSharing}
                />
            )}
        </div>
    );
};

export default ProjectsView;