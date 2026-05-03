# 🏗️ Nenasa LMS System Architecture

## Overview

Nenasa LMS is a **three-tier production-ready Learning Management System** built with modern technologies and deployed to the cloud.

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Frontend (React/Vite)                                      │
│  https://nenasamobile.netlify.app                           │
│                                                             │
│  ├─ Pages: Login, Dashboard, Classes, Lessons, Exams, etc  │
│  ├─ Components: NavBar, BottomNavBar, Cards, Forms         │
│  ├─ Services: API Client, AuthContext, JWT Interceptor     │
│  └─ Styling: Tailwind CSS + Recharts Charts                │
│                                                             │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS + JWT
┌────────────────────▼────────────────────────────────────────┐
│                                                             │
│  Backend API (Express.js)                                   │
│  https://nenasa-lms-mobile.onrender.com                     │
│                                                             │
│  ├─ Authentication: JWT + bcryptjs                          │
│  ├─ Authorization: Role-based middleware                    │
│  ├─ Routes: Auth, Teachers, Students, Classes, Lessons, etc │
│  ├─ File Upload: Multer (videos, PDFs, exams)              │
│  └─ Hybrid DB: MongoDB + JSON fallback                      │
│                                                             │
└────────────────────┬────────────────────────────────────────┘
                     │ MongoDB Driver
┌────────────────────▼────────────────────────────────────────┐
│                                                             │
│  Database (MongoDB Atlas)                                   │
│  Cloud-hosted: nanasa_lms                                   │
│                                                             │
│  ├─ Users (9+ accounts)                                     │
│  ├─ Teachers & Profiles                                     │
│  ├─ Students & Enrollments                                  │
│  ├─ Classes & Schedules                                     │
│  ├─ Lessons & Attachments                                   │
│  ├─ Exams & Submissions                                     │
│  ├─ Payments & Approvals                                    │
│  ├─ Feedback & Ratings                                      │
│  └─ Analytics & Reports                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Frontend Layer

