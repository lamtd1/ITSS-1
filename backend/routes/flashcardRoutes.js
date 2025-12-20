import express from 'express';
import { listSets, getSet, listSetFlashcards, createSet, addFlashcardToSet, toggleCardLearned } from '../controllers/flashcardController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Sets (scope to authenticated user)
router.get('/sets', authenticate, listSets);
router.get('/sets/:id', authenticate, getSet);
router.post('/sets', authenticate, createSet);

// Flashcards in set (scope to authenticated user)
router.get('/sets/:id/cards', authenticate, listSetFlashcards);
router.post('/sets/:id/cards', authenticate, addFlashcardToSet);

// Toggle learned status (scope to authenticated user)
router.patch('/cards/:cardId/toggle-learned', authenticate, toggleCardLearned);

export default router;
