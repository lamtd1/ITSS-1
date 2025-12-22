import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';

const baseBackendURL = `${import.meta.env.VITE_API_URL}/api`; // Dynamic URL
const API_URL = `${baseBackendURL}/api`;

const StudentAssignmentList = () => {
  const navigate = useNavigate();
  // Lấy user từ localStorage
  const user = JSON.parse(localStorage.getItem('kakehashi_user'));
  const currentStudentId = user ? user.id : null;
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseBackendURL}/assignments/student?userId=${currentStudentId}`);
      setAssignments(response.data);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setError("データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleStartAssignment = (assignmentId) => {
    navigate(`/student/assignments/${assignmentId}`);
  };

  const getStatusText = (status, score, totalScore) => {
    // If not started
    if (status === 'assigned' || !status) return '未着手';

    // If pending grading
    if (status === 'pending_grading') return '採点中';

    // If graded and 100%
    if (status === 'graded' && score === totalScore) return '完了';

    // If graded but not 100%
    if (status === 'graded') return '採点済み';

    // Fallback
    return '未着手';
  };

  const getStatusColor = (status, score, totalScore) => {
    // If not started
    if (status === 'assigned' || !status) return 'bg-gray-100 text-gray-700 border-gray-400';

    // If pending grading
    if (status === 'pending_grading') return 'bg-yellow-100 text-yellow-700 border-yellow-500';

    // If 100% complete
    if (status === 'graded' && score === totalScore) return 'bg-green-100 text-green-700 border-green-500';

    // If graded but not 100%
    if (status === 'graded') return 'bg-blue-100 text-blue-700 border-blue-400';

    return 'bg-gray-100 text-gray-700 border-gray-400';
  };

  const getProgressColor = (status, progress) => {
    if (progress === 100) return 'bg-green-500';
    if (status === 'pending_grading') return 'bg-yellow-500';
    if (progress > 0) return 'bg-blue-500';
    return 'bg-gray-300';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter assignments based on search term
  const filteredAssignments = assignments.filter(assignment =>
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-8 text-center text-gray-500">読み込み中...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>{error}</p>
        <button onClick={fetchAssignments} className="mt-4 underline">再試行</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">課題一覧</h2>
          <p className="text-gray-500">期限内に課題を完了させてください。</p>
        </div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <input
            type="text"
            placeholder="課題を検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map((asm) => {
            // Calculate progress as percentage from score
            const progress = asm.totalScore > 0 ? Math.round((asm.score || 0) / asm.totalScore * 100) : 0;

            return (
              <Card key={asm.id} className={`border-l-4 transition-shadow hover:shadow-md ${getStatusColor(asm.status, asm.score, asm.totalScore).split(' ')[2]}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">{asm.title}</h3>
                    {asm.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{asm.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        <span className="font-semibold text-orange-600">{asm.remainingTime}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">event</span>
                        期限: {formatDate(asm.deadline)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">quiz</span>
                        問題数: {asm.questionCount}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-base">
                        <span className="material-symbols-outlined text-base">star</span>
                        <span className="text-gray-700">得点:</span>
                        {asm.score !== null ? (
                          <span className="text-blue-600 font-bold">{asm.score}点</span>
                        ) : (
                          <span className="text-gray-400">未採点</span>
                        )}
                        <span className="text-gray-500">/ {asm.totalScore}点</span>
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase whitespace-nowrap ${getStatusColor(asm.status, asm.score, asm.totalScore)}`}>
                    {getStatusText(asm.status, asm.score, asm.totalScore)}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">進捗率</span>
                    <span className="font-bold">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${getProgressColor(asm.status, progress)}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-gray-50">
                  {asm.status === 'submitted' ? (
                    <Button
                      variant="secondary"
                      className="text-sm py-1.5"
                      onClick={() => handleStartAssignment(asm.id)}
                    >
                      <span className="material-symbols-outlined text-sm mr-1">visibility</span>
                      結果を見る
                    </Button>
                  ) : asm.isOverdue ? (
                    <Button
                      variant="secondary"
                      disabled
                      className="text-sm py-1.5 opacity-50"
                    >
                      <span className="material-symbols-outlined text-sm mr-1">schedule</span>
                      期限切れ
                    </Button>
                  ) : (
                    <Button
                      className="text-sm py-1.5"
                      onClick={() => handleStartAssignment(asm.id)}
                    >
                      <span className="material-symbols-outlined text-sm mr-1">
                        {asm.status === 'in_progress' ? 'edit' : 'play_arrow'}
                      </span>
                      {asm.status === 'in_progress' ? '続ける' : '開始する'}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })
        ) : (
          <div className="col-span-2 text-center py-8 text-gray-400">
            {searchTerm ? '検索条件に一致する課題がありません' : '課題がありません'}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAssignmentList;