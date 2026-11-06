// ============================================================
// Answer Model — SQL queries for answer operations
// ============================================================
const { pool } = require('../config/db');

const Answer = {
    // Bulk insert answers
    bulkCreate: async (attemptId, answers) => {
        if (!answers || answers.length === 0) return;

        const values = answers.map(a => [attemptId, a.question_id, a.selected_answer || null]);
        const placeholders = values.map(() => '(?, ?, ?)').join(', ');
        const flatValues = values.flat();

        const [result] = await pool.execute(
            `INSERT INTO answers (attempt_id, question_id, selected_answer) VALUES ${placeholders}`,
            flatValues
        );
        return result;
    },

    // Get answers by attempt ID
    findByAttemptId: async (attemptId) => {
        const [rows] = await pool.execute(
            `SELECT a.*, q.question, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.difficulty
             FROM answers a
             JOIN questions q ON a.question_id = q.id
             WHERE a.attempt_id = ?`,
            [attemptId]
        );
        return rows;
    },

    // Create a single answer (used in adaptive exams)
    createSingle: async (attemptId, questionId, selectedAnswer) => {
        const [result] = await pool.execute(
            'INSERT INTO answers (attempt_id, question_id, selected_answer) VALUES (?, ?, ?)',
            [attemptId, questionId, selectedAnswer || null]
        );
        return { id: result.insertId };
    },

    // Get answered question IDs for an attempt
    getAnsweredQuestionIds: async (attemptId) => {
        const [rows] = await pool.execute(
            'SELECT question_id FROM answers WHERE attempt_id = ?',
            [attemptId]
        );
        return rows.map(r => r.question_id);
    },

    // Get answer count for an attempt
    countByAttempt: async (attemptId) => {
        const [rows] = await pool.execute(
            'SELECT COUNT(*) as total FROM answers WHERE attempt_id = ?',
            [attemptId]
        );
        return rows[0].total;
    }
};

module.exports = Answer;
