const classifyInput = (text) => {
    const trimmed = text.trim();
    const isJapanese = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(trimmed);
    const wordCount = trimmed.split(/\s+/).length;

    console.log(`Input: "${trimmed}"`);
    console.log(`isJapanese: ${isJapanese}`);

    // Japanese Logic
    if (isJapanese) {
        // If it has sentence punctuation or is long, treat as sentence
        if (/[。！？]/.test(trimmed) || trimmed.length > 15) return 'SENTENCE';
        return 'JA_WORD';
    }

    // Vietnamese/Other Logic
    // If it's short (<= 3 words) and no sentence punctuation, treat as word lookup
    if (wordCount <= 3 && !/[.!?]/.test(trimmed)) return 'VI_WORD';

    return 'SENTENCE';
};

console.log("Result:", classifyInput("留学"));
