import React from 'react';

const Header = ({ user, onMenuClick }) => {
  const userInitial = user?.username ? user.username.charAt(0).toUpperCase() : '?';
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="flex items-center gap-1 md:hidden">
           <span className="text-lg font-bold text-blue-600">KAKEHASHI</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-gray-900">こんにちは、{user?.username}さん</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-linear-to-tr from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white">
          {userInitial}
        </div>
      </div>
    </header>
  );
};

export default Header;