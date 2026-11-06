// ============================================================
// Dashboard Routes
// ============================================================
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// GET /api/dashboard/admin — Admin dashboard stats
router.get('/admin', auth, roleCheck('admin'), dashboardController.getAdminStats);

// GET /api/dashboard/student — Student dashboard stats
router.get('/student', auth, roleCheck('student'), dashboardController.getStudentStats);

module.exports = router;
