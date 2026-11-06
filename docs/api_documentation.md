# API Documentation

## Online Examination and Result Management System

**Base URL:** `http://localhost:5000/api`  
**Authentication:** Bearer Token (JWT)

---

## Authentication

### Register Student
```
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "9876543210",
  "course": "B.Tech CSE"
}

Response: 201
{
  "success": true,
  "data": {
    "token": "eyJhbGci...",
    "user": { "id": 1, "name": "John Doe", "email": "john@example.com", "role": "student" }
  }
}
```

### Login
```
POST /auth/login
{
  "email": "admin@examportal.com",
  "password": "admin123",
  "role": "admin"
}

Response: 200
{
  "success": true,
  "data": { "token": "eyJhbGci...", "user": {...} }
}
```

### Forgot Password
```
POST /auth/forgot-password
{ "email": "john@example.com" }
```

### Reset Password
```
POST /auth/reset-password
{ "token": "uuid-token", "password": "newpassword" }
```

---

## Students (Admin Only)

### List Students
```
GET /students?page=1&limit=10&search=john
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "data": {
    "students": [...],
    "total": 50,
    "page": 1,
    "totalPages": 5
  }
}
```

### Create Student
```
POST /students
Authorization: Bearer <admin-token>
{ "name": "Jane", "email": "jane@test.com", "password": "pass123", "phone": "123", "course": "BCA" }
```

### Update Student
```
PUT /students/:id
{ "name": "Jane Doe", "email": "jane@test.com", "phone": "456", "course": "MCA" }
```

### Delete Student
```
DELETE /students/:id
```

---

## Subjects

### List All Subjects
```
GET /subjects
Authorization: Bearer <token>
```

### Create Subject (Admin)
```
POST /subjects
{ "subject_name": "Data Structures" }
```

---

## Exams

### List Exams (Admin)
```
GET /exams?page=1&limit=10&search=dsa
```

### Get Available Exams (Student)
```
GET /exams/available
```

### Create Exam (Admin)
```
POST /exams
{
  "exam_name": "DSA Final Exam",
  "subject_id": 1,
  "duration": 30,
  "total_marks": 100,
  "exam_date": "2026-07-01",
  "status": "active"
}
```

### Start Exam (Student)
```
POST /exams/:examId/start

Response: 200
{
  "data": {
    "attempt_id": 1,
    "exam": { "id": 1, "exam_name": "...", "duration": 30, "total_marks": 100 },
    "questions": [
      { "id": 1, "question": "...", "option_a": "...", "option_b": "...", "option_c": "...", "option_d": "..." }
    ]
  }
}
```

### Submit Exam (Student)
```
POST /exams/:attemptId/submit
{
  "answers": [
    { "question_id": 1, "selected_answer": "B" },
    { "question_id": 2, "selected_answer": "A" }
  ]
}

Response: 200
{
  "data": { "score": 80, "total_marks": 100, "percentage": 80, "grade": "A", "status": "pass" }
}
```

---

## Questions (Admin)

### Get Questions by Exam
```
GET /questions/:examId
```

### Create Question
```
POST /questions
{
  "exam_id": 1,
  "question": "What is the time complexity of binary search?",
  "option_a": "O(n)",
  "option_b": "O(log n)",
  "option_c": "O(n²)",
  "option_d": "O(1)",
  "correct_answer": "B"
}
```

---

## Results

### All Results (Admin)
```
GET /results?page=1&search=john
```

### Student's Results
```
GET /results/my-results
```

### Leaderboard
```
GET /results/leaderboard
```

### Dashboard Stats
```
GET /dashboard/admin
GET /dashboard/student
```

---

## Reports

### Export Excel (Admin)
```
GET /reports/excel
Response: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

### Download PDF (Student)
```
GET /reports/my-pdf/:examId
Response: application/pdf
```

---

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [{ "field": "email", "message": "Valid email is required" }]
}
```

| Status Code | Description |
|------------|-------------|
| 400 | Validation error or bad request |
| 401 | Unauthorized (invalid/expired token) |
| 403 | Forbidden (insufficient role) |
| 404 | Resource not found |
| 500 | Internal server error |
