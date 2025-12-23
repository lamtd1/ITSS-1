import express from 'express';
import { translate, getHistory } from '../controllers/ai/translationController.js';

const router = express.Router();

router.post('/translate', translate);
router.get('/history', getHistory);

export default router;
