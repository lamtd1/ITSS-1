import FlashcardSet from '../models/flashcard/FlashcardSet.js';
import FlashCard from '../models/flashcard/FlashCard.js';

export const listSets = async (req, res) => {
  try {
    const sets = await FlashcardSet.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: sets });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch sets', error: err.message });
  }
};

export const getSet = async (req, res) => {
  try {
    const set = await FlashcardSet.findByPk(req.params.id);
    if (!set) return res.status(404).json({ success: false, message: 'Set not found' });
    if (set.userId !== req.user.id) return res.status(403).json({ success: false, message: 'Forbidden' });
    res.json({ success: true, data: set });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch set', error: err.message });
  }
};

export const listSetFlashcards = async (req, res) => {
  try {
    const setId = req.params.id;
    const set = await FlashcardSet.findByPk(setId);
    if (!set) return res.status(404).json({ success: false, message: 'Set not found' });
    if (set.userId !== req.user.id) return res.status(403).json({ success: false, message: 'Forbidden' });
    const cards = await FlashCard.findAll({ where: { setId }, order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: cards });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch flashcards', error: err.message });
  }
};

export const createSet = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'title is required' });
    const set = await FlashcardSet.create({ userId: req.user.id, title, description });
    res.status(201).json({ success: true, data: set });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create set', error: err.message });
  }
};

export const addFlashcardToSet = async (req, res) => {
  try {
    const setId = req.params.id;
    const { front, back } = req.body;
    const set = await FlashcardSet.findByPk(setId);
    if (!set) return res.status(404).json({ success: false, message: 'Set not found' });
    if (set.userId !== req.user.id) return res.status(403).json({ success: false, message: 'Forbidden' });
    if (!front || !back) return res.status(400).json({ success: false, message: 'front and back are required' });
    const card = await FlashCard.create({ setId, front, back });
    res.status(201).json({ success: true, data: card });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add flashcard', error: err.message });
  }
};

export const toggleCardLearned = async (req, res) => {
  try {
    const cardId = req.params.cardId;
    const card = await FlashCard.findByPk(cardId);
    if (!card) return res.status(404).json({ success: false, message: 'Card not found' });
    // Ensure the card belongs to a set owned by the current user
    const set = await FlashcardSet.findByPk(card.setId);
    if (!set) return res.status(404).json({ success: false, message: 'Set not found' });
    if (set.userId !== req.user.id) return res.status(403).json({ success: false, message: 'Forbidden' });
    
    card.isLearned = !card.isLearned;
    await card.save();
    
    res.json({ success: true, data: card });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to toggle learned status', error: err.message });
  }
};
