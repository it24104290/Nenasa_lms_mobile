## නැනස LMS – Full Stack Setup

This project is a simple full-stack Learning Management System (LMS) with:

- **Backend**: Spring Boot, Spring Security (JWT), Spring Data JPA, MySQL
- **Frontend**: React, Vite, React Router, Axios, Material UI

Roles: **ADMIN**, **TEACHER**, **STUDENT**.

---

## 1. Backend – Spring Boot

### 1.1. Prerequisites

- JDK 17+
- Maven
- MySQL running locally

### 1.2. Configure database

Edit `backend/src/main/resources/application.properties`:

- Set `spring.datasource.username` and `spring.datasource.password` for your MySQL.
- Optionally change the DB name in `spring.datasource.url`.

Spring will auto-create/update tables because `spring.jpa.hibernate.ddl-auto=update`.

### 1.3. Run the backend

In a terminal:

```bash
cd backend
mvn spring-boot:run
```

Backend will start on `http://localhost:8080`.

### 1.4. Main APIs

- `POST /api/auth/register` – register user (defaults to STUDENT role).
- `POST /api/auth/login` – returns JWT token, username, role.
- CRUD:
  - `/api/students`
  - `/api/teachers`
  - `/api/classes`
  - `/api/lessons`
  - `/api/exams` (with MCQ questions and submission)
  - `/api/payments`
- Admin reports:
  - `GET /api/admin/reports/summary`

All secured endpoints require `Authorization: Bearer <token>`.

---

## 2. Frontend – React (Vite + MUI)

### 2.1. Prerequisites

- Node.js 18+ and npm (or yarn/pnpm)

### 2.2. Install dependencies

```bash
cd frontend
npm install
```

### 2.3. Run the frontend

```bash
npm run dev
```

Frontend will run on `http://localhost:3000`.

Make sure the backend (port 8080) is already running; the frontend talks to it at `http://localhost:8080/api`.

---

## 3. Using the App

1. **Register a user** using `POST /api/auth/register` (or add directly in DB) and assign roles as needed.
2. **Login** through the UI at `http://localhost:3000/login`.
3. After login:
   - **Student**: default home dashboard, can view classes, lessons, exams, and payments.
   - **Teacher**: visit `/teacher` to see teacher dashboard, manage classes/lessons/exams.
   - **Admin**: visit `/admin` to see admin dashboard, manage students, teachers, classes, payments, and view summary report.

The UI provides simple CRUD screens for:

- **Students** – `/admin/students`
- **Teachers** – `/admin/teachers`
- **Classes** – `/classes`
- **Lessons** – `/lessons`
- **Exams** – `/exams`
- **Payments** – `/payments`

---

## 4. Basic Testing

- **Backend tests** (if you add JUnit tests later):

```bash
cd backend
mvn test
```

- **Manual end-to-end testing**:
  1. Start MySQL.
  2. Run backend with `mvn spring-boot:run`.
  3. Run frontend with `npm run dev`.
  4. Register + login, then:
     - Create teachers, students, and classes.
     - Upload lessons for classes.
     - Create exams for classes.
     - Record payments for students.
     - As admin, open the admin dashboard to verify counts and totals.

