// ============================================================
// Subject Routes
// ============================================================
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const subjectController = require('../controllers/subjectController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const validate = require('../middleware/validate');

// GET /api/subjects — Get all subjects (authenticated)
router.get('/', auth, subjectController.getAll);

// GET /api/subjects/:id — Get subject by ID
router.get('/:id', auth, subjectController.getById);

// POST /api/subjects — Create subject (admin only)
router.post('/', auth, roleCheck('admin'), [
    body('subject_name').trim().notEmpty().withMessage('Subject name is required')
], validate, subjectController.create);

// PUT /api/subjects/:id — Update subject (admin only)
router.put('/:id', auth, roleCheck('admin'), [
    body('subject_name').trim().notEmpty().withMessage('Subject name is required')
], validate, subjectController.update);

// DELETE /api/subjects/:id — Delete subject (admin only)
router.delete('/:id', auth, roleCheck('admin'), subjectController.delete);

module.exports = router;
