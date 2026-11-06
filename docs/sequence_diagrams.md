# Sequence Diagrams — Online Examination and Result Management System

## 1. Student Registration

```mermaid
sequenceDiagram
    participant S as Student
    participant F as Frontend
    participant B as Backend API
    participant DB as MySQL Database

    S->>F: Fill registration form
    F->>B: POST /api/auth/register
    B->>DB: Check if email exists
    DB-->>B: Email not found
    B->>B: Hash password (bcrypt)
    B->>DB: INSERT INTO students
    DB-->>B: Student created (id)
    B->>B: Generate JWT token
    B-->>F: 201 {token, user}
    F->>F: Store token in localStorage
    F-->>S: Redirect to Student Dashboard
```

## 2. Login Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend API
    participant DB as MySQL Database

    U->>F: Enter email, password, role
    F->>B: POST /api/auth/login
    B->>DB: Find user by email (admin/student table)
    DB-->>B: User record
    B->>B: Compare password (bcrypt)
    B->>B: Generate JWT token
    B-->>F: 200 {token, user}
    F->>F: Store token, set user context
    F-->>U: Redirect to Dashboard
```

## 3. Take Exam Flow

```mermaid
sequenceDiagram
    participant S as Student
    participant F as Frontend
    participant B as Backend API
    participant DB as MySQL Database

    S->>F: Click "Start Exam"
    F->>B: POST /api/exams/:id/start
    B->>DB: Check existing attempt
    DB-->>B: No previous completion
    B->>DB: INSERT exam_attempt (in_progress)
    B->>DB: SELECT questions (randomized, no answers)
    DB-->>B: Questions list
    B-->>F: {attempt_id, questions, duration}
    F->>F: Start countdown timer

    loop Answer Questions
        S->>F: Select answer option
        F->>F: Store in local state
    end

    alt Timer Expires
        F->>F: Auto-trigger submit
    else Manual Submit
        S->>F: Click Submit
        F->>F: Show confirmation dialog
        S->>F: Confirm
    end

    F->>B: POST /api/exams/:attemptId/submit
    B->>DB: Bulk INSERT answers
    B->>DB: SELECT correct_answers
    B->>B: Calculate score, percentage, grade
    B->>DB: INSERT result
    B->>DB: UPDATE attempt (completed)
    B-->>F: {score, percentage, grade, status}
    F-->>S: Display Result Page
```

## 4. Admin Creates Exam

```mermaid
sequenceDiagram
    participant A as Admin
    participant F as Frontend
    participant B as Backend API
    participant DB as MySQL Database

    A->>F: Fill exam form (name, subject, duration, marks, date)
    F->>B: POST /api/exams
    B->>DB: INSERT INTO exams
    DB-->>B: Exam created
    B-->>F: 201 Success
    F-->>A: Show success toast

    A->>F: Click "Manage Questions"
    F->>F: Navigate to questions page
    A->>F: Add MCQ question
    F->>B: POST /api/questions
    B->>DB: INSERT INTO questions
    DB-->>B: Question created
    B-->>F: 201 Success
    F-->>A: Question added to list
```

## 5. View Results & Generate Report

```mermaid
sequenceDiagram
    participant A as Admin
    participant F as Frontend
    participant B as Backend API
    participant DB as MySQL Database

    A->>F: Navigate to Results page
    F->>B: GET /api/results?page=1
    B->>DB: SELECT results JOIN students, exams, subjects
    DB-->>B: Results with pagination
    B-->>F: {results, total, totalPages}
    F-->>A: Display results table

    A->>F: Click "Export Excel"
    F->>B: GET /api/reports/excel
    B->>DB: SELECT all results
    B->>B: Generate Excel (ExcelJS)
    B-->>F: Excel file (blob)
    F-->>A: Download file
```
