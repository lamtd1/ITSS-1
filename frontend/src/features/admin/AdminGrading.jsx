import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "../../components/common/Button.jsx";

const baseBackendURL = `${import.meta.env.VITE_API_URL}/api`;

const AdminGrading = () => {
    const { submissionId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [scores, setScores] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `${baseBackendURL}/assignments/submission/${submissionId}/grading`
                );
                setData(response.data);

                // Initialize scores with earnedScore
                const initialScores = {};
                response.data.questions.forEach(q => {
                    initialScores[q.id] = q.earnedScore || 0;
                });
                setScores(initialScores);

            } catch (err) {
                console.error("Error fetching submission:", err);
                alert("Load failed");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [submissionId]);

    const handleScoreChange = (qId, value) => {
        setScores(prev => ({ ...prev, [qId]: value }));
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            await axios.post(`${baseBackendURL}/assignments/submission/${submissionId}/grade`, {
                scores
            });
            alert("採点が完了しました");
            navigate(-1); // Back
        } catch (e) {
            console.error(e);
            alert("Error submitting grade");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
    if (!data) return <div className="p-8 text-center text-red-500">Not found</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-10">
            <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
                <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{data.assignmentTitle}</h2>
                    <p className="text-gray-500">
                        学生: <span className="font-semibold">{data.studentName}</span> |
                        現在の点数: <span className="font-bold text-blue-600">{data.totalScore} / {data.maxTotalScore}</span>
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                {data.questions.map((q, index) => (
                    <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-lg text-gray-800">
                                Q{index + 1}. <span className="font-normal text-gray-600 text-base ml-2">{q.type === 'Tno' ? '(多肢選択)' : '(記述式)'}</span>
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">点数:</span>
                                <input
                                    type="number"
                                    className="border border-gray-300 rounded px-2 py-1 w-20 text-right font-bold"
                                    value={scores[q.id]}
                                    onChange={(e) => handleScoreChange(q.id, e.target.value)}
                                    max={q.maxScore}
                                    min={0}
                                />
                                <span className="text-gray-400">/ {q.maxScore}</span>
                            </div>
                        </div>

                        <div className="mb-4 text-gray-900 p-3 bg-gray-50 rounded border border-gray-100">
                            {q.text}
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-semibold text-gray-500 uppercase">学生の回答:</p>
                            {q.type === 'Tno' ? (
                                <div className="space-y-2">
                                    {q.options.map((opt) => {
                                        const isSelected = q.studentAnswer == opt.id;
                                        const isCorrect = opt.isCorrect; // Assuming backend sends this (it usually sends options: [{id, text, isCorrect}]) for Grading endpoint
                                        // Check backend logic: getSubmissionForGrading parses options. 
                                        // Need to verify if 'isCorrect' is included in that parse.
                                        // In assignmentController: 
                                        // const parsed = JSON.parse(q.text); content = parsed.prompt; options = parsed.options;
                                        // Yes, options from DB usually contain {id, text, isCorrect: true/false}

                                        let itemClass = "p-3 rounded border ";
                                        if (isSelected) {
                                            if (isCorrect) itemClass += "bg-green-50 border-green-500 text-green-700 font-medium";
                                            else itemClass += "bg-red-50 border-red-500 text-red-700";
                                        } else {
                                            if (isCorrect) itemClass += "bg-green-50 border-green-300 text-green-600 border-dashed"; // Show correct answer nicely
                                            else itemClass += "bg-white border-gray-200 text-gray-600";
                                        }

                                        return (
                                            <div key={opt.id} className={itemClass}>
                                                {opt.text}
                                                {isSelected && <span className="ml-2 text-xs font-bold">(選択済み)</span>}
                                                {isCorrect && !isSelected && <span className="ml-2 text-xs font-bold text-green-600">(正解)</span>}
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="p-4 bg-white border border-gray-300 rounded text-gray-800 whitespace-pre-wrap">
                                    {q.studentAnswer || <span className="text-gray-400 italic">未回答</span>}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-end gap-3 sticky bottom-4 bg-white/80 backdrop-blur p-4 rounded-xl shadow border border-gray-200">
                <Button variant="ghost" onClick={() => navigate(-1)}>キャンセル</Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                    {submitting ? "保存中..." : "点数を保存"}
                </Button>
            </div>
        </div>
    );
};

export default AdminGrading;
