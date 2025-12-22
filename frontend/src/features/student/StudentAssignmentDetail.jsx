import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Card from "../../components/common/Card.jsx";
import Button from "../../components/common/Button.jsx";

const baseBackendURL = `${import.meta.env.VITE_API_URL}/api`;

const StudentAssignmentDetail = () => {
  // Lấy user từ localStorage
  const user = JSON.parse(localStorage.getItem('kakehashi_user'));
  const currentStudentId = user ? user.id : null;
  const { id } = useParams(); // Lấy ID bài tập từ URL
  const navigate = useNavigate();

  // Không cần lấy user từ localStorage nữa
  // const [user] = useState(...) -> BỎ

  const [assignment, setAssignment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({}); // Lưu câu trả lời: { questionId: value }
  const [submissionStatus, setSubmissionStatus] = useState(null);

  // 1. Lấy dữ liệu bài tập
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        // Gọi API với CURRENT_STUDENT_ID fix cứng
        const response = await axios.get(
          `${baseBackendURL}/assignments/${id}/details`,
          {
            params: { userId: currentStudentId },
          }
        );

        setAssignment(response.data.assignment);
        setQuestions(response.data.questions);
        setSubmissionStatus(response.data.submission?.status);

        // Nếu đã làm bài (draft hoặc submitted), fill lại câu trả lời cũ
        if (response.data.submission?.answers) {
          const savedAnswers = {};
          response.data.submission.answers.forEach(ans => {
            savedAnswers[ans.questionId] = ans.answer;
          });
          setAnswers(savedAnswers);
        }

      } catch (error) {
        console.error("Error fetching assignment details:", error);
        // alert("Không thể tải bài tập hoặc bạn không có quyền truy cập.");
        navigate("/student/assignments");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetails();
    }
  }, [id, navigate]);

  // 2. Xử lý khi chọn đáp án
  const handleOptionChange = (questionId, optionId) => {
    if (submissionStatus === 'submitted') return; // Không cho sửa nếu đã nộp
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleTextChange = (questionId, text) => {
    if (submissionStatus === 'submitted') return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: text,
    }));
  };

  // 3. Nộp bài (Submit)
  const handleSubmit = async () => {
    if (!window.confirm("本当に提出しますか？提出後は修正できません。")) return;

    try {
      const answersArray = Object.keys(answers).map(qId => ({
        questionId: parseInt(qId),
        answer: answers[qId]
      }));

      const payload = {
        userId: currentStudentId,
        answers: answersArray
      };

      const res = await axios.post(`${baseBackendURL}/assignments/${id}/submit`, payload);

      alert(`提出しました！\nスコア: ${res.data.score}`);
      navigate("/student/assignments");
    } catch (error) {
      console.error("Submit error:", error);
      alert(error.response?.data?.message || "エラーが発生しました");
    }
  };

  // 4. Lưu nháp (Draft)
  const handleSaveDraft = async () => {
    try {
      const answersArray = Object.keys(answers).map(qId => ({
        questionId: parseInt(qId),
        answer: answers[qId]
      }));

      await axios.post(`${baseBackendURL}/assignments/${id}/draft`, {
        userId: currentStudentId,
        answers: answersArray
      });
      alert("下書きを保存しました");
    } catch (error) {
      console.error("Save draft error:", error);
      alert("保存に失敗しました");
    }
  };

  if (loading) return <div className="p-10 text-center">読み込み中...</div>;
  if (!assignment) return null;

  const isSubmitted = submissionStatus === 'submitted' || submissionStatus === 'pending_grading' || submissionStatus === 'graded';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <Card className="border-l-4 border-blue-500">
        <h1 className="text-2xl font-bold text-gray-800">{assignment.title}</h1>
        <div className="text-gray-500 text-sm mt-1">
          期限: {new Date(assignment.deadline).toLocaleString('ja-JP')}
        </div>
        <p className="mt-4 text-gray-700 whitespace-pre-line">{assignment.description}</p>
        <div className="mt-2 text-right font-bold text-blue-600">
          合計点: {assignment.score}
        </div>
      </Card>

      {/* Questions List */}
      <div className="space-y-6">
        {questions.map((q, index) => (
          <Card key={q.id}>
            <div className="flex justify-between mb-2">
              <span className="font-bold text-lg">質問 {index + 1}</span>
              <span className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-600">
                {q.score} 点
              </span>
            </div>

            <div className="mb-4 text-gray-800">{q.text}</div>

            {/* Render input dựa trên loại câu hỏi */}
            {q.type === 'Tno' ? (
              // Trắc nghiệm
              <div className="space-y-2 pl-4">
                {q.options && q.options.map((opt) => {
                  const isStudentAnswer = answers[q.id] == opt.id;
                  const isCorrectAnswer = opt.isCorrect;

                  // Determine styling based on grading status
                  let optionClass = "flex items-center p-3 rounded border transition-colors ";

                  if (isSubmitted) {
                    // After grading: show correct in green, wrong in red
                    if (isCorrectAnswer) {
                      optionClass += "border-green-500 bg-green-50 ";
                    } else if (isStudentAnswer) {
                      // Student selected this wrong answer
                      optionClass += "border-red-500 bg-red-50 ";
                    } else {
                      optionClass += "border-gray-200 bg-gray-50 ";
                    }
                  } else {
                    // Before submitting: show selected answer
                    if (isStudentAnswer) {
                      optionClass += "border-blue-500 bg-blue-50 cursor-pointer hover:bg-blue-100 ";
                    } else {
                      optionClass += "border-gray-200 cursor-pointer hover:bg-gray-50 ";
                    }
                  }

                  return (
                    <label key={opt.id} className={optionClass}>
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        value={opt.id}
                        checked={isStudentAnswer}
                        onChange={() => handleOptionChange(q.id, opt.id)}
                        disabled={isSubmitted}
                        className="w-5 h-5 text-blue-600 mr-3"
                      />
                      <span className={isSubmitted && isCorrectAnswer ? "font-semibold text-green-700" : isSubmitted && isStudentAnswer ? "text-red-700" : ""}>
                        {opt.text}
                      </span>
                      {isSubmitted && isCorrectAnswer && (
                        <span className="ml-auto text-green-600 font-bold text-sm">✓ 正解</span>
                      )}
                      {isSubmitted && isStudentAnswer && !isCorrectAnswer && (
                        <span className="ml-auto text-red-600 font-bold text-sm">✗ 不正解</span>
                      )}
                    </label>
                  );
                })}
              </div>
            ) : (
              // Tự luận (Essay)
              <textarea
                className="w-full border p-3 rounded focus:outline-blue-500"
                rows="4"
                placeholder="回答を入力してください..."
                value={answers[q.id] || ""}
                onChange={(e) => handleTextChange(q.id, e.target.value)}
                disabled={isSubmitted}
              ></textarea>
            )}
          </Card>
        ))}
      </div>

      {/* Actions Footer */}
      {!isSubmitted && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg z-10">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="text-sm text-gray-500">
              回答済み: {Object.keys(answers).length} / {questions.length}
            </div>
            <div className="flex gap-4">
              <Button variant="secondary" onClick={handleSaveDraft}>
                下書き保存
              </Button>
              <Button onClick={handleSubmit}>
                提出する
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAssignmentDetail;