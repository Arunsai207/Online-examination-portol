# Viva Questions and Answers

## Online Examination and Result Management System

---

### 1. What is the objective of your project?
**Answer:** The objective is to develop a secure, responsive, and professional Online Examination and Result Management System where administrators can create and manage exams, questions, students, and results, while students can register, take exams online, and view their results instantly. It automates the traditional examination process, reducing manual effort and enabling real-time result generation.

### 2. What technology stack have you used?
**Answer:** 
- **Frontend:** React.js with Vite as the build tool, React Router DOM for routing, Axios for HTTP requests, Chart.js for data visualization
- **Backend:** Node.js with Express.js framework
- **Database:** MySQL with mysql2 driver and connection pooling
- **Authentication:** JWT (JSON Web Tokens) for stateless auth, bcrypt for password hashing
- **Additional:** PDFKit for PDF generation, ExcelJS for Excel export, Nodemailer for email notifications

### 3. Why did you choose React.js for the frontend?
**Answer:** React.js was chosen because: (1) Component-based architecture enables reusable UI components, (2) Virtual DOM provides efficient rendering, (3) Large ecosystem with libraries like React Router, Chart.js integration, (4) State management with Context API, (5) Strong community support and industry adoption.

### 4. How does JWT authentication work in your system?
**Answer:** When a user logs in with valid credentials, the server generates a JWT token containing the user's ID, email, and role. This token is sent to the client and stored in localStorage. For subsequent API requests, the token is attached as a Bearer token in the Authorization header. The auth middleware on the server verifies this token before granting access. Tokens expire after 24 hours.

### 5. How do you handle role-based access control?
**Answer:** We have two roles: Admin and Student. The role is embedded in the JWT payload during login. A `roleCheck` middleware verifies the user's role against the required role for each route. Protected routes on the frontend use `AdminRoute` and `StudentRoute` wrapper components that check the user's role before rendering.

### 6. How is the examination engine designed?
**Answer:** 
1. Student clicks "Start Exam" → API creates an exam_attempt record
2. Questions are fetched with randomized order (ORDER BY RAND()) — **correct answers are never sent to the client**
3. A countdown timer starts on the frontend using a custom `useTimer` hook
4. Student navigates through one question per page, selecting answers stored in local state
5. On submit (or auto-submit on timeout), answers are bulk-inserted into the database
6. Server compares answers with correct answers, calculates score, percentage, grade, and pass/fail status
7. Result is stored and returned to the student

### 7. How do you prevent cheating in exams?
**Answer:** Several measures: (1) Correct answers are never sent to the frontend, (2) Questions are randomized on the server, (3) Multiple attempts are prevented by checking the exam_attempts table, (4) Timer is enforced — auto-submit on timeout, (5) Server validates the attempt belongs to the authenticated student.

### 8. Explain the grading system.
**Answer:** Grade is calculated based on percentage: A+ (90-100%), A (80-89%), B (70-79%), C (60-69%), F (below 60%). The passing threshold is 60%. The `gradeService` module handles all grade calculations centrally.

### 9. How is the database designed?
**Answer:** The MySQL database has 9 tables: admin, students, subjects, exams, questions, exam_attempts, answers, results, and password_resets. Foreign keys ensure referential integrity (e.g., exams reference subjects, questions reference exams). Indexes are created on frequently queried columns for performance.

### 10. What is the MVC architecture pattern used in the backend?
**Answer:** 
- **Model:** SQL query layer (e.g., Student.js, Exam.js) — encapsulates database operations
- **View:** React.js frontend (separated as a SPA)
- **Controller:** Request handlers (e.g., examController.js) — receives requests, calls models, returns responses
- Additionally, we have a Services layer for business logic (grading, PDF, email) and Middleware for cross-cutting concerns (auth, validation, error handling).

### 11. How do you handle SQL injection?
**Answer:** We use parameterized queries with mysql2's `execute()` method. All user inputs are passed as parameters (?) rather than concatenated into SQL strings. This prevents SQL injection attacks at the database driver level.

### 12. How is the PDF report generated?
**Answer:** We use the PDFKit library to generate result certificates. The `pdfService.js` creates a styled PDF document with student details, exam information, score, grade, and a grading scale legend. The PDF is streamed directly to the HTTP response.

### 13. How do you handle errors in the application?
**Answer:** Centralized error handling: (1) Each controller wraps logic in try-catch and calls `next(error)`, (2) A global `errorHandler` middleware catches all errors, logs them, and sends formatted JSON responses, (3) A `notFoundHandler` catches 404 routes, (4) Frontend uses axios interceptors to handle API errors and show toast notifications.

### 14. What is CORS and why is it needed?
**Answer:** CORS (Cross-Origin Resource Sharing) is needed because the frontend (port 5173) and backend (port 5000) run on different origins. The `cors` middleware is configured to allow requests from the frontend origin, with credentials enabled for cookie/token handling.

### 15. How do you implement dark mode?
**Answer:** Dark mode uses CSS custom properties (variables) with a `data-theme` attribute on the HTML element. The `ThemeContext` provider manages the theme state and persists it in localStorage. Toggling the theme changes CSS variables globally (backgrounds, text colors, borders), affecting all components instantly.

### 16. What are the advantages of using connection pooling for MySQL?
**Answer:** Connection pooling reuses database connections instead of creating new ones for each query. This reduces connection overhead, improves response times, handles concurrent requests efficiently, and prevents connection exhaustion under load. We configure it with `connectionLimit: 10`.

### 17. How does the leaderboard work?
**Answer:** The leaderboard queries the results table, groups by student, calculates average percentage across all exams, and orders by average score descending. It shows the top 20 students with their average score, exams taken, and pass count.

### 18. What security measures have you implemented?
**Answer:** (1) JWT authentication with expiry, (2) bcrypt password hashing (salt rounds: 10), (3) Helmet middleware for HTTP security headers, (4) CORS restriction, (5) Input validation with express-validator, (6) Parameterized SQL queries, (7) Role-based access control, (8) XSS prevention via input sanitization.

### 19. What challenges did you face during development?
**Answer:** Key challenges included: (1) Designing the exam engine to handle timer synchronization between client and server, (2) Preventing race conditions in concurrent exam submissions, (3) Building an efficient grading algorithm, (4) Creating a responsive UI that works well on mobile for exam-taking, (5) Implementing secure authentication flow.

### 20. What future enhancements can be made?
**Answer:** (1) Real-time proctoring with webcam monitoring, (2) Support for different question types (fill-in-the-blank, essay), (3) AI-based question generation, (4) WebSocket for real-time notifications, (5) Multi-language support, (6) Advanced analytics with ML-based predictions, (7) Mobile app using React Native, (8) Integration with LMS platforms.
