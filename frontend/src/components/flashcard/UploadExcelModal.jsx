import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import Button from '../common/Button.jsx';

const UploadExcelModal = ({ isOpen, onClose, onImported }) => {
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleFileChange = async (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    setRows([]);
    setError(null);
    if (!f) return;

    setIsParsing(true);
    try {
      let wb;
      if (f.name.toLowerCase().endsWith('.csv')) {
        const text = await f.text();
        wb = XLSX.read(text, { type: 'string' });
      } else {
        const data = await f.arrayBuffer();
        wb = XLSX.read(data, { type: 'array' });
      }
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(ws, { header: 1 });
      // Expect header row: front, back
      if (!json || json.length < 2) {
        setError('ファイルの内容が不正です（データがありません）。');
        setIsParsing(false);
        return;
      }
      const header = json[0].map(h => String(h).trim().toLowerCase());
      const frontIdx = header.indexOf('front');
      const backIdx = header.indexOf('back');
      if (frontIdx === -1 || backIdx === -1) {
        setError('ヘッダーに front, back が必要です。');
        setIsParsing(false);
        return;
      }
      const parsed = json.slice(1)
        .filter(r => r && (r[frontIdx] || r[backIdx]))
        .map(r => ({ front: String(r[frontIdx] || '').trim(), back: String(r[backIdx] || '').trim() }))
        .filter(r => r.front && r.back);
      setRows(parsed);
    } catch (err) {
      console.error('Excel parse error:', err);
      setError('Excelの読み取りに失敗しました');
    } finally {
      setIsParsing(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('セットのタイトルを入力してください');
      return;
    }
    if (rows.length === 0) {
      alert('カードデータがありません');
      return;
    }
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('ログインが必要です');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      // 1) Create set
      const resSet = await fetch(`${baseUrl}/api/flashcards/sets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: title.trim(), description: description.trim() }),
      });
      const dataSet = await resSet.json();
      if (!dataSet?.success) {
        setError('セット作成に失敗しました');
        setIsSubmitting(false);
        return;
      }
      const setId = dataSet.data.id;

      // 2) Create cards
      for (const row of rows) {
        // eslint-disable-next-line no-await-in-loop
        const resCard = await fetch(`${baseUrl}/api/flashcards/sets/${setId}/cards`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ front: row.front, back: row.back }),
        });
        const dataCard = await resCard.json();
        if (!dataCard?.success) {
          console.warn('Failed to add a card:', row, dataCard);
        }
      }

      onImported({ setId, count: rows.length, title: title.trim() });
      onClose();
    } catch (err) {
      console.error('Import submit error:', err);
      setError('インポートに失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white w-[95%] max-w-xl rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">ExcelでFlashcardセットを追加</h3>
          {/* Removed X close button to use Cancel only */}
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">セットタイトル</label>
            <input className="w-full border rounded-md px-3 py-2" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">説明（任意）</label>
            <input className="w-full border rounded-md px-3 py-2" value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Excelファイル（.xlsx / .csv）</label>
            <input type="file" accept=".xlsx,.csv" onChange={handleFileChange} />
            <p className="text-xs text-gray-500 mt-1">
              テンプレートをダウンロード: <a className="text-blue-600 underline" href="/flashcards-template.csv" download>flashcards-template.csv</a>
            </p>
          </div>

          {isParsing && (
            <div className="text-gray-600 text-sm">解析中...</div>
          )}

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          {rows.length > 0 && (
            <div className="border rounded-md p-3">
              <div className="text-sm text-gray-600 mb-2">{rows.length} 件のカードが読み込まれました</div>
              <div className="max-h-40 overflow-auto text-sm">
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      <th className="border-b p-1">front</th>
                      <th className="border-b p-1">back</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 10).map((r, i) => (
                      <tr key={i}>
                        <td className="border-b p-1">{r.front}</td>
                        <td className="border-b p-1">{r.back}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rows.length > 10 && (
                  <div className="text-xs text-gray-400 mt-2">（最初の10件を表示）</div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={onClose} className="bg-gray-200 text-gray-800">キャンセル</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || isParsing || rows.length === 0}>
              {isSubmitting ? 'インポート中…' : 'インポート'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadExcelModal;
