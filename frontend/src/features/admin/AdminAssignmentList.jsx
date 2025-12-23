import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MOCK_DATA } from "../../lib/mockData.js";
import Button from "../../components/common/Button.jsx";

const baseBackendURL = `${import.meta.env.VITE_API_URL}/api`;
// Giả định ID giáo viên đang đăng nhập là 2 (giống phần Create)
const CURRENT_TEACHER_ID = 2;

const AdminAssignmentList = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hàm lấy dữ liệu từ BE
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      // Gọi API lấy danh sách, có thể filter theo userId nếu BE hỗ trợ
      const response = await axios.get(
        `${baseBackendURL}/assignments?userId=${CURRENT_TEACHER_ID}`
      );

      // Nếu BE trả về array trực tiếp
      const data = Array.isArray(response.data) ? response.data : [];

      // Map dữ liệu từ BE sang format hiển thị (nếu cần xử lý thêm)
      // Ví dụ: BE trả về "createdAt", UI cần hiển thị ngày format đẹp
      setAssignments(data);
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

  // Hàm xóa bài tập
  const handleDelete = async (id) => {
    if (!window.confirm("本当に削除しますか？")) return;

    try {
      await axios.delete(`${baseBackendURL}/assignments/${id}`, {
        params: { userId: CURRENT_TEACHER_ID },
      });
      alert("削除しました");
      // Refresh list
      fetchAssignments();
    } catch (err) {
      console.error("Error deleting assignment:", err);
      alert("削除に失敗しました");
    }
  };

  // Helper format ngày
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Helper tính trạng thái (Ví dụ: So sánh ngày kết thúc với hiện tại)
  const getStatus = (endDate) => {
    if (!endDate) return "active";
    const end = new Date(endDate);
    const now = new Date();
    return now > end ? "done" : "active";
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        読み込み中...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>{error}</p>
        <button onClick={fetchAssignments} className="mt-4 underline">
          再試行
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">課題管理</h2>
          <p className="text-gray-500 text-sm">
            作成した課題の確認・編集・削除を行います。
          </p>
        </div>
        <Button onClick={() => navigate("/admin/assignments/create")}>
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
            {assignments.length > 0 ? (
              assignments.map((asm) => {
                const status = getStatus(asm.endDate);

                // Logic đếm số học sinh:
                // 1. Kiểm tra assignType (không phân biệt hoa thường)
                // 2. Nếu 'specific', ưu tiên đếm mảng assignedStudents, nếu không có thì tìm trường assigneesCount, cuối cùng là 0
                const isAll = asm.assignType?.toLowerCase() === "all";
                const count =
                  (asm.assignedStudents && asm.assignedStudents.length) ||
                  asm.assigneesCount ||
                  0;

                const studentCountDisplay = isAll
                  ? "全員 (Tất cả)"
                  : `${count} 名`;

                return (
                  <tr
                    key={asm.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800">{asm.title}</div>
                      <div className="text-xs text-gray-500">
                        作成日: {formatDate(asm.createdAt || asm.createdDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(asm.endDate || asm.deadline)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="bg-blue-100 text-blue-700 py-1 px-2 rounded-full text-xs font-bold">
                        {studentCountDisplay}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${status === "done"
                          ? "bg-gray-100 text-gray-500"
                          : "bg-green-100 text-green-700"
                          }`}
                      >
                        {status === "done" ? "終了" : "進行中"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      {/* Nút Edit tạm thời chưa có chức năng cụ thể */}
                      <button
                        className="text-blue-600 hover:bg-blue-50 p-2 rounded-full"
                        title="編集"
                        onClick={() =>
                          navigate(`/admin/assignments/edit/${asm.id}`)
                        }
                      >
                        <span className="material-symbols-outlined text-xl">
                          edit
                        </span>
                      </button>
                      <button
                        className="text-red-500 hover:bg-red-50 p-2 rounded-full"
                        title="削除"
                        onClick={() => handleDelete(asm.id)}
                      >
                        <span className="material-symbols-outlined text-xl">
                          delete
                        </span>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-400">
                  課題がありません
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
