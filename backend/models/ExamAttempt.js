// ============================================================
// ExamAttempt Model — SQL queries for exam attempt tracking
// ============================================================
const { pool } = require('../config/db');

const ExamAttempt = {
    // Create a new attempt
    create: async (studentId, examId) => {
        const [result] = await pool.execute(
            'INSERT INTO exam_attempts (student_id, exam_id, status) VALUES (?, ?, ?)',
            [studentId, examId, 'in_progress']
        );
        return { id: result.insertId, student_id: studentId, exam_id: examId, status: 'in_progress' };
    },

    // Find attempt by ID
    findById: async (id) => {
        const [rows] = await pool.execute(
            'SELECT * FROM exam_attempts WHERE id = ?',
            [id]
        );
        return rows[0];
    },

    // Check if student has already completed this exam
    hasCompleted: async (studentId, examId) => {
        const [rows] = await pool.execute(
            `SELECT COUNT(*) as count FROM exam_attempts 
             WHERE student_id = ? AND exam_id = ? AND status IN ('completed', 'timed_out')`,
            [studentId, examId]
        );
        return rows[0].count > 0;
    },

    // Check if student has an in-progress attempt
    getInProgress: async (studentId, examId) => {
        const [rows] = await pool.execute(
            `SELECT * FROM exam_attempts 
             WHERE student_id = ? AND exam_id = ? AND status = 'in_progress'
             ORDER BY start_time DESC LIMIT 1`,
            [studentId, examId]
        );
        return rows[0];
    },

    // Complete an attempt
    complete: async (id) => {
        const [result] = await pool.execute(
            `UPDATE exam_attempts SET status = 'completed', end_time = NOW() WHERE id = ?`,
            [id]
        );
        return result;
    },

    // Time out an attempt
    timeout: async (id) => {
        const [result] = await pool.execute(
            `UPDATE exam_attempts SET status = 'timed_out', end_time = NOW() WHERE id = ?`,
            [id]
        );
        return result;
    },

    // Get attempts by student
    getByStudent: async (studentId) => {
        const [rows] = await pool.execute(
            `SELECT ea.*, e.exam_name, s.subject_name 
             FROM exam_attempts ea
             JOIN exams e ON ea.exam_id = e.id
             JOIN subjects s ON e.subject_id = s.id
             WHERE ea.student_id = ?
             ORDER BY ea.start_time DESC`,
            [studentId]
        );
        return rows;
    },

    // Get all attempts (admin view)
    findAll: async (page = 1, limit = 10) => {
        const offset = (page - 1) * limit;
        const [rows] = await pool.execute(
            `SELECT ea.*, st.name as student_name, st.email as student_email,
             e.exam_name, s.subject_name
             FROM exam_attempts ea
             JOIN students st ON ea.student_id = st.id
             JOIN exams e ON ea.exam_id = e.id
             JOIN subjects s ON e.subject_id = s.id
             ORDER BY ea.start_time DESC
             LIMIT ${Number(limit)} OFFSET ${Number(offset)}`
        );
        const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM exam_attempts');
        return {
            attempts: rows,
            total: countResult[0].total,
            page,
            totalPages: Math.ceil(countResult[0].total / limit)
        };
    },

    // Get total count
    getCount: async () => {
        const [rows] = await pool.execute('SELECT COUNT(*) as total FROM exam_attempts');
        return rows[0].total;
    }
};

module.exports = ExamAttempt;
