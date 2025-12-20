import { useState, useEffect } from 'react';

export const useFlashcardSet = (setId, baseUrl) => {
  const [set, setSet] = useState(null);
  const [cards, setCards] = useState([]);
  const [allCards, setAllCards] = useState([]);
  const [totalCards, setTotalCards] = useState(0);
  const [learnedCount, setLearnedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setError('認証が必要です');
          setLoading(false);
          return;
        }
        // Fetch set info
        const setResponse = await fetch(`${baseUrl}/api/flashcards/sets/${setId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const setData = await setResponse.json();
        
        if (!setData.success) {
          setError('セットが見つかりません');
          return;
        }
        setSet(setData.data);

        // Fetch cards
        const cardsResponse = await fetch(`${baseUrl}/api/flashcards/sets/${setId}/cards`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const cardsData = await cardsResponse.json();
        
        if (cardsData.success) {
          const fetchedCards = cardsData.data;
          setAllCards(fetchedCards);
          setTotalCards(fetchedCards.length);
          const learned = fetchedCards.filter(card => card.isLearned).length;
          setLearnedCount(learned);
          
          const unlearnedCards = fetchedCards.filter(card => !card.isLearned);
          setCards(unlearnedCards);
        } else {
          setError('カードの取得に失敗しました');
        }
      } catch (err) {
        console.error('Error fetching flashcard data:', err);
        setError('サーバーエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setId, baseUrl]);

  const addCard = (newCard) => {
    setAllCards(prev => [...prev, newCard]);
    setCards(prev => [...prev, newCard]);
    setTotalCards(prev => prev + 1);
  };

  const markAsLearned = (cardId) => {
    setLearnedCount(prev => prev + 1);
    setAllCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, isLearned: true } : card
    ));
    setCards(prev => prev.filter(card => card.id !== cardId));
  };

  const unmarkAsLearned = (cardId) => {
    setLearnedCount(prev => prev - 1);
    setAllCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, isLearned: false } : card
    ));
    const cardToAdd = allCards.find(c => c.id === cardId);
    if (cardToAdd) {
      setCards(prev => [...prev, { ...cardToAdd, isLearned: false }]);
    }
  };

  const getLearnedCards = () => allCards.filter(card => card.isLearned);

  return {
    set,
    cards,
    allCards,
    totalCards,
    learnedCount,
    loading,
    error,
    addCard,
    markAsLearned,
    unmarkAsLearned,
    getLearnedCards
  };
};
