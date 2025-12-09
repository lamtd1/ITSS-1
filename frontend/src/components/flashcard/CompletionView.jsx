import React from 'react';
import Button from '../../components/common/Button.jsx';

const CompletionView = ({ 
  learnedCount, 
  onBackToList, 
  onShowLearned, 
  onAddCard 
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBackToList}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <span className="material-symbols-outlined mr-1">arrow_back</span>
          戻る
        </button>
      </div>
      
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl mb-2 text-green-500">check_circle</span>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">おめでとうございます！</h3>
          <p className="text-gray-600 mb-6">すべてのカードを習得しました</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={onBackToList}>
              一覧に戻る
            </Button>
            <Button
              variant="secondary"
              onClick={onShowLearned}
              className="flex items-center gap-2"
            >
              <span className="material-symbols-outlined">visibility</span>
              習得済みカードを見る ({learnedCount})
            </Button>
            <Button
              onClick={onAddCard}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <span className="material-symbols-outlined">add</span>
              カードを追加
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletionView;
