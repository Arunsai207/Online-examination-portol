-- ============================================================
-- Online Examination and Result Management System
-- Database Schema for MySQL
-- ============================================================

CREATE DATABASE IF NOT EXISTS online_exam_system;
USE online_exam_system;

-- ============================================================
-- 1. ADMIN TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- 2. STUDENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    course VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- 3. SUBJECTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_name VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- 4. EXAMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS exams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_name VARCHAR(200) NOT NULL,
    subject_id INT NOT NULL,
    duration INT NOT NULL COMMENT 'Duration in minutes',
    total_marks INT NOT NULL,
    exam_date DATE NOT NULL,
    status ENUM('upcoming', 'active', 'completed') DEFAULT 'upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 5. QUESTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT NOT NULL,
    question TEXT NOT NULL,
    option_a VARCHAR(500) NOT NULL,
    option_b VARCHAR(500) NOT NULL,
    option_c VARCHAR(500) NOT NULL,
    option_d VARCHAR(500) NOT NULL,
    correct_answer ENUM('A', 'B', 'C', 'D') NOT NULL,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 6. EXAM ATTEMPTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS exam_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    exam_id INT NOT NULL,
    status ENUM('in_progress', 'completed', 'timed_out') DEFAULT 'in_progress',
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 7. ANSWERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    attempt_id INT NOT NULL,
    question_id INT NOT NULL,
    selected_answer ENUM('A', 'B', 'C', 'D') NULL,
    FOREIGN KEY (attempt_id) REFERENCES exam_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 8. RESULTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    exam_id INT NOT NULL,
    attempt_id INT NOT NULL,
    score INT NOT NULL DEFAULT 0,
    total_marks INT NOT NULL,
    percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    grade VARCHAR(5) NOT NULL DEFAULT 'F',
    status ENUM('pass', 'fail') NOT NULL DEFAULT 'fail',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (attempt_id) REFERENCES exam_attempts(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 9. PROCTORING LOGS TABLE (AI Proctoring System)
-- ============================================================
CREATE TABLE IF NOT EXISTS proctoring_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    attempt_id INT NOT NULL,
    violation_type VARCHAR(100) NOT NULL,
    description TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (attempt_id) REFERENCES exam_attempts(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 10. PASSWORD RESET TOKENS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_admin_email ON admin(email);
CREATE INDEX idx_exams_subject ON exams(subject_id);
CREATE INDEX idx_exams_date ON exams(exam_date);
CREATE INDEX idx_questions_exam ON questions(exam_id);
CREATE INDEX idx_attempts_student ON exam_attempts(student_id);
CREATE INDEX idx_attempts_exam ON exam_attempts(exam_id);
CREATE INDEX idx_answers_attempt ON answers(attempt_id);
CREATE INDEX idx_results_student ON results(student_id);
CREATE INDEX idx_results_exam ON results(exam_id);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Default Admin (password: admin123)
INSERT INTO admin (name, email, password) VALUES 
('System Administrator', 'admin@examportal.com', '$2a$10$2nyKELkubLGvbIeLKhtmY.Y.wKCnqlta501jYJNJKO0sqG1cqQaQG');

-- Sample Subjects
INSERT INTO subjects (subject_name) VALUES 
('Data Structures and Algorithms'),
('Database Management Systems'),
('Operating Systems'),
('Computer Networks'),
('Software Engineering'),
('Web Technologies'),
('Artificial Intelligence'),
('Machine Learning');

-- Sample Exams
INSERT INTO exams (exam_name, subject_id, duration, total_marks, exam_date, status) VALUES
('DSA Mid-Term Exam', 1, 30, 50, '2026-06-15', 'active'),
('DBMS Final Exam', 2, 45, 100, '2026-06-20', 'active'),
('OS Quiz 1', 3, 20, 25, '2026-06-25', 'upcoming'),
('CN Mid-Term Exam', 4, 30, 50, '2026-07-01', 'upcoming');

-- Sample Questions for DSA Mid-Term (Exam ID: 1)
INSERT INTO questions (exam_id, question, option_a, option_b, option_c, option_d, correct_answer) VALUES
(1, 'What is the time complexity of binary search?', 'O(n)', 'O(log n)', 'O(n²)', 'O(1)', 'B'),
(1, 'Which data structure uses FIFO?', 'Stack', 'Queue', 'Array', 'Tree', 'B'),
(1, 'What is the worst-case time complexity of QuickSort?', 'O(n log n)', 'O(n)', 'O(n²)', 'O(log n)', 'C'),
(1, 'Which traversal visits the root first?', 'Inorder', 'Preorder', 'Postorder', 'Level Order', 'B'),
(1, 'A stack follows which principle?', 'FIFO', 'LIFO', 'LILO', 'Random', 'B'),
(1, 'What is the space complexity of merge sort?', 'O(1)', 'O(n)', 'O(log n)', 'O(n²)', 'B'),
(1, 'Which data structure is used in BFS?', 'Stack', 'Queue', 'Heap', 'Array', 'B'),
(1, 'What is a complete binary tree?', 'All levels full except possibly last', 'All leaves at same level', 'Every node has 2 children', 'Height balanced tree', 'A'),
(1, 'Hash collision can be resolved by?', 'Sorting', 'Chaining', 'Recursion', 'Iteration', 'B'),
(1, 'The height of a balanced BST with n nodes is?', 'O(n)', 'O(log n)', 'O(n²)', 'O(1)', 'B');

-- Sample Questions for DBMS Final (Exam ID: 2)
INSERT INTO questions (exam_id, question, option_a, option_b, option_c, option_d, correct_answer) VALUES
(2, 'What does SQL stand for?', 'Structured Query Language', 'Simple Query Language', 'Standard Query Logic', 'System Query Language', 'A'),
(2, 'Which normal form removes partial dependencies?', '1NF', '2NF', '3NF', 'BCNF', 'B'),
(2, 'ACID stands for?', 'Atomicity Consistency Isolation Durability', 'Atomicity Concurrency Isolation Durability', 'Availability Consistency Isolation Durability', 'Atomicity Consistency Integration Durability', 'A'),
(2, 'Which key uniquely identifies a record?', 'Foreign Key', 'Primary Key', 'Candidate Key', 'Super Key', 'B'),
(2, 'A deadlock occurs when?', 'Two transactions wait for each other', 'A transaction is very slow', 'Database crashes', 'Index is missing', 'A'),
(2, 'Which join returns all records from left table?', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'CROSS JOIN', 'B'),
(2, 'What is a view in SQL?', 'A physical table', 'A virtual table', 'An index', 'A stored procedure', 'B'),
(2, 'Which command is used to remove a table?', 'DELETE', 'DROP', 'REMOVE', 'TRUNCATE', 'B'),
(2, 'What is referential integrity?', 'Foreign key constraint', 'Primary key constraint', 'Check constraint', 'Unique constraint', 'A'),
(2, 'Which isolation level prevents dirty reads?', 'READ UNCOMMITTED', 'READ COMMITTED', 'REPEATABLE READ', 'SERIALIZABLE', 'B');

SELECT 'Database created and seeded successfully!' AS status;
