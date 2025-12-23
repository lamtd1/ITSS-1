import React, { useState, useRef, useEffect } from "react"; // Thêm useEffect
import * as XLSX from "xlsx";
import axios from "axios";
import Card from "../../components/common/Card.jsx";
import Button from "../../components/common/Button.jsx";
import { useNavigate, useParams } from "react-router-dom"; // Thêm useParams

const baseBackendURL = `${import.meta.env.VITE_API_URL}/api`;
const API_URL = `${baseBackendURL}/api`;

const AdminAssignmentCreate = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Lấy ID từ URL (nếu có)
  const isEditMode = Boolean(id); // Xác định chế độ

  // State quản lý thông tin bài tập
  const [assignmentInfo, setAssignmentInfo] = useState({
    title: "",
    description: "",
    endDate: "",
    totalScore: 100,
    assignType: "all",
  });

  const [assignedEmails, setAssignedEmails] = useState([]);
  const [inputEmail, setInputEmail] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loadingData, setLoadingData] = useState(false); // Loading khi fetch dữ liệu edit

  const fileInputRef = useRef(null);
  const questionsEndRef = useRef(null);

  // --- USE EFFECT: LẤY DỮ LIỆU KHI EDIT ---
  useEffect(() => {
    if (isEditMode) {
      const fetchAssignmentData = async () => {
        try {
          setLoadingData(true);
          // Gọi API dành riêng cho giáo viên mà ta vừa tạo ở Bước 1
          const response = await axios.get(`${baseBackendURL}/assignments/${id}/teacher-detail`);
          const data = response.data;

          // 1. Fill thông tin cơ bản
          // Format date từ ISO string sang YYYY-MM-DD để input type="date" hiểu
          const formattedDate = data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : "";

          setAssignmentInfo({
            title: data.title,
            description: data.description || "",
            endDate: formattedDate,
            totalScore: data.score,
            assignType: data.assignType || "all",
          });

          // 2. Fill danh sách học sinh (nếu là specific)
          if (data.assignType === 'specific' && data.assigneeList) {
            // assigneeList trong DB lưu mảng string, axios tự parse JSON nếu cột là jsonb/json
            // Nếu DB lưu chuỗi thuần thì cần JSON.parse, nhưng Sequelize thường tự handle
            setAssignedEmails(data.assigneeList);
          }

          // 3. Fill câu hỏi
          // API Bước 1 đã format sẵn options, chỉ cần gán vào
          if (data.questions) {
            setQuestions(data.questions);
          }

        } catch (error) {
          console.error("Error fetching assignment details:", error);
          alert("Dữ liệu bài tập không tồn tại hoặc bị lỗi.");
          navigate("/admin/assignments");
        } finally {
          setLoadingData(false);
        }
      };

      fetchAssignmentData();
    }
  }, [id, isEditMode, navigate]);


  // --- TÍNH ĐIỂM ---
  const currentTotalScore = questions.reduce(
    (sum, q) => sum + (parseInt(q.score) || 0),
    0
  );
  const isScoreValid =
    currentTotalScore === parseInt(assignmentInfo.totalScore);
  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    if (name === "assignType") {
      setAssignmentInfo((prev) => ({ ...prev, assignType: value }));
    } else {
      setAssignmentInfo((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddEmail = () => {
    if (inputEmail && !assignedEmails.includes(inputEmail)) {
      if (!/\S+@\S+\.\S+/.test(inputEmail)) {
        alert("無効なメールアドレスです。");
        return;
      }
      setAssignedEmails([...assignedEmails, inputEmail]);
      setInputEmail("");
    }
  };

  const handleRemoveEmail = (email) => {
    setAssignedEmails(assignedEmails.filter((e) => e !== email));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      const emailList = [];
      const emailRegex = /\S+@\S+\.\S+/;
      data.flat().forEach((cell) => {
        if (typeof cell === "string" && emailRegex.test(cell.trim())) {
          emailList.push(cell.trim());
        }
      });
      if (emailList.length > 0) {
        setAssignedEmails((prev) => [...new Set([...prev, ...emailList])]);
        alert(`${file.name} から ${emailList.length} 件のメールアドレスを読み込みました。`);
      } else {
        alert("有効なメールアドレスが見つかりませんでした。");
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addQuestion = () => {
    const newId = questions.length > 0 ? Math.max(...questions.map((q) => q.id)) + 1 : 1;
    setQuestions([
      ...questions,
      {
        id: newId,
        text: "",
        type: "Tno",
        score: 0,
        options: [
          { id: 1, text: "", isCorrect: true },
          { id: 2, text: "", isCorrect: false },
        ],
      },
    ]);
    setTimeout(() => {
      questionsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleQuestionChange = (id, field, value) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const addOption = (questionId) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        const newOptionId =
          q.options.length > 0
            ? Math.max(...q.options.map((o) => o.id)) + 1
            : 1;
        return {
          ...q,
          options: [
            ...q.options,
            { id: newOptionId, text: "", isCorrect: false },
          ],
        };
      })
    );
  };

  const removeOption = (questionId, optionId) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        return { ...q, options: q.options.filter((o) => o.id !== optionId) };
      })
    );
  };

  const handleOptionTextChange = (questionId, optionId, text) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        return {
          ...q,
          options: q.options.map((o) =>
            o.id === optionId ? { ...o, text } : o
          ),
        };
      })
    );
  };

  const handleCorrectOptionChange = (questionId, optionId) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        return {
          ...q,
          options: q.options.map((o) => ({
            ...o,
            isCorrect: o.id === optionId,
          })),
        };
      })
    );
  };
  // -------------------------------------------------------------


  // --- SAVE & CALL API ---
  const handleSave = async () => {
    // 1. Validation
    if (!assignmentInfo.title.trim()) {
      alert("タイトルを入力してください。");
      return;
    }
    if (questions.length === 0) {
      alert("少なくとも1つの質問を追加してください。");
      return;
    }
    if (!isScoreValid) {
      alert(`エラー: 質問の合計点 (${currentTotalScore}) が課題の合計点 (${assignmentInfo.totalScore}) と一致しません。`);
      return;
    }
    if (assignmentInfo.assignType === "specific" && assignedEmails.length === 0) {
      alert("エラー: 学生を指定するか、Excelファイルをアップロードしてください。");
      return;
    }
    const invalidQuestions = questions.filter(
      (q) => q.type === "Tno" && !q.options.some((o) => o.isCorrect)
    );
    if (invalidQuestions.length > 0) {
      alert("エラー: 選択式の質問には少なくとも1つの正解を選択してください。");
      return;
    }

    // 2. Prepare Payload
    const payload = {
      title: assignmentInfo.title,
      description: assignmentInfo.description,
      endDate: assignmentInfo.endDate,
      totalScore: parseInt(assignmentInfo.totalScore),
      assignType: assignmentInfo.assignType,
      assignedStudents: assignmentInfo.assignType === "all" ? [] : assignedEmails,
      questions: questions.map((q) => ({
        text: q.text,
        type: q.type,
        score: parseInt(q.score),
        options: q.options,
      })),
      userId: 2, // Hardcode tạm thời
    };

    console.log("Sending Payload:", payload);

    try {
      let response;
      if (isEditMode) {
        // --- LOGIC EDIT (PUT) ---
        response = await axios.put(`${baseBackendURL}/assignments/${id}`, payload);
        alert("更新しました！");
      } else {
        // --- LOGIC CREATE (POST) ---
        response = await axios.post(`${baseBackendURL}/assignments`, payload);
        alert("保存しました");
      }

      if (response.status === 200 || response.status === 201) {
        navigate("/admin/assignments");
      }
    } catch (error) {
      console.error("Error saving assignment:", error);
      const errorMsg = error.response?.data?.message || "保存に失敗しました。";
      alert(errorMsg);
    }
  };

  if (loadingData) {
    return <div className="text-center p-10">データを読み込み中...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-6 flex justify-between items-end">
        <div>
          {/* Đổi tiêu đề dựa trên mode */}
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditMode ? "課題編集" : "課題作成"}
          </h2>
          <p className="text-gray-500 text-sm">
            {isEditMode ? "既存の課題内容を編集する" : "全体の課題を作成して登録する"}
          </p>
        </div>
        <div
          className={`text-sm font-bold ${isScoreValid ? "text-green-600" : "text-red-500"
            }`}
        >
          現在の合計: {currentTotalScore} / {assignmentInfo.totalScore} 点
        </div>
      </div>

      {/* ... Phần JSX Form bên dưới GIỮ NGUYÊN HOÀN TOÀN như file cũ ... */}
      {/* Chỉ cần copy-paste lại toàn bộ phần return JSX bên dưới từ AdminAssignmentCreate cũ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            {/* Nội dung form Details... giữ nguyên, bind value={assignmentInfo.title} v.v... */}
            <h3 className="font-bold text-lg mb-4 pb-2 border-b text-gray-800">
              課題の詳細
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  タイトル <span className="text-red-500">*</span>
                </label>
                <input
                  name="title"
                  value={assignmentInfo.title}
                  onChange={handleInfoChange}
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                  placeholder="例：第1章 テスト"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  説明
                </label>
                <textarea
                  name="description"
                  value={assignmentInfo.description}
                  onChange={handleInfoChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                  placeholder="説明..."
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  終了日 <span className="text-red-500">*</span>
                </label>
                <input
                  name="endDate"
                  value={assignmentInfo.endDate}
                  onChange={handleInfoChange}
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </Card>

          <Card>
            {/* Phần Render Questions... giữ nguyên, bind questions.map... */}
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="font-bold text-lg text-gray-800">質問リスト</h3>
            </div>
            <div className="space-y-4">
              {questions.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <p className="text-gray-500 text-sm">質問がありません。</p>
                </div>
              ) : (
                questions.map((q, index) => (
                  <div key={q.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                    {/* ... Nội dung item câu hỏi ... giữ nguyên */}
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-sm text-gray-700">質問 {index + 1}</span>
                      <button onClick={() => removeQuestion(q.id)} className="text-red-400 hover:text-red-600 p-1"><span className="material-symbols-outlined">delete</span></button>
                    </div>
                    <div className="space-y-3">
                      <input type="text" value={q.text} onChange={(e) => handleQuestionChange(q.id, "text", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded" placeholder="質問内容..." />
                      <div className="flex gap-2">
                        <select value={q.type} onChange={(e) => handleQuestionChange(q.id, "type", e.target.value)} className="w-1/2 px-3 py-2 border border-gray-300 rounded"><option value="Tno">選択式</option><option value="Essay">記述式</option></select>
                        <input type="number" value={q.score} onChange={(e) => handleQuestionChange(q.id, "score", e.target.value)} className="w-1/2 px-3 py-2 border border-gray-300 rounded text-right" placeholder="点数" />
                      </div>
                      {q.type === "Tno" && (
                        <div className="mt-4 pt-3 border-t border-gray-200 space-y-2">
                          {q.options && q.options.map((opt) => (
                            <div key={opt.id} className="flex items-center gap-2">
                              <input type="radio" name={`correct-answer-${q.id}`} checked={opt.isCorrect} onChange={() => handleCorrectOptionChange(q.id, opt.id)} className="w-4 h-4" />
                              <input type="text" value={opt.text} onChange={(e) => handleOptionTextChange(q.id, opt.id, e.target.value)} className="flex-1 px-2 py-1 border rounded" />
                              <button onClick={() => removeOption(q.id, opt.id)} className="text-gray-400"><span className="material-symbols-outlined">close</span></button>
                            </div>
                          ))}
                          <button onClick={() => addOption(q.id)} className="text-xs text-blue-600 font-bold">選択肢を追加</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 pt-2">
              <button onClick={addQuestion} className="w-full py-3 border-2 border-dashed border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 font-bold"><span className="material-symbols-outlined mr-2">add_circle</span> 質問を追加</button>
              <div ref={questionsEndRef} />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            {/* Phần Setting Total Score... giữ nguyên */}
            <h3 className="font-bold text-sm text-gray-700 mb-3 border-b pb-2">設定</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">合計ポイント <span className="text-red-500">*</span></label>
              <input name="totalScore" value={assignmentInfo.totalScore} onChange={(e) => setAssignmentInfo({ ...assignmentInfo, totalScore: e.target.value })} type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg font-bold text-blue-600 text-lg" />
            </div>
          </Card>

          <Card>
            {/* Phần Assign Students... giữ nguyên logic hiển thị */}
            <h3 className="font-bold text-sm text-gray-700 mb-3 border-b pb-2">対象学生</h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="flex items-center"><input type="radio" name="assignType" value="all" checked={assignmentInfo.assignType === "all"} onChange={handleInfoChange} className="mr-2" /> 全員に割り当てる</label>
                <label className="flex items-center"><input type="radio" name="assignType" value="specific" checked={assignmentInfo.assignType === "specific"} onChange={handleInfoChange} className="mr-2" /> 特定の学生</label>
              </div>
              {assignmentInfo.assignType === "specific" && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="mb-3 flex gap-2">
                    <input type="text" value={inputEmail} onChange={(e) => setInputEmail(e.target.value)} className="flex-1 px-3 py-1 border rounded text-sm" placeholder="Email" />
                    <button onClick={handleAddEmail} className="bg-blue-600 text-white px-3 py-1 rounded text-xs">追加</button>
                  </div>
                  <div className="mb-4">
                    <label className="cursor-pointer bg-gray-100 border px-3 py-1 rounded text-sm block text-center">
                      Excel Upload <input type="file" accept=".xlsx" onChange={handleFileUpload} ref={fileInputRef} className="hidden" />
                    </label>
                  </div>
                  <div className="max-h-40 overflow-y-auto border bg-gray-50 p-2 rounded">
                    {assignedEmails.map((email, idx) => (
                      <div key={idx} className="flex justify-between bg-white px-2 py-1 mb-1 border rounded text-sm">
                        <span>{email}</span>
                        <button onClick={() => handleRemoveEmail(email)} className="text-red-500">x</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Button className="w-full" onClick={handleSave}>
            <span className="material-symbols-outlined mr-2">save</span>
            {isEditMode ? "更新する" : "保存"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminAssignmentCreate;