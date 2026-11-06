// ============================================================
// Exam Model — SQL queries for exam operations
// ============================================================
const { pool } = require('../config/db');

const Exam = {
    // Find all exams with subject info
    findAll: async (search = '', page = 1, limit = 10) => {
        const offset = (page - 1) * limit;
        let query = `SELECT e.*, s.subject_name, 
                      (SELECT COUNT(*) FROM questions WHERE exam_id = e.id) as question_count
                      FROM exams e 
                      LEFT JOIN subjects s ON e.subject_id = s.id`;
        let countQuery = 'SELECT COUNT(*) as total FROM exams e LEFT JOIN subjects s ON e.subject_id = s.id';
        const params = [];
        const countParams = [];

        if (search) {
            const searchClause = ' WHERE e.exam_name LIKE ? OR s.subject_name LIKE ?';
            query += searchClause;
            countQuery += searchClause;
            params.push(`%${search}%`, `%${search}%`);
            countParams.push(`%${search}%`, `%${search}%`);
        }

        query += ` ORDER BY e.exam_date DESC LIMIT ${Number(limit)} OFFSET ${Number(offset)}`;

        const [rows] = await pool.execute(query, params);
        const [countResult] = await pool.execute(countQuery, countParams);

        return {
            exams: rows,
            total: countResult[0].total,
            page,
            totalPages: Math.ceil(countResult[0].total / limit)
        };
    },

    // Find exam by ID
    findById: async (id) => {
        const [rows] = await pool.execute(
            `SELECT e.*, s.subject_name,
             (SELECT COUNT(*) FROM questions WHERE exam_id = e.id) AS question_count,
             CASE
                 WHEN e.status = 'active'
                  AND e.exam_date <= CURDATE()
                  AND (e.start_time IS NULL OR e.start_time <= NOW())
                  AND (e.end_time IS NULL OR e.end_time >= NOW())
                  AND (SELECT COUNT(*) FROM questions WHERE exam_id = e.id) > 0
                 THEN 1 ELSE 0
             END AS can_start
             FROM exams e
             LEFT JOIN subjects s ON e.subject_id = s.id
             WHERE e.id = ?`,
            [id]
        );
        return rows[0];
    },

    // List published/active and upcoming exams for students.
    // Exams remain visible before their start time and while questions are being added,
    // but can_start is true only when the exam is active, within its time window,
    // and has at least one question.
    getAvailable: async (studentId) => {
        const [rows] = await pool.execute(
            `SELECT e.*, s.subject_name,
             COALESCE(q.question_count, 0) AS question_count,
             CASE
                 WHEN e.status = 'active'
                  AND e.exam_date <= CURDATE()
                  AND (e.start_time IS NULL OR e.start_time <= NOW())
                  AND (e.end_time IS NULL OR e.end_time >= NOW())
                  AND COALESCE(q.question_count, 0) > 0
                 THEN 1 ELSE 0
             END AS can_start,
             (SELECT COUNT(*)
                FROM exam_attempts ea
               WHERE ea.exam_id = e.id
                 AND ea.student_id = ?
                 AND ea.status IN ('completed', 'timed_out')) AS attempted
             FROM exams e
             LEFT JOIN subjects s ON e.subject_id = s.id
             LEFT JOIN (
                 SELECT exam_id, COUNT(*) AS question_count
                   FROM questions
                  GROUP BY exam_id
             ) q ON q.exam_id = e.id
             WHERE e.status IN ('upcoming', 'active')
               AND e.exam_date >= CURDATE()
               AND (e.end_time IS NULL OR e.end_time >= NOW())
             ORDER BY
                 CASE WHEN e.status = 'active' THEN 0 ELSE 1 END,
                 e.start_time ASC,
                 e.exam_date ASC`,
            [studentId]
        );
        return rows;
    },

    // Create exam
    create: async (examData) => {
        const { exam_name, subject_id, duration, total_marks, exam_date, start_time, end_time, status, is_adaptive } = examData;
        const [result] = await pool.execute(
            'INSERT INTO exams (exam_name, subject_id, duration, total_marks, exam_date, start_time, end_time, status, is_adaptive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [exam_name, subject_id, duration, total_marks, exam_date, start_time || null, end_time || null, status || 'upcoming', is_adaptive ? 1 : 0]
        );
        return { id: result.insertId, ...examData };
    },

    // Update exam
    update: async (id, examData) => {
        const { exam_name, subject_id, duration, total_marks, exam_date, start_time, end_time, status, is_adaptive } = examData;
        const [result] = await pool.execute(
            'UPDATE exams SET exam_name = ?, subject_id = ?, duration = ?, total_marks = ?, exam_date = ?, start_time = ?, end_time = ?, status = ?, is_adaptive = ? WHERE id = ?',
            [exam_name, subject_id, duration, total_marks, exam_date, start_time || null, end_time || null, status, is_adaptive ? 1 : 0, id]
        );
        return result;
    },

    // Delete exam
    delete: async (id) => {
        const [result] = await pool.execute(
            'DELETE FROM exams WHERE id = ?',
            [id]
        );
        return result;
    },

    // Get total count
    getCount: async () => {
        const [rows] = await pool.execute('SELECT COUNT(*) as total FROM exams');
        return rows[0].total;
    }
};

module.exports = Exam;
