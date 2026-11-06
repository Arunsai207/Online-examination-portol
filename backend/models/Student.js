// ============================================================
// Student Model — SQL queries for student operations
// ============================================================
const { pool } = require('../config/db');

const Student = {
    // Find all students with optional search and pagination
    findAll: async (search = '', page = 1, limit = 10) => {
        const offset = (page - 1) * limit;
        let query = 'SELECT id, name, email, phone, course, created_at FROM students';
        let countQuery = 'SELECT COUNT(*) as total FROM students';
        const params = [];
        const countParams = [];

        if (search) {
            const searchClause = ' WHERE name LIKE ? OR email LIKE ? OR course LIKE ?';
            query += searchClause;
            countQuery += searchClause;
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam);
            countParams.push(searchParam, searchParam, searchParam);
        }

        query += ` ORDER BY created_at DESC LIMIT ${Number(limit)} OFFSET ${Number(offset)}`;

        const [rows] = await pool.execute(query, params);
        const [countResult] = await pool.execute(countQuery, countParams);

        return {
            students: rows,
            total: countResult[0].total,
            page,
            totalPages: Math.ceil(countResult[0].total / limit)
        };
    },

    // Find student by ID
    findById: async (id) => {
        const [rows] = await pool.execute(
            'SELECT id, name, email, phone, course, face_descriptor, created_at FROM students WHERE id = ?',
            [id]
        );
        return rows[0];
    },

    // Find student by email (includes password for auth)
    findByEmail: async (email) => {
        const [rows] = await pool.execute(
            'SELECT * FROM students WHERE email = ?',
            [email]
        );
        return rows[0];
    },

    // Create new student
    create: async (studentData) => {
        const { name, email, password, phone, course } = studentData;
        const [result] = await pool.execute(
            'INSERT INTO students (name, email, password, phone, course) VALUES (?, ?, ?, ?, ?)',
            [name, email, password, phone || null, course || null]
        );
        return { id: result.insertId, name, email, phone, course };
    },

    // Update student
    update: async (id, studentData) => {
        const { name, email, phone, course } = studentData;
        const [result] = await pool.execute(
            'UPDATE students SET name = ?, email = ?, phone = ?, course = ? WHERE id = ?',
            [name, email, phone || null, course || null, id]
        );
        return result;
    },

    // Delete student
    delete: async (id) => {
        const [result] = await pool.execute(
            'DELETE FROM students WHERE id = ?',
            [id]
        );
        return result;
    },

    // Update password
    updatePassword: async (id, hashedPassword) => {
        const [result] = await pool.execute(
            'UPDATE students SET password = ? WHERE id = ?',
            [hashedPassword, id]
        );
        return result;
    },

    // Update face descriptor for biometric authentication
    updateFaceDescriptor: async (id, faceDescriptor) => {
        const [result] = await pool.execute(
            'UPDATE students SET face_descriptor = ? WHERE id = ?',
            [faceDescriptor, id]
        );
        return result;
    },

    // Get total count
    getCount: async () => {
        const [rows] = await pool.execute('SELECT COUNT(*) as total FROM students');
        return rows[0].total;
    }
};

module.exports = Student;
