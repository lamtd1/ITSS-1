import React from 'react';

const FlashCard = ({ card, isFlipped, onFlip }) => {
  return (
    <div className="relative h-[400px] perspective-1000">
      <div
        onClick={onFlip}
        className={`absolute inset-0 transition-transform duration-500 transform-style-3d cursor-pointer ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front */}
        <div className={`absolute inset-0 backface-hidden ${isFlipped ? 'invisible' : 'visible'}`}>
          <div className="h-full bg-white rounded-xl shadow-lg p-8 flex flex-col items-center justify-center border-2 border-gray-100">
            <span className="text-sm text-gray-500 mb-4">表</span>
            <p className="text-3xl font-bold text-gray-800 text-center">{card.front}</p>
            <p className="text-sm text-gray-400 mt-8">クリックして裏返す</p>
          </div>
        </div>

        {/* Back */}
        <div className={`absolute inset-0 backface-hidden rotate-y-180 ${isFlipped ? 'visible' : 'invisible'}`}>
          <div className="h-full bg-blue-50 rounded-xl shadow-lg p-8 flex flex-col items-center justify-center border-2 border-blue-200">
            <span className="text-sm text-blue-600 mb-4">裏</span>
            <p className="text-3xl font-bold text-gray-800 text-center">{card.back}</p>
            {card.isLearned && (
              <span className="mt-4 px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                習得済み
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashCard;
