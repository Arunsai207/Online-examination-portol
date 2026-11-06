// ============================================================
// Student Routes
// ============================================================
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const studentController = require('../controllers/studentController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const validate = require('../middleware/validate');

// Admin routes — manage students
router.get('/', auth, roleCheck('admin'), studentController.getAll);
router.get('/:id', auth, roleCheck('admin'), studentController.getById);

router.post('/', auth, roleCheck('admin'), [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validate, studentController.create);

router.put('/:id', auth, roleCheck('admin'), [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required')
], validate, studentController.update);

router.delete('/:id', auth, roleCheck('admin'), studentController.delete);

// Student self-service routes
router.put('/profile/update', auth, roleCheck('student'), studentController.updateProfile);
router.put('/profile/password', auth, roleCheck('student'), [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], validate, studentController.changePassword);

router.put('/profile/face', auth, roleCheck('student'), studentController.updateFaceDescriptor);

module.exports = router;
