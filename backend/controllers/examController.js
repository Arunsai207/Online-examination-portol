// ============================================================
// Exam Controller — CRUD and exam management
// ============================================================
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const ExamAttempt = require('../models/ExamAttempt');
const Answer = require('../models/Answer');
const Result = require('../models/Result');
const gradeService = require('../services/gradeService');
const { getPagination } = require('../utils/helpers');
const { generateFeedback } = require('../services/aiFeedbackService');
const { pool } = require('../config/db');

const examController = {
    // Get all exams (admin)
    getAll: async (req, res, next) => {
        try {
            const { search } = req.query;
            const { page, limit } = getPagination(req.query.page, req.query.limit);
            const result = await Exam.findAll(search, page, limit);
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    },

    // Get exam by ID
    getById: async (req, res, next) => {
        try {
            const exam = await Exam.findById(req.params.id);
            if (!exam) {
                return res.status(404).json({ success: false, message: 'Exam not found' });
            }
            res.json({ success: true, data: exam });
        } catch (error) {
            next(error);
        }
    },

    // Get available exams for student
    getAvailable: async (req, res, next) => {
        try {
            const exams = await Exam.getAvailable(req.user.id);
            res.json({ success: true, data: exams });
        } catch (error) {
            next(error);
        }
    },

    // Create exam
    create: async (req, res, next) => {
        try {
            const examData = req.body;
            const exam = await Exam.create(examData);
            res.status(201).json({
                success: true,
                message: 'Exam created successfully',
                data: exam
            });
        } catch (error) {
            next(error);
        }
    },


    // Create an exam by selecting a requested number of questions from question_bank.
    // The source bank is read-only; selected questions are copied into the exam's questions table.
    createFromQuestionBank: async (req, res, next) => {
        let connection;
        try {
            const {
                exam_name, subject_id, question_count, duration, total_marks,
                exam_date, start_time, end_time, status
            } = req.body;

            const subjectId = Number(subject_id);
            const questionCount = Number(question_count);
            const examDuration = Number(duration);
            const examMarks = Number(total_marks);

            if (!exam_name || !Number.isInteger(subjectId) || subjectId < 1 ||
                !Number.isInteger(questionCount) || questionCount < 1 ||
                !Number.isInteger(examDuration) || examDuration < 1 ||
                !Number.isInteger(examMarks) || examMarks < 1 || !exam_date) {
                return res.status(400).json({
                    success: false,
                    message: 'Provide an exam name, valid subject, question count, duration, marks and exam date.'
                });
            }

            // question_bank currently has no difficulty classification. Do not enable
            // adaptive mode for these exams because adaptive selection needs real difficulty labels.
            if (req.body.is_adaptive) {
                return res.status(400).json({
                    success: false,
                    message: 'Adaptive mode is not available for question-bank exams because the bank has no difficulty labels.'
                });
            }

            connection = await pool.getConnection();
            await connection.beginTransaction();

            const [subjects] = await connection.execute(
                'SELECT id FROM subjects WHERE id = ?',
                [subjectId]
            );
            if (!subjects.length) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'Selected subject does not exist.' });
            }

            const [countRows] = await connection.execute(
                'SELECT COUNT(*) AS available FROM question_bank WHERE subject_id = ?',
                [subjectId]
            );
            const available = Number(countRows[0].available);
            if (questionCount > available) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Only ${available} questions are available for this subject.`,
                    data: { available_questions: available }
                });
            }

            const [selectedQuestions] = await connection.execute(
                `SELECT question, option_a, option_b, option_c, option_d, correct_answer
                   FROM question_bank
                  WHERE subject_id = ?
                  ORDER BY RAND()
                  LIMIT ${questionCount}`,
                [subjectId]
            );

            if (selectedQuestions.length !== questionCount) {
                throw new Error('Could not retrieve the requested number of questions.');
            }

            const [examResult] = await connection.execute(
                `INSERT INTO exams
                    (exam_name, subject_id, duration, total_marks, exam_date,
                     start_time, end_time, status, is_adaptive)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
                [
                    exam_name.trim(), subjectId, examDuration, examMarks, exam_date,
                    start_time || null, end_time || null, status || 'upcoming'
                ]
            );
            const examId = examResult.insertId;

            const values = selectedQuestions.map(q => [
                examId, q.question, q.option_a, q.option_b, q.option_c,
                q.option_d, q.correct_answer, 'medium'
            ]);
            const placeholders = values.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
            await connection.execute(
                `INSERT INTO questions
                    (exam_id, question, option_a, option_b, option_c, option_d, correct_answer, difficulty)
                 VALUES ${placeholders}`,
                values.flat()
            );

            await connection.commit();
            return res.status(201).json({
                success: true,
                message: `Exam created successfully with ${questionCount} questions.`,
                data: { exam_id: examId, question_count: questionCount, available_questions: available }
            });
        } catch (error) {
            if (connection) {
                try { await connection.rollback(); } catch (_) {}
            }
            return next(error);
        } finally {
            if (connection) connection.release();
        }
    },

    // ===== PARSE PDF / IMAGE — returns questions for preview (no DB save) =====
    parsePdf: async (req, res, next) => {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'File is required' });
            }

            let text = '';
            const mimeType = req.file.mimetype;

            // 1. Extract Text based on file type
            if (mimeType.startsWith('image/')) {
                // Use OCR for images
                const Tesseract = require('tesseract.js');
                const result = await Tesseract.recognize(req.file.buffer, 'eng');
                text = result.data.text;
            } else if (mimeType === 'application/pdf') {
                // Parse PDF
                const pdfParseModule = require('pdf-parse');
                const pdfParse = pdfParseModule.default || pdfParseModule;
                const pdfData = await pdfParse(req.file.buffer);
                text = pdfData.text;
                
                // OCR fallback if PDF text is empty (scanned PDF case)
                // Note: True PDF OCR requires poppler/ghostscript.
                // We'll throw an error telling them to use images instead for scans.
                if (!text || text.trim().length < 20) {
                    return res.status(400).json({
                        success: false,
                        message: 'This PDF appears to be scanned (contains no digital text). Please upload it as an Image (PNG/JPG) to use our OCR feature.'
                    });
                }
            } else {
                return res.status(400).json({ success: false, message: 'Unsupported file format. Please upload PDF or Image (PNG/JPG).' });
            }

            // 2. Extract, Deduplicate, Validate
            const { parseTextToMCQ, validateQuestions, deduplicateQuestions } = require('../services/aiParserService');
            let questions = parseTextToMCQ(text);
            questions = deduplicateQuestions(questions);
            const validated = validateQuestions(questions);

            const validCount = validated.filter(q => q.isValid).length;
            const invalidCount = validated.filter(q => !q.isValid).length;

            res.json({
                success: true,
                message: `Extracted ${validated.length} questions (${validCount} valid, ${invalidCount} need review).`,
                data: {
                    questions: validated,
                    stats: {
                        total: validated.length,
                        valid: validCount,
                        invalid: invalidCount,
                        duplicatesRemoved: questions.length !== validated.length ? 'some' : 0
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // ===== CREATE EXAM FROM REVIEWED JSON (Admin publishes after preview) =====
    createFromJson: async (req, res, next) => {
        try {
            const { exam_name, subject_id, duration, exam_date, start_time, end_time, status, is_adaptive, questions } = req.body;

            if (!questions || questions.length === 0) {
                return res.status(400).json({ success: false, message: 'At least one question is required' });
            }

            // Create Exam
            const examData = {
                exam_name,
                subject_id,
                duration: parseInt(duration),
                total_marks: questions.length,
                exam_date,
                start_time: start_time || null,
                end_time: end_time || null,
                status: status || 'active',
                is_adaptive: Boolean(is_adaptive)
            };
            const exam = await Exam.create(examData);

            // Bulk Create Questions
            const cleanQuestions = questions.map(q => ({
                question: q.question,
                option_a: q.option_a,
                option_b: q.option_b,
                option_c: q.option_c,
                option_d: q.option_d,
                correct_answer: q.correct_answer
            }));
            await Question.bulkCreate(exam.id, cleanQuestions);

            res.status(201).json({
                success: true,
                message: `Exam published with ${cleanQuestions.length} questions!`,
                data: { exam_id: exam.id, question_count: cleanQuestions.length }
            });
        } catch (error) {
            next(error);
        }
    },

    // Update exam
    update: async (req, res, next) => {
        try {
            const exam = await Exam.findById(req.params.id);
            if (!exam) {
                return res.status(404).json({ success: false, message: 'Exam not found' });
            }

            await Exam.update(req.params.id, req.body);
            res.json({ success: true, message: 'Exam updated successfully' });
        } catch (error) {
            next(error);
        }
    },

    // Delete exam
    delete: async (req, res, next) => {
        try {
            const exam = await Exam.findById(req.params.id);
            if (!exam) {
                return res.status(404).json({ success: false, message: 'Exam not found' });
            }

            await Exam.delete(req.params.id);
            res.json({ success: true, message: 'Exam deleted successfully' });
        } catch (error) {
            next(error);
        }
    },

    // ===== START EXAM (Student) =====
    startExam: async (req, res, next) => {
        try {
            const examId = req.params.id;
            const studentId = req.user.id;

            // Check if exam exists and is active
            const exam = await Exam.findById(examId);
            if (!exam) {
                return res.status(404).json({ success: false, message: 'Exam not found' });
            }
            if (!exam.can_start) {
                let message = 'This exam is not currently available.';
                if (exam.status !== 'active') {
                    message = 'This exam has not been activated by the administrator yet.';
                } else if (Number(exam.question_count) < 1) {
                    message = 'This exam cannot be started because no questions have been added yet.';
                } else if (exam.start_time && new Date(exam.start_time).getTime() > Date.now()) {
                    message = 'This exam has not started yet. Please return at the scheduled start time.';
                } else if (exam.end_time && new Date(exam.end_time).getTime() < Date.now()) {
                    message = 'The examination time window has ended.';
                }
                return res.status(400).json({ success: false, message });
            }

            // Check if already completed
            const hasCompleted = await ExamAttempt.hasCompleted(studentId, examId);
            if (hasCompleted) {
                return res.status(400).json({ success: false, message: 'You have already completed this exam' });
            }

            // Check for existing in-progress attempt
            let attempt = await ExamAttempt.getInProgress(studentId, examId);
            if (!attempt) {
                attempt = await ExamAttempt.create(studentId, examId);
            }

            // ===== ADAPTIVE EXAM MODE =====
            if (exam.is_adaptive) {
                // Get already-answered question IDs (resume support)
                const answeredIds = await Answer.getAnsweredQuestionIds(attempt.id);
                const totalQuestions = await Question.countByExamId(examId);
                const maxQuestions = Math.min(totalQuestions, 10); // Adaptive exams cap at 10

                if (answeredIds.length >= maxQuestions) {
                    return res.status(400).json({ success: false, message: 'This adaptive exam has already been completed' });
                }

                // Determine current difficulty based on answer history
                let currentDifficulty = 'medium';
                if (answeredIds.length > 0) {
                    const answers = await Answer.findByAttemptId(attempt.id);
                    const lastAnswer = answers[answers.length - 1];
                    if (lastAnswer.selected_answer === lastAnswer.correct_answer) {
                        currentDifficulty = lastAnswer.difficulty === 'easy' ? 'medium' : 'hard';
                    } else {
                        currentDifficulty = lastAnswer.difficulty === 'hard' ? 'medium' : 'easy';
                    }
                }

                // Get next question
                let nextQuestion = await Question.findAdaptiveQuestion(examId, currentDifficulty, answeredIds);
                if (!nextQuestion) {
                    nextQuestion = await Question.findAnyUnansweredQuestion(examId, answeredIds);
                }
                if (!nextQuestion) {
                    return res.status(400).json({ success: false, message: 'No more questions available' });
                }

                return res.json({
                    success: true,
                    data: {
                        attempt_id: attempt.id,
                        exam: {
                            id: exam.id,
                            exam_name: exam.exam_name,
                            duration: exam.duration,
                            total_marks: exam.total_marks,
                            is_adaptive: true
                        },
                        question: nextQuestion,
                        question_number: answeredIds.length + 1,
                        total_questions: maxQuestions,
                        start_time: attempt.start_time
                    }
                });
            }

            // ===== STANDARD EXAM MODE =====
            // Get questions and randomize order (Fisher-Yates shuffle)
            const questions = await Question.findForExam(examId);
            for (let j = questions.length - 1; j > 0; j--) {
                const k = Math.floor(Math.random() * (j + 1));
                [questions[j], questions[k]] = [questions[k], questions[j]];
            }

            res.json({
                success: true,
                data: {
                    attempt_id: attempt.id,
                    exam: {
                        id: exam.id,
                        exam_name: exam.exam_name,
                        duration: exam.duration,
                        total_marks: exam.total_marks,
                        is_adaptive: false
                    },
                    questions,
                    start_time: attempt.start_time
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // ===== SUBMIT EXAM (Student) =====
    submitExam: async (req, res, next) => {
        try {
            const attemptId = req.params.attemptId;
            const { answers } = req.body;
            const studentId = req.user.id;

            // Get attempt
            const attempt = await ExamAttempt.findById(attemptId);
            if (!attempt) {
                return res.status(404).json({ success: false, message: 'Attempt not found' });
            }
            if (attempt.student_id !== studentId) {
                return res.status(403).json({ success: false, message: 'Unauthorized' });
            }
            if (attempt.status !== 'in_progress') {
                return res.status(400).json({ success: false, message: 'This exam attempt has already been submitted' });
            }

            // Get exam details
            const exam = await Exam.findById(attempt.exam_id);

            // Save answers
            if (answers && answers.length > 0) {
                await Answer.bulkCreate(attemptId, answers);
            }

            // Calculate score
            const correctAnswers = await Question.getCorrectAnswers(attempt.exam_id);
            let score = 0;
            const marksPerQuestion = exam.total_marks / correctAnswers.length;

            if (answers && answers.length > 0) {
                for (const correct of correctAnswers) {
                    const studentAnswer = answers.find(a => a.question_id === correct.id);
                    if (studentAnswer && studentAnswer.selected_answer === correct.correct_answer) {
                        score += marksPerQuestion;
                    }
                }
            }

            score = Math.round(score * 100) / 100;
            const percentage = gradeService.calculatePercentage(score, exam.total_marks);
            const grade = gradeService.calculateGrade(percentage);
            const status = gradeService.getStatus(percentage);

            // Complete the attempt
            await ExamAttempt.complete(attemptId);

            // Generate AI Feedback
            let ai_feedback = null;
            try {
                const allAnswers = await Answer.findByAttemptId(attemptId);
                const ProctoringLog = require('../models/ProctoringLog');
                const proctoringLogs = await ProctoringLog.findByAttemptId(attemptId);
                ai_feedback = await generateFeedback({
                    result: { score, total_marks: exam.total_marks, percentage, grade, status },
                    answers: allAnswers,
                    exam,
                    proctoringLogs
                });
            } catch (fbErr) {
                console.error('AI Feedback generation failed:', fbErr.message);
            }

            // Save result
            const result = await Result.create({
                student_id: studentId,
                exam_id: attempt.exam_id,
                attempt_id: attemptId,
                score,
                total_marks: exam.total_marks,
                percentage,
                grade,
                status,
                ai_feedback
            });

            res.json({
                success: true,
                message: 'Exam submitted successfully',
                data: {
                    result_id: result.id,
                    score,
                    total_marks: exam.total_marks,
                    percentage,
                    grade,
                    status,
                    exam_name: exam.exam_name
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // ===== SUBMIT ADAPTIVE ANSWER (Student — one question at a time) =====
    submitAdaptiveAnswer: async (req, res, next) => {
        try {
            const attemptId = req.params.attemptId;
            const { question_id, selected_answer } = req.body;
            const studentId = req.user.id;

            // Validate attempt
            const attempt = await ExamAttempt.findById(attemptId);
            if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found' });
            if (attempt.student_id !== studentId) return res.status(403).json({ success: false, message: 'Unauthorized' });
            if (attempt.status !== 'in_progress') return res.status(400).json({ success: false, message: 'Attempt already submitted' });

            const exam = await Exam.findById(attempt.exam_id);

            // Save the answer
            await Answer.createSingle(attemptId, question_id, selected_answer);

            // Check correctness
            const question = await Question.findById(question_id);
            const isCorrect = question && selected_answer === question.correct_answer;

            // Get all answered question IDs
            const answeredIds = await Answer.getAnsweredQuestionIds(attemptId);
            const totalAvailable = await Question.countByExamId(attempt.exam_id);
            const maxQuestions = Math.min(totalAvailable, 10);

            // Check if exam is complete
            if (answeredIds.length >= maxQuestions) {
                // === COMPLETE THE ADAPTIVE EXAM ===
                await ExamAttempt.complete(attemptId);

                const allAnswers = await Answer.findByAttemptId(attemptId);

                // Weighted scoring: easy=1, medium=2, hard=3
                const difficultyWeights = { easy: 1, medium: 2, hard: 3 };
                let weightedScore = 0;
                let maxWeightedScore = 0;
                allAnswers.forEach(a => {
                    const w = difficultyWeights[a.difficulty || 'medium'];
                    maxWeightedScore += w;
                    if (a.selected_answer === a.correct_answer) weightedScore += w;
                });

                const score = Math.round((weightedScore / maxWeightedScore) * exam.total_marks * 100) / 100;
                const percentage = gradeService.calculatePercentage(score, exam.total_marks);
                const grade = gradeService.calculateGrade(percentage);
                const status = gradeService.getStatus(percentage);

                // Generate AI Feedback
                let ai_feedback = null;
                try {
                    const ProctoringLog = require('../models/ProctoringLog');
                    const proctoringLogs = await ProctoringLog.findByAttemptId(attemptId);
                    ai_feedback = await generateFeedback({
                        result: { score, total_marks: exam.total_marks, percentage, grade, status },
                        answers: allAnswers,
                        exam,
                        proctoringLogs
                    });
                } catch (fbErr) {
                    console.error('AI Feedback generation failed:', fbErr.message);
                }

                const result = await Result.create({
                    student_id: studentId,
                    exam_id: attempt.exam_id,
                    attempt_id: attemptId,
                    score,
                    total_marks: exam.total_marks,
                    percentage,
                    grade,
                    status,
                    ai_feedback
                });

                return res.json({
                    success: true,
                    data: {
                        completed: true,
                        result: {
                            result_id: result.id,
                            score,
                            total_marks: exam.total_marks,
                            percentage,
                            grade,
                            status,
                            exam_name: exam.exam_name
                        }
                    }
                });
            }

            // === NOT COMPLETE — GET NEXT QUESTION ===
            const currentDifficulty = question.difficulty || 'medium';
            let nextDifficulty;
            if (isCorrect) {
                nextDifficulty = currentDifficulty === 'easy' ? 'medium' : 'hard';
            } else {
                nextDifficulty = currentDifficulty === 'hard' ? 'medium' : 'easy';
            }

            let nextQuestion = await Question.findAdaptiveQuestion(attempt.exam_id, nextDifficulty, answeredIds);
            if (!nextQuestion) {
                nextQuestion = await Question.findAnyUnansweredQuestion(attempt.exam_id, answeredIds);
            }

            if (!nextQuestion) {
                // No more questions — force complete
                return res.json({ success: true, data: { completed: true, message: 'Question bank exhausted' } });
            }

            return res.json({
                success: true,
                data: {
                    completed: false,
                    is_correct: isCorrect,
                    next_question: nextQuestion,
                    question_number: answeredIds.length + 1,
                    total_questions: maxQuestions
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // ===== RECORD PROCTORING VIOLATION (Student) =====
    recordViolation: async (req, res, next) => {
        try {
            const attemptId = req.params.attemptId;
            const { violation_type, description } = req.body;
            const studentId = req.user.id;

            // Check attempt ownership
            const attempt = await ExamAttempt.findById(attemptId);
            if (!attempt || attempt.student_id !== studentId) {
                return res.status(403).json({ success: false, message: 'Unauthorized' });
            }

            const ProctoringLog = require('../models/ProctoringLog');
            await ProctoringLog.create(attemptId, violation_type, description);

            res.json({ success: true, message: 'Violation recorded' });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = examController;
