import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import ProtectedRoute from './routes/ProtectedRoute'
import AuthLayout from './layouts/AuthLayout'
import DashboardLayout from './layouts/DashboardLayout'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import HomePage from './pages/dashboard/HomePage'
import ReviewCVPage from './pages/dashboard/ReviewCVPage'
import InterviewPage from './pages/dashboard/InterviewPage'
import FeedbackPage from './pages/dashboard/FeedbackPage'
import SettingsPage from './pages/dashboard/SettingsPage'

import LandingPage from './pages/landing/LandingPage'
import CVReviewLandingPage from './pages/landing/CVReviewLandingPage'
import InterviewLandingPage from './pages/landing/InterviewLandingPage'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Routes>

            {/* Landing pages – public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/cv-review" element={<CVReviewLandingPage />} />
            <Route path="/interview" element={<InterviewLandingPage />} />

            {/* Auth routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Dashboard routes – protected */}
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

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}