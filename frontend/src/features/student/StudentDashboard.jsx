import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Card from '../../components/common/Card.jsx';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('kakehashi_user') || '{}');

  // Mốc thời gian để hiển thị lời chào
  const hour = new Date().getHours();
  let greeting = "こんにちは！"; // Default
  if (hour < 12) greeting = "おはようございます！";
  else if (hour < 18) greeting = "こんにちは！";
  else greeting = "こんばんは！";

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!user?.id) return;
      try {
        const dbUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';
        const response = await axios.get(`${dbUrl}/assignments/student?userId=${user.id}`);

        // Filter unsubmitted assignments
        const unsubmitted = response.data.filter(asm =>
          asm.status === 'assigned' || asm.status === 'in_progress'
        );
        setAssignments(unsubmitted);
      } catch (error) {
        console.error("Error fetching assignments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [user?.id]);

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-8 text-white shadow-xl">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">{greeting}</h2>
          <p className="text-blue-100 max-w-xl">今日も一緒に頑張りましょう！</p>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-orange-500">warning</span>
          未提出の課題
        </h3>

        {loading ? (
          <div className="text-center py-8 text-gray-500">読み込み中...</div>
        ) : assignments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((asm) => (
              <Card
                key={asm.id}
                className="hover:shadow-md transition-all cursor-pointer group border-l-4 border-orange-500 hover:scale-[1.02]"
                onClick={() => navigate(`/student/assignments/${asm.id}`)}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${asm.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                    {asm.status === 'in_progress' ? '実施中' : '未実施'}
                  </span>
                  {asm.isOverdue && <span className="text-xs font-bold text-red-500">期限切れ</span>}
                </div>
                <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">{asm.title}</h4>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-4">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  <span>残り: {asm.remainingTime}</span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">未提出の課題はありません。素晴らしい！</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;