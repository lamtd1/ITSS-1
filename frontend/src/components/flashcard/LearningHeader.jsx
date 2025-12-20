import React from 'react';
import Button from '../../components/common/Button.jsx';

const LearningHeader = ({ 
  setTitle, 
  setDescription,
  learnedCount, 
  totalCards, 
  onBack, 
  onShowLearned, 
  onAddCard 
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
        >
          <span className="material-symbols-outlined mr-1">arrow_back</span>
          戻る
        </button>
        <h2 className="text-2xl font-bold text-gray-800">{setTitle}</h2>
        {setDescription && (
          <p className="text-gray-600 text-sm mt-1">{setDescription}</p>
        )}
        <p className="text-gray-500 text-sm">
          進捗: {learnedCount} / {totalCards} カード習得済み
        </p>
      </div>
      <div className="flex gap-2">
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
  );
};

export default LearningHeader;
