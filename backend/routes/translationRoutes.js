import express from 'express';
import * as translationController from '../controllers/translationController.js';

const router = express.Router();

// Route dịch từ tiếng Nhật sang tiếng Việt
router.post('/ja-to-vi', translationController.translateJaToVi);

export default router;
