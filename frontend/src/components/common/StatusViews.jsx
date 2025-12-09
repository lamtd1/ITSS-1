import React from 'react';
import Button from '../../components/common/Button.jsx';

const LoadingView = () => (
  <div className="flex items-center justify-center h-[calc(100vh-140px)]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">読み込み中...</p>
    </div>
  </div>
);

const ErrorView = ({ error, onBack }) => (
  <div className="flex items-center justify-center h-[calc(100vh-140px)]">
    <div className="text-center">
      <span className="material-symbols-outlined text-5xl mb-2 text-red-600">error</span>
      <p className="text-red-600 mb-4">{error}</p>
      <Button onClick={onBack}>戻る</Button>
    </div>
  </div>
);

export { LoadingView, ErrorView };
