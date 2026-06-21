import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'

// Routes guards
import ProtectedRoute from './routes/ProtectedRoute'
import AdminRoute from './routes/AdminRoute'

// Layouts
import AuthLayout from './layouts/AuthLayout'
import DashboardLayout from './layouts/DashboardLayout'
import AdminLayout from './layouts/AdminLayout'

// Auth pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// User dashboard pages
import HomePage from './pages/dashboard/HomePage'
import ReviewCVPage from './pages/dashboard/ReviewCVPage'
import InterviewPage from './pages/dashboard/InterviewPage'
import FeedbackPage from './pages/dashboard/FeedbackPage'
import SettingsPage from './pages/dashboard/SettingsPage'

// Landing pages
import LandingPage from './pages/landing/LandingPage'
import CVReviewLandingPage from './pages/landing/CVReviewLandingPage'
import InterviewLandingPage from './pages/landing/InterviewLandingPage'

// Admin pages
import DashboardAdmin from './pages/admin/DashboardAdmin'
import UserManagement from './pages/admin/UserManagement'
import ActivityLogs from './pages/admin/ActivityLogs'
import FeedbackManagement from './pages/admin/FeedbackManagement'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Routes>

            {/* ─── Landing pages – public ─── */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/cv-review" element={<CVReviewLandingPage />} />
            <Route path="/interview" element={<InterviewLandingPage />} />

            {/* ─── Auth routes ─── */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* ─── User Dashboard routes – protected (role: user & admin) ─── */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<HomePage />} />
              <Route path="review-cv" element={<ReviewCVPage />} />
              <Route path="interview" element={<InterviewPage />} />
              <Route path="feedback" element={<FeedbackPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* ─── Admin routes – protected (role: admin only) ─── */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardAdmin />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="activity-logs" element={<ActivityLogs />} />
              <Route path="feedbacks" element={<FeedbackManagement />} />
            </Route>

            {/* ─── Fallback ─── */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
