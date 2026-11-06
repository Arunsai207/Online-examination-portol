// ============================================================
// Admin Model — SQL queries for admin operations
// ============================================================
const { pool } = require('../config/db');

const Admin = {
    // Find admin by email
    findByEmail: async (email) => {
        const [rows] = await pool.execute(
            'SELECT * FROM admin WHERE email = ?',
            [email]
        );
        return rows[0];
    },

    // Find admin by ID
    findById: async (id) => {
        const [rows] = await pool.execute(
            'SELECT id, name, email, created_at FROM admin WHERE id = ?',
            [id]
        );
        return rows[0];
    },

    // Update admin password
    updatePassword: async (id, hashedPassword) => {
        const [result] = await pool.execute(
            'UPDATE admin SET password = ? WHERE id = ?',
            [hashedPassword, id]
        );
        return result;
    }
};

module.exports = Admin;
