import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import FloatingTranslate from '../common/FloatingTranslate.jsx';

const MainLayout = ({ user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Sidebar
        role={user?.role}
        onLogout={onLogout}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen transition-all duration-300">
        <Header
          user={user}
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />

        <main className="flex-1 p-4 md:p-8 overflow-y-auto scroll-smooth">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Floating Translate Button - appears on all pages */}
      <FloatingTranslate />
    </div>
  );
};

export default MainLayout;