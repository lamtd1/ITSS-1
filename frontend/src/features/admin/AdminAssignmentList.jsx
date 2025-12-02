import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_DATA } from '../../lib/mockData.js';
import Button from '../../components/common/Button.jsx';

const AdminAssignmentList = () => {
  const navigate = useNavigate();

  // Giả sử chúng ta lấy danh sách bài tập từ MOCK_DATA (hoặc API sau này)
  const assignments = MOCK_DATA.studentAssignments.map(a => ({
      ...a, 
      author: "Admin", 
      createdDate: "2023/10/25",
      assigneesCount: 45 // Số học sinh được giao
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">課題管理</h2>
          <p className="text-gray-500 text-sm">作成した課題の確認・編集・削除を行います。</p>
        </div>
        <Button onClick={() => navigate('/admin/assignments/create')}>
            <span className="material-symbols-outlined mr-1">add</span>
            新規作成
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase font-semibold border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">タイトル</th>
              <th className="px-6 py-4">期限</th>
              <th className="px-6 py-4">対象人数</th>
              <th className="px-6 py-4">ステータス</th>
              <th className="px-6 py-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {assignments.map((asm) => (
              <tr key={asm.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-800">{asm.title}</div>
                  <div className="text-xs text-gray-500">作成日: {asm.createdDate}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {asm.deadline}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <span className="bg-blue-100 text-blue-700 py-1 px-2 rounded-full text-xs font-bold">
                    {asm.assigneesCount} 名
                  </span>
                </td>
                 <td className="px-6 py-4">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                      asm.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {asm.status === 'done' ? '完了' : '進行中'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-full" title="編集">
                    <span className="material-symbols-outlined text-xl">edit</span>
                  </button>
                  <button className="text-red-500 hover:bg-red-50 p-2 rounded-full" title="削除">
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </td>
              </tr>
            ))}
            {assignments.length === 0 && (
                <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-400">
                        課題がありません。
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAssignmentList;