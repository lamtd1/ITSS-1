import React from 'react';
import Button from '../common/Button.jsx';

const CreateSetModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  titleValue, 
  descriptionValue, 
  onTitleChange, 
  onDescriptionChange, 
  isSubmitting 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800">新規セット作成</h3>
          {/* Removed X close button to use Cancel only */}
        </div>

        {/* Modal Body */}
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              セットタイトル *
            </label>
            <input
              type="text"
              value={titleValue}
              onChange={onTitleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例: 日常会話"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              説明 (オプション)
            </label>
            <textarea
              value={descriptionValue}
              onChange={onDescriptionChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="3"
              placeholder="このセットについて..."
            />
          </div>

          {/* Modal Footer */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? '作成中...' : '作成'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSetModal;
