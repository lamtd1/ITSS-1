import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx'; // Import thư viện xử lý Excel
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';

const AdminAssignmentCreate = () => {
  // State quản lý thông tin chung
  const [assignmentInfo, setAssignmentInfo] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    totalScore: 100,
    assignType: 'all', // 'all': Tất cả | 'specific': Chỉ định
  });

  // State danh sách Email
  const [assignedEmails, setAssignedEmails] = useState([]);
  const [inputEmail, setInputEmail] = useState('');
  
  // State câu hỏi
  const [questions, setQuestions] = useState([]);

  const fileInputRef = useRef(null);

  // --- TÍNH TOÁN ĐIỂM ---
  const currentTotalScore = questions.reduce((sum, q) => sum + (parseInt(q.score) || 0), 0);
  const isScoreValid = currentTotalScore === parseInt(assignmentInfo.totalScore);

  // --- HANDLERS: THÔNG TIN CHUNG ---
  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setAssignmentInfo(prev => ({ ...prev, [name]: value }));
  };

  // --- HANDLERS: QUẢN LÝ HỌC SINH (EMAIL & EXCEL THẬT) ---
  
  // Thêm email thủ công
  const handleAddEmail = () => {
    if (inputEmail && !assignedEmails.includes(inputEmail)) {
      if (!/\S+@\S+\.\S+/.test(inputEmail)) {
        alert("無効なメールアドレスです。");
        return;
      }
      setAssignedEmails([...assignedEmails, inputEmail]);
      setInputEmail('');
    }
  };

  const handleRemoveEmail = (email) => {
    setAssignedEmails(assignedEmails.filter(e => e !== email));
  };

  // Xử lý upload file Excel THẬT
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const bstr = evt.target.result;
      // Đọc file Excel
      const wb = XLSX.read(bstr, { type: 'binary' });
      
      // Lấy sheet đầu tiên
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      
      // Chuyển data sang dạng mảng json (header: 1 để lấy mảng 2 chiều)
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      
      // Làm phẳng mảng và tìm các chuỗi là email
      const emailList = [];
      const emailRegex = /\S+@\S+\.\S+/;

      data.flat().forEach(cell => {
        if (typeof cell === 'string' && emailRegex.test(cell.trim())) {
          emailList.push(cell.trim());
        }
      });

      if (emailList.length > 0) {
        setAssignedEmails(prev => [...new Set([...prev, ...emailList])]); // Gộp và lọc trùng
        alert(`${file.name} から ${emailList.length} 件のメールアドレスを読み込みました。`);
      } else {
        alert("有効なメールアドレスが見つかりませんでした。");
      }
    };

    reader.readAsBinaryString(file);

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- HANDLERS: CÂU HỎI ---
  const addQuestion = () => {
    const newId = questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1;
    setQuestions([...questions, { 
      id: newId, 
      text: '', 
      type: 'Tno', 
      score: 0,
      options: [ 
        { id: 1, text: '', isCorrect: true }, 
        { id: 2, text: '', isCorrect: false } 
      ] 
    }]);
  };

  const handleQuestionChange = (id, field, value) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  // --- HANDLERS: ĐÁP ÁN ---
  const addOption = (questionId) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== questionId) return q;
      const newOptionId = q.options.length > 0 ? Math.max(...q.options.map(o => o.id)) + 1 : 1;
      return { ...q, options: [...q.options, { id: newOptionId, text: '', isCorrect: false }] };
    }));
  };

  const removeOption = (questionId, optionId) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== questionId) return q;
      return { ...q, options: q.options.filter(o => o.id !== optionId) };
    }));
  };

  const handleOptionTextChange = (questionId, optionId, text) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== questionId) return q;
      return { ...q, options: q.options.map(o => o.id === optionId ? { ...o, text } : o) };
    }));
  };

  const handleCorrectOptionChange = (questionId, optionId) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== questionId) return q;
      return { ...q, options: q.options.map(o => ({ ...o, isCorrect: o.id === optionId })) };
    }));
  };

  // --- SAVE ---
  const handleSave = () => {
    if (!assignmentInfo.title.trim()) { alert("タイトルを入力してください。"); return; }
    if (questions.length === 0) { alert("少なくとも1つの質問を追加してください。"); return; }
    if (!isScoreValid) { alert(`エラー: 質問の合計点 (${currentTotalScore}) が課題の合計点 (${assignmentInfo.totalScore}) と一致しません。`); return; }
    
    if (assignmentInfo.assignType === 'specific' && assignedEmails.length === 0) {
        alert("エラー: 学生を指定するか、Excelファイルをアップロードしてください。");
        return;
    }

    const invalidQuestions = questions.filter(q => q.type === 'Tno' && !q.options.some(o => o.isCorrect));
    if (invalidQuestions.length > 0) { alert("エラー: 選択式の質問には少なくとも1つの正解を選択してください。"); return; }

    const payload = {
        ...assignmentInfo,
        assignedStudents: assignmentInfo.assignType === 'all' ? 'ALL' : assignedEmails,
        questions
    }
    console.log("Saving...", payload);
    alert("保存しました！");
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-6 flex justify-between items-end">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">課題作成</h2>
            <p className="text-gray-500 text-sm">全体の課題を作成して登録する</p>
        </div>
        <div className={`text-sm font-bold ${isScoreValid ? 'text-green-600' : 'text-red-500'}`}>
            現在の合計: {currentTotalScore} / {assignmentInfo.totalScore} 点
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột Trái */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="font-bold text-lg mb-4 pb-2 border-b text-gray-800">課題の詳細</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">タイトル <span className="text-red-500">*</span></label>
                <input name="title" value={assignmentInfo.title} onChange={handleInfoChange} type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500" placeholder="例：第1章 テスト"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
                <textarea name="description" value={assignmentInfo.description} onChange={handleInfoChange} rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500" placeholder="説明..."></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">開始日 <span className="text-red-500">*</span></label>
                  <input name="startDate" value={assignmentInfo.startDate} onChange={handleInfoChange} type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">終了日 <span className="text-red-500">*</span></label>
                  <input name="endDate" value={assignmentInfo.endDate} onChange={handleInfoChange} type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg"/>
                </div>
              </div>
            </div>
          </Card>

          <Card>
             <div className="flex justify-between items-center mb-4 pb-2 border-b">
                <h3 className="font-bold text-lg text-gray-800">質問リスト</h3>
                <Button variant="secondary" className="text-sm" onClick={addQuestion}>
                    <span className="material-symbols-outlined text-sm mr-1">add</span> 質問を追加
                </Button>
             </div>
             <div className="space-y-4">
                {questions.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                        <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">quiz</span>
                        <p className="text-gray-500 text-sm">質問がありません。「質問を追加」をクリックしてください。</p>
                    </div>
                ) : (
                    questions.map((q, index) => (
                        <div key={q.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                            <div className="flex justify-between items-center mb-3">
                                <span className="font-bold text-sm text-gray-700">質問 {index + 1}</span>
                                <button onClick={() => removeQuestion(q.id)} className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50" title="削除">
                                    <span className="material-symbols-outlined text-xl">delete</span>
                                </button>
                            </div>
                            <div className="space-y-3">
                                <input type="text" value={q.text} onChange={(e) => handleQuestionChange(q.id, 'text', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-sm outline-none focus:border-blue-500" placeholder="質問内容..."/>
                                <div className="flex gap-2">
                                    <select value={q.type} onChange={(e) => handleQuestionChange(q.id, 'type', e.target.value)} className="w-1/2 px-3 py-2 border border-gray-300 rounded bg-white text-sm">
                                        <option value="Tno">選択式 (Trắc nghiệm)</option>
                                        <option value="Essay">記述式 (Tự luận)</option>
                                    </select>
                                    <div className="w-1/2 flex items-center relative">
                                        <input type="number" value={q.score} onChange={(e) => handleQuestionChange(q.id, 'score', e.target.value === '' ? '' : parseInt(e.target.value))} onFocus={(e) => e.target.select()} className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-sm text-right font-medium pr-8" placeholder="点数"/>
                                        <span className="absolute right-3 text-sm text-gray-500">点</span>
                                    </div>
                                </div>
                            </div>
                            {q.type === 'Tno' && (
                                <div className="mt-4 pt-3 border-t border-gray-200">
                                    <p className="text-xs font-bold text-gray-500 mb-2">選択肢 (正解を選択)</p>
                                    <div className="space-y-2">
                                        {q.options && q.options.map((opt) => (
                                            <div key={opt.id} className="flex items-center gap-2">
                                                <input type="radio" name={`correct-answer-${q.id}`} checked={opt.isCorrect} onChange={() => handleCorrectOptionChange(q.id, opt.id)} className="w-4 h-4 text-blue-600 cursor-pointer"/>
                                                <input type="text" value={opt.text} onChange={(e) => handleOptionTextChange(q.id, opt.id, e.target.value)} className={`flex-1 px-2 py-1 border rounded text-sm outline-none ${opt.isCorrect ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}`} placeholder="選択肢..."/>
                                                <button onClick={() => removeOption(q.id, opt.id)} className="text-gray-400 hover:text-red-500"><span className="material-symbols-outlined text-lg">close</span></button>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={() => addOption(q.id)} className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center"><span className="material-symbols-outlined text-sm mr-1">add</span> 選択肢を追加</button>
                                </div>
                            )}
                        </div>
                    ))
                )}
             </div>
          </Card>
        </div>

        {/* Cột Phải */}
        <div className="space-y-6">
          <Card>
            <h3 className="font-bold text-sm text-gray-700 mb-3 border-b pb-2">設定</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">合計ポイント <span className="text-red-500">*</span></label>
                <div className="relative">
                    <input name="totalScore" value={assignmentInfo.totalScore} onChange={(e) => { const val = e.target.value; const intVal = val === '' ? '' : parseInt(val, 10); handleInfoChange({ target: { name: 'totalScore', value: intVal } }); }} onFocus={(e) => e.target.select()} type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg font-bold text-blue-600 text-lg pr-8" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">点</span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-sm text-gray-700 mb-3 border-b pb-2">対象学生</h3>
            <div className="space-y-4">
                <div className="flex flex-col gap-2">
                    <label className="flex items-center cursor-pointer">
                        <input type="radio" name="assignType" value="all" checked={assignmentInfo.assignType === 'all'} onChange={handleInfoChange} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"/>
                        <span className="ml-2 text-sm text-gray-700">全員に割り当てる</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                        <input type="radio" name="assignType" value="specific" checked={assignmentInfo.assignType === 'specific'} onChange={handleInfoChange} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"/>
                        <span className="ml-2 text-sm text-gray-700">特定の学生</span>
                    </label>
                </div>

                {assignmentInfo.assignType === 'specific' && (
                    <div className="mt-2 pt-2 border-t border-gray-200 animate-fade-in">
                        <div className="mb-3">
                            <label className="block text-xs font-medium text-gray-500 mb-1">メールアドレスで追加</label>
                            <div className="flex gap-2">
                                <input type="text" value={inputEmail} onChange={(e) => setInputEmail(e.target.value)} className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm outline-none focus:border-blue-500" placeholder="student@example.com"/>
                                <button onClick={handleAddEmail} className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700 transition">追加</button>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Excelで一括追加 (.xlsx)</label>
                            <div className="flex items-center gap-2">
                                <label className="cursor-pointer flex items-center gap-2 px-3 py-1.5 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition text-sm text-gray-700 w-full justify-center">
                                    <span className="material-symbols-outlined text-lg">upload_file</span>
                                    <span>ファイルを選択</span>
                                    <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} ref={fileInputRef} className="hidden"/>
                                </label>
                            </div>
                        </div>

                        <div className="mt-2">
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-xs font-medium text-gray-500">選択された学生 ({assignedEmails.length}名)</label>
                                {assignedEmails.length > 0 && <button onClick={() => setAssignedEmails([])} className="text-xs text-red-500 hover:underline">全て削除</button>}
                            </div>
                            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded bg-gray-50 p-2 space-y-1">
                                {assignedEmails.length > 0 ? (
                                    assignedEmails.map((email, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-white px-2 py-1 rounded border border-gray-100 text-sm">
                                            <span className="truncate text-gray-700">{email}</span>
                                            <button onClick={() => handleRemoveEmail(email)} className="text-red-400 hover:text-red-600 ml-2"><span className="material-symbols-outlined text-base">close</span></button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-400 text-center py-2">学生が選択されていません</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
          </Card>

          <Button className="w-full" onClick={handleSave}>
            <span className="material-symbols-outlined mr-2">save</span> 保存
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminAssignmentCreate;