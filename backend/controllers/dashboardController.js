// ============================================================
// Dashboard Controller — Admin analytics
// ============================================================
const Student = require('../models/Student');
const Exam = require('../models/Exam');
const Subject = require('../models/Subject');
const ExamAttempt = require('../models/ExamAttempt');
const Result = require('../models/Result');

const dashboardController = {
    // Get admin dashboard stats
    getAdminStats: async (req, res, next) => {
        try {
            const [totalStudents, totalExams, totalSubjects, totalAttempts, passFailStats, subjectPerformance, monthlyStats] = await Promise.all([
                Student.getCount(),
                Exam.getCount(),
                Subject.getCount(),
                ExamAttempt.getCount(),
                Result.getPassFailStats(),
                Result.getSubjectPerformance(),
                Result.getMonthlyStats()
            ]);

            const passPercentage = passFailStats.total > 0 
                ? ((passFailStats.passed / passFailStats.total) * 100).toFixed(1) 
                : 0;
            const failPercentage = passFailStats.total > 0 
                ? ((passFailStats.failed / passFailStats.total) * 100).toFixed(1) 
                : 0;

            res.json({
                success: true,
                data: {
                    totalStudents,
                    totalExams,
                    totalSubjects,
                    totalAttempts,
                    passPercentage: parseFloat(passPercentage),
                    failPercentage: parseFloat(failPercentage),
                    subjectPerformance,
                    monthlyStats
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // Get student dashboard stats
    getStudentStats: async (req, res, next) => {
        try {
            const studentId = req.user.id;
            const [results, availableExams] = await Promise.all([
                Result.findByStudentId(studentId),
                Exam.getAvailable(studentId)
            ]);

            const totalExamsTaken = results.length;
            const totalPassed = results.filter(r => r.status === 'pass').length;
            const avgPercentage = totalExamsTaken > 0 
                ? (results.reduce((sum, r) => sum + parseFloat(r.percentage), 0) / totalExamsTaken).toFixed(1)
                : 0;

            res.json({
                success: true,
                data: {
                    totalExamsTaken,
                    totalPassed,
                    totalFailed: totalExamsTaken - totalPassed,
                    avgPercentage: parseFloat(avgPercentage),
                    availableExams: availableExams.length,
                    recentResults: results.slice(0, 5)
                }
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = dashboardController;
