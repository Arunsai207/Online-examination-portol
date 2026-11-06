# Admin Global Leaderboard Update

## Changes
- Moved the existing leaderboard UI into `frontend/src/pages/admin/Leaderboard.jsx`.
- Added the Admin Panel route `/admin/leaderboard` and sidebar navigation entry.
- Removed the leaderboard route, navigation item, and old page from the Student Panel.
- Restricted `GET /api/results/leaderboard` to authenticated administrators.
- Updated the leaderboard API to return paginated results and search by student name/email.
- Includes every registered student. Students with no completed exams remain visible with no rank/average and zero attempts.
- Ranking uses each student's latest valid completed result per exam, then averages those exam percentages. Existing result data is not modified.

## Notes
- No database migration is required.
- No teacher functionality or unrelated feature changes were added.
- Backend JavaScript syntax checks passed with `node --check`.
- Frontend production build was not run in this environment because frontend dependencies (`node_modules`) are not included in the supplied ZIP. Run `npm install` then `npm run build` inside `frontend` on the development machine to verify the production bundle.
