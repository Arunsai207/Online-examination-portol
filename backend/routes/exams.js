// ============================================================
// Exam Routes
// ============================================================
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const examController = require('../controllers/examController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const validate = require('../middleware/validate');

// Student routes
router.get('/available', auth, roleCheck('student'), examController.getAvailable);
router.post('/:id/start', auth, roleCheck('student'), examController.startExam);
router.post('/:attemptId/submit', auth, roleCheck('student'), examController.submitExam);
router.post('/:attemptId/adaptive-submit', auth, roleCheck('student'), examController.submitAdaptiveAnswer);
router.post('/:attemptId/violation', auth, roleCheck('student'), examController.recordViolation);

// Admin routes
router.get('/', auth, roleCheck('admin'), examController.getAll);
router.get('/:id', auth, examController.getById);

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// PDF Parse (returns preview JSON, no DB save)
router.post('/parse-pdf', auth, roleCheck('admin'), upload.single('pdf'), examController.parsePdf);

// Create from reviewed JSON (after admin preview)
router.post('/create-from-json', auth, roleCheck('admin'), [
    body('exam_name').trim().notEmpty().withMessage('Exam name is required'),
    body('subject_id').isInt().withMessage('Subject ID is required'),
    body('duration').isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),
    body('exam_date').isDate().withMessage('Valid exam date is required'),
    body('questions').isArray({ min: 1 }).withMessage('At least one question is required')
], validate, examController.createFromJson);

// Create exam using a requested number of randomly selected question-bank entries.
router.post('/create-from-question-bank', auth, roleCheck('admin'), [
    body('exam_name').trim().notEmpty().withMessage('Exam name is required'),
    body('subject_id').isInt({ min: 1 }).withMessage('Valid subject is required'),
    body('question_count').isInt({ min: 1, max: 400 }).withMessage('Question count must be between 1 and 400'),
    body('duration').isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),
    body('total_marks').isInt({ min: 1 }).withMessage('Total marks must be at least 1'),
    body('exam_date').isDate().withMessage('Valid exam date is required')
], validate, examController.createFromQuestionBank);

router.post('/', auth, roleCheck('admin'), [
    body('exam_name').trim().notEmpty().withMessage('Exam name is required'),
    body('subject_id').isInt().withMessage('Subject ID is required'),
    body('duration').isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),
    body('total_marks').isInt({ min: 1 }).withMessage('Total marks must be at least 1'),
    body('exam_date').isDate().withMessage('Valid exam date is required')
], validate, examController.create);

router.put('/:id', auth, roleCheck('admin'), [
    body('exam_name').trim().notEmpty().withMessage('Exam name is required'),
    body('subject_id').isInt().withMessage('Subject ID is required'),
    body('duration').isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),
    body('total_marks').isInt({ min: 1 }).withMessage('Total marks must be at least 1')
], validate, examController.update);

router.delete('/:id', auth, roleCheck('admin'), examController.delete);

module.exports = router;
