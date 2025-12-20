import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';

const baseBackendURL = 'http://localhost:5001/api';
const CURRENT_STUDENT_ID = 3; // TODO: Lấy từ context/auth

const StudentAssignmentList = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseBackendURL}/assignments/student?userId=${CURRENT_STUDENT_ID}`);
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

  const getStatusText = (status) => {
    switch (status) {
      case 'submitted': return '完了';
      case 'in_progress': return '進行中';
      case 'assigned': return '未着手';
      default: return '未着手';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-green-100 text-green-700 border-green-500';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700 border-yellow-500';
      case 'assigned': return 'bg-blue-100 text-blue-700 border-blue-500';
      default: return 'bg-blue-100 text-blue-700 border-blue-500';
    }
  };

  const getProgressColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-green-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'assigned': return 'bg-blue-500';
      default: return 'bg-blue-500';
    }
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
          filteredAssignments.map((asm) => (
            <Card key={asm.id} className={`border-l-4 transition-shadow hover:shadow-md ${getStatusColor(asm.status).split(' ')[2]}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">{asm.title}</h3>
                  {asm.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{asm.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">schedule</span> 
                      残り: {asm.remainingTime}
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
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">star</span> 
                      配点: {asm.totalScore}点
                      {asm.score !== null && ` (${asm.score}点獲得)`}
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase whitespace-nowrap ${getStatusColor(asm.status)}`}>
                  {getStatusText(asm.status)}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">進捗率</span>
                  <span className="font-bold">{asm.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${getProgressColor(asm.status)}`}
                    style={{ width: `${asm.progress}%` }}
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
          ))
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