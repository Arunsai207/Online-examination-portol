# 🎓 Online Examination and Result Management System

A comprehensive full-stack web application for conducting online examinations, managing student records, and generating performance analytics. Built as a **Final Year B.Tech Computer Science Project**.

![Tech Stack](https://img.shields.io/badge/React-19-blue) ![Node.js](https://img.shields.io/badge/Node.js-20.19%2B%20or%2022.12%2B-green) ![MySQL](https://img.shields.io/badge/MySQL-8.0-orange) ![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Screenshots](#-screenshots)
- [Grade System](#-grade-system)
- [Default Credentials](#-default-credentials)

---

## ✨ Features

### 🤖 Advanced AI Modules (New)
- 📄 **PDF Auto-Extraction**: Upload a PDF of MCQs; AI extracts questions, options, and correct answers automatically.
- 📷 **Biometric Face Registration**: Students must scan and register their face before starting an exam.
- 👁️ **Continuous AI Proctoring**: Live webcam tracking to detect missing faces, multiple persons, or looking away.
- 🚫 **Tab-Switch Detection**: Anti-cheat system that tracks if students navigate away from the exam tab.
- 📈 **Adaptive Difficulty Engine**: Question difficulty scales up or down based on student's live performance.
- 💡 **AI Feedback Generation**: Detailed performance feedback and personalized study insights upon exam completion.

### Admin Module
- 📊 Analytics Dashboard with Charts
- 👥 Student Management (CRUD)
- 📚 Subject Management
- 📝 Exam Management & Scheduling
- ❓ Question Bank Management (MCQ)
- 📈 Results & Performance Reports
- 📥 Export to PDF & Excel

### Student Module
- 🔐 Registration & Authentication
- 📝 Take Timed Online Exams
- ⏱️ Auto-Submit on Timeout
- 📊 Instant Results & Grade
- 📋 Exam History
- 🏆 Leaderboard & Rankings
- 👤 Profile Management

### Security
- 🔑 JWT Authentication
- 🔒 bcrypt Password Hashing
- 🛡️ Role-Based Access Control
- ✅ Input Validation (express-validator)
- 🚫 SQL Injection Prevention
- 🔐 Secure API Responses

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js, React Router, Chart.js, Axios |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL |
| **Auth** | JWT, bcrypt |
| **Reports** | PDFKit, ExcelJS |
| **Build Tool** | Vite |

---

## 📁 Project Structure

```
├── database/
│   └── database.sql          # MySQL schema & seed data
├── backend/
│   ├── config/db.js          # MySQL connection pool
│   ├── controllers/          # Route handlers
│   ├── middleware/            # Auth, validation, error handling
│   ├── models/               # SQL query layer
│   ├── routes/               # API route definitions
│   ├── services/             # Business logic (email, PDF, Excel, grading)
│   ├── utils/                # Helpers & constants
│   ├── app.js                # Express app setup
│   └── server.js             # Entry point
├── frontend/
│   └── src/
│       ├── context/          # Auth & Theme providers
│       ├── hooks/            # Custom React hooks
│       ├── layouts/          # Page layouts
│       ├── pages/            # All page components
│       ├── routes/           # Route configuration
│       ├── services/         # API service layer
│       ├── App.jsx           # Root component
│       └── index.css         # Design system
├── docs/                     # Project documentation
└── README.md
```

---

## 🚀 Installation

### Prerequisites
- **Node.js** v20.19+ or v22.12+ (required by the included Vite 8 toolchain) 
- **MySQL** v8.0+
- **npm** v9+

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd "online examination and result management system"
```

### Step 2: Setup Database
```bash
# Login to MySQL and run the schema
mysql -u root -p < database/database.sql
```

### Step 3: Setup Backend
```bash
cd backend
npm install

# Create your local environment file from the safe template
copy .env.example .env
# Edit .env and enter your own MySQL credentials and a private JWT_SECRET

npm run dev
```

### Step 4: Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### Step 5: Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

---

## 🔑 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@examportal.com | admin123 |
| **Student** | Register via the app | - |

---

## 📊 Grade System

| Percentage | Grade |
|-----------|-------|
| 90 - 100 | A+ |
| 80 - 89 | A |
| 70 - 79 | B |
| 60 - 69 | C |
| Below 60 | F |

**Passing Percentage: 60%**

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Student registration |
| POST | `/api/auth/login` | Login (admin/student) |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/auth/me` | Get current user |

### Students
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students` | List all students |
| GET | `/api/students/:id` | Get student by ID |
| POST | `/api/students` | Create student |
| PUT | `/api/students/:id` | Update student |
| DELETE | `/api/students/:id` | Delete student |

### Subjects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subjects` | List all subjects |
| POST | `/api/subjects` | Create subject |
| PUT | `/api/subjects/:id` | Update subject |
| DELETE | `/api/subjects/:id` | Delete subject |

### Exams
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/exams` | List all exams |
| GET | `/api/exams/available` | Available exams (student) |
| POST | `/api/exams` | Create exam |
| POST | `/api/exams/:id/start` | Start exam (student) |
| POST | `/api/exams/:attemptId/submit` | Submit exam |

### Results & Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/results` | All results |
| GET | `/api/results/my-results` | Student's results |
| GET | `/api/results/leaderboard` | Leaderboard |
| GET | `/api/dashboard/admin` | Admin analytics |
| GET | `/api/reports/excel` | Export Excel |

---

## 📄 License

This project is developed for educational purposes as a B.Tech Final Year Project.

---

## 👨‍💻 Developer

**Online Examination and Result Management System**  
B.Tech Computer Science — Final Year Project  
© 2026


---

## 🔧 Maintenance Notes: Exam Visibility and Leaderboard

### Exam visibility rules

The student available-exams list includes exams whose status is `upcoming` or `active` and whose exam date is today or in the future, provided the configured end time has not passed. This allows students to see an upcoming exam before it opens and allows an administrator to add questions without the exam disappearing from the student list.

The student page displays the current status. The **Start Exam** action is enabled only when:
- The administrator has set the exam status to `active`.
- The exam date has arrived, and the configured start time has arrived (or no start time is configured).
- The configured end time has not passed (or no end time is configured).
- At least one question has been added.
- The student has not already completed the exam.

The backend checks these conditions again when the student attempts to start an exam. The frontend button state is not treated as a security boundary.

### Leaderboard calculation

The leaderboard is calculated from stored `results` joined to their corresponding `exam_attempts` and `students` records. Only results linked to an attempt whose status is `completed` are counted.

- Global leaderboard: students are compared using their average recorded percentage, making exams with different maximum marks comparable.
- Exam-specific leaderboard: pass an `examId` query parameter to rank students for one exam.
- Tied average percentages receive the same dense rank. If duplicate finalized result rows exist for the same student and exam, the most recently saved result is used.
- Display ordering for tied ranks is made stable using exams taken, passes, student name, and student ID.
- The leaderboard returns the student name, rank, average percentage, number of distinct exams taken, and number passed. It does not return student email addresses.

The global average is an average of the student's recorded exam percentages; it is not a weighted average by marks or question count.

### Local configuration and credentials

The archive includes `backend/.env.example`, not a real `.env` file. Copy it to `.env` and enter your own local database password and JWT secret. Do not share `.env` or commit it to source control.

The sample administrator credentials documented above are for the seeded database only. Change the password immediately if you use that account.

### Validation notes

A successful server startup does not by itself prove exam visibility or leaderboard correctness. Verify the end-to-end flow using an administrator, a student, an exam with questions, and finalized result records. See the delivery/test report supplied with the repaired project for the checks that were actually run.
