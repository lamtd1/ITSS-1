import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card.jsx';

const StudentDictionary = () => {
  const [term, setTerm] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('kakehashi_user') || '{}');

  // Fetch history on mount
  useEffect(() => {
    if (user?.id) {
      fetchHistory();
    }
  }, []);

  const fetchHistory = async () => {
    try {
      const dbUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';
      const res = await fetch(`${dbUrl}/ai/history?user_id=${user?.id}`);
      if (res.ok) {
        const data = await res.json();
        // Filter out duplicates based on text if needed, or just take top 10
        setHistory(data.slice(0, 10));
      }
    } catch (error) {
      console.error("Failed to fetch history", error);
    }
  };

  const handleSearch = async (e, overrideTerm) => {
    if (e) e.preventDefault();
    const searchTerm = overrideTerm || term;
    if (!searchTerm.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const dbUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';
      const response = await fetch(`${dbUrl}/ai/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: searchTerm,
          source: 'auto',
          target: 'auto',
          mode: 'dictionary',
          user_id: user?.id
        })
      });

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      console.log("API Response:", data); // Debug Log

      let parsedData = data;

      // Only attempt to parse 'translation' if it's a string AND looks like JSON, 
      // AND we don't already have a detailed object (checked via 'kanji' or 'word')
      if (typeof data.translation === 'string' && !data.kanji && !data.word) {
        const trimmedTranslation = data.translation.trim();
        if (trimmedTranslation.startsWith('{') || trimmedTranslation.startsWith('[')) {
          try {
            const inner = JSON.parse(data.translation);
            if (typeof inner === 'object') {
              parsedData = inner;
            }
          } catch (e) {
            // Not a JSON string, keep original
            console.log("Not a nested JSON string:", e);
          }
        }
      }
      console.log("Parsed Data:", parsedData); // Debug Log

      setResult(parsedData);
      fetchHistory(); // Refresh history after search
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const playAudio = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      window.speechSynthesis.speak(utterance);
    }
  };

  const renderWordResult = (data) => (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Section */}
      <div className="border-b border-gray-100 pb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-6xl font-bold text-blue-600">{data.kanji || term}</h1>
            <button
              onClick={() => playAudio(data.kanji || term)}
              className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
              title="Nghe phát âm"
            >
              <span className="material-symbols-outlined text-2xl">volume_up</span>
            </button>
          </div>

          {data.radical && (
            <div className="text-center p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="text-2xl font-serif text-gray-700 mb-1">{data.radical.symbol}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">{data.radical.meaning}</div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {/* Readings Row */}
          <div className="flex flex-wrap items-center gap-3">
            {data.reading && (
              <span className="text-2xl text-gray-800 font-medium">{data.reading}</span>
            )}
            {data.romaji && (
              <span className="text-lg text-gray-500 font-mono px-2 border-l border-gray-300">
                {data.romaji}
              </span>
            )}
            {data.han_viet && (
              <span className="px-3 py-1 bg-orange-50 text-orange-700 border border-orange-100 rounded-lg text-sm font-bold font-serif">
                {data.han_viet}
              </span>
            )}
          </div>

          {/* Tags Row */}
          <div className="flex flex-wrap gap-2">
            {data.jlpt && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold">
                {data.jlpt}
              </span>
            )}
            {data.onyomi && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                On: {data.onyomi}
              </span>
            )}
            {data.kunyomi && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                Kun: {data.kunyomi}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Meaning Section */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
          Nghĩa của từ
        </h3>
        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
          <p className="text-2xl text-gray-900 font-medium mb-2">{data.meaning || data.translation}</p>
          {data.definition && (
            <p className="text-gray-600 leading-relaxed">{data.definition}</p>
          )}
        </div>
      </div>

      {/* Components */}
      {data.components && data.components.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide">Thành phần cấu tạo</h4>
          <div className="flex gap-3">
            {data.components.map((comp, idx) => (
              <div key={idx} className="w-12 h-12 flex items-center justify-center bg-white border border-gray-200 rounded-xl text-xl font-serif text-gray-700 shadow-sm">
                {comp}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usages / Compounds */}
      {data.usages && data.usages.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
            Từ vựng liên quan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.usages.map((usage, idx) => (
              <div key={idx} className="group bg-white p-4 rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-lg text-gray-800 group-hover:text-purple-700 transition-colors">{usage.word}</span>
                  <span className="text-sm text-gray-400 font-mono">{usage.reading}</span>
                </div>
                <p className="text-gray-600 text-sm">{usage.meaning}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Examples */}
      {data.examples && data.examples.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-green-500 rounded-full"></span>
            Ví dụ mẫu
          </h3>
          <div className="space-y-3">
            {data.examples.map((ex, idx) => (
              <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => playAudio(ex.sentence)}
                    className="mt-1 text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">volume_up</span>
                  </button>
                  <div>
                    <p className="text-lg text-gray-800 font-medium mb-1">{ex.sentence}</p>
                    <p className="text-sm text-blue-600 mb-1">{ex.reading}</p>
                    <p className="text-gray-600 italic">{ex.translation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderListResult = (list) => (
    <div className="space-y-4 animate-fadeIn">
      <h3 className="text-lg font-bold text-gray-700 mb-4">Kết quả tìm kiếm cho "{term}"</h3>
      {list.map((item, idx) => (
        <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="text-2xl font-bold text-blue-600">{item.word}</h4>
              <p className="text-gray-500 font-mono">{item.reading}</p>
            </div>
            <button
              onClick={() => {
                setTerm(item.word);
                handleSearch(null, item.word);
              }}
              className="text-sm text-blue-500 hover:underline"
            >
              Chi tiết &rarr;
            </button>
          </div>
          <p className="text-gray-800 text-lg">{item.meaning}</p>
        </div>
      ))}
    </div>
  );

  const renderSentenceResult = (data) => (
    <div className="p-6 animate-fadeIn">
      <h3 className="text-lg font-bold text-gray-500 mb-2">Bản dịch</h3>
      {data.furigana && (
        <p className="text-lg text-gray-500 mb-1">{data.furigana}</p>
      )}
      <p className="text-2xl text-gray-900 leading-relaxed">{data.translation}</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="text-center pt-8 pb-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Từ điển Nhật - Việt</h2>
        <p className="text-gray-500">Tra cứu Kanji, từ vựng và dịch câu thông minh</p>
      </div>

      {/* Search Box */}
      <Card className="p-2 shadow-xl shadow-blue-100/50 border-blue-100 sticky top-4 z-40 bg-white/80 backdrop-blur-md">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1 flex items-center px-4 border-2 border-transparent focus-within:border-blue-500 rounded-xl bg-gray-50 transition-all duration-300">
            <span className="material-symbols-outlined text-gray-400 text-2xl">search</span>
            <input
              type="text"
              className="w-full pl-3 py-4 bg-transparent outline-none text-lg text-gray-800 placeholder-gray-400"
              placeholder="Nhập từ, câu tiếng Nhật hoặc tiếng Việt..."
              value={term}
              onChange={e => setTerm(e.target.value)}
            />
            {term && (
              <button
                type="button"
                onClick={() => setTerm('')}
                className="p-1 hover:bg-gray-200 rounded-full text-gray-400 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <span>Dịch</span>
            )}
          </button>
        </form>
      </Card>

      {/* Results Area */}
      {result ? (
        <Card className="overflow-hidden border-0 shadow-2xl shadow-gray-100">
          <div className="p-8">
            {/* Determine result type */}
            {Array.isArray(result)
              ? renderListResult(result)
              : (result.kanji || result.word)
                ? renderWordResult(result)
                : renderSentenceResult(result)
            }
          </div>
        </Card>
      ) : (
        /* History / Suggestions */
        <div className="mt-8">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Lịch sử tra cứu</h3>
          <div className="flex flex-wrap gap-3">
            {history.map((item) => (
              <button
                key={item._id}
                onClick={() => {
                  setTerm(item.input.text);
                  // Optionally trigger search immediately
                }}
                className="group flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:shadow-md transition-all cursor-pointer"
              >
                <span>{item.input.text}</span>
                <span className="text-xs text-gray-400 group-hover:text-blue-400">
                  → {(() => {
                    try {
                      if (typeof item.output.translation === 'string' && item.output.translation.trim().startsWith('{')) {
                        const parsed = JSON.parse(item.output.translation);
                        return parsed.translation || parsed.meaning || '...';
                      }
                      return item.output.translation || item.output.meaning || '...';
                    } catch (e) {
                      return '...';
                    }
                  })()}
                </span>
              </button>
            ))}
            {history.length === 0 && (
              <p className="text-gray-400 italic px-2">Chưa có lịch sử tra cứu nào.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDictionary;