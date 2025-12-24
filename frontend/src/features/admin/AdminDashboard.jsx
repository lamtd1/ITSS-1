import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    slides: 0,
    assignments: 0,
    students: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const dbUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';
        const response = await axios.get(`${dbUrl}/admin/dashboard-stats`);
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading stats...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-blue-500 flex items-center justify-between">
          <div><p className="text-gray-500 mb-1 text-sm font-bold">スライド</p><h3 className="text-3xl font-bold text-gray-800">{stats.slides}</h3></div>
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><span className="material-symbols-outlined">co_present</span></div>
        </Card>
        <Card className="border-l-4 border-orange-500 flex items-center justify-between">
          <div><p className="text-gray-500 mb-1 text-sm font-bold">課題</p><h3 className="text-3xl font-bold text-gray-800">{stats.assignments}</h3></div>
          <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><span className="material-symbols-outlined">assignment</span></div>
        </Card>
        <Card className="border-l-4 border-green-500 flex items-center justify-between">
          <div><p className="text-gray-500 mb-1 text-sm font-bold">学生</p><h3 className="text-3xl font-bold text-gray-800">{stats.students}</h3></div>
          <div className="p-2 bg-green-50 text-green-600 rounded-lg"><span className="material-symbols-outlined">group</span></div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-bold text-lg mb-4 text-gray-800">概要</h3>
          <ul className="space-y-3">
            <li className="text-sm text-gray-600">- スライド: {stats.slides}件</li>
            <li className="text-sm text-gray-600">- 課題: {stats.assignments}件</li>
            <li className="text-sm text-gray-600">- メンバー: {stats.students}人</li>
          </ul>
          <p className="text-sm text-gray-500 mt-4">システムの全体状況をひと目で把握できる。</p>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;