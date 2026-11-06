# Final Repair and Verification Report

## Repairs included

The project was repaired in place while retaining its React/Vite frontend, Express backend, MySQL schema, existing routes, and page structure.

1. **Student exam visibility**
   - Upcoming and active exams scheduled for today or later are returned to students while their end time has not passed.
   - Exams remain visible while questions are being added.
   - The API calculates `can_start`; starting is enabled only for an active exam inside its configured time window with at least one question.
   - The backend repeats the check when the student starts the exam.

2. **Imported exam scheduling**
   - The PDF/import publish flow now passes `start_time`, `end_time`, and `is_adaptive` to the exam model so these values are saved.

3. **Leaderboard**
   - Leaderboard results are restricted to valid result rows linked to matching completed attempts.
   - The latest result per student/exam is used to avoid duplicate counting.
   - Ranking uses average percentage and SQL `DENSE_RANK`, so ties share a rank.
   - Stable tie ordering is applied and student email is not selected for the leaderboard response.

## Validation actually performed for this delivery

| Check | Result |
|---|---|
| Node.js syntax check for all 43 backend JavaScript files (`node --check`) | Passed |
| Frontend production build | Not completed: dependency installation timed out in this environment and Vite was not available afterward |
| MySQL integration tests | Not run; no project MySQL server/database was available in this environment |
| Full browser/admin/student workflow | Must be verified locally using your MySQL database |

Do not interpret static syntax validation as proof that the database-backed workflows have been integration-tested.

## Important configuration

- The real `backend/.env` file is intentionally not included.
- Copy `backend/.env.example` to `backend/.env` and enter your own MySQL settings and a strong private JWT secret.
- Do not share or upload your `.env` file.
- No database reset or destructive migration is included. Keep your existing database and records.

## Windows CMD setup

Open two CMD windows from the extracted project folder.

**Window 1 — backend**
```cmd
cd backend
copy .env.example .env
notepad .env
npm install
npm start
```

Edit `.env` with the database credentials for your existing `online_exam_system` database before starting the backend.

**Window 2 — frontend**
```cmd
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

Backend health check: `http://localhost:5000/api/health`

## Local acceptance checks

1. Sign in as an administrator.
2. Create or select a subject and create an exam with a current/future date.
3. Confirm the exam appears in the student's Available Exams list before it opens.
4. Add at least one question and activate the exam.
5. Confirm the student can start only when the date/time window is valid.
6. Complete an exam and confirm the result is saved.
7. Confirm the leaderboard shows the completed student with a backend-calculated rank.

If any step fails, share the exact error message and relevant source file (never `.env` or passwords).
