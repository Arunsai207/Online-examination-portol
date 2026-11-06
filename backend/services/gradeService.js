// ============================================================
// Grade Calculation Service
// ============================================================

const GRADE_THRESHOLDS = [
    { min: 90, max: 100, grade: 'A+' },
    { min: 80, max: 89, grade: 'A' },
    { min: 70, max: 79, grade: 'B' },
    { min: 60, max: 69, grade: 'C' },
    { min: 0, max: 59, grade: 'F' }
];

const PASS_THRESHOLD = 60;

const gradeService = {
    // Calculate grade from percentage
    calculateGrade: (percentage) => {
        for (const threshold of GRADE_THRESHOLDS) {
            if (percentage >= threshold.min && percentage <= threshold.max) {
                return threshold.grade;
            }
        }
        return 'F';
    },

    // Determine pass/fail status
    getStatus: (percentage) => {
        return percentage >= PASS_THRESHOLD ? 'pass' : 'fail';
    },

    // Calculate percentage
    calculatePercentage: (score, totalMarks) => {
        if (totalMarks === 0) return 0;
        return parseFloat(((score / totalMarks) * 100).toFixed(2));
    },

    // Get grade thresholds (for frontend display)
    getThresholds: () => GRADE_THRESHOLDS
};

module.exports = gradeService;
