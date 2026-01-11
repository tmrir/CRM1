import React from 'react';
import type { User } from '../types';
import { hasPermission } from '../utils/exportHelpers';

type View = 'dashboard' | 'projects' | 'tasks' | 'team' | 'calendar' | 'reports' | 'systemReport' | 'settings' | 'profile' | 'associations';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  onLogout: () => void;
  currentUser: User;
}

const NavLink: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <li
    onClick={onClick}
    className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors ${isActive
      ? 'bg-cyan-500 text-white shadow-lg'
      : 'text-slate-300 hover:bg-slate-700'
      }`}
  >
    {icon}
    <span className="ms-3 font-semibold">{label}</span>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isSidebarOpen, setSidebarOpen, onLogout, currentUser }) => {
  const handleNavigation = (view: View) => {
    setCurrentView(view);
    if (window.innerWidth < 1024) { // lg breakpoint in Tailwind
      setSidebarOpen(false);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setSidebarOpen(false)}
      ></div>
      <aside
        className={`fixed top-0 right-0 h-full bg-slate-800 text-white w-64 p-4 flex flex-col z-40 transition-transform transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
          } lg:relative lg:translate-x-0 lg:w-64`}
      >
        <div className="text-center py-4 mb-4 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Team-Task Manager</h2>
        </div>
        <nav className="flex-1 overflow-y-auto">
          <ul>
            <NavLink
              label="لوحة التحكم"
              isActive={currentView === 'dashboard'}
              onClick={() => handleNavigation('dashboard')}
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>}
            />
            {hasPermission(currentUser, 'manageProjects') && (
              <NavLink
                label="المشاريع"
                isActive={currentView === 'projects'}
                onClick={() => handleNavigation('projects')}
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>}
              />
            )}
            <NavLink
              label="المهام"
              isActive={currentView === 'tasks'}
              onClick={() => handleNavigation('tasks')}
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>}
            />
            {hasPermission(currentUser, 'manageTeam') && (
              <NavLink
                label="فريق العمل"
                isActive={currentView === 'team'}
                onClick={() => handleNavigation('team')}
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.125-1.274-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.125-1.274.356-1.857m0 0a3.001 3.001 0 015.656 0M9.5 8a3.5 3.5 0 117 0 3.5 3.5 0 01-7 0z"></path></svg>}
              />
            )}
            <NavLink
              label="التقويم"
              isActive={currentView === 'calendar'}
              onClick={() => handleNavigation('calendar')}
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>}
            />
            <NavLink
              label="الجمعيات"
              isActive={currentView === 'associations'}
              onClick={() => handleNavigation('associations')}
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>}
            />
            {hasPermission(currentUser, 'viewReports') && (
              <>
                <NavLink
                  label="التقارير"
                  isActive={currentView === 'reports'}
                  onClick={() => handleNavigation('reports')}
                  icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>}
                />
                <NavLink
                  label="تقرير النظام"
                  isActive={currentView === 'systemReport'}
                  onClick={() => handleNavigation('systemReport')}
                  icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>}
                />
              </>
            )}
          </ul>
        </nav>

        <div className="mt-auto">
          {hasPermission(currentUser, 'manageSettings') && (
            <NavLink
              label="الإعدادات"
              isActive={currentView === 'settings'}
              onClick={() => handleNavigation('settings')}
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>}
            />
          )}
          <div className="border-t border-slate-700 my-2"></div>
          <NavLink
            label="تسجيل الخروج"
            isActive={false}
            onClick={onLogout}
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>}
          />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;