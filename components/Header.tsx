import React, { useState, useMemo } from 'react';
import type { User, Task, Employee } from '../types';

type View = 'dashboard' | 'projects' | 'tasks' | 'calendar' | 'reports' | 'settings' | 'profile';

interface HeaderProps {
  user: User;
  tasks: Task[];
  employees: Employee[];
  toggleSidebar: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setCurrentView: (view: View) => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, tasks, employees, toggleSidebar, searchTerm, setSearchTerm, setCurrentView, onLogout }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);

  const overdueTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return tasks.filter(t => new Date(t.due_date) < today && t.status !== 'done');
  }, [tasks]);

  const [hasNewNotification, setHasNewNotification] = useState(overdueTasks.length > 0);

  const handleProfileClick = () => {
    setDropdownOpen(!isDropdownOpen);
    if (isNotificationsOpen) {
      setNotificationsOpen(false);
    }
  };

  const handleNotificationClick = () => {
    setNotificationsOpen(!isNotificationsOpen);
    if (isDropdownOpen) {
      setDropdownOpen(false);
    }
    if (hasNewNotification) {
      setHasNewNotification(false);
    }
  };

  const handleNotificationItemClick = () => {
    setCurrentView('tasks');
    setNotificationsOpen(false);
  };

  return (
    <header className="bg-slate-800 p-4 flex items-center justify-between shadow-md flex-shrink-0">
      <div className="flex items-center">
        {/* Hamburger Menu for Mobile */}
        <button onClick={toggleSidebar} className="text-slate-300 focus:outline-none lg:hidden me-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="بحث في المهام..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-900 text-white rounded-full py-2 px-4 ps-10 focus:outline-none focus:ring-2 focus:ring-cyan-500 w-40 sm:w-64"
          />
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications Icon */}
        <div className="relative">
          <button onClick={handleNotificationClick} className="text-slate-300 focus:outline-none hover:text-white transition-colors p-2 rounded-full hover:bg-slate-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
            {hasNewNotification && (
              <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-slate-800"></span>
            )}
          </button>
          {isNotificationsOpen && (
            <div className="absolute start-0 lg:end-0 lg:start-auto mt-2 w-80 bg-slate-700 rounded-md shadow-lg z-20">
              <div className="p-3 border-b border-slate-600">
                <h4 className="text-sm font-semibold text-white">الإشعارات</h4>
              </div>
              <ul className="py-2 max-h-80 overflow-y-auto">
                {overdueTasks.length > 0 ? (
                  overdueTasks.map(task => {
                    const assignee = employees.find(e => e.id === task.employee_id);
                    return (
                       <li key={task.id} onClick={handleNotificationItemClick} className="flex items-start gap-3 px-4 py-3 text-sm text-slate-200 hover:bg-slate-600 cursor-pointer">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-white text-xs">
                              مهمة متأخرة: <span className="font-semibold text-cyan-400">{task.description}</span>
                              {assignee && ` (لـ ${assignee.name})`}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">تاريخ الاستحقاق: {task.due_date}</p>
                          </div>
                        </li>
                    )
                  })
                ) : (
                  <li>
                    <p className="text-center text-sm text-slate-400 py-4">لا توجد إشعارات جديدة</p>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button onClick={handleProfileClick} className="flex items-center gap-2 focus:outline-none">
            <img className="w-10 h-10 rounded-full" src={user.avatar_url} alt={user.name} />
            <div className="hidden sm:block text-right">
              <p className="font-semibold text-white">{user.name}</p>
              <p className="text-xs text-slate-400">{user.role}</p>
            </div>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute start-0 mt-2 w-48 bg-slate-700 rounded-md shadow-lg py-1 z-20">
              <div onClick={() => { setCurrentView('profile'); setDropdownOpen(false); }} className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-600 cursor-pointer">ملفي الشخصي</div>
              <div onClick={() => { setCurrentView('settings'); setDropdownOpen(false); }} className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-600 cursor-pointer">الإعدادات</div>
              <div className="border-t border-slate-600 my-1"></div>
              <div onClick={onLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-600 cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                <span>تسجيل الخروج</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;