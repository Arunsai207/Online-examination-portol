// ============================================================
// ProctoringLog Model — SQL queries for tracking AI proctor violations
// ============================================================
const { pool } = require('../config/db');

const ProctoringLog = {
    // Record a violation
    create: async (attemptId, violationType, description = '') => {
        const [result] = await pool.execute(
            'INSERT INTO proctoring_logs (attempt_id, violation_type, description) VALUES (?, ?, ?)',
            [attemptId, violationType, description]
        );
        return { id: result.insertId, attempt_id: attemptId, violation_type: violationType, description };
    },

    // Get all logs for an attempt
    findByAttemptId: async (attemptId) => {
        const [rows] = await pool.execute(
            'SELECT * FROM proctoring_logs WHERE attempt_id = ? ORDER BY timestamp ASC',
            [attemptId]
        );
        return rows;
    }
};

module.exports = ProctoringLog;
