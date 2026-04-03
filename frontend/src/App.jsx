import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './services/AuthContext';
import NavBar from './components/Layout/NavBar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfileFormPage from './pages/ProfileFormPage';
import ClassRecommendationsPage from './pages/ClassRecommendationsPage';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

import DashboardTeacher from './pages/DashboardTeacher';
import DashboardAdmin from './pages/DashboardAdmin';
import StudentsPage from './pages/StudentsPage';
import TeachersPage from './pages/TeachersPage';
import ClassesPage from './pages/ClassesPage';
import LessonsPage from './pages/LessonsPage';
import ExamsPage from './pages/ExamsPage';
import PaymentsPage from './pages/PaymentsPage';
import PaymentOfficerPage from './pages/PaymentOfficerPage';
import FeedbackPage from './pages/FeedbackPage';
import ModulesPage from './pages/ModulesPage';

const normalizeRole = (role) => String(role || '').toUpperCase().replace(/^ROLE_/, '');

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  const userRole = normalizeRole(user.role);
  const allowedRoles = roles ? roles.map(normalizeRole) : null;
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  const { user } = useAuth();
  const userRole = normalizeRole(user?.role);

  return (
    <div 
      className="min-h-screen font-sans text-slate-900"
      style={{
        backgroundImage: 'url(/nenasa.png)',
        backgroundColor: '#4e5d6d',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recommendations"
            element={
              <ProtectedRoute roles={['STUDENT', 'ADMIN']}>
                <ClassRecommendationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                {userRole === 'TEACHER' ? <Navigate to="/teacher" replace /> :
                 userRole === 'ADMIN' ? <Navigate to="/admin" replace /> :
                 <Navigate to="/recommendations" replace />}
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher"
            element={
              <ProtectedRoute roles={['TEACHER', 'ADMIN']}>
                <DashboardTeacher />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <DashboardAdmin />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/students"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <StudentsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/teachers"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <TeachersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/classes"
            element={
              <ProtectedRoute>
                <ClassesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/lessons"
            element={
              <ProtectedRoute>
                <LessonsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/exams"
            element={
              <ProtectedRoute>
                <ExamsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payments"
            element={
              <ProtectedRoute roles={['STUDENT','ADMIN']}>
                <PaymentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment-officer"
            element={
              <ProtectedRoute roles={['PAYMENT_OFFICER', 'ADMIN']}>
                <PaymentOfficerPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute roles={['TEACHER', 'ADMIN', 'STUDENT']}>
                <AnalyticsDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedback"
            element={
              <ProtectedRoute roles={['STUDENT', 'ADMIN', 'TEACHER']}>
                <FeedbackPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/modules"
            element={
              <ProtectedRoute roles={['ADMIN', 'TEACHER']}>
                <ModulesPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}
