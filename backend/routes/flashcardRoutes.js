import express from 'express';
import { listSets, getSet, listSetFlashcards, createSet, addFlashcardToSet, toggleCardLearned } from '../controllers/flashcardController.js';

const router = express.Router();

// Sets
router.get('/sets', listSets);
router.get('/sets/:id', getSet);
router.post('/sets', createSet);

// Flashcards in set
router.get('/sets/:id/cards', listSetFlashcards);
router.post('/sets/:id/cards', addFlashcardToSet);

// Toggle learned status
router.patch('/cards/:cardId/toggle-learned', toggleCardLearned);

export default router;
