// ============================================================
// Report Routes — PDF and Excel exports
// ============================================================
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Admin: Download result PDF by attempt ID
router.get('/pdf/:attemptId', auth, roleCheck('admin'), reportController.downloadResultPDF);

// Admin: Export all results to Excel
router.get('/excel', auth, roleCheck('admin'), reportController.exportResultsExcel);

// Student: Download own result PDF
router.get('/my-pdf/:examId', auth, roleCheck('student'), reportController.downloadMyResultPDF);

module.exports = router;
