import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "../../components/common/Button.jsx";

const baseBackendURL = `${import.meta.env.VITE_API_URL}/api`;

const AdminStudentDetail = () => {
    const { id } = useParams(); // studentId
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `${baseBackendURL}/assignments/student/${id}/assignments`
                );
                setAssignments(response.data);
            } catch (err) {
                console.error("Error fetching student assignments:", err);
                setError("データの取得に失敗しました");
            } finally {
                setLoading(false);
            }
        };

        fetchAssignments();
    }, [id]);

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("ja-JP");
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate("/admin/students")}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">学生詳細履歴</h2>
                    <p className="text-gray-500 text-sm">課題の提出状況と成績を確認します。</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 text-sm uppercase font-semibold border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4">課題タイトル</th>
                            <th className="px-6 py-4">期限</th>
                            <th className="px-6 py-4">提出日</th>
                            <th className="px-6 py-4">ステータス</th>
                            <th className="px-6 py-4">点数</th>
                            <th className="px-6 py-4 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {assignments.length > 0 ? (
                            assignments.map((asm) => (
                                <tr key={asm.assignmentId} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {asm.title}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {formatDate(asm.deadline)}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {asm.submittedAt ? formatDate(asm.submittedAt) : "-"}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${asm.status === "graded" || asm.status === "completed"
                                                    ? "bg-green-100 text-green-700"
                                                    : asm.status === "submitted" || asm.status === "pending_grading"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : "bg-gray-100 text-gray-600"
                                                }`}
                                        >
                                            {asm.statusDisplay}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-800">
                                        {asm.score !== null ? `${asm.score} / ${asm.totalScore}` : "-"}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {(asm.status === "submitted" ||
                                            asm.status === "pending_grading" ||
                                            asm.status === "graded") && (
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        navigate(`/admin/grading/${asm.submissionId}`)
                                                    }
                                                >
                                                    {asm.status === "graded" ? "再採点" : "採点する"}
                                                </Button>
                                            )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center py-8 text-gray-400">
                                    データがありません
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminStudentDetail;
