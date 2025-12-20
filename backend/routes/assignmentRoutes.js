import express from 'express';
import {
  createAssignment,
  getTeacherAssignments,
  updateAssignment,
  deleteAssignment,
  getStudentAssignments,
  getAssignmentDetails,
  submitAssignment,
  saveDraft
} from '../controllers/assignmentController.js';

const router = express.Router();

// --- GIÁO VIÊN ---
// Tạo bài tập mới
router.post('/', createAssignment);

// Lấy danh sách bài tập (của giáo viên)
router.get('/', getTeacherAssignments);

// Cập nhật bài tập
router.put('/:id', updateAssignment);

// Xóa bài tập
router.delete('/:id', deleteAssignment);

// --- HỌC SINH ---
router.get('/student', getStudentAssignments);
router.get('/:id/details', getAssignmentDetails); 
router.post('/:id/submit', submitAssignment);
router.post('/:id/draft', saveDraft);

export default router;