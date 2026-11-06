// ============================================================
// Question Routes
// ============================================================
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const questionController = require('../controllers/questionController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const validate = require('../middleware/validate');

// GET /api/questions/:examId — Get questions by exam ID (admin)
router.get('/:examId', auth, roleCheck('admin'), questionController.getByExamId);

// POST /api/questions — Create single question
router.post('/', auth, roleCheck('admin'), [
    body('exam_id').isInt().withMessage('Exam ID is required'),
    body('question').trim().notEmpty().withMessage('Question text is required'),
    body('option_a').trim().notEmpty().withMessage('Option A is required'),
    body('option_b').trim().notEmpty().withMessage('Option B is required'),
    body('option_c').trim().notEmpty().withMessage('Option C is required'),
    body('option_d').trim().notEmpty().withMessage('Option D is required'),
    body('correct_answer').isIn(['A', 'B', 'C', 'D']).withMessage('Correct answer must be A, B, C, or D')
], validate, questionController.create);

// POST /api/questions/bulk — Bulk create questions
router.post('/bulk', auth, roleCheck('admin'), [
    body('exam_id').isInt().withMessage('Exam ID is required'),
    body('questions').isArray({ min: 1 }).withMessage('At least one question is required')
], validate, questionController.bulkCreate);

// PUT /api/questions/:id — Update question
router.put('/:id', auth, roleCheck('admin'), [
    body('question').trim().notEmpty().withMessage('Question text is required'),
    body('option_a').trim().notEmpty().withMessage('Option A is required'),
    body('option_b').trim().notEmpty().withMessage('Option B is required'),
    body('option_c').trim().notEmpty().withMessage('Option C is required'),
    body('option_d').trim().notEmpty().withMessage('Option D is required'),
    body('correct_answer').isIn(['A', 'B', 'C', 'D']).withMessage('Correct answer must be A, B, C, or D')
], validate, questionController.update);

// DELETE /api/questions/:id — Delete question
router.delete('/:id', auth, roleCheck('admin'), questionController.delete);

module.exports = router;
