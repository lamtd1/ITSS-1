import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import SlideEditModal from './SlideEditModal.jsx';

const AdminSlideUpload = () => {
  const [activeTab, setActiveTab] = useState('link'); // 'link' or 'file'
  const [formData, setFormData] = useState({
    title: '',
    link: '',
    tags: '',
    description: ''
  });
  const [file, setFile] = useState(null);
  const [isValidLink, setIsValidLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [slides, setSlides] = useState([]);
  const [editingSlide, setEditingSlide] = useState(null);
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  // Fetch slides for management
  const fetchSlides = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/slides`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}) // No filters for now
      });
      const data = await response.json();
      if (data.success) {
        setSlides(data.data);
      }
    } catch (error) {
      console.error('Error fetching slides:', error);
    }
  };

  // Fetch all tags
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

  useEffect(() => {
    fetchSlides();
    fetchAllTags();
  }, []);

  // Validate Google Drive link
  const validateGoogleDriveLink = (link) => {
    const patterns = [
      /^https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/?(view|edit)?/,
      /^https:\/\/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
      /^https:\/\/docs\.google\.com\/(document|spreadsheets|presentation)\/d\/([a-zA-Z0-9_-]+)/
    ];
    return patterns.some(pattern => pattern.test(link));
  };

  const handleLinkChange = (e) => {
    const link = e.target.value;
    setFormData({ ...formData, link });

    if (link) {
      setIsValidLink(validateGoogleDriveLink(link));
    } else {
      setIsValidLink(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

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

    if (!formData.title) {
      setMessage({ type: 'error', text: 'タイトルは必須です' });
      return;
    }

    if (activeTab === 'link' && (!formData.link || !isValidLink)) {
      setMessage({ type: 'error', text: '有効なGoogle Driveのリンクを入力してください' });
      return;
    }

    if (activeTab === 'file' && !file) {
      setMessage({ type: 'error', text: 'ファイルを選択してください' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Get current user from localStorage
      const userStr = localStorage.getItem('kakehashi_user');
      const user = userStr ? JSON.parse(userStr) : { id: 1 };

      const tagArray = formData.tags
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0);

      let body;
      let headers = {};

      if (activeTab === 'file') {
        const data = new FormData();
        data.append('file', file);
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('userId', user.id);
        tagArray.forEach(tag => data.append('tags[]', tag)); // Append tags individually
        body = data;
        // Don't set Content-Type header for FormData, browser does it automatically with boundary
      } else {
        body = JSON.stringify({
          userId: user.id,
          title: formData.title,
          link: formData.link,
          tags: tagArray,
          description: formData.description
        });
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/slides`, {
        method: 'POST',
        headers: headers,
        body: body,
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'スライドが正常にアップロードされました' });
        // Reset form
        setFormData({ title: '', link: '', tags: '', description: '' });
        setFile(null);
        setIsValidLink(null);
        setSelectedTags([]);
        // Refresh slide list and tags
        fetchSlides();
        fetchAllTags();
      } else {
        setMessage({ type: 'error', text: data.message || 'アップロードに失敗しました' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: 'サーバーエラーが発生しました' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('本当にこのスライドを削除しますか？')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/slides/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchSlides(); // Refresh list
      } else {
        alert('削除に失敗しました');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('エラーが発生しました');
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">スライド管理</h2>
        <p className="text-gray-500 text-sm">スライドのアップロード、編集、削除ができます</p>
      </div>

      <Card className="mb-8">
        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'link'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => setActiveTab('link')}
          >
            リンクで共有
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'file'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => setActiveTab('file')}
          >
            ファイルをアップロード
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Message Display */}
          {message.text && (
            <div className={`mb-4 p-3 rounded-lg ${message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
              {message.text}
            </div>
          )}

          {/* Link Input */}
          {activeTab === 'link' && (
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Google Driveリンク <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={formData.link}
                onChange={handleLinkChange}
                placeholder="https://drive.google.com/file/d/..."
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${isValidLink === null
                  ? 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                  : isValidLink
                    ? 'border-green-500 focus:border-green-500 focus:ring-green-200'
                    : 'border-red-500 focus:border-red-500 focus:ring-red-200'
                  }`}
              />
              {isValidLink === false && (
                <p className="text-xs text-red-500 mt-1">
                  有効なGoogle Driveのリンクを入力してください
                </p>
              )}
            </div>
          )}

          {/* File Input */}
          {activeTab === 'file' && (
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                ファイルを選択 <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.pptx,.ppt"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="material-symbols-outlined text-2xl">upload_file</span>
                </div>
                {file ? (
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-gray-900">クリックしてファイルを選択</p>
                    <p className="text-xs text-gray-500 mt-1">PDF, PPTX (最大100MB)</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Common Fields */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 block mb-2">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="例：第1課：ひらがな"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
            />
          </div>

          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 block mb-2">
              タグ
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="文法, 初級, N5 (カンマ区切り)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
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

          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 block mb-2">
              説明
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="このスライドの内容について..."
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors resize-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={loading || (activeTab === 'link' && !isValidLink) || (activeTab === 'file' && !file) || !formData.title}
              className="min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin mr-2">⏳</span>
                  アップロード中...
                </span>
              ) : (
                'アップロード'
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Slide List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-bold text-gray-800">アップロード済みスライド</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm">
                <th className="p-4 font-medium">タイトル</th>
                <th className="p-4 font-medium">タグ</th>
                <th className="p-4 font-medium">作成日</th>
                <th className="p-4 font-medium text-right">アクション</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {slides.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">
                    スライドがありません
                  </td>
                </tr>
              ) : (
                slides.map(slide => (
                  <tr key={slide.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{slide.title}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[200px]">{slide.description}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {slide.tags?.map(tag => (
                          <span key={tag.id} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(slide.createdAt).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingSlide(slide)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="編集"
                        >
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(slide.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="削除"
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingSlide && (
        <SlideEditModal
          slide={editingSlide}
          onClose={() => setEditingSlide(null)}
          onUpdate={() => {
            setEditingSlide(null);
            fetchSlides();
          }}
        />
      )}
    </div>
  );
};
export default AdminSlideUpload;