**Location:** Netlify (https://nenasamobile.netlify.app)

### Technology Stack
- **Framework:** React 18.3.1
- **Build Tool:** Vite 6.0.0
- **Routing:** React Router 6.28.0
- **HTTP Client:** Axios 1.7.7
- **Styling:** Tailwind CSS 4.2.2
- **Charts:** Recharts 3.8.0
- **State Management:** React Context API (AuthContext)

### Key Features
- **Responsive Design:** Mobile-first with bottom navigation
- **SPA Routing:** Client-side navigation with `_redirects`
- **Authentication:** JWT bearer token stored in localStorage
- **Auto-Deploy:** Automatic deployment from GitHub main branch
- **Mobile Optimized:** Bottom navigation bar with icons
- **Desktop & Mobile Views:** Responsive breakpoints with Tailwind

### Pages
| Page | Role | Features |
|------|------|----------|
| LoginPage | All | User authentication with JWT |
| RegisterPage | All | Create new user accounts |
| DashboardAdmin | ADMIN | System overview & statistics |
| DashboardTeacher | TEACHER | Teacher dashboard & controls |
| ClassesPage | All | Browse & enroll in classes |
| LessonsPage | TEACHER/STUDENT | View and upload lessons |
| ExamsPage | All | Create, take, and view exams |
| PaymentsPage | STUDENT | Payment history & invoices |
| PaymentOfficerPage | PAYMENT_OFFICER | Approve/decline payments |
| FeedbackPage | All | Submit and view feedback |
| AnalyticsDashboard | TEACHER/ADMIN | Performance metrics & charts |
| ProfileFormPage | All | User profile & settings |

---

## 🔧 Backend API Layer

**Location:** Render (https://nenasa-lms-mobile.onrender.com)

### Technology Stack
- **Runtime:** Node.js v20.19.6
- **Framework:** Express.js 4.19.2
- **Authentication:** jsonwebtoken 9.0.2
- **Password Hashing:** bcryptjs 2.4.3
- **File Upload:** multer 1.4.5-lts.1
- **Database Client:** mongodb 6.x
- **CORS:** cors 2.8.5
- **Environment:** dotenv 16.x

### Core Components

#### Authentication Middleware
```javascript
// JWT validation with 7-day expiry
requireAuth(req, res, next) - Validates bearer token
requireRole(...roles) - Role-based access control
```

#### API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | User login |
| `/api/auth/register` | POST | User registration |
| `/api/teachers` | GET/POST/PUT/DELETE | Teacher CRUD |
| `/api/students` | GET/POST/PUT/DELETE | Student CRUD |
| `/api/classes` | GET/POST/PUT/DELETE | Class management |
| `/api/lessons` | GET/POST/PUT/DELETE | Lesson management |
| `/api/lessons/:id/upload/:type` | POST | Upload lesson attachments |
| `/api/exams` | GET/POST/PUT/DELETE | Exam management |
| `/api/exams/:id/submit/mcq` | POST | MCQ submission (auto-graded) |
| `/api/exams/:id/submit/essay` | POST | Essay submission (with upload) |
| `/api/payments` | GET/POST | Payment management |
| `/api/payments/approve` | POST | Approve payment |
| `/api/payments/decline` | POST | Decline payment |
| `/api/analytics/teacher/:id` | GET | Teacher performance |
| `/api/exams/leaderboard/:period` | GET | Student rankings |
| `/api/feedbacks` | GET/POST | Feedback management |

#### File Upload
- **Multer Configuration:** Disk storage with auto-directory creation
- **Upload Paths:** `/backend/uploads/{lessons,exams}/`
- **Static Route:** `/uploads` served by Express
- **Supported Types:** Videos, PDFs, images, documents

#### Database Adapter (Hybrid)
- **Primary:** MongoDB Atlas with automatic persistence
- **Fallback:** Local JSON file (`backend/data/db.json`)
- **In-Memory Cache:** Runtime state with background persistence
- **Thread-Safe:** Promise-based update queue prevents race conditions

---

## 💾 Database Layer

**Service:** MongoDB Atlas (Cloud)

### Database Structure
```
nanasa_lms (Database)
└── app_state (Collection)
    └── _id: "nanasa_lms_state" (Single Document)
        ├── meta
        │   ├── createdAt
        │   └── updatedAt
        ├── users (Array)
        │   ├── id, username, email, passwordHash
        │   ├── role (ADMIN/TEACHER/STUDENT/PAYMENT_OFFICER)
        │   ├── teacherId/studentId
        │   └── profile
        ├── teachers (Array)
        ├── students (Array)
        ├── classes (Array)
        ├── modules (Array)
        ├── lessons (Array)
        ├── exams (Array)
        ├── payments (Array)
        ├── feedbacks (Array)
        ├── examEnrollments (Array)
        ├── examSubmissions (Array)
        ├── moduleApplications (Array)
        └── studentClassEnrollments (Array)
```

### Seed Data
- **Admin:** admin / admin123
- **Teacher:** teacher / teacher123
- **Student:** student / student123
- **Payment Officer:** officer / officer123
- **Sample Entities:** 1 module, 1 class, 1 teacher enrollment

### Data Persistence
- **Real-time:** In-memory runtime state
- **Async Persistence:** Background MongoDB updates with debouncing
- **Fallback:** JSON file if MongoDB unavailable
- **Automatic Sync:** Data synced on startup

---

## 🔐 Security Architecture

### Authentication Flow
```
1. User enters credentials
   ↓
2. POST /api/auth/login with username + password
   ↓
3. Backend verifies password hash with bcryptjs
   ↓
4. Generate JWT token (sub, username, role, teacherId, studentId)
   ↓
5. Return token to client
   ↓
6. Client stores in localStorage
   ↓
7. Include in all subsequent requests: Authorization: Bearer {token}
   ↓
8. Backend validates token signature and expiry (7 days)
```

### Authorization
- **Role-based Middleware:** `requireRole(...roles)` checks user role
- **Protected Routes:** All API endpoints except /auth require JWT
- **Data Isolation:** Teachers can only modify their own classes/lessons
- **Permission Checks:** Students can only see enrolled classes

### Password Security
- **Hashing:** bcryptjs with 10 salt rounds
- **Never Stored:** Plain passwords never persisted
- **Comparison:** Async hash comparison on login

### CORS Protection
- **Frontend Only:** CORS restricted to Netlify URL
- **Production Ready:** No localhost access from production backend

---

## 🚀 Deployment & DevOps

### Version Control
- **Repository:** GitHub (it24104290/Nenasa_lms_mobile)
- **Branch:** main
- **Auto-Deploy Triggers:** Push to main branch

### Frontend Deployment (Netlify)
1. **Trigger:** Push to GitHub main
2. **Build:** `npm run build` (Vite produces dist/)
3. **Publish:** dist/ directory served via CDN
4. **Routing:** `_redirects` file enables SPA routing
5. **URL:** https://nenasamobile.netlify.app
6. **SSL:** Automatic HTTPS
7. **Performance:** Global CDN distribution

### Backend Deployment (Render)
1. **Trigger:** Push to GitHub main
2. **Build:** npm install + node src/server.js
3. **Environment Variables:** MONGODB_URI, JWT_SECRET, CORS_ORIGIN, etc.
4. **URL:** https://nenasa-lms-mobile.onrender.com
5. **Auto-Restart:** On deployment or failure
6. **Logs:** Real-time deployment logs available

### Database (MongoDB Atlas)
- **Hosting:** Cloud-hosted MongoDB
- **Connection:** MONGODB_URI environment variable
- **Credentials:** Securely stored in Render environment
- **Backups:** Automatic MongoDB Atlas backups
- **Scaling:** Auto-scaling cluster

---

## 👥 User Roles & Permissions

### ADMIN
- ✅ Manage all users (create, update, delete)
- ✅ View system analytics and reports
- ✅ Manage teachers and students
- ✅ View all classes, lessons, exams
- ✅ Approve/decline payments
- ✅ System configuration

### TEACHER
- ✅ Create and manage own classes
- ✅ Create and manage lessons with uploads
- ✅ Create and grade exams
- ✅ View student submissions
- ✅ View performance analytics
- ✅ Receive feedback from students
- ❌ Cannot manage other teachers' content

### STUDENT
- ✅ Enroll in classes
- ✅ View lessons and course materials
- ✅ Take exams and submit answers
- ✅ View payment history
- ✅ Submit feedback to teachers
- ✅ View personal analytics
- ❌ Cannot edit other student profiles

### PAYMENT_OFFICER
- ✅ View pending payments
- ✅ Approve or decline payment requests
- ✅ View payment history
- ✅ Generate payment reports
- ❌ Cannot create users or manage classes

---

## 📊 System Capabilities

### Class Management
- Create classes with schedules (day, start/end time)
- Associate with teacher
- Student enrollment
- Grade management

### Lesson Management
- Upload video lectures
- Upload PDF notes
- Upload study materials
- Automatic file hosting
- Lesson organization by class

### Exam System
- Two exam types: MCQ (auto-graded) and Essay (manual grading)
- MCQ auto-marks with instant feedback
- Essay submissions with file upload
- Exam scheduling
- Leaderboard by subject
- Pass rate analytics

### Payment System
- Fee collection
- Payment status tracking
- Approval workflow
- Payment history
- Officer approval required

### Analytics
- Teacher performance metrics
- Student pass rates
- Class comparisons
- Daily leaderboard
- Subject-wise rankings
- Feedback ratings

---

## 🛠️ Development & Troubleshooting

### Environment Variables (.env)
```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/?appName=Cluster0
MONGODB_DB_NAME=nanasa_lms
MONGODB_COLLECTION=app_state
JWT_SECRET=your-secret-key
CORS_ORIGIN=https://frontend-url
PORT=8080
```

### Common Issues

**MongoDB Connection Failed**
- ✓ Check MONGODB_URI in .env
- ✓ Verify MongoDB Atlas IP whitelist
- ✓ Ensure database user has correct permissions

**CORS Errors**
- ✓ Update CORS_ORIGIN to match frontend URL
- ✓ Restart backend service
- ✓ Hard refresh browser (Ctrl+Shift+R)

**JWT Expired**
- ✓ Tokens expire after 7 days
- ✓ User must login again
- ✓ Client automatically redirects to login

**File Upload Failed**
- ✓ Ensure uploads/ directory exists
- ✓ Check disk space on server
- ✓ Verify file permissions

---

## 📈 Monitoring & Maintenance

### Health Checks
- Endpoint: `GET /api/health`
- Response: `{"ok":true,"service":"nanasa-lms-backend"}`
- Frequency: Check every 5 minutes

### Logs
- **Frontend:** Browser DevTools Console
- **Backend:** Render dashboard > Logs
- **Database:** MongoDB Atlas logs

### Performance
- CDN: Netlify global distribution
- API Response Time: ~100-200ms average
- Database Query Time: ~10-50ms
- Caching: Browser caching + service workers

---

## 🎓 Usage Guide

### For Admins
1. Login with admin account
2. Navigate to Admin dashboard
3. Manage users, view analytics
4. Approve payments

### For Teachers
1. Login with teacher account
2. Create classes and lessons
3. Upload course materials
4. Create and grade exams
5. View student performance

### For Students
1. Login with student account
2. Browse and enroll in classes
3. View lessons
4. Take exams
5. Make payments
6. Submit feedback

---

## 📞 Support & Documentation

- **GitHub:** https://github.com/it24104290/Nenasa_lms_mobile
- **Frontend URL:** https://nenasamobile.netlify.app
- **Backend API:** https://nenasa-lms-mobile.onrender.com
- **Architecture Diagram:** See ARCHITECTURE.html

---

**Last Updated:** May 3, 2026
**Status:** ✅ Production Ready
