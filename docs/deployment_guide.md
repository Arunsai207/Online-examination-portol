# Deployment Guide

## Online Examination and Result Management System

---

## Option 1: Local Development

Already configured — run `npm run dev` in both backend and frontend directories.

---

## Option 2: Production Deployment

### Backend Deployment (e.g., Railway, Render, DigitalOcean)

#### 1. Prepare for production
```bash
cd backend

# Set environment to production
# Update .env:
NODE_ENV=production
```

#### 2. Deploy to Railway/Render
- Connect your GitHub repository
- Set root directory to `backend`
- Set build command: `npm install`
- Set start command: `node server.js`
- Add environment variables from .env

### Frontend Deployment (e.g., Vercel, Netlify)

#### 1. Build for production
```bash
cd frontend
npm run build
```

#### 2. Deploy to Vercel
```bash
npx -y vercel --prod
```

Or connect GitHub repo to Vercel dashboard:
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

#### 3. Update API URL
Update `frontend/src/services/api.js` baseURL to your backend URL.

### Database Deployment

#### Option A: PlanetScale / Railway MySQL
- Create a MySQL database instance
- Run `database/database.sql` against it
- Update backend `.env` with production credentials

#### Option B: Self-hosted
- Install MySQL on your server
- Secure with strong credentials
- Configure firewall rules

---

## Environment Variables (Production)

```env
NODE_ENV=production
PORT=5000
DB_HOST=your-mysql-host
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-strong-password
DB_NAME=online_exam_system
JWT_SECRET=your-very-long-random-secret-key
FRONTEND_URL=https://your-frontend-domain.com
```

---

## Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT_SECRET (32+ chars)
- [ ] Enable HTTPS
- [ ] Set secure CORS origins
- [ ] Regular database backups
- [ ] Update dependencies regularly
