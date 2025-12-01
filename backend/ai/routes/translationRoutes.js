import express from 'express';
import { translate, getHistory } from '../controllers/translationController.js';

const router = express.Router();

router.post('/translate', translate);
router.get('/history', getHistory);

export default router;
