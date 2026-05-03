================================================================================
                      NENASA LMS MOBILE - PROJECT README
================================================================================

01). GITHUB REPOSITORY LINK
================================================================================
GitHub Repository: https://github.com/it24104290/Nenasa_lms_mobile


02). TEAM DETAILS
================================================================================
Group Number: [Your Group Number Here]

Member 1: IT24104290 – Dananjaya – Full Stack Development
Member 2: [IT Number] – [Name] – [Module/Role]
Member 3: [IT Number] – [Name] – [Module/Role]
Member 4: [IT Number] – [Name] – [Module/Role]
Member 5: [IT Number] – [Name] – [Module/Role]
Member 6: [IT Number] – [Name] – [Module/Role]


03). DEPLOYMENT DETAILS
================================================================================
Frontend URL:  https://nenasamobile.netlify.app
Backend URL:   https://nenasa-lms-mobile.onrender.com
Database:      MongoDB Atlas (Cloud)


04). SYSTEM OVERVIEW
================================================================================
Nenasa LMS is a comprehensive Learning Management System built with modern 
web technologies. It provides features for teachers, students, administrators, 
and payment officers to manage education and learning processes efficiently.

Tech Stack:
- Frontend:  React 18.3.1 with Vite 6.0.0, Tailwind CSS, Recharts
- Backend:   Node.js 20.19.6 with Express.js 4.19.2
- Database:  MongoDB Atlas (Cloud-hosted)
- Auth:      JWT with bcryptjs password hashing


05). FEATURES
================================================================================
✓ User Authentication & Authorization (4 roles: Admin, Teacher, Student, Officer)
✓ Class Management & Enrollment
✓ Lesson Management with File Uploads (Videos, PDFs, Notes)
✓ Exam System (MCQ with Auto-grading, Essay Submissions)
✓ Payment Management & Approval Workflow
✓ Student Analytics & Performance Metrics
✓ Teacher Dashboards & Leaderboards
✓ Feedback & Rating System
✓ Responsive Mobile & Desktop UI
✓ Real-time Data Persistence


06). DEFAULT TEST CREDENTIALS
================================================================================
Admin Account:
  Username: admin
  Password: admin123

Teacher Account:
  Username: teacher
  Password: teacher123

Student Account:
  Username: student
  Password: student123

Payment Officer Account:
  Username: officer
  Password: officer123


07). PROJECT STRUCTURE
================================================================================
nenasa_lms_mobile/
├── frontend/                          # React Frontend Application
│   ├── src/
│   │   ├── pages/                     # Page components
│   │   ├── components/                # Reusable components
│   │   ├── services/                  # API client & context
│   │   ├── App.jsx                    # Main app wrapper
│   │   └── main.jsx                   # Entry point
│   ├── package.json                   # Frontend dependencies
│   └── vite.config.mjs                # Vite configuration
│
├── backend/                           # Node.js Express Backend
│   ├── src/
│   │   ├── server.js                  # Main API server
│   │   ├── db.js                      # Database adapter
│   │   ├── middleware/                # Authentication & uploads
│   │   ├── utils/                     # Helper functions
│   │   └── uploads/                   # File storage
│   ├── package.json                   # Backend dependencies
│   └── .env                           # Environment variables
│
├── ARCHITECTURE.html                  # System architecture diagram (PDF export)
├── DATABASE_SCHEMA.html               # Database ER diagram (PDF export)
├── API_ENDPOINTS.html                 # Complete API reference (PDF export)
├── ARCHITECTURE.md                    # Detailed architecture documentation
└── README.md                          # Full project documentation


08). QUICK START GUIDE
================================================================================

LOCAL DEVELOPMENT:

1. Clone Repository:
   git clone https://github.com/it24104290/Nenasa_lms_mobile.git
   cd "nenasa_lms_mobile"

2. Backend Setup:
   cd backend
   npm install
   npm run dev
   (Runs on http://localhost:8080)

3. Frontend Setup (New Terminal):
   cd frontend
   npm install
   npm run dev
   (Runs on http://localhost:5173)

4. Access Application:
   Open http://localhost:5173 in your browser
   Login with credentials from section 06

PRODUCTION ACCESS:

1. Frontend:  https://nenasamobile.netlify.app
2. Backend:   https://nenasa-lms-mobile.onrender.com
3. Health Check: https://nenasa-lms-mobile.onrender.com/api/health


09). DOCUMENTATION REFERENCES
================================================================================

System Architecture:
  Open: ARCHITECTURE.html → Click "Print to PDF" button

Database Schema:
  Open: DATABASE_SCHEMA.html → Click "Print to PDF" button

API Endpoints:
  Open: API_ENDPOINTS.html → Click "Print to PDF" button

Full Documentation:
  Read: ARCHITECTURE.md (Markdown format)
  Read: README.md (Project README)


10). KEY ENDPOINTS
================================================================================

