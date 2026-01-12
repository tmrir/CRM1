import React, { useState, useEffect } from 'react';
import type { Employee, Task, User, Project } from './types';
import { initialCurrentUser } from './data';
import { supabase } from './supabaseClient';
import type { Session } from '@supabase/supabase-js';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginPage from './LoginPage';
import DashboardView from './components/DashboardView';
import ProjectsView from './components/ProjectsView';
import TasksView from './components/TasksView';
import ReportsView from './components/ReportsView';
import SettingsView from './components/SettingsView';
import TeamView from './components/TeamView';
import ProfileView from './components/ProfileView';
import CalendarView from './components/CalendarView';
import SystemReportView from './components/SystemReportView';
import PublicTaskView from './components/PublicTaskView';
import AssociationsView from './components/AssociationsViewDB';
import { sendNotification, hasPermission } from './utils/exportHelpers';

type View = 'dashboard' | 'projects' | 'tasks' | 'team' | 'calendar' | 'reports' | 'systemReport' | 'settings' | 'profile' | 'associations';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loginError, setLoginError] = useState('');

  const [publicProject, setPublicProject] = useState<Project | null>(null);

  const [currentUser, setCurrentUser] = useState<User>(initialCurrentUser);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifiedTaskIds, setNotifiedTaskIds] = useState<number[]>([]);

  const fetchAllData = async (userId: string) => {
    try {
      const { data: currentUserData, error: userError } = await supabase.from('employees').select('*').eq('id', userId).single();
      if (userError) throw userError;
      setCurrentUser(currentUserData as User);

      const { data: employeesData, error: employeesError } = await supabase.from('employees').select('*');
      if (employeesError) throw employeesError;
      setEmployees(employeesData as Employee[]);

      const { data: projectsData, error: projectsError } = await supabase.from('projects').select('*');
      if (projectsError) throw projectsError;

      const { data: tasksData, error: tasksError } = await supabase.from('tasks').select('*');
      if (tasksError) throw tasksError;
      setTasks(tasksData as Task[]);

      updateProjectsProgress(tasksData as Task[], projectsData as Project[]);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkPublicLink = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const publicId = urlParams.get('publicProjectId');
      if (publicId) {
        const { data, error } = await supabase.from('projects').select().eq('public_id', publicId).eq('is_public', true).single();
        if (data) {
          setPublicProject(data);
          const { data: tasksData } = await supabase.from('tasks').select('*').eq('project_id', data.id);
          if (tasksData) setTasks(tasksData);
          const { data: employeesData } = await supabase.from('employees').select('*');
          if (employeesData) setEmployees(employeesData);
        }
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchAllData(session.user.id);
      } else {
        checkPublicLink().finally(() => setLoading(false));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchAllData(session.user.id);
      } else {
        setLoading(false);
        setCurrentUser(initialCurrentUser);
        setEmployees([]);
        setProjects([]);
        setTasks([]);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Notification logic remains largely the same, just field names updated
    const checkTasksForNotifications = () => {
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
      const now = new Date();
      const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);

      tasks.forEach(task => {
        if (notifiedTaskIds.includes(task.id) || !task.due_date) return;
        try {
          const dueDateTimeString = task.due_time ? `${task.due_date}T${task.due_time}` : `${task.due_date}T23:59:59`;
          const dueDateTime = new Date(dueDateTimeString);
          if (dueDateTime < now && task.status !== 'done') {
            // ... notification logic for overdue
          } else if (task.due_time && task.status !== 'done' && dueDateTime > now && dueDateTime <= fifteenMinutesFromNow) {
            // ... notification logic for upcoming
          }
        } catch (error) { /* Silently fail */ }
      });
    };
    const intervalId = setInterval(checkTasksForNotifications, 60000);
    return () => clearInterval(intervalId);
  }, [tasks, notifiedTaskIds]);

  const recalculateProjectProgress = (projectId: number, currentTasks: Task[]) => {
    const relevantTasks = currentTasks.filter(t => t.project_id === projectId);
    if (relevantTasks.length === 0) return 0;
    const completedTasks = relevantTasks.filter(t => t.status === 'done').length;
    return Math.round((completedTasks / relevantTasks.length) * 100);
  };

  const updateProjectsProgress = (currentTasks: Task[], currentProjects: Project[]) => {
    const updatedProjects = currentProjects.map(proj => ({ ...proj, progress: recalculateProjectProgress(proj.id, currentTasks) }));
    setProjects(updatedProjects);
  };

  const handleLogin = async (identifier: string, password: string) => {
    setLoginError('');
    const trimmedIdentifier = identifier.trim();
    let emailToLogin: string;

    try {
      if (!trimmedIdentifier.includes('@')) {
        // It's a username, fetch the corresponding email
        const { data: users, error: userError } = await supabase
          .from('employees')
          .select('email')
          .eq('username', trimmedIdentifier);

        if (userError) {
          console.error('Error fetching user by username:', userError.message);
          setLoginError('حدث خطأ أثناء التحقق من البيانات.');
          return;
        }

        if (!users || users.length === 0) {
          setLoginError('البيانات المدخلة غير صحيحة.');
          return;
        }

        // Take the first match in case of duplicates
        emailToLogin = users[0].email;
      } else {
        // It's an email
        emailToLogin = trimmedIdentifier;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: emailToLogin,
        password
      });

      if (signInError) {
        setLoginError('البيانات المدخلة غير صحيحة.');
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setCurrentUser(initialCurrentUser);
  };

  const handleSaveEmployee = async (data: Omit<Employee, 'id' | 'avatar_url'> & { password?: string }, id?: string) => {
    if (id) {
      // UPDATE existing employee. Password changes are not handled here.
      const { password, ...profileData } = data;
      const { error } = await supabase.from('employees').update(profileData).eq('id', id);
      if (error) {
        console.error("Error updating employee", error);
      } else {
        fetchAllData(currentUser.id);
      }
    } else { // CREATE new employee
      if (!data.password) {
        console.error("Password is required for new employees.");
        return;
      }

      // IMPORTANT: For this to work without sending a confirmation email,
      // you must disable "Confirm email" in your Supabase project's Auth settings.

      // 1. Preserve the admin's current session
      const { data: { session: adminSession } } = await supabase.auth.getSession();
      if (!adminSession) {
        console.error("Admin not logged in. Cannot create user.");
        return;
      }

      // 2. Create the new user. This will temporarily change the auth state.
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
            avatar_url: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(data.name)}`
          }
        }
      });

      if (authError || !authData.user) {
        console.error("Error creating auth user:", authError);
        // Restore admin session on failure
        await supabase.auth.setSession(adminSession);
        return;
      }

      // 3. The DB trigger has created a basic profile. Now update it with the correct role and username.
      // The client is now technically authenticated as the new user for this operation.
      const { error: profileError } = await supabase
        .from('employees')
        .update({
          name: data.name,
          username: data.username,
          role: data.role,
          avatar_url: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(data.name)}`
        })
        .eq('id', authData.user.id);

      if (profileError) {
        console.error("Error updating employee profile:", profileError);
      }

      // 4. Sign out the new user and restore the admin's session.
      await supabase.auth.signOut();
      await supabase.auth.setSession(adminSession);

      // The onAuthStateChange listener will handle fetching the updated data with the restored admin session.
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    // Note: This only deletes the profile record, not the auth user.
    // A full implementation requires an Edge Function to call `supabase.auth.admin.deleteUser()`.
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (error) console.error("Error deleting employee", error);
    else fetchAllData(currentUser.id);
  };

  const handleSaveTask = async (data: Omit<Task, 'id'>, id?: number) => {
    const payload: Partial<Task> = {
      ...data,
      due_time: data.due_time || null,
    };

    if (id) { // This is an update
      const existingTask = tasks.find(t => t.id === id);
      if (existingTask) {
        // Task is moving to 'inprogress' for the first time
        if (payload.status === 'inprogress' && !existingTask.started_at) {
          payload.started_at = new Date().toISOString();
        }
        // Task is being completed
        if (payload.status === 'done' && existingTask.status !== 'done') {
          payload.completed_at = new Date().toISOString();
        }
      }
    }

    const { error } = await supabase.from('tasks').upsert({ id, ...payload });
    if (error) {
      console.error("Error saving task:", error);
    } else {
      const isNewTaskAssignment = !id && data.employee_id;
      if (isNewTaskAssignment) {
        try {
          const assignedEmployee = employees.find(e => e.id === data.employee_id);
          const linkedProject = projects.find(p => p.id === data.project_id);

          if (assignedEmployee) {
            const subject = `تذكير ببدء مهمة: ${data.description}`;
            const emailHtmlBody = `<div dir="rtl" style="font-family: Cairo, sans-serif; text-align: right; color: #333;">
                        <h3 style="font-family: Cairo, sans-serif;">تذكير ببدء مهمة 👋</h3>
                        <p style="font-family: Cairo, sans-serif;">مرحباً ${assignedEmployee.name.split(' ')[0]}،</p>
                        <p style="font-family: Cairo, sans-serif;">لقد تم إسناد مهمة جديدة إليك. يرجى البدء في العمل عليها وتغيير حالتها إلى "جاري العمل" ليعرف الفريق تقدمك.</p>
                        <br>
                        <p style="font-family: Cairo, sans-serif;">
                            <b>المهمة:</b> ${data.description}<br>
                            <b>المشروع:</b> ${linkedProject?.name || 'غير محدد'}
                        </p>
                        <p style="font-family: Cairo, sans-serif; text-align: center; margin-top: 20px;">
                            <a href="https://crm-2-six.vercel.app/" target="_blank" style="font-family: Cairo, sans-serif; background-color: #0891b2; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                                الانتقال إلى النظام
                            </a>
                        </p>
                        <br>
                        <p style="font-family: Cairo, sans-serif;">شكراً لك،<br>إدارة الفريق</p>
                    </div>`;

            const emailPayload = {
              to: assignedEmployee.email,
              subject: subject,
              html: emailHtmlBody
            };

            const { error: functionError } = await supabase.functions.invoke('send-email', {
              body: emailPayload,
            });

            if (functionError) {
              console.error('Error sending task notification email:', functionError.message);
            }
          }
        } catch (e) {
          console.error('Failed to invoke email function:', e);
        }
      }
      await fetchAllData(currentUser.id);
    }
  };

  const handleDeleteTask = async (id: number) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) console.error("Error deleting task", error);
    else fetchAllData(currentUser.id);
  };

  const handleSaveProject = async (data: Partial<Omit<Project, 'id' | 'progress'>>, id?: number) => {
    const { error } = await supabase.from('projects').upsert({ id, ...data });
    if (error) console.error("Error saving project", error);
    else fetchAllData(currentUser.id);
  };

  const handleDeleteProject = async (id: number) => {
    // This should ideally be a transaction or a CASCADE delete in the DB schema.
    await supabase.from('tasks').delete().eq('project_id', id);
    await supabase.from('projects').delete().eq('id', id);
    fetchAllData(currentUser.id);
  };

  const handleSaveProfile = async (data: Omit<User, 'id' | 'avatar_url' | 'role'>) => {
    const { error } = await supabase.from('employees').update(data).eq('id', currentUser.id);
    if (error) console.error("Error saving profile", error);
    else fetchAllData(currentUser.id);
  };

  const handleUpdateAvatar = async (file: File) => {
    if (!currentUser?.id) return;
    const filePath = `public/${currentUser.id}`;
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      return;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const urlWithCacheBuster = `${data.publicUrl}?t=${new Date().getTime()}`;

    const { error: updateError } = await supabase
      .from('employees')
      .update({ avatar_url: urlWithCacheBuster })
      .eq('id', currentUser.id);

    if (updateError) {
      console.error('Error updating avatar URL:', updateError);
      return;
    }
    await fetchAllData(currentUser.id);
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-white">Loading...</div>;
  }

  if (publicProject) {
    return <PublicTaskView project={publicProject} tasks={tasks} employees={employees} />;
  }

  // 🔥 تم تعطيل صفحة تسجيل الدخول - الدخول المباشر مفعّل
  // if (!session) {
  //   return <LoginPage onLogin={handleLogin} loginError={loginError} />;
  // }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView projects={projects} tasks={tasks} employees={employees} setCurrentView={setCurrentView} />;
      case 'projects': return <ProjectsView projects={projects} tasks={tasks} onSave={handleSaveProject} onDelete={handleDeleteProject} setCurrentView={setCurrentView} currentUser={currentUser} />;
      case 'tasks': return <TasksView tasks={tasks} projects={projects} employees={employees} onSave={handleSaveTask} onDelete={handleDeleteTask} currentUser={currentUser} />;
      case 'team': return <TeamView employees={employees} onSaveEmployee={handleSaveEmployee} onDeleteEmployee={handleDeleteEmployee} currentUser={currentUser} />;
      case 'calendar': return <CalendarView tasks={tasks} onSaveTask={handleSaveTask} projects={projects} employees={employees} currentUser={currentUser} onDeleteTask={handleDeleteTask} />;
      case 'reports': return <ReportsView tasks={tasks} employees={employees} projects={projects} currentUser={currentUser} />;
      case 'systemReport': return <SystemReportView />;
      case 'settings':
        return hasPermission(currentUser, 'manageSettings')
          ? <SettingsView />
          : <DashboardView projects={projects} tasks={tasks} employees={employees} setCurrentView={setCurrentView} />;
      case 'profile': return <ProfileView currentUser={currentUser} onSave={handleSaveProfile} onUpdateAvatar={handleUpdateAvatar} />;
      case 'associations': return <AssociationsView />;
      default: return <DashboardView projects={projects} tasks={tasks} employees={employees} setCurrentView={setCurrentView} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-900" dir="rtl">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout} currentUser={currentUser} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={currentUser} toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} searchTerm={searchTerm} setSearchTerm={setSearchTerm} setCurrentView={setCurrentView} tasks={tasks} employees={employees} onLogout={handleLogout} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-900 p-4 sm:p-6 lg:p-8">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;