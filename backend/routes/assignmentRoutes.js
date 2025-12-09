import express from 'express';
import * as assignmentController from '../controllers/assignmentController.js';

const router = express.Router();

// --- GIÁO VIÊN ---

// Tạo bài tập mới
// POST /api/assignments
router.post('/', assignmentController.createAssignment);

// Lấy danh sách bài tập (của giáo viên)
// GET /api/assignments?userId=...
router.get('/', assignmentController.getTeacherAssignments);

export default router;