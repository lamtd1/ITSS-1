import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ role, isOpen, onClose, onLogout }) => {
  const location = useLocation();

  const adminLinks = [
    { path: '/admin/dashboard', label: '概要', icon: 'dashboard' },
    { path: '/admin/slides', label: 'スライド', icon: 'description' },
    { path: '/admin/assignments', label: '課題', icon: 'smartphone' }, // Trỏ về danh sách
    { path: '/admin/students', label: '学生', icon: 'person' },
  ];

  const studentLinks = [
    { path: '/student/dashboard', label: '概要', icon: 'dashboard' },
    { path: '/student/dictionary', label: '辞書', icon: 'menu_book' },
    { path: '/student/slides', label: 'スライド', icon: 'co_present' },
    { path: '/student/assignments', label: '課題', icon: 'assignment' },
    { path: '/student/flashcards', label: 'Flashcard', icon: 'style' },
  ];

  const links = role === 'admin' ? adminLinks : studentLinks;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white text-gray-800 border-r border-gray-200">
      <div className="h-16 flex items-center px-6 border-b border-gray-200 mb-4">
        <span className="text-xl font-extrabold text-black tracking-wide">KAKEHASHI</span>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {links.map((link) => {
          // Check active cho cả route con (vd: /admin/assignments/create cũng active menu Assignments)
          const isActive = location.pathname.startsWith(link.path);
          return (
            <Link 
              key={link.path} 
              to={link.path}
              onClick={onClose} 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-bold text-sm ${
                isActive 
                  ? 'bg-[#1E50A2] text-white shadow-md' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className={`material-symbols-outlined text-xl ${isActive ? 'text-white' : 'text-gray-700'}`}>
                {link.icon}
              </span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button 
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer font-bold text-sm"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          <span>ログアウト</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-30 h-full">
        <SidebarContent />
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose}></div>
          <div className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl h-full">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;