import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentCourses from './pages/student/StudentCourses';
import QuizValidation from './pages/QuizValidation';
import CodeChallenge from './pages/student/CodeChallenge';
import ChatbotPage from './pages/student/ChatbotPage';
import Opportunites from './pages/student/Opportunites';
import Flashcards from './pages/student/Flashcards';
import QuizTaker from './pages/student/QuizTaker';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ padding: '20px' }}>Chargement...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const RoleBasedRedirect = () => {
  const { user, loading } = useAuth();
  
  if (loading) return <div style={{ padding: '20px' }}>Chargement...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  if (user.role === 'admin' || user.role === 'teacher') {
    return <Navigate to="/admin" replace />;
  }
  return <Navigate to="/student" replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      
      {/* Role-based redirection from root */}
      <Route path="/" element={<RoleBasedRedirect />} />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin', 'teacher']}>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="validation" element={<QuizValidation />} />
      </Route>

      {/* Student Routes */}
      <Route path="/student" element={
        <ProtectedRoute allowedRoles={['student']}>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<StudentDashboard />} />
        <Route path="courses" element={<StudentCourses />} />
        <Route path="playground" element={<CodeChallenge />} />
        <Route path="chat" element={<ChatbotPage />} />
        <Route path="opportunites" element={<Opportunites />} />
        <Route path="flashcards" element={<Flashcards />} />
        <Route path="quiz/:bankId" element={<QuizTaker />} />
      </Route>

    </Routes>
  );
}

export default App;
