// ============================================================
// Subject Model — SQL queries for subject operations
// ============================================================
const { pool } = require('../config/db');

const Subject = {
    // Find all subjects
    findAll: async () => {
        const [rows] = await pool.execute(
            'SELECT * FROM subjects ORDER BY subject_name ASC'
        );
        return rows;
    },

    // Find subject by ID
    findById: async (id) => {
        const [rows] = await pool.execute(
            'SELECT * FROM subjects WHERE id = ?',
            [id]
        );
        return rows[0];
    },

    // Create subject
    create: async (subjectName) => {
        const [result] = await pool.execute(
            'INSERT INTO subjects (subject_name) VALUES (?)',
            [subjectName]
        );
        return { id: result.insertId, subject_name: subjectName };
    },

    // Update subject
    update: async (id, subjectName) => {
        const [result] = await pool.execute(
            'UPDATE subjects SET subject_name = ? WHERE id = ?',
            [subjectName, id]
        );
        return result;
    },

    // Delete subject
    delete: async (id) => {
        const [result] = await pool.execute(
            'DELETE FROM subjects WHERE id = ?',
            [id]
        );
        return result;
    },

    // Get total count
    getCount: async () => {
        const [rows] = await pool.execute('SELECT COUNT(*) as total FROM subjects');
        return rows[0].total;
    }
};

module.exports = Subject;
