import express from 'express';
import {
  createAssignment,
  getTeacherAssignments,
  updateAssignment,
  deleteAssignment,
  getStudentAssignments,
  getAssignmentDetails,
  submitAssignment,
  saveDraft,
  getTeacherAssignmentById,
  gradeSubmission,
  getStudentProgress,
  getStudentAssignmentsForTeacher,
  getSubmissionForGrading
} from '../controllers/assignmentController.js';

const router = express.Router();

// --- GIÁO VIÊN ---
// Tạo bài tập mới
router.post('/', createAssignment);

// Lấy danh sách bài tập (của giáo viên)
router.get('/', getTeacherAssignments);

// Lấy danh sách học sinh & tiến độ (Admin Student Manage)
router.get('/progress/students', getStudentProgress);

// Lấy danh sách bài tập của 1 học sinh (để giáo viên xem)
router.get('/student/:studentId/assignments', getStudentAssignmentsForTeacher);

// Lấy chi tiết 1 bài nộp để chấm
router.get('/submission/:submissionId/grading', getSubmissionForGrading);

// Chấm điểm
router.post('/submission/:submissionId/grade', gradeSubmission);


// Cập nhật bài tập
router.put('/:id', updateAssignment);

// Xóa bài tập
router.delete('/:id', deleteAssignment);

// --- HỌC SINH ---
router.get('/student', getStudentAssignments);
router.get('/:id/details', getAssignmentDetails);
router.post('/:id/submit', submitAssignment);
router.post('/:id/draft', saveDraft);
router.get('/:id/teacher-detail', getTeacherAssignmentById);
export default router;