// ============================================================
// Result Model — SQL queries for result operations
// ============================================================
const { pool } = require('../config/db');

const Result = {
    // Create result
    create: async (resultData) => {
        const { student_id, exam_id, attempt_id, score, total_marks, percentage, grade, status, ai_feedback } = resultData;
        const [result] = await pool.execute(
            `INSERT INTO results (student_id, exam_id, attempt_id, score, total_marks, percentage, grade, status, ai_feedback) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [student_id, exam_id, attempt_id, score, total_marks, percentage, grade, status, ai_feedback || null]
        );
        return { id: result.insertId, ...resultData };
    },

    // Find all results with student and exam info
    findAll: async (search = '', page = 1, limit = 10) => {
        const offset = (page - 1) * limit;
        let query = `SELECT r.*, st.name as student_name, st.email as student_email,
                      e.exam_name, s.subject_name
                      FROM results r
                      JOIN students st ON r.student_id = st.id
                      JOIN exams e ON r.exam_id = e.id
                      JOIN subjects s ON e.subject_id = s.id`;
        let countQuery = `SELECT COUNT(*) as total FROM results r
                          JOIN students st ON r.student_id = st.id
                          JOIN exams e ON r.exam_id = e.id
                          JOIN subjects s ON e.subject_id = s.id`;
        const params = [];
        const countParams = [];

        if (search) {
            const searchClause = ' WHERE st.name LIKE ? OR e.exam_name LIKE ? OR s.subject_name LIKE ?';
            query += searchClause;
            countQuery += searchClause;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
            countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        query += ` ORDER BY r.created_at DESC LIMIT ${Number(limit)} OFFSET ${Number(offset)}`;

        const [rows] = await pool.execute(query, params);
        const [countResult] = await pool.execute(countQuery, countParams);

        return {
            results: rows,
            total: countResult[0].total,
            page,
            totalPages: Math.ceil(countResult[0].total / limit)
        };
    },

    // Find results by student ID
    findByStudentId: async (studentId) => {
        const [rows] = await pool.execute(
            `SELECT r.*, e.exam_name, s.subject_name, e.exam_date
             FROM results r
             JOIN exams e ON r.exam_id = e.id
             JOIN subjects s ON e.subject_id = s.id
             WHERE r.student_id = ?
             ORDER BY r.created_at DESC`,
            [studentId]
        );
        return rows;
    },

    // Find result by attempt ID
    findByAttemptId: async (attemptId) => {
        const [rows] = await pool.execute(
            `SELECT r.*, e.exam_name, s.subject_name, st.name as student_name
             FROM results r
             JOIN exams e ON r.exam_id = e.id
             JOIN subjects s ON e.subject_id = s.id
             JOIN students st ON r.student_id = st.id
             WHERE r.attempt_id = ?`,
            [attemptId]
        );
        return rows[0];
    },

    // Get pass/fail statistics
    getPassFailStats: async () => {
        const [rows] = await pool.execute(
            `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pass' THEN 1 ELSE 0 END) as passed,
                SUM(CASE WHEN status = 'fail' THEN 1 ELSE 0 END) as failed
             FROM results`
        );
        return rows[0];
    },

    // Get subject-wise performance
    getSubjectPerformance: async () => {
        const [rows] = await pool.execute(
            `SELECT s.subject_name, 
                    COUNT(r.id) as total_attempts,
                    ROUND(AVG(r.percentage), 2) as avg_percentage,
                    SUM(CASE WHEN r.status = 'pass' THEN 1 ELSE 0 END) as passed,
                    SUM(CASE WHEN r.status = 'fail' THEN 1 ELSE 0 END) as failed
             FROM results r
             JOIN exams e ON r.exam_id = e.id
             JOIN subjects s ON e.subject_id = s.id
             GROUP BY s.id, s.subject_name
             ORDER BY avg_percentage DESC`
        );
        return rows;
    },

    // Get monthly statistics
    getMonthlyStats: async () => {
        const [rows] = await pool.execute(
            `SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month,
                COUNT(*) as total_exams,
                ROUND(AVG(percentage), 2) as avg_percentage
             FROM results
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
             GROUP BY DATE_FORMAT(created_at, '%Y-%m')
             ORDER BY month ASC`
        );
        return rows;
    },

    // Global admin leaderboard. Every registered student is included; students
    // without a completed exam appear with null rank/average and zero attempts.
    getLeaderboard: async (examId = null, page = 1, limit = 20, search = '') => {
        const safePage = Math.max(Number.parseInt(page, 10) || 1, 1);
        const safeLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 20, 1), 100);
        const offset = (safePage - 1) * safeLimit;
        const filter = examId !== null && examId !== undefined ? ' AND r.exam_id = ?' : '';
        const params = [];
        if (examId !== null && examId !== undefined) params.push(examId);
        const searchClause = search ? ' WHERE student_name LIKE ? OR student_email LIKE ?' : '';
        const searchParams = search ? [`%${search}%`, `%${search}%`] : [];

        const cte = `
            WITH valid_results AS (
                SELECT r.id, r.student_id, r.exam_id, r.percentage, r.status, r.created_at,
                    ROW_NUMBER() OVER (PARTITION BY r.student_id, r.exam_id
                        ORDER BY r.created_at DESC, r.id DESC) AS result_order
                FROM results r
                INNER JOIN exam_attempts ea ON ea.id = r.attempt_id
                    AND ea.student_id = r.student_id AND ea.exam_id = r.exam_id
                    AND ea.status = 'completed'
                WHERE r.total_marks > 0 AND r.percentage BETWEEN 0 AND 100 ${filter}
            ), student_totals AS (
                SELECT st.id AS student_id, st.name AS student_name, st.email AS student_email,
                    AVG(vr.percentage) AS raw_avg_percentage,
                    COUNT(DISTINCT vr.exam_id) AS exams_taken,
                    COUNT(DISTINCT CASE WHEN vr.status = 'pass' THEN vr.exam_id END) AS passed
                FROM students st
                LEFT JOIN valid_results vr ON vr.student_id = st.id AND vr.result_order = 1
                GROUP BY st.id, st.name, st.email
            ), ranked_students AS (
                SELECT CASE WHEN raw_avg_percentage IS NULL THEN NULL
                    ELSE DENSE_RANK() OVER (ORDER BY raw_avg_percentage DESC) END AS rank_position,
                    student_id, student_name, student_email,
                    ROUND(raw_avg_percentage, 2) AS avg_percentage,
                    exams_taken, passed, raw_avg_percentage
                FROM student_totals
            )`;

        const [rows] = await pool.execute(
            `${cte} SELECT rank_position, student_id, student_name, student_email,
                avg_percentage, exams_taken, passed
             FROM ranked_students ${searchClause}
             ORDER BY (raw_avg_percentage IS NULL) ASC, raw_avg_percentage DESC,
                exams_taken DESC, passed DESC, student_name ASC, student_id ASC
             LIMIT ${safeLimit} OFFSET ${offset}`,
            [...params, ...searchParams]
        );
        const [countRows] = await pool.execute(
            `SELECT COUNT(*) AS total FROM students st ${search ? 'WHERE st.name LIKE ? OR st.email LIKE ?' : ''}`,
            searchParams
        );
        const total = Number(countRows[0].total || 0);
        return { results: rows, total, page: safePage, limit: safeLimit,
            totalPages: Math.ceil(total / safeLimit) };
    },

    // Get result by student and exam
    findByStudentAndExam: async (studentId, examId) => {
        const [rows] = await pool.execute(
            `SELECT r.*, e.exam_name, s.subject_name
             FROM results r
             JOIN exams e ON r.exam_id = e.id
             JOIN subjects s ON e.subject_id = s.id
             WHERE r.student_id = ? AND r.exam_id = ?`,
            [studentId, examId]
        );
        return rows[0];
    }
};

module.exports = Result;
