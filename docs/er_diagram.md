# ER Diagram — Online Examination and Result Management System

## Entity Relationship Diagram

```mermaid
erDiagram
    ADMIN {
        int id PK
        varchar name
        varchar email UK
        varchar password
        timestamp created_at
    }

    STUDENTS {
        int id PK
        varchar name
        varchar email UK
        varchar password
        varchar phone
        varchar course
        timestamp created_at
    }

    SUBJECTS {
        int id PK
        varchar subject_name
        timestamp created_at
    }

    EXAMS {
        int id PK
        varchar exam_name
        int subject_id FK
        int duration
        int total_marks
        date exam_date
        enum status
        timestamp created_at
    }

    QUESTIONS {
        int id PK
        int exam_id FK
        text question
        varchar option_a
        varchar option_b
        varchar option_c
        varchar option_d
        enum correct_answer
    }

    EXAM_ATTEMPTS {
        int id PK
        int student_id FK
        int exam_id FK
        enum status
        timestamp start_time
        timestamp end_time
    }

    ANSWERS {
        int id PK
        int attempt_id FK
        int question_id FK
        enum selected_answer
    }

    RESULTS {
        int id PK
        int student_id FK
        int exam_id FK
        int attempt_id FK
        int score
        int total_marks
        decimal percentage
        varchar grade
        enum status
        timestamp created_at
    }

    PASSWORD_RESETS {
        int id PK
        varchar email
        varchar token
        timestamp expires_at
        timestamp created_at
    }

    SUBJECTS ||--o{ EXAMS : "has"
    EXAMS ||--o{ QUESTIONS : "contains"
    STUDENTS ||--o{ EXAM_ATTEMPTS : "takes"
    EXAMS ||--o{ EXAM_ATTEMPTS : "attempted_in"
    EXAM_ATTEMPTS ||--o{ ANSWERS : "has"
    QUESTIONS ||--o{ ANSWERS : "answered_in"
    STUDENTS ||--o{ RESULTS : "receives"
    EXAMS ||--o{ RESULTS : "generates"
    EXAM_ATTEMPTS ||--|| RESULTS : "produces"
```

## Relationships

| Relationship | Type | Description |
|-------------|------|-------------|
| Subject → Exam | One-to-Many | Each subject can have multiple exams |
| Exam → Question | One-to-Many | Each exam contains multiple MCQ questions |
| Student → Exam Attempt | One-to-Many | A student can attempt multiple exams |
| Exam → Exam Attempt | One-to-Many | An exam can be attempted by multiple students |
| Exam Attempt → Answer | One-to-Many | Each attempt records multiple answers |
| Exam Attempt → Result | One-to-One | Each completed attempt generates one result |
