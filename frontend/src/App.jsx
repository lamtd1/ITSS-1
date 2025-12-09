import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from './components/layouts/MainLayout.jsx';

// Auth Page
import LoginPage from './features/auth/LoginPage.jsx';

// Admin Pages
import AdminDashboard from './features/admin/AdminDashboard.jsx';
import AdminSlideUpload from './features/admin/AdminSlideUpload.jsx';
import AdminStudentManage from './features/admin/AdminStudentManage.jsx';
import AdminAssignmentCreate from './features/admin/AdminAssignmentCreate.jsx';

// Student Pages
import StudentDashboard from './features/student/StudentDashboard.jsx';
import StudentDictionary from './features/student/StudentDictionary.jsx';
import StudentSlideView from './features/student/StudentSlideView.jsx';
import StudentAssignmentList from './features/student/StudentAssignmentList.jsx';
import StudentFlashcardCreate from './features/student/StudentFlashcardCreate.jsx';
import StudentFlashcardLearn from './features/student/StudentFlashcardLearn.jsx';

const App = () => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('kakehashi_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('kakehashi_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('kakehashi_user');
  };

  const ProtectedRoute = ({ children, role }) => {
    if (!user) return <Navigate to="/login" replace />;
    if (role && user.role !== role) {
      return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <LoginPage onLogin={handleLogin} /> : <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><MainLayout user={user} onLogout={handleLogout} /></ProtectedRoute>}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="slides" element={<AdminSlideUpload />} />
          <Route path="assignments" element={<AdminAssignmentCreate />} />
          <Route path="students" element={<AdminStudentManage />} />
        </Route>

        {/* Student Routes */}
        <Route path="/student" element={<ProtectedRoute role="student"><MainLayout user={user} onLogout={handleLogout} /></ProtectedRoute>}>
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="dictionary" element={<StudentDictionary />} />
          <Route path="slides" element={<StudentSlideView />} />
          <Route path="assignments" element={<StudentAssignmentList />} />
          <Route path="flashcards" element={<StudentFlashcardCreate />} />
          <Route path="flashcards/learn/:setId" element={<StudentFlashcardLearn />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;