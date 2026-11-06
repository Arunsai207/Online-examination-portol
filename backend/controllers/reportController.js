// ============================================================
// Report Controller — PDF and Excel exports
// ============================================================
const Result = require('../models/Result');
const Answer = require('../models/Answer');
const Student = require('../models/Student');
const Exam = require('../models/Exam');
const pdfService = require('../services/pdfService');
const excelService = require('../services/excelService');

const reportController = {
    // Download result PDF for a specific attempt
    downloadResultPDF: async (req, res, next) => {
        try {
            const result = await Result.findByAttemptId(req.params.attemptId);
            if (!result) {
                return res.status(404).json({ success: false, message: 'Result not found' });
            }

            // Get student info
            const student = await Student.findById(result.student_id);
            const exam = await Exam.findById(result.exam_id);

            const resultData = {
                ...result,
                student_name: student.name,
                student_email: student.email,
                exam_date: exam.exam_date
            };

            pdfService.generateResultPDF(resultData, res);
        } catch (error) {
            next(error);
        }
    },

    // Export all results to Excel
    exportResultsExcel: async (req, res, next) => {
        try {
            const { search } = req.query;
            const results = await Result.findAll(search, 1, 10000); // Get all results
            await excelService.generateResultsExcel(results.results, res);
        } catch (error) {
            next(error);
        }
    },

    // Download student's own result PDF
    downloadMyResultPDF: async (req, res, next) => {
        try {
            const result = await Result.findByStudentAndExam(req.user.id, req.params.examId);
            if (!result) {
                return res.status(404).json({ success: false, message: 'Result not found' });
            }

            const student = await Student.findById(req.user.id);
            const exam = await Exam.findById(req.params.examId);

            const resultData = {
                ...result,
                student_name: student.name,
                student_email: student.email,
                exam_date: exam.exam_date
            };

            pdfService.generateResultPDF(resultData, res);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = reportController;
