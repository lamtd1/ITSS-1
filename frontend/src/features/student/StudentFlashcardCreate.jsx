import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import CreateSetModal from '../../components/flashcard/CreateSetModal.jsx';
import UploadExcelModal from '../../components/flashcard/UploadExcelModal.jsx';

const StudentFlashcardCreate = () => {
  const navigate = useNavigate();
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newSetTitle, setNewSetTitle] = useState('');
  const [newSetDescription, setNewSetDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reload, setReload] = useState(0);

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch flashcard sets
  useEffect(() => {
    const fetchSets = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setError('認証が必要です');
          setLoading(false);
          return;
        }
        const response = await fetch(`${baseUrl}/api/flashcards/sets`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          // Fetch card counts for each set
          const setsWithCounts = await Promise.all(
            data.data.map(async (set) => {
              const cardsResponse = await fetch(`${baseUrl}/api/flashcards/sets/${set.id}/cards`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              const cardsData = await cardsResponse.json();
              const cards = cardsData.success ? cardsData.data : [];
              const learnedCount = cards.filter(c => c.isLearned).length;
              return {
                ...set,
                count: cards.length,
                progress: cards.length > 0 ? Math.round((learnedCount / cards.length) * 100) : 0
              };
            })
          );
          setFlashcardSets(setsWithCounts);
        } else {
          setError('セットの取得に失敗しました');
        }
      } catch (err) {
        console.error('Error fetching flashcard sets:', err);
        setError('サーバーエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchSets();
  }, [baseUrl, reload]);

  const handleSetClick = (setId) => {
    navigate(`/student/flashcards/learn/${setId}`);
  };

  const handleCreateSet = async (e) => {
    e.preventDefault();

    if (!newSetTitle.trim()) {
      alert('タイトルを入力してください');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('ログインが必要です');
        setIsSubmitting(false);
        return;
      }
      const response = await fetch(`${baseUrl}/api/flashcards/sets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newSetTitle.trim(),
          description: newSetDescription.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Add new set to list
        const newSet = { ...data.data, count: 0, progress: 0 };
        setFlashcardSets(prev => [...prev, newSet]);

        // Reset form and close modal
        setNewSetTitle('');
        setNewSetDescription('');
        setShowCreateModal(false);

        alert('セットを作成しました！');
      } else {
        alert('セットの作成に失敗しました');
      }
    } catch (err) {
      console.error('Error creating set:', err);
      alert('サーバーエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSets = flashcardSets.filter(set =>
    set.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">フラッシュカード作成</h2>
          <p className="text-gray-500">単語を復習するためのカードセットを作成・管理します。</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button onClick={() => setShowCreateModal(true)}>
            <span className="material-symbols-outlined mr-1">add</span>
            新しいセットを作成
          </Button>
          <Button onClick={() => setShowUploadModal(true)}>
            <span className="material-symbols-outlined mr-1">upload_file</span>
            Excelでフラッシュカードセットを追加
          </Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <input
            type="text"
            placeholder="フラッシュカードを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          onClick={() => setShowCreateModal(true)}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-blue-400 hover:text-blue-500 transition-all cursor-pointer h-48"
        >
          <span className="material-symbols-outlined text-4xl mb-2">add</span>
          <span className="font-medium">新規セット作成</span>
        </div>

        {filteredSets.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            {searchQuery ? 'セットが見つかりません' : 'セットがまだありません'}
          </div>
        ) : (
          filteredSets.map((set) => (
            <Card
              key={set.id}
              onClick={() => handleSetClick(set.id)}
              className="hover:shadow-md transition-all cursor-pointer group flex flex-col h-48 justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-gray-500">style</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">{set.title}</h3>
                {set.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-1">{set.description}</p>
                )}
                <p className="text-sm text-gray-500">{set.count} 単語</p>
              </div>

              <div className="space-y-2 relative z-10">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>習得率</span>
                  <span>{set.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full" style={{ width: `${set.progress}%` }}></div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <CreateSetModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewSetTitle('');
          setNewSetDescription('');
        }}
        onSubmit={handleCreateSet}
        titleValue={newSetTitle}
        descriptionValue={newSetDescription}
        onTitleChange={(e) => setNewSetTitle(e.target.value)}
        onDescriptionChange={(e) => setNewSetDescription(e.target.value)}
        isSubmitting={isSubmitting}
      />

      <UploadExcelModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onImported={({ setId, count, title }) => {
          // Refetch sets to update counts and progress accurately
          setReload(r => r + 1);
          alert(`新しいセット（ID: ${setId}）を作成し、${count}枚のカードを追加しました！`);
        }}
      />
    </div>
  );
};

export default StudentFlashcardCreate;