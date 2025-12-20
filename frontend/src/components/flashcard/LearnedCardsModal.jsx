import React from 'react';
import Button from '../common/Button.jsx';

const LearnedCardsModal = ({ isOpen, onClose, learnedCards, onUnmarkCard }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800">習得済みカード</h3>
          {/* Removed X close button to use Cancel only */}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {learnedCards.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              まだ習得済みのカードがありません
            </div>
          ) : (
            <div className="space-y-3">
              {learnedCards.map((card) => (
                <div
                  key={card.id}
                  className="bg-gray-50 rounded-lg p-4 flex items-start justify-between hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 mb-1">{card.front}</p>
                    <p className="text-sm text-gray-600">{card.back}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => onUnmarkCard(card.id)}
                    className="ml-4 text-orange-600 hover:bg-orange-50 border-orange-300"
                  >
                    <span className="material-symbols-outlined mr-1 text-sm">replay</span>
                    再学習
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t bg-gray-50">
          <Button onClick={onClose} className="w-full">
            閉じる
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LearnedCardsModal;
