// ============================================================
// Result Routes
// ============================================================
const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Admin routes
router.get('/', auth, roleCheck('admin'), resultController.getAll);
router.get('/stats', auth, roleCheck('admin'), resultController.getStats);
router.get('/subject-performance', auth, resultController.getSubjectPerformance);
router.get('/monthly-stats', auth, roleCheck('admin'), resultController.getMonthlyStats);
router.get('/leaderboard', auth, roleCheck('admin'), resultController.getLeaderboard);
router.get('/details/:attemptId', auth, resultController.getDetails);

// Student routes
router.get('/my-results', auth, roleCheck('student'), resultController.getByStudentId);
router.get('/student/:studentId', auth, roleCheck('admin'), resultController.getByStudentId);

module.exports = router;
