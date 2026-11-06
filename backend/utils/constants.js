// ============================================================
// Constants
// ============================================================

module.exports = {
    ROLES: {
        ADMIN: 'admin',
        STUDENT: 'student'
    },
    EXAM_STATUS: {
        UPCOMING: 'upcoming',
        ACTIVE: 'active',
        COMPLETED: 'completed'
    },
    ATTEMPT_STATUS: {
        IN_PROGRESS: 'in_progress',
        COMPLETED: 'completed',
        TIMED_OUT: 'timed_out'
    },
    RESULT_STATUS: {
        PASS: 'pass',
        FAIL: 'fail'
    },
    GRADE_THRESHOLDS: {
        'A+': { min: 90, max: 100 },
        'A': { min: 80, max: 89 },
        'B': { min: 70, max: 79 },
        'C': { min: 60, max: 69 },
        'F': { min: 0, max: 59 }
    },
    PASS_PERCENTAGE: 60,
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 10,
        MAX_LIMIT: 100
    }
};
