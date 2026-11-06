QUESTION BANK EXAM CREATION UPDATE

Feature
-------
Admin can create an exam by selecting one of the existing subjects and entering
the number of questions to use (1-400). The backend randomly selects exactly
that many rows from question_bank for the selected subject and copies them into
the existing questions table. The question_bank table is never modified.

Files changed
-------------
backend/controllers/examController.js
  Adds createFromQuestionBank. It validates input, checks the subject and
  available count, then creates the exam and copies selected questions in a
  single MySQL transaction. Questions are assigned difficulty='medium'
  because the verified question_bank schema has no difficulty column.

backend/routes/exams.js
  Adds POST /api/exams/create-from-question-bank (admin-only) and validation.

frontend/src/services/dataService.js
  Adds examService.createFromQuestionBank().

frontend/src/pages/admin/ManageExams.jsx
  Adds Number of Questions (1-400) to the Create Exam form and uses the new
  endpoint when creating a standard subject-based exam. Existing edit and
  PDF-based creation paths are retained.

Important
---------
- The feature expects the existing online_exam_system.question_bank table
  with columns: subject_id, question, option_a, option_b, option_c, option_d,
  correct_answer.
- Current known data has 400 questions for each of the eight subjects.
- Adaptive mode is disabled for bank-created exams because question_bank has
  no difficulty classification. Existing adaptive exams and PDF flow remain.
- Total marks defaults to the selected question count in the form but remains
  editable. Scoring continues to use the existing proportional scoring logic.
- Existing exams are not modified. This update only changes future exam creation.

Install
-------
Replace the project folder with this updated project after keeping your
existing backup. Do not overwrite your .env file with .env.example. Keep your
actual backend .env credentials locally.

Then run backend and frontend as before:
  backend:  npm start
  frontend: npm run dev

Manual verification
-------------------
1. Admin > Manage Exams > Create Exam.
2. Select any subject, e.g. Operating Systems.
3. Enter 10 in Number of Questions.
4. Enter exam name, duration, date and status; total marks defaults to 10.
5. Create the exam.
6. Check Admin exam list and Student Available Exams; it should show 10.
7. Start the exam and confirm 10 questions are presented.

SQL verification:
  USE online_exam_system;
  SELECT e.id, e.exam_name, e.total_marks, COUNT(q.id) AS actual_questions
  FROM exams e LEFT JOIN questions q ON q.exam_id = e.id
  GROUP BY e.id, e.exam_name, e.total_marks
  ORDER BY e.id DESC;

Expected: the newly created exam has actual_questions equal to the requested
question_count. If fewer than requested questions exist for a subject, the
backend returns an error and does not create a partial exam.
