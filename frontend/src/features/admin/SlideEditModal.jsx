import React, { useState, useEffect } from 'react';
import Button from '../../components/common/Button.jsx';

const SlideEditModal = ({ slide, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        title: slide.title,
        link: slide.filepath.replace('/preview', '/view'), // Convert back to view link for editing
        tags: slide.tags?.map(t => t.name).join(', ') || '',
        description: slide.description || ''
    });
    const [loading, setLoading] = useState(false);
    const [allTags, setAllTags] = useState([]);

    // Fetch all tags
    useEffect(() => {
        const fetchAllTags = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/slides/tags/all`);
                const data = await response.json();
                if (data.success) {
                    setAllTags(data.data);
                }
            } catch (error) {
                console.error('Error fetching tags:', error);
            }
        };
        fetchAllTags();
    }, []);

    // Toggle tag selection
    const toggleTag = (tagName) => {
        const currentTags = formData.tags
            .split(',')
            .map(t => t.trim())
            .filter(t => t.length > 0);

        const tagLower = tagName.toLowerCase();
        const index = currentTags.findIndex(t => t.toLowerCase() === tagLower);

        let newTags;
        if (index > -1) {
            // Remove tag
            currentTags.splice(index, 1);
            newTags = currentTags;
        } else {
            // Add tag
            newTags = [...currentTags, tagLower];
        }

        setFormData({ ...formData, tags: newTags.join(', ') });
    };

    // Check if a tag is selected
    const isTagSelected = (tagName) => {
        const currentTags = formData.tags
            .split(',')
            .map(t => t.trim().toLowerCase())
            .filter(t => t.length > 0);
        return currentTags.includes(tagName.toLowerCase());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const tagArray = formData.tags
                .split(',')
                .map(tag => tag.trim().toLowerCase())
                .filter(tag => tag.length > 0);

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/slides/${slide.id}`, {
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
                    {/* Removed X close button to use Cancel only */}
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
                            placeholder="文法, 初級, N5 (カンマ区切り)"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            既存のタグを選択するか、新しいタグを入力してください
                        </p>

                        {/* Tag Selector */}
                        {allTags.length > 0 && (
                            <div className="mt-3">
                                <p className="text-xs font-medium text-gray-600 mb-2">既存のタグ:</p>
                                <div className="flex flex-wrap gap-2">
                                    {allTags.map(tag => (
                                        <button
                                            key={tag.id}
                                            type="button"
                                            onClick={() => toggleTag(tag.name)}
                                            className={`px-3 py-1.5 rounded-full text-sm transition-all ${isTagSelected(tag.name)
                                                    ? 'bg-blue-600 text-white shadow-sm'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {tag.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
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
