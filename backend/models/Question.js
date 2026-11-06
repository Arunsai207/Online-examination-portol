// ============================================================
// Question Model — SQL queries for question operations
// ============================================================
const { pool } = require('../config/db');

const Question = {
    // Find all questions for an exam (admin view — includes correct answer)
    findByExamId: async (examId) => {
        const [rows] = await pool.execute(
            'SELECT id, exam_id, question, option_a, option_b, option_c, option_d, correct_answer, difficulty FROM questions WHERE exam_id = ? ORDER BY id ASC',
            [examId]
        );
        return rows;
    },

    // Find questions for exam taking (student view — excludes correct answer, randomized)
    findForExam: async (examId) => {
        const [rows] = await pool.execute(
            'SELECT id, exam_id, question, option_a, option_b, option_c, option_d, difficulty FROM questions WHERE exam_id = ? ORDER BY RAND()',
            [examId]
        );
        return rows;
    },

    // Find one question by difficulty for adaptive exams (excludes already-answered ones)
    findAdaptiveQuestion: async (examId, difficulty, excludeIds = []) => {
        let query = 'SELECT id, exam_id, question, option_a, option_b, option_c, option_d, difficulty FROM questions WHERE exam_id = ? AND difficulty = ?';
        const params = [examId, difficulty];
        if (excludeIds.length > 0) {
            query += ` AND id NOT IN (${excludeIds.map(() => '?').join(',')})`;
            params.push(...excludeIds);
        }
        query += ' ORDER BY RAND() LIMIT 1';
        const [rows] = await pool.execute(query, params);
        return rows[0] || null;
    },

    // Find any unanswered question for adaptive (fallback if preferred difficulty exhausted)
    findAnyUnansweredQuestion: async (examId, excludeIds = []) => {
        let query = 'SELECT id, exam_id, question, option_a, option_b, option_c, option_d, difficulty FROM questions WHERE exam_id = ?';
        const params = [examId];
        if (excludeIds.length > 0) {
            query += ` AND id NOT IN (${excludeIds.map(() => '?').join(',')})`;
            params.push(...excludeIds);
        }
        query += ' ORDER BY RAND() LIMIT 1';
        const [rows] = await pool.execute(query, params);
        return rows[0] || null;
    },

    // Find question by ID
    findById: async (id) => {
        const [rows] = await pool.execute(
            'SELECT * FROM questions WHERE id = ?',
            [id]
        );
        return rows[0];
    },

    // Create question
    create: async (questionData) => {
        const { exam_id, question, option_a, option_b, option_c, option_d, correct_answer, difficulty } = questionData;
        const [result] = await pool.execute(
            'INSERT INTO questions (exam_id, question, option_a, option_b, option_c, option_d, correct_answer, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [exam_id, question, option_a, option_b, option_c, option_d, correct_answer, difficulty || 'medium']
        );
        return { id: result.insertId, ...questionData };
    },

    // Bulk create questions
    bulkCreate: async (examId, questions) => {
        const values = questions.map(q => [
            examId, q.question, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.difficulty || 'medium'
        ]);
        
        const placeholders = values.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
        const flatValues = values.flat();

        const [result] = await pool.execute(
            `INSERT INTO questions (exam_id, question, option_a, option_b, option_c, option_d, correct_answer, difficulty) VALUES ${placeholders}`,
            flatValues
        );
        return result;
    },

    // Update question
    update: async (id, questionData) => {
        const { question, option_a, option_b, option_c, option_d, correct_answer, difficulty } = questionData;
        const [result] = await pool.execute(
            'UPDATE questions SET question = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?, correct_answer = ?, difficulty = ? WHERE id = ?',
            [question, option_a, option_b, option_c, option_d, correct_answer, difficulty || 'medium', id]
        );
        return result;
    },

    // Delete question
    delete: async (id) => {
        const [result] = await pool.execute(
            'DELETE FROM questions WHERE id = ?',
            [id]
        );
        return result;
    },

    // Get correct answers for an exam
    getCorrectAnswers: async (examId) => {
        const [rows] = await pool.execute(
            'SELECT id, correct_answer FROM questions WHERE exam_id = ?',
            [examId]
        );
        return rows;
    },

    // Count questions for an exam
    countByExamId: async (examId) => {
        const [rows] = await pool.execute(
            'SELECT COUNT(*) as total FROM questions WHERE exam_id = ?',
            [examId]
        );
        return rows[0].total;
    }
};

module.exports = Question;