Authentication:
  POST   /api/auth/login              - User login
  POST   /api/auth/register           - Create account
  GET    /api/health                  - Server health check

Classes:
  GET    /api/classes                 - Get all classes
  POST   /api/classes                 - Create class (Teacher)
  POST   /api/classes/:id/enroll      - Enroll in class (Student)

Lessons:
  GET    /api/lessons                 - Get all lessons
  POST   /api/lessons                 - Create lesson (Teacher)
  POST   /api/lessons/:id/upload/:type - Upload attachment (Teacher)

Exams:
  GET    /api/exams                   - Get all exams
  POST   /api/exams                   - Create exam (Teacher)
  POST   /api/exams/:id/submit/mcq    - Submit MCQ (Student)
  POST   /api/exams/:id/submit/essay  - Submit essay (Student)

Payments:
  GET    /api/payments                - Get payments
  POST   /api/payments/approve        - Approve payment (Officer)
  POST   /api/payments/decline        - Decline payment (Officer)

Analytics:
  GET    /api/analytics/teacher/:id   - Teacher performance
  GET    /api/analytics/admin         - Admin dashboard


11). DEPLOYMENT INFORMATION
================================================================================

Continuous Integration/Deployment:
- Frontend: Automated deployment to Netlify on push to main branch
- Backend:  Automated deployment to Render on push to main branch

Environment Variables (Backend):
- MONGODB_URI          - MongoDB connection string
- MONGODB_DB_NAME      - Database name (nanasa_lms)
- MONGODB_COLLECTION   - Collection name (app_state)
- JWT_SECRET           - Secret key for JWT signing
- CORS_ORIGIN          - Allowed frontend URL
- PORT                 - Server port (set by Render)

Build Commands:
- Frontend: npm run build (produces dist/)
- Backend:  npm install && node src/server.js


12). ROLES & PERMISSIONS
================================================================================

ADMIN:
  • Manage all users
  • View system analytics
  • Manage teachers and students
  • Approve/decline payments
  • System configuration

TEACHER:
  • Create and manage classes
  • Upload lessons with attachments
  • Create and grade exams
  • View student submissions
  • View performance analytics

STUDENT:
  • Enroll in classes
  • View lessons and materials
  • Take exams
  • Submit payments
  • View analytics
  • Submit feedback

PAYMENT_OFFICER:
  • View pending payments
  • Approve/decline payments
  • View payment history
  • Generate reports


13). TROUBLESHOOTING
================================================================================

Frontend Issues:
  Q: "Cannot connect to backend" error
  A: Check CORS_ORIGIN in backend environment variables
     Ensure backend URL matches in frontend/src/services/api.js

  Q: "404 on direct URL access" (e.g., /login)
  A: Ensure frontend/public/_redirects file exists with: /* /index.html 200

  Q: "Login page stuck loading"
  A: Check browser console for API errors
     Verify backend is running and accessible

Backend Issues:
  Q: "MongoDB connection failed"
  A: Check MONGODB_URI in .env is correct
     Verify MongoDB Atlas IP whitelist includes Render IP

  Q: "Storage engine: file instead of mongodb"
  A: Verify MONGODB_URI environment variable is set correctly
     Check variable name (should be MONGODB_URI, not MONGO_URI)

  Q: "JWT token expired"
  A: Tokens expire after 7 days
     User needs to login again to get new token


14). SUPPORT & CONTACT
================================================================================

GitHub Issues:
  Report bugs and request features at:
  https://github.com/it24104290/Nenasa_lms_mobile/issues

Project Links:
  Frontend:  https://nenasamobile.netlify.app
  Backend:   https://nenasa-lms-mobile.onrender.com
  GitHub:    https://github.com/it24104290/Nenasa_lms_mobile


15). PROJECT STATUS
================================================================================
Status:        ✅ PRODUCTION READY
Last Updated:  May 3, 2026
Version:       1.0.0
License:       MIT


================================================================================
For detailed technical documentation, please refer to:
  • ARCHITECTURE.html (Visual diagrams)
  • DATABASE_SCHEMA.html (ER diagrams)
  • API_ENDPOINTS.html (Complete API reference)
  • ARCHITECTURE.md (Markdown documentation)
================================================================================
