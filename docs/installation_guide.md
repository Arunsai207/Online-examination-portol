# Installation Guide

## Online Examination and Result Management System

### System Requirements

| Component | Minimum Version |
|-----------|----------------|
| Node.js | v18.0+ |
| MySQL | v8.0+ |
| npm | v9.0+ |
| Browser | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ |
| RAM | 4 GB |
| Disk Space | 500 MB |

---

### Step 1: Install Prerequisites

#### Node.js
Download and install from [https://nodejs.org](https://nodejs.org) (LTS version recommended)

```bash
# Verify installation
node --version
npm --version
```

#### MySQL
Download and install from [https://dev.mysql.com/downloads/](https://dev.mysql.com/downloads/)

```bash
# Verify installation
mysql --version
```

---

### Step 2: Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Run the database script
source database/database.sql;

# Verify
USE online_exam_system;
SHOW TABLES;
```

This will create:
- Database: `online_exam_system`
- 9 tables with foreign keys and indexes
- Default admin account
- Sample subjects and exams with questions

---

### Step 3: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment
# Edit .env file with your MySQL credentials:
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=online_exam_system

# Start development server
npm run dev
```

Backend will start on **http://localhost:5000**

---

### Step 4: Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will start on **http://localhost:5173**

---

### Step 5: Verify Installation

1. Open **http://localhost:5173** in your browser
2. Click "Login" and select "Admin" tab
3. Login with: `admin@examportal.com` / `admin123`
4. You should see the Admin Dashboard

---

### Troubleshooting

| Issue | Solution |
|-------|----------|
| MySQL connection refused | Ensure MySQL service is running |
| Port 5000 in use | Change PORT in backend/.env |
| CORS error | Ensure FRONTEND_URL in .env matches frontend URL |
| Module not found | Run `npm install` in both backend and frontend |
