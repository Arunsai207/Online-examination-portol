// ============================================================
// Result Controller — Results, analytics, leaderboard
// ============================================================
const Result = require('../models/Result');
const Answer = require('../models/Answer');
const { getPagination } = require('../utils/helpers');

const resultController = {
    // Get all results (admin)
    getAll: async (req, res, next) => {
        try {
            const { search } = req.query;
            const { page, limit } = getPagination(req.query.page, req.query.limit);
            const results = await Result.findAll(search, page, limit);
            res.json({ success: true, data: results });
        } catch (error) {
            next(error);
        }
    },

    // Get results by student ID
    getByStudentId: async (req, res, next) => {
        try {
            const studentId = req.params.studentId || req.user.id;
            const results = await Result.findByStudentId(studentId);
            res.json({ success: true, data: results });
        } catch (error) {
            next(error);
        }
    },

    // Get result details (with answers breakdown)
    getDetails: async (req, res, next) => {
        try {
            const result = await Result.findByAttemptId(req.params.attemptId);
            if (!result) {
                return res.status(404).json({ success: false, message: 'Result not found' });
            }

            // Get detailed answers
            const answers = await Answer.findByAttemptId(req.params.attemptId);

            // Get proctoring logs
            const ProctoringLog = require('../models/ProctoringLog');
            const proctoringLogs = await ProctoringLog.findByAttemptId(req.params.attemptId);

            res.json({
                success: true,
                data: {
                    result,
                    answers,
                    proctoringLogs
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // Get pass/fail statistics
    getStats: async (req, res, next) => {
        try {
            const stats = await Result.getPassFailStats();
            res.json({ success: true, data: stats });
        } catch (error) {
            next(error);
        }
    },

    // Get subject-wise performance
    getSubjectPerformance: async (req, res, next) => {
        try {
            const performance = await Result.getSubjectPerformance();
            res.json({ success: true, data: performance });
        } catch (error) {
            next(error);
        }
    },

    // Get monthly statistics
    getMonthlyStats: async (req, res, next) => {
        try {
            const stats = await Result.getMonthlyStats();
            res.json({ success: true, data: stats });
        } catch (error) {
            next(error);
        }
    },

    // Get the global leaderboard (admin only; enforced by the route).
    getLeaderboard: async (req, res, next) => {
        try {
            const { examId, search } = req.query;
            let normalizedExamId = null;
            if (examId !== undefined && examId !== '') {
                normalizedExamId = Number(examId);
                if (!Number.isInteger(normalizedExamId) || normalizedExamId < 1) {
                    return res.status(400).json({ success: false, message: 'examId must be a positive integer' });
                }
            }
            const { page, limit } = getPagination(req.query.page, req.query.limit);
            const leaderboard = await Result.getLeaderboard(normalizedExamId, page, limit, search || '');
            res.json({ success: true, data: leaderboard });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = resultController;
