import FlashCard from '../../models/flashcard/FlashCard.js';
import FlashcardSet from '../../models/flashcard/FlashcardSet.js';

// Get all flashcard sets for a user
export const getUserFlashcardSets = async (userId) => {
  try {
    const sets = await FlashcardSet.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
    return sets;
  } catch (error) {
    throw new Error('Failed to fetch flashcard sets: ' + error.message);
  }
};

// Get a single flashcard set
export const getFlashcardSetById = async (setId) => {
  try {
    const set = await FlashcardSet.findByPk(setId);
    if (!set) {
      throw new Error('Flashcard set not found');
    }
    return set;
  } catch (error) {
    throw error;
  }
};

// Create a new flashcard set
export const createFlashcardSet = async (userId, title, description) => {
  try {
    const set = await FlashcardSet.create({
      userId,
      title,
      description: description || null
    });
    return set;
  } catch (error) {
    throw new Error('Failed to create flashcard set: ' + error.message);
  }
};

// Update a flashcard set
export const updateFlashcardSet = async (setId, updates) => {
  try {
    const set = await FlashcardSet.findByPk(setId);
    if (!set) {
      throw new Error('Flashcard set not found');
    }
    
    if (updates.title) set.title = updates.title;
    if (updates.description !== undefined) set.description = updates.description;
    
    await set.save();
    return set;
  } catch (error) {
    throw error;
  }
};

// Delete a flashcard set
export const deleteFlashcardSet = async (setId) => {
  try {
    const set = await FlashcardSet.findByPk(setId);
    if (!set) {
      throw new Error('Flashcard set not found');
    }
    
    // Delete all cards in the set (cascade should handle this, but explicit is safer)
    await FlashCard.destroy({ where: { setId } });
    
    await set.destroy();
    return { success: true };
  } catch (error) {
    throw error;
  }
};

// Get all cards in a set
export const getCardsInSet = async (setId) => {
  try {
    const cards = await FlashCard.findAll({
      where: { setId },
      order: [['createdAt', 'ASC']]
    });
    return cards;
  } catch (error) {
    throw new Error('Failed to fetch cards: ' + error.message);
  }
};

// Create a flashcard
export const createFlashcard = async (setId, front, back) => {
  try {
    const card = await FlashCard.create({
      setId,
      front,
      back,
      isLearned: false
    });
    return card;
  } catch (error) {
    throw new Error('Failed to create flashcard: ' + error.message);
  }
};

// Update a flashcard
export const updateFlashcard = async (cardId, updates) => {
  try {
    const card = await FlashCard.findByPk(cardId);
    if (!card) {
      throw new Error('Flashcard not found');
    }
    
    if (updates.front) card.front = updates.front;
    if (updates.back) card.back = updates.back;
    if (updates.isLearned !== undefined) card.isLearned = updates.isLearned;
    
    await card.save();
    return card;
  } catch (error) {
    throw error;
  }
};

// Toggle learned status
export const toggleLearnedStatus = async (cardId) => {
  try {
    const card = await FlashCard.findByPk(cardId);
    if (!card) {
      throw new Error('Flashcard not found');
    }
    
    card.isLearned = !card.isLearned;
    await card.save();
    return card;
  } catch (error) {
    throw error;
  }
};

// Delete a flashcard
export const deleteFlashcard = async (cardId) => {
  try {
    const card = await FlashCard.findByPk(cardId);
    if (!card) {
      throw new Error('Flashcard not found');
    }
    
    await card.destroy();
    return { success: true };
  } catch (error) {
    throw error;
  }
};

// Get progress statistics for a set
export const getSetProgress = async (setId) => {
  try {
    const cards = await FlashCard.findAll({ where: { setId } });
    const totalCards = cards.length;
    const learnedCards = cards.filter(card => card.isLearned).length;
    const progress = totalCards > 0 ? Math.round((learnedCards / totalCards) * 100) : 0;
    
    return {
      totalCards,
      learnedCards,
      unlearnedCards: totalCards - learnedCards,
      progress
    };
  } catch (error) {
    throw new Error('Failed to calculate progress: ' + error.message);
  }
};

