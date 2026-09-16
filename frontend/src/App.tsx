import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { LearningAIPage } from './pages/LearningAIPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { NotesPage } from './pages/NotesPage';
import { TasksPage } from './pages/TasksPage';
import { CalendarPage } from './pages/CalendarPage';
import { MemoryPage } from './pages/MemoryPage';
import { EvaluationPage } from './pages/EvaluationPage';
import { ProgressPage } from './pages/ProgressPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { TimerPage } from './pages/TimerPage';
import { ClassroomPage } from './pages/ClassroomPage';
import { SuperAdminPage } from './pages/SuperAdminPage';
import { InstitutionPortalPage } from './pages/InstitutionPortalPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleProtectedRoute } from './components/RoleProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Super Admin Control Portal */}
        <Route
          path="/admin"
          element={
            <RoleProtectedRoute allowedRoles={['super_admin', 'admin']}>
              <SuperAdminPage />
            </RoleProtectedRoute>
          }
        />

        {/* Institution Admin Portal */}
        <Route
          path="/institution-portal"
          element={
            <RoleProtectedRoute allowedRoles={['institution_admin']}>
              <InstitutionPortalPage />
            </RoleProtectedRoute>
          }
        />

        {/* Authenticated Application Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/classroom"
          element={
            <RoleProtectedRoute allowedRoles={['super_admin', 'admin', 'institution_admin', 'institution_student']} strict={true}>
              <ClassroomPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/classroom/:id"
          element={
            <RoleProtectedRoute allowedRoles={['super_admin', 'admin', 'institution_admin', 'institution_student']} strict={true}>
              <ClassroomPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/learning-ai"
          element={
            <ProtectedRoute>
              <LearningAIPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <DocumentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <NotesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TasksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/memory"
          element={
            <ProtectedRoute>
              <MemoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/timer"
          element={
            <ProtectedRoute>
              <TimerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/evaluation"
          element={
            <ProtectedRoute>
              <EvaluationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessments"
          element={
            <ProtectedRoute>
              <EvaluationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              <ProgressPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
