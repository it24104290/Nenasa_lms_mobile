# Nanasa LMS Node Backend

Node.js + Express backend for the existing React frontend.

## Quick Start

1. Install dependencies:

   npm install

2. Create environment file:

   copy .env.example .env

   Set `MONGODB_URI` in `.env` to your Atlas connection string.
   Replace `YOUR_URL_ENCODED_PASSWORD` with your actual password (URL-encoded if it has special characters).

3. Start development server:

   npm run dev

API runs on `http://localhost:8080` and expects frontend requests on `/api/*`.

## Seed Login Accounts

- Admin: `admin` / `admin123`
- Teacher: `teacher` / `teacher123`
- Student: `student` / `student123`
- Payment Officer: `officer` / `officer123`

## Implemented API Areas

- Auth: login, register
- Users: profile save
- Teachers, students, classes, modules
- Lessons with file uploads
- Exams (MCQ + essay), enrollments, submissions, grading
- Analytics (teacher performance)
- Daily subject leaderboard
- Payments + payment officer approvals
- Feedback and recommendations

## Storage

- MongoDB Atlas is used when `MONGODB_URI` is set.
- If Atlas is not set or fails to connect, backend falls back to local JSON file `data/db.json`.
- Uploaded files remain in `uploads/`.
