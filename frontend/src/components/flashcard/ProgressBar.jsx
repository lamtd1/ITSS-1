import React from 'react';

const ProgressBar = ({ learnedCount, totalCards }) => {
  const progress = totalCards > 0 ? (learnedCount / totalCards) * 100 : 0;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>習得済み: {learnedCount}</span>
        <span>残り: {totalCards - learnedCount}</span>
      </div>
      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
        <div
          className="bg-blue-500 h-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
