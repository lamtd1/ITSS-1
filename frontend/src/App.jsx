import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from './components/layouts/MainLayout.jsx';

// Auth Page
import LoginPage from './features/auth/LoginPage.jsx';
import RegisterPage from './features/auth/RegisterPage.jsx';

// Admin Pages
import AdminDashboard from './features/admin/AdminDashboard.jsx';
import AdminSlideUpload from './features/admin/AdminSlideUpload.jsx';
import AdminStudentManage from './features/admin/AdminStudentManage.jsx';
import AdminAssignmentList from './features/admin/AdminAssignmentList.jsx'; // Mới
import AdminAssignmentCreate from './features/admin/AdminAssignmentCreate.jsx';
import AdminStudentDetail from './features/admin/AdminStudentDetail.jsx';
import AdminGrading from './features/admin/AdminGrading.jsx';

// Student Pages
import StudentDashboard from './features/student/StudentDashboard.jsx';
import StudentDictionary from './features/student/StudentDictionary.jsx';
import StudentSlideView from './features/student/StudentSlideView.jsx';
import StudentAssignmentList from './features/student/StudentAssignmentList.jsx';
import StudentFlashcardCreate from './features/student/StudentFlashcardCreate.jsx';
import StudentFlashcardLearn from './features/student/StudentFlashcardLearn.jsx';
import StudentAssignmentDetail from './features/student/StudentAssignmentDetail.jsx';

const App = () => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('kakehashi_user');
    if (!saved || saved === "undefined") return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('kakehashi_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('kakehashi_user');
  };

  const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    if (!user) return <Navigate to="/login" replace />;

    // Chuẩn hóa role của user về chữ thường để so sánh chính xác
    const userRole = (user.role || '').toLowerCase();

    // Đảm bảo allowedRoles luôn là mảng và chuẩn hóa về chữ thường
    const validRoles = (Array.isArray(allowedRoles) ? allowedRoles : []).map(r => r.toLowerCase());

    // Nếu role của user KHÔNG nằm trong danh sách được phép
    if (validRoles.length > 0 && !validRoles.includes(userRole)) {
      // Điều hướng user về trang dashboard tương ứng với quyền thật của họ
      if (userRole === 'admin' || userRole === 'teacher') {
        return <Navigate to="/admin/dashboard" replace />;
      } else {
        return <Navigate to="/student/dashboard" replace />;
      }
    }

    return children;
  };

  const getHomeRoute = () => {
    if (!user) return '/login';
    const role = (user.role || '').toLowerCase();
    if (role === 'admin' || role === 'teacher') return '/admin/dashboard';
    return '/student/dashboard';
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <LoginPage onLogin={handleLogin} /> : <Navigate to={getHomeRoute()} />} />
        <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to={getHomeRoute()} replace />} />
        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin', 'teacher']}>
              <MainLayout user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="slides" element={<AdminSlideUpload />} />
          <Route path="assignments" element={<AdminAssignmentList />} /> {/* Danh sách */}
          <Route path="assignments/create" element={<AdminAssignmentCreate />} />
          <Route path="/admin/assignments/edit/:id" element={<AdminAssignmentCreate />} />
          <Route path="students" element={<AdminStudentManage />} />
          <Route path="students/:id" element={<AdminStudentDetail />} />
          <Route path="grading/:submissionId" element={<AdminGrading />} />
        </Route>

        {/* Student Routes */}
        <Route path="/student" element={<ProtectedRoute role="student"><MainLayout user={user} onLogout={handleLogout} /></ProtectedRoute>}>
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="dictionary" element={<StudentDictionary />} />
          <Route path="slides" element={<StudentSlideView />} />
          <Route path="assignments" element={<StudentAssignmentList />} />
          <Route path="assignments/:id" element={<StudentAssignmentDetail />} />
          <Route path="flashcards" element={<StudentFlashcardCreate />} />
          <Route path="flashcards/learn/:setId" element={<StudentFlashcardLearn />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;