import React, { useState } from 'react';
import Button from '../../components/common/Button.jsx';

const SlideEditModal = ({ slide, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        title: slide.title,
        link: slide.filepath.replace('/preview', '/view'), // Convert back to view link for editing
        tags: slide.tags?.map(t => t.name).join(', ') || '',
        description: slide.description || ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const tagArray = formData.tags
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);

            const response = await fetch(`http://localhost:5001/api/slides/${slide.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: formData.title,
                    link: formData.link,
                    tags: tagArray,
                    description: formData.description
                }),
            });

            if (response.ok) {
                onUpdate();
            } else {
                alert('更新に失敗しました');
            }
        } catch (error) {
            console.error('Update error:', error);
            alert('エラーが発生しました');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 text-lg">スライド編集</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1.5">タイトル</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1.5">Google Driveリンク</label>
                        <input
                            type="url"
                            value={formData.link}
                            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1.5">タグ</label>
                        <input
                            type="text"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1.5">説明</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="secondary" type="button" onClick={onClose}>
                            キャンセル
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? '保存中...' : '保存'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SlideEditModal;
