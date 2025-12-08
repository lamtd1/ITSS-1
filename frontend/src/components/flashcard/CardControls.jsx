import React from 'react';
import Button from '../../components/common/Button.jsx';

const CardControls = ({ 
  currentIndex, 
  totalCards, 
  isFlipped,
  onPrevious, 
  onFlip, 
  onMarkLearned, 
  onNext 
}) => {
  return (
    <>
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm">
        <Button
          variant="secondary"
          onClick={onPrevious}
          disabled={currentIndex === 0}
        >
          <span className="material-symbols-outlined mr-1">arrow_back</span>
          前へ
        </Button>

        <Button onClick={onFlip}>
          <span className="material-symbols-outlined mr-1">flip</span>
          {isFlipped ? '表に戻す' : '裏返す'}
        </Button>

        {isFlipped && (
          <Button 
            onClick={onMarkLearned}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <span className="material-symbols-outlined mr-1">check_circle</span>
            習得済みにする
          </Button>
        )}

        <Button
          variant="secondary"
          onClick={onNext}
          disabled={currentIndex === totalCards - 1}
        >
          次へ
          <span className="material-symbols-outlined ml-1">arrow_forward</span>
        </Button>
      </div>

      <div className="bg-gray-50 p-4 rounded-xl">
        <p className="text-sm text-gray-600 text-center">
          <span className="font-medium">キーボードショートカット:</span>
          <span className="mx-2">Space/Enter = 裏返す</span>
          <span className="mx-2">← = 前へ</span>
          <span className="mx-2">→ = 次へ</span>
        </p>
      </div>
    </>
  );
};

export default CardControls;
