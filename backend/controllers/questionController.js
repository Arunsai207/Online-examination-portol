// ============================================================
// Question Controller — CRUD operations
// ============================================================
const Question = require('../models/Question');

const questionController = {
    // Get questions by exam ID
    getByExamId: async (req, res, next) => {
        try {
            const questions = await Question.findByExamId(req.params.examId);
            res.json({ success: true, data: questions });
        } catch (error) {
            next(error);
        }
    },

    // Get question by ID
    getById: async (req, res, next) => {
        try {
            const question = await Question.findById(req.params.id);
            if (!question) {
                return res.status(404).json({ success: false, message: 'Question not found' });
            }
            res.json({ success: true, data: question });
        } catch (error) {
            next(error);
        }
    },

    // Create question
    create: async (req, res, next) => {
        try {
            const question = await Question.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Question created successfully',
                data: question
            });
        } catch (error) {
            next(error);
        }
    },

    // Bulk create questions
    bulkCreate: async (req, res, next) => {
        try {
            const { exam_id, questions } = req.body;
            await Question.bulkCreate(exam_id, questions);
            res.status(201).json({
                success: true,
                message: `${questions.length} questions added successfully`
            });
        } catch (error) {
            next(error);
        }
    },

    // Update question
    update: async (req, res, next) => {
        try {
            const question = await Question.findById(req.params.id);
            if (!question) {
                return res.status(404).json({ success: false, message: 'Question not found' });
            }

            await Question.update(req.params.id, req.body);
            res.json({ success: true, message: 'Question updated successfully' });
        } catch (error) {
            next(error);
        }
    },

    // Delete question
    delete: async (req, res, next) => {
        try {
            const question = await Question.findById(req.params.id);
            if (!question) {
                return res.status(404).json({ success: false, message: 'Question not found' });
            }

            await Question.delete(req.params.id);
            res.json({ success: true, message: 'Question deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = questionController;
