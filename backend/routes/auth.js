// ============================================================
// Auth Routes
// ============================================================
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

// POST /api/auth/register — Student registration
router.post('/register', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').optional().trim(),
    body('course').optional().trim()
], validate, authController.register);

// POST /api/auth/login — Login (admin & student)
router.post('/login', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    body('role').isIn(['admin', 'student']).withMessage('Role must be admin or student')
], validate, authController.login);

// POST /api/auth/forgot-password
router.post('/forgot-password', [
    body('email').isEmail().withMessage('Valid email is required')
], validate, authController.forgotPassword);

// POST /api/auth/reset-password
router.post('/reset-password', [
    body('token').notEmpty().withMessage('Token is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validate, authController.resetPassword);

// GET /api/auth/me — Get current user
router.get('/me', auth, authController.getMe);

module.exports = router;
