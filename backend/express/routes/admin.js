const express = require('express');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const {
  getStatistics,
  getUsers,
  updateUserStatus,
  updateUserRole,
  getActivityLogs,
  getFeedbacks,
  updateFeedbackStatus,
} = require('../controllers/adminController');

const router = express.Router();

// Semua route admin wajib: authenticate + authorizeAdmin
router.use(authenticate, authorizeAdmin);

// ─────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────
// GET /api/admin/statistics
router.get('/statistics', getStatistics);

// ─────────────────────────────────────────────────────────────
// User Management
// ─────────────────────────────────────────────────────────────
// GET  /api/admin/users?search=&role=&page=&limit=
router.get('/users', getUsers);

// PATCH /api/admin/users/:id/status   body: { status: 'active' | 'suspended' }
router.patch('/users/:id/status', updateUserStatus);

// PATCH /api/admin/users/:id/role     body: { role: 'user' | 'admin' }
router.patch('/users/:id/role', updateUserRole);

// ─────────────────────────────────────────────────────────────
// Activity Monitoring
// ─────────────────────────────────────────────────────────────
// GET /api/admin/activity-logs?search=&period=today|7days|30days&page=&limit=
router.get('/activity-logs', getActivityLogs);

// ─────────────────────────────────────────────────────────────
// Feedback Management
// ─────────────────────────────────────────────────────────────
// GET   /api/admin/feedbacks?status=&page=&limit=
router.get('/feedbacks', getFeedbacks);

// PATCH /api/admin/feedbacks/:id/status   body: { status: 'pending' | 'read' | 'resolved' }
router.patch('/feedbacks/:id/status', updateFeedbackStatus);

module.exports = router;
