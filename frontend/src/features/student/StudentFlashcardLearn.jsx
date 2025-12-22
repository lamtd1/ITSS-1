import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFlashcardSet } from '../../hooks/useFlashcardSet.js';
import { useCardNavigation } from '../../hooks/useCardNavigation.js';
import { LoadingView, ErrorView } from '../../components/common/StatusViews.jsx';
import FlashCard from '../../components/flashcard/FlashCard.jsx';
import LearningHeader from '../../components/flashcard/LearningHeader.jsx';
import ProgressBar from '../../components/flashcard/ProgressBar.jsx';
import CardControls from '../../components/flashcard/CardControls.jsx';
import CompletionView from '../../components/flashcard/CompletionView.jsx';
import LearnedCardsModal from '../../components/flashcard/LearnedCardsModal.jsx';
import AddCardModal from '../../components/flashcard/AddCardModal.jsx';

const StudentFlashcardLearn = () => {
  const { setId } = useParams();
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_URL;

  const {
    set,
    cards,
    totalCards,
    learnedCount,
    loading,
    error,
    addCard,
    markAsLearned,
    unmarkAsLearned,
    getLearnedCards
  } = useFlashcardSet(setId, baseUrl);

  const {
    currentIndex,
    isFlipped,
    handleFlip,
    handleNext,
    handlePrevious,
    setCurrentIndex,
    setIsFlipped
  } = useCardNavigation(cards.length);

  const [showLearnedModal, setShowLearnedModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMarkAsLearned = async () => {
    try {
      const currentCard = cards[currentIndex];
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('ログインが必要です');
        return;
      }
      const response = await fetch(`${baseUrl}/api/flashcards/cards/${currentCard.id}/toggle-learned`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success) {
        markAsLearned(currentCard.id);

        if (cards.length === 1) {
          navigate('/student/flashcards');
        } else if (currentIndex >= cards.length - 1) {
          setCurrentIndex(cards.length - 2);
        }
        setIsFlipped(false);
      }
    } catch (err) {
      console.error('Error marking card as learned:', err);
    }
  };

  const handleUnmarkAsLearned = async (cardId) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('ログインが必要です');
        return;
      }
      const response = await fetch(`${baseUrl}/api/flashcards/cards/${cardId}/toggle-learned`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success) {
        unmarkAsLearned(cardId);
      }
    } catch (err) {
      console.error('Error unmarking card as learned:', err);
    }
  };

  const handleAddCard = async (e) => {
    e.preventDefault();

    if (!newCardFront.trim() || !newCardBack.trim()) {
      alert('表面と裏面の両方を入力してください');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('ログインが必要です');
        setIsSubmitting(false);
        return;
      }
      const response = await fetch(`${baseUrl}/api/flashcards/sets/${setId}/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          front: newCardFront.trim(),
          back: newCardBack.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        const newCard = { ...data.data, isLearned: false };
        addCard(newCard);

        setNewCardFront('');
        setNewCardBack('');
        setShowAddCardModal(false);

        alert('カードを追加しました！');
      } else {
        alert('カードの追加に失敗しました');
      }
    } catch (err) {
      console.error('Error adding card:', err);
      alert('サーバーエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingView />;
  if (error) return <ErrorView error={error} onBack={() => navigate('/student/flashcards')} />;

  if (cards.length === 0) {
    return (
      <>
        <CompletionView
          learnedCount={learnedCount}
          onBackToList={() => navigate('/student/flashcards')}
          onShowLearned={() => setShowLearnedModal(true)}
          onAddCard={() => setShowAddCardModal(true)}
        />
        <LearnedCardsModal
          isOpen={showLearnedModal}
          onClose={() => setShowLearnedModal(false)}
          learnedCards={getLearnedCards()}
          onUnmarkCard={handleUnmarkAsLearned}
        />
        <AddCardModal
          isOpen={showAddCardModal}
          onClose={() => {
            setShowAddCardModal(false);
            setNewCardFront('');
            setNewCardBack('');
          }}
          onSubmit={handleAddCard}
          frontValue={newCardFront}
          backValue={newCardBack}
          onFrontChange={(e) => setNewCardFront(e.target.value)}
          onBackChange={(e) => setNewCardBack(e.target.value)}
          isSubmitting={isSubmitting}
        />
      </>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <LearningHeader
        setTitle={set?.title}
        setDescription={set?.description}
        learnedCount={learnedCount}
        totalCards={totalCards}
        onBack={() => navigate('/student/flashcards')}
        onShowLearned={() => setShowLearnedModal(true)}
        onAddCard={() => setShowAddCardModal(true)}
      />

      <ProgressBar learnedCount={learnedCount} totalCards={totalCards} />

      <FlashCard
        card={currentCard}
        isFlipped={isFlipped}
        onFlip={handleFlip}
      />

      <CardControls
        currentIndex={currentIndex}
        totalCards={cards.length}
        isFlipped={isFlipped}
        onPrevious={handlePrevious}
        onFlip={handleFlip}
        onMarkLearned={handleMarkAsLearned}
        onNext={handleNext}
      />

      <LearnedCardsModal
        isOpen={showLearnedModal}
        onClose={() => setShowLearnedModal(false)}
        learnedCards={getLearnedCards()}
        onUnmarkCard={handleUnmarkAsLearned}
      />

      <AddCardModal
        isOpen={showAddCardModal}
        onClose={() => {
          setShowAddCardModal(false);
          setNewCardFront('');
          setNewCardBack('');
        }}
        onSubmit={handleAddCard}
        frontValue={newCardFront}
        backValue={newCardBack}
        onFrontChange={(e) => setNewCardFront(e.target.value)}
        onBackChange={(e) => setNewCardBack(e.target.value)}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default StudentFlashcardLearn;
