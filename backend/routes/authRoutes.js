import express from 'express';
import * as authController from '../controllers/authController.js';
import {
  validateRegister,
  validateLogin,
  validateChangePassword,
  validateUpdateProfile,
} from "../middlewares/validation-middlewares.js";
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/change-password', authenticate, validateChangePassword, authController.changePassword);
router.post('/logout', authenticate, authController.logout);

router.get('/me', authenticate, authController.getProfile);
router.put('/profile', authenticate, validateUpdateProfile ,authController.updateProfile);

export default router;