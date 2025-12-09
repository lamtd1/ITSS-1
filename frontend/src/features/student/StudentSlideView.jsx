import React, { useState, useEffect } from "react";
import Button from "../../components/common/Button.jsx";
import PDFViewer from "./StudentPDFViewer.jsx";

const StudentSlideView = () => {
  const [slides, setSlides] = useState([]);
  const [filteredSlides, setFilteredSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedSlide, setSelectedSlide] = useState(null);

  // Fetch all slides
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${baseUrl}/api/slides`);
        const data = await response.json();

        if (data.success) {
          setSlides(data.data);
          setFilteredSlides(data.data);
        } else {
          setError('スライドの取得に失敗しました');
        }
      } catch (err) {
        console.error('Error fetching slides:', err);
        setError('サーバーエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, []);

  // Get all unique tags
  const allTags = [...new Set(slides.flatMap(slide =>
    slide.tags?.map(tag => tag.name) || []
  ))];

  // Filter slides based on search and tag
  useEffect(() => {
    let filtered = slides;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(slide =>
        slide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        slide.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by selected tag
    if (selectedTag) {
      filtered = filtered.filter(slide =>
        slide.tags?.some(tag => tag.name === selectedTag)
      );
    }

    setFilteredSlides(filtered);
  }, [searchQuery, selectedTag, slides]);

  // Open slide in modal
  const openSlide = (slide) => {
    setSelectedSlide(slide);
  };

  // Close modal
  const closeSlide = () => {
    setSelectedSlide(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-140px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-140px)]">
        <div className="text-center text-red-600">
          <span className="material-symbols-outlined text-5xl mb-2">error</span>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">授業スライド</h2>
        <p className="text-gray-500 text-sm">共有されたスライドを閲覧できます</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            search
          </span>
          <input
            type="text"
            placeholder="スライドを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
          />
        </div>

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTag('')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${selectedTag === ''
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              すべて
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${selectedTag === tag
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Slides Grid */}
      {filteredSlides.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">
            folder_open
          </span>
          <p className="text-gray-500">
            {searchQuery || selectedTag ? 'スライドが見つかりません' : 'スライドがまだありません'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSlides.map(slide => (
            <div
              key={slide.id}
              onClick={() => openSlide(slide)}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden group"
            >
              {/* Thumbnail */}
              <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center relative overflow-hidden">
                <span className="material-symbols-outlined text-6xl text-blue-300">
                  description
                </span>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 transition-opacity text-4xl">
                    visibility
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">
                  {slide.title}
                </h3>

                {slide.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {slide.description}
                  </p>
                )}

                {/* Tags */}
                {slide.tags && slide.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {slide.tags.map(tag => (
                      <span
                        key={tag.id}
                        className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Date */}
                <p className="text-xs text-gray-400">
                  {new Date(slide.createdAt).toLocaleDateString('ja-JP')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide Modal */}
      {selectedSlide && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">
                  {selectedSlide.title}
                </h3>
                {selectedSlide.tags && selectedSlide.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedSlide.tags.map(tag => (
                      <span
                        key={tag.id}
                        className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <a
                  href={selectedSlide.filepath.replace('/preview', '/view')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                  新しいタブで開く
                </a>
                <Button variant="secondary" onClick={closeSlide}>
                  閉じる
                </Button>
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 relative bg-gray-100 overflow-hidden">
              <PDFViewer
                fileUrl={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000')}/api/slides/${selectedSlide.id}/pdf`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSlideView;