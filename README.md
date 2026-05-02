# Nenasa LMS
## නැනස LMS – Mobile Learning Management System

A full-stack mobile Learning Management System built with **React**, **Node.js/Express.js**, and **MongoDB**.

### Tech Stack

- **Frontend**: React 18, Vite, React Router, Axios, Tailwind CSS
- **Backend**: Node.js, Express.js, JWT Authentication, bcryptjs for password hashing
- **Database**: MongoDB Atlas (Cloud)
- **File Storage**: Local disk uploads (lessons, exams)

### Features

- **Authentication**: JWT-based login and registration with role-based access control
- **User Roles**: ADMIN, TEACHER, STUDENT, PAYMENT_OFFICER
- **Teachers Management**: Create, update, delete teachers (ADMIN only)
- **Students Management**: Enroll students, manage profiles
- **Classes**: Create and manage tuition classes with schedules
- **Modules**: Create and organize learning modules by subject/grade
- **Lessons**: Upload lesson materials (videos, PDFs, notes) with file handling
- **Exams**: MCQ and essay-based exams with automatic marking, submissions, and grading
- **Payments**: Admission and class fee payments with approval workflow
- **Feedback**: Students can submit anonymous feedback for teachers
- **Analytics**: Teacher performance dashboards with exam statistics
- **Leaderboard**: Daily subject-based student performance rankings
- **Recommendations**: Suggest classes based on subject and grade

### Project Structure

```
nanasa-lms-webpage/
├── frontend/          # React web app
│   ├── src/
│   │   ├── pages/     # Route pages (login, dashboard, etc.)
│   │   ├── components/ # Reusable UI components
│   │   ├── services/  # API and auth context
│   │   └── App.jsx
│   └── package.json
└── backend/           # Node.js + Express API
    ├── src/
    │   ├── server.js  # Main Express app and routes
    │   ├── db.js      # MongoDB and fallback JSON DB adapter
    │   ├── middleware/ # Auth and upload handlers
    │   ├── utils/     # Helper functions
    │   └── config/    # Environment config
    ├── data/          # Local JSON DB (fallback)
    ├── uploads/       # File storage for lessons and exams
    └── package.json
```

### Quick Start

#### Backend Setup

1. Navigate to backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your MongoDB Atlas connection string.

5. Start dev server:
   ```bash
   npm run dev
   ```

Backend runs on `http://localhost:8080`.

#### Frontend Setup

1. Navigate to frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start dev server:
   ```bash
   npm run dev
   ```

Frontend runs on `http://localhost:5173` (Vite default) and proxies API calls to backend.

### Default Login Credentials

- **Admin**: `admin` / `admin123`
- **Teacher**: `teacher` / `teacher123`
- **Student**: `student` / `student123`
- **Payment Officer**: `officer` / `officer123`

### Database

- **Primary**: MongoDB Atlas (production data storage)
- **Fallback**: Local JSON file (`backend/data/db.json`) when Atlas is unavailable

### API Endpoints

Key endpoints are protected with JWT bearer token authentication:

- **Auth**: `/api/auth/login`, `/api/auth/register`
- **Users**: `/api/profile`
- **Teachers**: `/api/teachers`
- **Students**: `/api/students`
- **Classes**: `/api/classes`
- **Modules**: `/api/modules`
- **Lessons**: `/api/lessons`, `/api/lessons/:id/upload/:type`
- **Exams**: `/api/exams`, `/api/exams/:id/submit/mcq`, `/api/exams/:id/submit/essay`
- **Payments**: `/api/payments`, `/api/payments/pending`, `/api/payments/:id/approve`
- **Feedback**: `/api/feedbacks`
- **Analytics**: `/api/analytics/teacher/performance`
- **Leaderboard**: `/api/exams/leaderboard/daily-subject`

### Assignment Requirement

This project fulfills the assignment requirement to build a mobile learning management application using:
-  React (Frontend)
-  Node.js with Express.js (Backend)
-  MongoDB (Database)
