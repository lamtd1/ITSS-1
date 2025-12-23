import React, { useState } from 'react';

const FloatingTranslate = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [furigana, setFurigana] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;

    setIsTranslating(true);
    try {
      const dbUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';
      const response = await fetch(`${dbUrl}/ai/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sourceText,
          source: 'auto',
          target: 'auto',
          mode: 'translate'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (response.status === 429) {
          alert('APIの利用制限に達しました。しばらく待ってから再度お試しください。\n\n' +
            'Đã vượt quá giới hạn API. Vui lòng thử lại sau.');
          setIsTranslating(false);
          return;
        }

        throw new Error(errorData.message || 'Translation failed');
      }

      const data = await response.json();

      // If it's a word lookup (JSON object), show the translation field
      // If it's a sentence (simple string or object with translation), show that
      let result = '';
      let furiganaResult = '';

      if (typeof data.translation === 'string') {
        // Check if it's a JSON string inside
        try {
          const parsed = JSON.parse(data.translation);
          result = parsed.translation || parsed.meaning || data.translation;
          furiganaResult = parsed.furigana || data.furigana || '';
        } catch {
          result = data.translation;
          furiganaResult = data.furigana || '';
        }
      } else if (typeof data === 'object') {
        result = data.translation || data.meaning || JSON.stringify(data);
        furiganaResult = data.furigana || '';
      }

      setTranslatedText(result);
      setFurigana(furiganaResult);
    } catch (error) {
      console.error('Translation error:', error);
      setTranslatedText('翻訳に失敗しました。もう一度お試しください。\n\nDịch thất bại. Vui lòng thử lại.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    if (isExpanded) {
      // Reset when collapsing
      setSourceText('');
      setTranslatedText('');
      setFurigana('');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {/* Floating Button */}
      {!isExpanded && (
        <button
          onClick={handleToggle}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
          aria-label="Mở bộ dịch"
        >
          <svg
            className="w-6 h-6 group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
            />
          </svg>
        </button>
      )}

      {/* Expanded Translation Panel */}
      {isExpanded && (
        <div className="bg-white rounded-2xl shadow-2xl w-96 max-w-[calc(100vw-3rem)] animate-slideIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                />
              </svg>
              <h3 className="font-semibold">翻訳</h3>
            </div>
            <button
              onClick={handleToggle}
              className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
              aria-label="Thu nhỏ"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Source Text Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                翻訳対象のテキスト
              </label>
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="翻訳対象のテキストを入力してください..."
                className="w-full h-28 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
              />
            </div>

            {/* Translate Button */}
            <button
              onClick={handleTranslate}
              disabled={!sourceText.trim() || isTranslating}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {isTranslating ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>翻訳中...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                  <span>翻訳</span>
                </>
              )}
            </button>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                翻訳結果
              </label>
              <div className="w-full min-h-[7rem] px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800">
                {translatedText ? (
                  <div className="flex flex-col">
                    {furigana && (
                      <span className="text-xs text-gray-500 mb-1">{furigana}</span>
                    )}
                    <span>{translatedText}</span>
                  </div>
                ) : (
                  <span className="text-gray-400">翻訳結果が表示されます...</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FloatingTranslate;
