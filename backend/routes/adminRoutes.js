import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get dashboard statistics
// Add 'authenticate' middleware if you want to protect this route
router.get('/dashboard-stats', adminController.getDashboardStats);

export default router;
