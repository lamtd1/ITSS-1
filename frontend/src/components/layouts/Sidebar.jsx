import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ role, isOpen, onClose, onLogout }) => {
  const location = useLocation();

  // Menu Admin 
  const adminLinks = [
    { path: '/admin/dashboard', label: '概要', icon: 'dashboard' },
    { path: '/admin/slides', label: 'スライド', icon: 'co_present' },
    { path: '/admin/assignments', label: '課題', icon: 'assignment' },
    { path: '/admin/students', label: '学生', icon: 'group' },
  ];

  // Menu Student
  const studentLinks = [
    { path: '/student/dashboard', label: '概要', icon: 'dashboard' },
    { path: '/student/dictionary', label: '辞書', icon: 'menu_book' },
    { path: '/student/slides', label: 'スライド', icon: 'co_present' },
    { path: '/student/assignments', label: '課題', icon: 'assignment' },
    { path: '/student/flashcards', label: 'Flashcard', icon: 'style' },
  ];

  const links = role === 'admin' ? adminLinks : studentLinks;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white text-gray-800">
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <span className="text-xl font-bold text-blue-600 tracking-tight">KAKEHASHI</span>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link 
              key={link.path} 
              to={link.path}
              onClick={onClose} 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-50 text-blue-600 font-semibold' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className={`material-symbols-outlined ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                {link.icon}
              </span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button 
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-medium">ログアウト</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose}></div>
          <div className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl animate-slide-in">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;