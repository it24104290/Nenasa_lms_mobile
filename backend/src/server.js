const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { initDb, readDb, updateDb } = require('./db');
const { requireAuth, requireRole, JWT_SECRET } = require('./middleware/auth');
const { createUploader } = require('./middleware/upload');
const { id, nowIso, normalizeRole, safeNumber } = require('./utils/helpers');

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 8080);
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

const lessonUpload = createUploader('lessons');
const examUpload = createUploader('exams');

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

function pickUserForAuth(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    teacherId: user.teacherId || null,
    studentId: user.studentId || null,
  };
}

function createToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      username: user.username,
      role: user.role,
      teacherId: user.teacherId || null,
      studentId: user.studentId || null,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function getCurrentUser(req, db) {
  return db.users.find((u) => u.id === req.user.sub) || null;
}

function attachTeacher(classItem, db) {
  const teacher = db.teachers.find((t) => t.id === classItem.teacherId) || null;
  return {
    ...classItem,
    teacher: teacher ? { ...teacher } : null,
  };
}

function attachLesson(lesson, db) {
  const tuitionClass = db.classes.find((c) => c.id === lesson.classId) || null;
  return {
    ...lesson,
    tuitionClass,
  };
}

function attachFeedback(feedback, db) {
  const teacher = db.teachers.find((t) => t.id === feedback.teacherId) || null;
  const module = db.modules.find((m) => m.id === feedback.moduleId) || null;
  const student = feedback.studentId ? db.students.find((s) => s.id === feedback.studentId) || null : null;
  return {
    ...feedback,
    teacher,
    module,
    student: feedback.isAnonymous ? null : student,
  };
}

function attachPayment(payment, db) {
  const student = payment.studentId ? db.students.find((s) => s.id === payment.studentId) || null : null;
  const tuitionClass = payment.classId ? db.classes.find((c) => c.id === payment.classId) || null : null;
  return {
    ...payment,
    student,
    tuitionClass,
  };
}

function attachExam(exam, db) {
  const teacher = db.teachers.find((t) => t.id === exam.teacherId) || null;
  const module = db.modules.find((m) => m.id === exam.moduleId) || null;
  const tuitionClass = db.classes.find((c) => c.id === exam.classId) || null;
  return {
    ...exam,
    teacher,
    module,
    tuitionClass,
  };
}

function isExamWindowOpen(exam) {
  const now = Date.now();
  const start = new Date(exam.scheduledAt || 0).getTime();
  const end = new Date(exam.endAt || 0).getTime();
  if (!start || !end || Number.isNaN(start) || Number.isNaN(end)) return false;
  return now >= start && now < end;
}

function getExamSubmissionStatus(examId, studentId, db) {
  const exam = db.exams.find((e) => e.id === examId);
  if (!exam) return null;

  const enrolled = db.examEnrollments.some((x) => x.examId === examId && x.studentId === studentId);
  const submissions = db.examSubmissions
    .filter((s) => s.examId === examId && s.studentId === studentId)
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  const latest = submissions[0] || null;
  const canSubmit = Boolean(exam.active) && enrolled && isExamWindowOpen(exam);

  return {
    enrolled,
    canSubmit,
    attemptCount: submissions.length,
    latestSubmissionType: latest?.submissionType || null,
    latestScore: latest?.score ?? null,
    latestTotalMarks: latest?.totalMarks ?? null,
    latestEssayAnswerUrl: latest?.essayAnswerUrl || null,
  };
}

function getTeacherIdFromContext(req, db) {
  const user = getCurrentUser(req, db);
  if (!user) return null;
  if (user.role === 'TEACHER' && user.teacherId) return user.teacherId;
  if (user.role === 'TEACHER' && user.email) {
    const byEmail = db.teachers.find((t) => String(t.email || '').toLowerCase() === String(user.email).toLowerCase());
    return byEmail?.id || null;
  }
  return null;
}

function ensureDirectory(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'nanasa-lms-backend' });
});

// Admin-only endpoint to repair/reinitialize missing seed accounts
app.post('/api/admin/fix-seed-accounts', requireAuth, requireRole('ADMIN'), (req, res) => {
  try {
    const db = readDb();
    const timestamp = nowIso();
    let fixed = [];

    const seedAccounts = [
      { username: 'teacher', email: 'teacher@nanasa.local', password: 'teacher123', role: 'TEACHER' },
      { username: 'student', email: 'student@nanasa.local', password: 'student123', role: 'STUDENT' },
      { username: 'officer', email: 'officer@nanasa.local', password: 'officer123', role: 'PAYMENT_OFFICER' },
    ];

    seedAccounts.forEach((seed) => {
      const exists = db.users.some(u => u.username === seed.username);
      if (!exists) {
        const userId = id('usr');
        const newUser = {
          id: userId,
          username: seed.username,
          email: seed.email,
          passwordHash: bcrypt.hashSync(seed.password, 10),
          role: seed.role,
          teacherId: seed.role === 'TEACHER' ? id('tch') : null,
          studentId: seed.role === 'STUDENT' ? id('std') : null,
          profile: seed.role === 'STUDENT' ? {
            fullName: 'Demo Student',
            age: 17,
            grade: 'A/L',
            stream: 'MATHS',
            updatedAt: timestamp,
          } : null,
          createdAt: timestamp,
        };
        db.users.push(newUser);
        fixed.push(seed.username);

        if (seed.role === 'TEACHER') {
          db.teachers.push({
            id: newUser.teacherId,
            userId,
            fullName: 'Demo Teacher',
            email: seed.email,
            subject: 'Combined Maths',
            contactNumber: '0770000000',
            experience: 5,
            createdAt: timestamp,
          });
        }

        if (seed.role === 'STUDENT') {
          db.students.push({
            id: newUser.studentId,
            userId,
            fullName: 'Demo Student',
            email: seed.email,
            contactNumber: '',
            dateOfBirth: '2008-01-01',
            grade: 'A/L',
            stream: 'MATHS',
            createdAt: timestamp,
          });
        }
      }
    });

    if (fixed.length > 0) {
      updateDb(d => Object.assign(d, db));
      res.json({ message: 'Seed accounts fixed', fixed });
    } else {
      res.json({ message: 'All seed accounts already exist', fixed: [] });
    }
  } catch (error) {
    console.error('Error fixing seed accounts:', error);
    res.status(500).json({ message: 'Error fixing seed accounts' });
  }
});

// Admin-only endpoint to create/restore a user account with a specific password
app.post('/api/admin/create-user', requireAuth, requireRole('ADMIN'), (req, res) => {
  try {
    const { username, email, password, role } = req.body || {};
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password required' });
    }

    const db = readDb();
    const timestamp = nowIso();

    // Check if user already exists
    const exists = db.users.some(u => String(u.username).toLowerCase() === String(username).toLowerCase());
    if (exists) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const userId = id('usr');
    const normalizedRole = normalizeRole(role || 'TEACHER');
    const newUser = {
      id: userId,
      username: String(username).trim(),
      email: String(email).trim(),
      passwordHash: bcrypt.hashSync(String(password), 10),
      role: normalizedRole,
      teacherId: normalizedRole === 'TEACHER' ? id('tch') : null,
      studentId: normalizedRole === 'STUDENT' ? id('std') : null,
      profile: null,
      createdAt: timestamp,
    };

    db.users.push(newUser);

    if (normalizedRole === 'TEACHER') {
      db.teachers.push({
        id: newUser.teacherId,
        userId,
        fullName: String(username).trim(),
        email: String(email).trim(),
        subject: '',
        contactNumber: '',
        experience: null,
        createdAt: timestamp,
      });
    }

    if (normalizedRole === 'STUDENT') {
      db.students.push({
        id: newUser.studentId,
        userId,
        fullName: String(username).trim(),
        email: String(email).trim(),
        contactNumber: '',
        dateOfBirth: null,
        admissionNumber: `ADM-${Date.now()}`,
        status: 'ACTIVE',
        createdAt: timestamp,
      });
    }

    updateDb(d => Object.assign(d, db));
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { username, email, password, role } = req.body || {};
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required.' });
  }

  const requestedRole = normalizeRole(role || 'STUDENT');
  if (requestedRole === 'ADMIN' || requestedRole === 'PAYMENT_OFFICER') {
    return res.status(400).json({ message: 'You can register only as STUDENT or TEACHER.' });
  }

  const db = readDb();
  const userTaken = db.users.some((u) => String(u.username).toLowerCase() === String(username).toLowerCase());
  const emailTaken = db.users.some((u) => String(u.email).toLowerCase() === String(email).toLowerCase());
  if (userTaken || emailTaken) {
    return res.status(409).json({ message: 'Username or email already exists.' });
  }

  const timestamp = nowIso();
  const userId = id('usr');
  const nextUser = {
    id: userId,
    username: String(username).trim(),
    email: String(email).trim(),
    passwordHash: bcrypt.hashSync(String(password), 10),
    role: requestedRole,
    teacherId: null,
    studentId: null,
    profile: null,
    createdAt: timestamp,
  };

  if (requestedRole === 'TEACHER') {
    const teacherId = id('tch');
    nextUser.teacherId = teacherId;
    db.teachers.push({
      id: teacherId,
      userId,
      fullName: String(username).trim(),
      email: String(email).trim(),
      subject: '',
      contactNumber: '',
      experience: null,
      createdAt: timestamp,
    });
  } else {
    const studentId = id('std');
    nextUser.studentId = studentId;
    db.students.push({
      id: studentId,
      userId,
      fullName: String(username).trim(),
      email: String(email).trim(),
      contactNumber: '',
      dateOfBirth: null,
      admissionNumber: `ADM-${Date.now()}`,
      status: 'PENDING',
      createdAt: timestamp,
    });
  }

  db.users.push(nextUser);
  updateDb((draft) => Object.assign(draft, db));

  return res.status(201).json({ message: 'Registered successfully.' });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  const db = readDb();
  const user = db.users.find(
    (u) => String(u.username).toLowerCase() === String(username).toLowerCase() || String(u.email).toLowerCase() === String(username).toLowerCase()
  );
  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password.' });
  }

  const ok = bcrypt.compareSync(String(password), user.passwordHash);
  if (!ok) {
    return res.status(401).json({ message: 'Invalid username or password.' });
  }

  const token = createToken(user);
  return res.json({
    username: user.username,
    role: user.role,
    token,
    teacherId: user.teacherId || null,
  });
});

app.use('/api', requireAuth);

app.post('/api/profile', (req, res) => {
  const { fullName, age, grade, stream } = req.body || {};
  const nextAge = safeNumber(age, NaN);
  if (!fullName || !grade || Number.isNaN(nextAge)) {
    return res.status(400).json({ message: 'fullName, age, and grade are required.' });
  }

  updateDb((db) => {
    const user = db.users.find((u) => u.id === req.user.sub);
    if (!user) return;

    user.profile = {
      fullName: String(fullName).trim(),
      age: nextAge,
      grade: String(grade).trim(),
      stream: stream ? String(stream).trim() : '',
      updatedAt: nowIso(),
    };

    if (user.studentId) {
      const student = db.students.find((s) => s.id === user.studentId);
      if (student) {
        student.fullName = user.profile.fullName;
      }
    }
  });

  return res.status(201).json({ message: 'Profile saved.' });
});

app.get('/api/teachers', (_req, res) => {
  const db = readDb();
  res.json(db.teachers);
});

app.post('/api/teachers', requireRole('ADMIN'), (req, res) => {
  const { fullName, email, subject, contactNumber, experience } = req.body || {};
  if (!fullName || !email) {
    return res.status(400).json({ message: 'fullName and email are required.' });
  }

  const next = {
    id: id('tch'),
    fullName: String(fullName).trim(),
    email: String(email).trim(),
    subject: String(subject || '').trim(),
    contactNumber: String(contactNumber || '').trim(),
    experience: experience == null || experience === '' ? null : safeNumber(experience, null),
    userId: null,
    createdAt: nowIso(),
  };

  updateDb((db) => {
    db.teachers.push(next);
    const linkedUser = db.users.find((u) => String(u.email).toLowerCase() === String(next.email).toLowerCase() && u.role === 'TEACHER');
    if (linkedUser) {
      linkedUser.teacherId = next.id;
      next.userId = linkedUser.id;
    }
  });

  res.status(201).json(next);
});

app.put('/api/teachers/:id', requireRole('ADMIN'), (req, res) => {
  const teacherId = req.params.id;
  const payload = req.body || {};

  let updated = null;
  updateDb((db) => {
    const teacher = db.teachers.find((t) => t.id === teacherId);
    if (!teacher) return;
    teacher.fullName = payload.fullName ?? teacher.fullName;
    teacher.email = payload.email ?? teacher.email;
    teacher.subject = payload.subject ?? teacher.subject;
    teacher.contactNumber = payload.contactNumber ?? teacher.contactNumber;
    teacher.experience = payload.experience ?? teacher.experience;
    updated = { ...teacher };
  });

  if (!updated) {
    return res.status(404).json({ message: 'Teacher not found.' });
  }

  res.json(updated);
});

app.delete('/api/teachers/:id', requireRole('ADMIN'), (req, res) => {
  const teacherId = req.params.id;
  updateDb((db) => {
    db.teachers = db.teachers.filter((t) => t.id !== teacherId);
    db.users.forEach((u) => {
      if (u.teacherId === teacherId) {
        u.teacherId = null;
      }
    });
    db.classes.forEach((c) => {
      if (c.teacherId === teacherId) c.teacherId = null;
    });
  });
  res.status(204).send();
});

app.get('/api/students', (_req, res) => {
  const db = readDb();
  res.json(db.students);
});

app.post('/api/students/:id/enroll/:classId', requireRole('ADMIN'), (req, res) => {
  const { id: studentId, classId } = req.params;
  const db = readDb();
  const student = db.students.find((s) => s.id === studentId);
  const cls = db.classes.find((c) => c.id === classId);
  if (!student || !cls) {
    return res.status(404).json({ message: 'Student or class not found.' });
  }

  updateDb((draft) => {
    const exists = draft.studentClassEnrollments.some((e) => e.studentId === studentId && e.classId === classId);
    if (!exists) {
      draft.studentClassEnrollments.push({
        id: id('enr'),
        studentId,
        classId,
        createdAt: nowIso(),
      });
    }
    const s = draft.students.find((x) => x.id === studentId);
    if (s) s.status = 'ACTIVE';
  });

  res.json({ message: 'Student enrolled successfully.' });
});

app.get('/api/classes', (req, res) => {
  const db = readDb();
  const role = String(req.user.role || '').toUpperCase();
  if (role === 'TEACHER') {
    const teacherId = getTeacherIdFromContext(req, db);
    const own = db.classes.filter((c) => c.teacherId === teacherId).map((c) => attachTeacher(c, db));
    return res.json(own);
  }
  return res.json(db.classes.map((c) => attachTeacher(c, db)));
});

app.post('/api/classes', requireRole('ADMIN', 'TEACHER'), (req, res) => {
  const payload = req.body || {};
  const role = String(req.user.role || '').toUpperCase();
  const db = readDb();

  let teacherId = req.query.teacherId ? String(req.query.teacherId) : null;
  if (role === 'TEACHER') {
    teacherId = getTeacherIdFromContext(req, db);
  }

  if (teacherId && !db.teachers.some((t) => t.id === teacherId)) {
    return res.status(400).json({ message: 'Invalid teacherId.' });
  }

  if (!payload.name || !payload.grade || !payload.subjectId || !payload.type) {
    return res.status(400).json({ message: 'name, grade, subjectId and type are required.' });
  }

  const nextClass = {
    id: id('cls'),
    name: String(payload.name).trim(),
    grade: String(payload.grade).trim(),
    subjectId: String(payload.subjectId).trim(),
    type: String(payload.type).toUpperCase(),
    dayOfWeek: String(payload.dayOfWeek || '').toUpperCase(),
    startTime: payload.startTime || null,
    endTime: payload.endTime || null,
    teacherId: teacherId || null,
    createdAt: nowIso(),
  };

  updateDb((draft) => {
    draft.classes.push(nextClass);
  });

  res.status(201).json(attachTeacher(nextClass, db));
});

app.get('/api/modules', (req, res) => {
  const db = readDb();
  const role = String(req.user.role || '').toUpperCase();
  if (role === 'TEACHER') {
    const teacherId = getTeacherIdFromContext(req, db);
    return res.json(
      db.modules
        .filter((m) => !m.teacherId || m.teacherId === teacherId)
        .map((m) => ({ ...m, teacher: db.teachers.find((t) => t.id === m.teacherId) || null }))
    );
  }
  return res.json(db.modules.map((m) => ({ ...m, teacher: db.teachers.find((t) => t.id === m.teacherId) || null })));
});

app.post('/api/modules', requireRole('ADMIN', 'TEACHER'), (req, res) => {
  const payload = req.body || {};
  if (!payload.name || !payload.subject || !payload.grade) {
    return res.status(400).json({ message: 'name, subject and grade are required.' });
  }

  const db = readDb();
  const teacherId = req.user.role === 'TEACHER' ? getTeacherIdFromContext(req, db) : null;

  const next = {
    id: id('mod'),
    name: String(payload.name).trim(),
    description: String(payload.description || '').trim(),
    subject: String(payload.subject).trim(),
    grade: String(payload.grade).trim(),
    teacherId,
    createdAt: nowIso(),
  };

  updateDb((draft) => {
    draft.modules.push(next);
  });
  res.status(201).json(next);
});

app.put('/api/modules/:id', requireRole('ADMIN', 'TEACHER'), (req, res) => {
  const moduleId = req.params.id;
  const payload = req.body || {};
  let updated = null;

  updateDb((db) => {
    const item = db.modules.find((m) => m.id === moduleId);
    if (!item) return;

    if (req.user.role === 'TEACHER') {
      const teacherId = getTeacherIdFromContext(req, db);
      if (item.teacherId && item.teacherId !== teacherId) return;
    }

    item.name = payload.name ?? item.name;
    item.description = payload.description ?? item.description;
    item.subject = payload.subject ?? item.subject;
    item.grade = payload.grade ?? item.grade;
    updated = { ...item };
  });

  if (!updated) return res.status(404).json({ message: 'Module not found.' });
  res.json(updated);
});

app.delete('/api/modules/:id', requireRole('ADMIN', 'TEACHER'), (req, res) => {
  const moduleId = req.params.id;
  updateDb((db) => {
    db.modules = db.modules.filter((m) => m.id !== moduleId);
    db.exams.forEach((e) => {
      if (e.moduleId === moduleId) e.moduleId = null;
    });
  });
  res.status(204).send();
});

app.get('/api/lessons', (_req, res) => {
  const db = readDb();
  res.json(db.lessons.map((lesson) => attachLesson(lesson, db)));
});

app.post('/api/lessons', requireRole('ADMIN', 'TEACHER'), (req, res) => {
  const { title, description } = req.body || {};
  const classId = req.query.classId ? String(req.query.classId) : null;
  if (!title) {
    return res.status(400).json({ message: 'title is required.' });
  }

  const nextLesson = {
    id: id('lsn'),
    title: String(title).trim(),
    description: String(description || '').trim(),
    classId,
    videoUrl: null,
    pdfUrl: null,
    notesUrl: null,
    createdBy: req.user.sub,
    createdAt: nowIso(),
  };

  updateDb((db) => {
    db.lessons.push(nextLesson);
  });

  const db = readDb();
  res.status(201).json(attachLesson(nextLesson, db));
});

app.put('/api/lessons/:id', requireRole('ADMIN', 'TEACHER'), (req, res) => {
  const lessonId = req.params.id;
  const payload = req.body || {};
  const classId = req.query.classId ? String(req.query.classId) : null;
  let updated = null;

  updateDb((db) => {
    const lesson = db.lessons.find((l) => l.id === lessonId);
    if (!lesson) return;
    lesson.title = payload.title ?? lesson.title;
    lesson.description = payload.description ?? lesson.description;
    lesson.classId = classId;
    lesson.videoUrl = payload.videoUrl ?? lesson.videoUrl;
    lesson.pdfUrl = payload.pdfUrl ?? lesson.pdfUrl;
    lesson.notesUrl = payload.notesUrl ?? lesson.notesUrl;
    updated = { ...lesson };
  });

  if (!updated) return res.status(404).json({ message: 'Lesson not found.' });
  const db = readDb();
  res.json(attachLesson(updated, db));
});

app.delete('/api/lessons/:id', requireRole('ADMIN', 'TEACHER'), (req, res) => {
  const lessonId = req.params.id;
  updateDb((db) => {
    db.lessons = db.lessons.filter((l) => l.id !== lessonId);
  });
  res.status(204).send();
});

app.post('/api/lessons/:id/upload/:type', requireRole('ADMIN', 'TEACHER'), lessonUpload.single('file'), (req, res) => {
  const lessonId = req.params.id;
  const type = String(req.params.type || '').toLowerCase();
  if (!req.file) {
    return res.status(400).json({ message: 'File is required.' });
  }
  if (!['video', 'pdf', 'notes'].includes(type)) {
    return res.status(400).json({ message: 'Invalid upload type.' });
  }

  const relative = `/uploads/lessons/${req.file.filename}`;

  let ok = false;
  updateDb((db) => {
    const lesson = db.lessons.find((l) => l.id === lessonId);
    if (!lesson) return;
    if (type === 'video') lesson.videoUrl = relative;
    if (type === 'pdf') lesson.pdfUrl = relative;
    if (type === 'notes') lesson.notesUrl = relative;
    ok = true;
  });

  if (!ok) return res.status(404).json({ message: 'Lesson not found.' });
  res.json(relative);
});

app.get('/api/feedbacks', (req, res) => {
  const db = readDb();
  const role = String(req.user.role || '').toUpperCase();
  if (role === 'STUDENT') {
    return res.json([]);
  }
  return res.json(db.feedbacks.map((f) => attachFeedback(f, db)));
});

app.get('/api/feedbacks/teacher/:teacherId', (req, res) => {
  const db = readDb();
  const teacherId = req.params.teacherId;
  const list = db.feedbacks.filter((f) => f.teacherId === teacherId).map((f) => attachFeedback(f, db));
  res.json(list);
});

app.post('/api/feedbacks', requireRole('STUDENT'), (req, res) => {
  const { teacherId, rating, comment, isAnonymous, moduleId } = req.body || {};
  if (!teacherId || !rating) {
    return res.status(400).json({ message: 'teacherId and rating are required.' });
  }

  const db = readDb();
  const user = getCurrentUser(req, db);
  if (!user?.studentId) {
    return res.status(400).json({ message: 'Only student accounts can submit feedback.' });
  }

  const next = {
    id: id('fbk'),
    studentId: user.studentId,
    teacherId: String(teacherId),
    moduleId: moduleId || null,
    rating: Math.max(1, Math.min(5, safeNumber(rating, 5))),
    comment: String(comment || '').trim(),
    isAnonymous: Boolean(isAnonymous),
    createdAt: nowIso(),
  };

  updateDb((draft) => {
    draft.feedbacks.push(next);
  });

  const updatedDb = readDb();
  res.status(201).json(attachFeedback(next, updatedDb));
});

app.post('/api/module-applications', requireRole('STUDENT', 'ADMIN'), (req, res) => {
  const { studentName, age, grade, moduleId, teacherId } = req.body || {};
  if (!studentName || !age || !grade || !teacherId) {
    return res.status(400).json({ message: 'studentName, age, grade and teacherId are required.' });
  }

  const next = {
    id: id('app'),
    studentName: String(studentName).trim(),
    age: safeNumber(age, 0),
    grade: String(grade).trim(),
    moduleId: moduleId || null,
    teacherId: String(teacherId),
    status: 'PENDING',
    createdAt: nowIso(),
  };

  updateDb((db) => {
    db.moduleApplications.push(next);
  });

  res.status(201).json(next);
});

app.get('/api/recommendations', (req, res) => {
  const { subjectId, teacherId } = req.query;
  const db = readDb();
  let rows = db.classes.map((c) => attachTeacher(c, db));
  if (subjectId) {
    rows = rows.filter((r) => String(r.subjectId || '').toLowerCase() === String(subjectId).toLowerCase());
  }
  if (teacherId) {
    rows = rows.filter((r) => r.teacher?.id === String(teacherId));
  }

  const paperClasses = rows.filter((r) => String(r.type || '').toUpperCase() === 'PAPER');
  const revisionClasses = rows.filter((r) => String(r.type || '').toUpperCase() === 'REVISION');
  res.json({
    paperClasses,
    revisionClasses,
    combinedClasses: [...paperClasses, ...revisionClasses],
  });
});

app.post('/api/payments/admission', requireRole('STUDENT', 'ADMIN'), (req, res) => {
  const { amount, type, transactionId } = req.body || {};
  const studentName = String(req.query.studentName || '').trim();
  if (!studentName) {
    return res.status(400).json({ message: 'studentName query param is required.' });
  }

  const db = readDb();
  const user = getCurrentUser(req, db);

  const next = {
    id: id('pay'),
    studentId: user?.studentId || null,
    classId: null,
    studentName,
    amount: safeNumber(amount, 0),
    type: type || 'ADMISSION',
    transactionId: transactionId || `ADMIT-${Date.now()}`,
    status: 'PENDING',
    createdAt: nowIso(),
  };

  updateDb((draft) => {
    draft.payments.push(next);
  });

  res.status(201).json(next);
});

app.post('/api/payments', requireRole('STUDENT', 'ADMIN'), (req, res) => {
  const { amount, type } = req.body || {};
  const studentId = String(req.query.studentId || '').trim();
  const classId = String(req.query.classId || '').trim();
  if (!studentId || !classId) {
    return res.status(400).json({ message: 'studentId and classId query params are required.' });
  }

  const next = {
    id: id('pay'),
    studentId,
    classId,
    amount: safeNumber(amount, 0),
    type: type || 'CLASS_FEE',
    transactionId: `CLS-${Date.now()}`,
    status: 'PENDING',
    createdAt: nowIso(),
  };

  updateDb((db) => {
    db.payments.push(next);
  });

  res.status(201).json(next);
});

app.get('/api/payments/pending', requireRole('ADMIN', 'PAYMENT_OFFICER'), (_req, res) => {
  const db = readDb();
  res.json(db.payments.filter((p) => p.status === 'PENDING').map((p) => attachPayment(p, db)));
});

app.post('/api/payments/:id/approve', requireRole('ADMIN', 'PAYMENT_OFFICER'), (req, res) => {
  const paymentId = req.params.id;
  let found = false;
  updateDb((db) => {
    const payment = db.payments.find((p) => p.id === paymentId);
    if (!payment) return;
    payment.status = 'APPROVED';
    payment.approvedAt = nowIso();
    found = true;

    if (payment.studentId) {
      const student = db.students.find((s) => s.id === payment.studentId);
      if (student) student.status = 'ACTIVE';
    }
  });

  if (!found) return res.status(404).json({ message: 'Payment not found.' });
  return res.json({ message: 'Payment approved.' });
});

app.post('/api/payments/:id/decline', requireRole('ADMIN', 'PAYMENT_OFFICER'), (req, res) => {
  const paymentId = req.params.id;
  let found = false;
  updateDb((db) => {
    const payment = db.payments.find((p) => p.id === paymentId);
    if (!payment) return;
    payment.status = 'DECLINED';
    payment.declinedAt = nowIso();
    found = true;
  });

  if (!found) return res.status(404).json({ message: 'Payment not found.' });
  return res.json({ message: 'Payment declined.' });
});

app.get('/api/exams/leaderboard/daily-subject', (req, res) => {
  const db = readDb();
  const today = new Date().toISOString().slice(0, 10);
  const dailySubs = db.examSubmissions.filter((s) => String(s.submittedAt || '').startsWith(today));

  const bySubject = new Map();

  dailySubs.forEach((submission) => {
    const exam = db.exams.find((e) => e.id === submission.examId);
    if (!exam) return;
    const module = exam.moduleId ? db.modules.find((m) => m.id === exam.moduleId) : null;
    const cls = exam.classId ? db.classes.find((c) => c.id === exam.classId) : null;
    const subject = module?.subject || cls?.subjectId || 'General';

    if (!bySubject.has(subject)) bySubject.set(subject, []);
    bySubject.get(subject).push(submission);
  });

  const subjects = Array.from(bySubject.entries()).map(([subject, submissions]) => {
    const studentMap = new Map();

    submissions.forEach((s) => {
      const student = db.students.find((x) => x.id === s.studentId);
      if (!student) return;
      if (!studentMap.has(s.studentId)) {
        studentMap.set(s.studentId, {
          studentId: s.studentId,
          studentName: student.fullName || student.email || 'Student',
          studentEmail: student.email || '',
          score: 0,
          totalMarks: 0,
          submissionCount: 0,
        });
      }
      const row = studentMap.get(s.studentId);
      row.score += safeNumber(s.score, 0);
      row.totalMarks += safeNumber(s.totalMarks, 0);
      row.submissionCount += 1;
    });

    const rankings = Array.from(studentMap.values())
      .map((row) => ({
        ...row,
        averagePercentage: row.totalMarks > 0 ? Number(((row.score / row.totalMarks) * 100).toFixed(2)) : 0,
        trend: 'same',
      }))
      .sort((a, b) => b.averagePercentage - a.averagePercentage)
      .map((row, index) => ({ ...row, rank: index + 1 }));

    return { subject, rankings };
  });

  res.json({
    date: today,
    lastUpdatedAt: nowIso(),
    subjects,
  });
});

app.get('/api/exams', (req, res) => {
  const db = readDb();
  const role = String(req.user.role || '').toUpperCase();

  let list = db.exams;
  if (role === 'TEACHER') {
    const teacherId = getTeacherIdFromContext(req, db);
    list = list.filter((e) => e.teacherId === teacherId);
  }

  res.json(list.map((e) => attachExam(e, db)));
});

app.get('/api/exams/:id/status', requireRole('STUDENT'), (req, res) => {
  const db = readDb();
  const user = getCurrentUser(req, db);
  if (!user?.studentId) return res.status(400).json({ message: 'Student account required.' });

  const status = getExamSubmissionStatus(req.params.id, user.studentId, db);
  if (!status) return res.status(404).json({ message: 'Exam not found.' });
  return res.json(status);
});

app.post('/api/exams', requireRole('ADMIN'), (req, res) => {
  const { title, examCode, description, scheduledAt, endAt, examType, questions } = req.body || {};
  const teacherId = String(req.query.teacherId || '');
  const moduleId = String(req.query.moduleId || '');
  const classId = req.query.classId ? String(req.query.classId) : null;

  if (!title || !examCode || !teacherId || !moduleId || !scheduledAt || !endAt || !examType) {
    return res.status(400).json({ message: 'Missing required exam fields.' });
  }

  const next = {
    id: id('exm'),
    title: String(title).trim(),
    examCode: String(examCode).trim(),
    description: String(description || '').trim(),
    scheduledAt,
    endAt,
    examType: String(examType).toUpperCase(),
    teacherId,
    moduleId,
    classId,
    questions: Array.isArray(questions)
      ? questions.map((q, idx) => ({
          id: q.id || `q-${idx + 1}`,
          text: q.text || '',
          optionA: q.optionA || '',
          optionB: q.optionB || '',
          optionC: q.optionC || '',
          optionD: q.optionD || '',
          optionE: q.optionE || '',
          correctOption: String(q.correctOption || 'A').toUpperCase(),
          marks: safeNumber(q.marks, 1),
        }))
      : [],
    active: true,
    examPaperUrl: null,
    examPaperEditCount: 0,
    createdAt: nowIso(),
  };

  updateDb((db) => {
    db.exams.push(next);
  });

  const db = readDb();
  res.status(201).json(attachExam(next, db));
});

app.post('/api/exams/teacher', requireRole('TEACHER'), (req, res) => {
  const db = readDb();
  const teacherId = getTeacherIdFromContext(req, db);
  if (!teacherId) return res.status(400).json({ message: 'Teacher profile is not linked.' });

  const ownModule = db.modules.find((m) => m.teacherId === teacherId) || null;
  const { title, examCode, description, scheduledAt, endAt, examType, questions } = req.body || {};
  const classId = req.query.classId ? String(req.query.classId) : null;
  if (!title || !examCode || !scheduledAt || !endAt || !examType) {
    return res.status(400).json({ message: 'Missing required exam fields.' });
  }

  const next = {
    id: id('exm'),
    title: String(title).trim(),
    examCode: String(examCode).trim(),
    description: String(description || '').trim(),
    scheduledAt,
    endAt,
    examType: String(examType).toUpperCase(),
    teacherId,
    moduleId: ownModule?.id || null,
    classId,
    questions: Array.isArray(questions)
      ? questions.map((q, idx) => ({
          id: q.id || `q-${idx + 1}`,
          text: q.text || '',
          optionA: q.optionA || '',
          optionB: q.optionB || '',
          optionC: q.optionC || '',
          optionD: q.optionD || '',
          optionE: q.optionE || '',
          correctOption: String(q.correctOption || 'A').toUpperCase(),
          marks: safeNumber(q.marks, 1),
        }))
      : [],
    active: true,
    examPaperUrl: null,
    examPaperEditCount: 0,
    createdAt: nowIso(),
  };

  updateDb((draft) => {
    draft.exams.push(next);
  });

  const updatedDb = readDb();
  res.status(201).json(attachExam(next, updatedDb));
});

app.put('/api/exams/:id/admin', requireRole('ADMIN'), (req, res) => {
  const examId = req.params.id;
  const payload = req.body || {};
  const teacherId = req.query.teacherId ? String(req.query.teacherId) : null;
  const moduleId = req.query.moduleId ? String(req.query.moduleId) : null;
  const classId = req.query.classId ? String(req.query.classId) : null;

  let updated = null;
  updateDb((db) => {
    const exam = db.exams.find((e) => e.id === examId);
    if (!exam) return;

    exam.title = payload.title ?? exam.title;
    exam.examCode = payload.examCode ?? exam.examCode;
    exam.description = payload.description ?? exam.description;
    exam.scheduledAt = payload.scheduledAt ?? exam.scheduledAt;
    exam.endAt = payload.endAt ?? exam.endAt;
    exam.examType = payload.examType ? String(payload.examType).toUpperCase() : exam.examType;
    exam.teacherId = teacherId ?? exam.teacherId;
    exam.moduleId = moduleId ?? exam.moduleId;
    exam.classId = classId;
    updated = { ...exam };
  });

  if (!updated) return res.status(404).json({ message: 'Exam not found.' });
  const db = readDb();
  res.json(attachExam(updated, db));
});

app.put('/api/exams/:id/teacher', requireRole('TEACHER'), (req, res) => {
  const examId = req.params.id;
  const payload = req.body || {};
  let updated = null;

  updateDb((db) => {
    const teacherId = getTeacherIdFromContext(req, db);
    const exam = db.exams.find((e) => e.id === examId && e.teacherId === teacherId);
    if (!exam) return;

    exam.scheduledAt = payload.scheduledAt ?? exam.scheduledAt;
    exam.endAt = payload.endAt ?? exam.endAt;
    exam.examType = payload.examType ? String(payload.examType).toUpperCase() : exam.examType;
    updated = { ...exam };
  });

  if (!updated) return res.status(404).json({ message: 'Exam not found.' });
  const db = readDb();
  res.json(attachExam(updated, db));
});

app.delete('/api/exams/:id', requireRole('ADMIN'), (req, res) => {
  const examId = req.params.id;
  updateDb((db) => {
    db.exams = db.exams.filter((e) => e.id !== examId);
    db.examEnrollments = db.examEnrollments.filter((x) => x.examId !== examId);
    db.examSubmissions = db.examSubmissions.filter((x) => x.examId !== examId);
  });
  res.status(204).send();
});

app.patch('/api/exams/:id/active', requireRole('ADMIN', 'TEACHER'), (req, res) => {
  const examId = req.params.id;
  const nextActive = String(req.query.active || '').toLowerCase() === 'true';
  let updated = null;

  updateDb((db) => {
    const exam = db.exams.find((e) => e.id === examId);
    if (!exam) return;

    if (req.user.role === 'TEACHER') {
      const teacherId = getTeacherIdFromContext(req, db);
      if (exam.teacherId !== teacherId) return;
    }

    exam.active = nextActive;
    updated = { ...exam };
  });

  if (!updated) return res.status(404).json({ message: 'Exam not found.' });
  return res.json({ message: 'Exam status updated.' });
});

app.post('/api/exams/:id/upload/paper', requireRole('ADMIN', 'TEACHER'), examUpload.single('file'), (req, res) => {
  const examId = req.params.id;
  if (!req.file) return res.status(400).json({ message: 'File is required.' });

  const relative = `/uploads/exams/${req.file.filename}`;
  let updated = false;

  updateDb((db) => {
    const exam = db.exams.find((e) => e.id === examId);
    if (!exam) return;

    if (req.user.role === 'TEACHER') {
      const teacherId = getTeacherIdFromContext(req, db);
      if (exam.teacherId !== teacherId) return;
    }

    exam.examPaperUrl = relative;
    exam.examPaperEditCount = safeNumber(exam.examPaperEditCount, 0) + 1;
    updated = true;
  });

  if (!updated) return res.status(404).json({ message: 'Exam not found.' });
  res.json({ url: relative });
});

app.post('/api/exams/:id/enroll', requireRole('STUDENT'), (req, res) => {
  const examId = req.params.id;
  const db = readDb();
  const user = getCurrentUser(req, db);
  if (!user?.studentId) return res.status(400).json({ message: 'Student account required.' });

  const exam = db.exams.find((e) => e.id === examId);
  if (!exam) return res.status(404).json({ message: 'Exam not found.' });

  updateDb((draft) => {
    const exists = draft.examEnrollments.some((x) => x.examId === examId && x.studentId === user.studentId);
    if (!exists) {
      draft.examEnrollments.push({
        id: id('eenr'),
        examId,
        studentId: user.studentId,
        createdAt: nowIso(),
      });
    }
  });

  res.status(201).json({ message: 'Enrolled.' });
});

app.post('/api/exams/:id/submit/mcq', requireRole('STUDENT'), (req, res) => {
  const examId = req.params.id;
  const answers = req.body || {};

  const db = readDb();
  const user = getCurrentUser(req, db);
  if (!user?.studentId) return res.status(400).json({ message: 'Student account required.' });

  const exam = db.exams.find((e) => e.id === examId);
  if (!exam) return res.status(404).json({ message: 'Exam not found.' });
  if (String(exam.examType).toUpperCase() !== 'MCQ') {
    return res.status(400).json({ message: 'This endpoint is only for MCQ exams.' });
  }

  const status = getExamSubmissionStatus(examId, user.studentId, db);
  if (!status?.canSubmit) {
    return res.status(400).json({ message: 'You can submit only during active exam time after enrolling.' });
  }

  let score = 0;
  let totalMarks = 0;
  exam.questions.forEach((q, idx) => {
    const qid = q.id || `q-${idx}`;
    const selected = String(answers[qid] || answers[`q-${idx}`] || answers[`q-${idx + 1}`] || '').toUpperCase();
    const correct = String(q.correctOption || '').toUpperCase();
    const marks = safeNumber(q.marks, 1);
    totalMarks += marks;
    if (selected && selected === correct) {
      score += marks;
    }
  });

  const attemptCount = db.examSubmissions.filter((s) => s.examId === examId && s.studentId === user.studentId).length;
  const submission = {
    id: id('sub'),
    resultId: id('res'),
    examId,
    studentId: user.studentId,
    submissionType: 'MCQ',
    attemptNumber: attemptCount + 1,
    answers,
    essayAnswerUrl: null,
    score,
    totalMarks,
    teacherRemark: '',
    status: 'PUBLISHED',
    submittedAt: nowIso(),
    gradedAt: nowIso(),
  };

  updateDb((draft) => {
    draft.examSubmissions.push(submission);
  });

  res.status(201).json({ message: 'MCQ submitted.', score, totalMarks });
});

app.post('/api/exams/:id/submit/essay', requireRole('STUDENT'), examUpload.single('file'), (req, res) => {
  const examId = req.params.id;
  if (!req.file) return res.status(400).json({ message: 'Essay answer file is required.' });

  const db = readDb();
  const user = getCurrentUser(req, db);
  if (!user?.studentId) return res.status(400).json({ message: 'Student account required.' });

  const exam = db.exams.find((e) => e.id === examId);
  if (!exam) return res.status(404).json({ message: 'Exam not found.' });
  if (String(exam.examType).toUpperCase() !== 'ESSAY') {
    return res.status(400).json({ message: 'This endpoint is only for ESSAY exams.' });
  }

  const status = getExamSubmissionStatus(examId, user.studentId, db);
  if (!status?.canSubmit) {
    return res.status(400).json({ message: 'You can submit only during active exam time after enrolling.' });
  }

  const relative = `/uploads/exams/${req.file.filename}`;
  const attemptCount = db.examSubmissions.filter((s) => s.examId === examId && s.studentId === user.studentId).length;

  const submission = {
    id: id('sub'),
    resultId: id('res'),
    examId,
    studentId: user.studentId,
    submissionType: 'ESSAY',
    attemptNumber: attemptCount + 1,
    answers: {},
    essayAnswerUrl: relative,
    score: null,
    totalMarks: null,
    teacherRemark: '',
    status: 'SUBMITTED',
    submittedAt: nowIso(),
    gradedAt: null,
  };

  updateDb((draft) => {
    draft.examSubmissions.push(submission);
  });

  res.status(201).json({ message: 'Essay submitted.' });
});

app.get('/api/exams/:id/submissions', requireRole('ADMIN', 'TEACHER'), (req, res) => {
  const examId = req.params.id;
  const db = readDb();

  let submissions = db.examSubmissions.filter((s) => s.examId === examId);
  if (req.user.role === 'TEACHER') {
    const teacherId = getTeacherIdFromContext(req, db);
    const exam = db.exams.find((e) => e.id === examId);
    if (!exam || exam.teacherId !== teacherId) {
      return res.status(403).json({ message: 'Not allowed to view these submissions.' });
    }
  }

  const rows = submissions.map((s) => {
    const student = db.students.find((std) => std.id === s.studentId);
    return {
      ...s,
      studentName: student?.fullName || student?.email || 'Student',
      studentEmail: student?.email || '',
    };
  });

  res.json(rows);
});

app.patch('/api/exams/:id/submissions/:resultId/result', requireRole('ADMIN', 'TEACHER'), (req, res) => {
  const examId = req.params.id;
  const resultId = req.params.resultId;
  const { score, totalMarks, teacherRemark } = req.body || {};

  let updated = null;
  updateDb((db) => {
    const exam = db.exams.find((e) => e.id === examId);
    if (!exam) return;

    if (req.user.role === 'TEACHER') {
      const teacherId = getTeacherIdFromContext(req, db);
      if (exam.teacherId !== teacherId) return;
    }

    const submission = db.examSubmissions.find((s) => s.resultId === resultId && s.examId === examId);
    if (!submission) return;
    submission.score = safeNumber(score, 0);
    submission.totalMarks = safeNumber(totalMarks, 0);
    submission.teacherRemark = String(teacherRemark || '');
    submission.status = 'PUBLISHED';
    submission.gradedAt = nowIso();
    updated = { ...submission };
  });

  if (!updated) return res.status(404).json({ message: 'Submission not found.' });
  res.json(updated);
});

app.get('/api/analytics/teacher/performance', requireRole('ADMIN', 'TEACHER'), (req, res) => {
  const db = readDb();
  const passMarkPercentage = safeNumber(req.query.passMarkPercentage, 40);

  let teacherId = req.query.teacherId ? String(req.query.teacherId) : null;
  if (req.user.role === 'TEACHER') {
    teacherId = getTeacherIdFromContext(req, db);
  }

  if (!teacherId) {
    return res.status(400).json({ message: 'Teacher id is required.' });
  }

  const teacher = db.teachers.find((t) => t.id === teacherId) || null;
  const exams = db.exams.filter((e) => e.teacherId === teacherId);

  const examPerformance = exams.map((exam) => {
    const submissions = db.examSubmissions.filter((s) => s.examId === exam.id && s.score != null && s.totalMarks != null);
    const totalScore = submissions.reduce((sum, s) => sum + safeNumber(s.score, 0), 0);
    const totalMarks = submissions.reduce((sum, s) => sum + safeNumber(s.totalMarks, 0), 0);
    const averageMarks = submissions.length ? totalScore / submissions.length : 0;
    const averagePercentage = totalMarks > 0 ? (totalScore / totalMarks) * 100 : 0;

    const passCount = submissions.filter((s) => {
      const percent = s.totalMarks ? (safeNumber(s.score, 0) / safeNumber(s.totalMarks, 1)) * 100 : 0;
      return percent >= passMarkPercentage;
    }).length;

    const classItem = exam.classId ? db.classes.find((c) => c.id === exam.classId) : null;

    return {
      examId: exam.id,
      examTitle: exam.title,
      examCode: exam.examCode,
      classId: classItem?.id || null,
      className: classItem?.name || '-',
      submissionCount: submissions.length,
      averageMarks: Number(averageMarks.toFixed(2)),
      averagePercentage: Number(averagePercentage.toFixed(2)),
      passStudentPercentage: submissions.length ? Number(((passCount / submissions.length) * 100).toFixed(2)) : 0,
    };
  });

  const classMap = new Map();
  examPerformance.forEach((row) => {
    const key = row.classId || 'NO_CLASS';
    if (!classMap.has(key)) {
      classMap.set(key, {
        classId: row.classId,
        className: row.className,
        totalAveragePercentage: 0,
        totalPassPercentage: 0,
        examCount: 0,
      });
    }
    const agg = classMap.get(key);
    agg.totalAveragePercentage += row.averagePercentage;
    agg.totalPassPercentage += row.passStudentPercentage;
    agg.examCount += 1;
  });

  const classComparison = Array.from(classMap.values()).map((entry) => ({
    classId: entry.classId,
    className: entry.className,
    averagePercentage: entry.examCount ? Number((entry.totalAveragePercentage / entry.examCount).toFixed(2)) : 0,
    passStudentPercentage: entry.examCount ? Number((entry.totalPassPercentage / entry.examCount).toFixed(2)) : 0,
    examCount: entry.examCount,
  }));

  const totalSubmissions = examPerformance.reduce((sum, row) => sum + row.submissionCount, 0);
  const overallClassAveragePercentage = examPerformance.length
    ? Number((examPerformance.reduce((sum, row) => sum + row.averagePercentage, 0) / examPerformance.length).toFixed(2))
    : 0;
  const passStudentPercentage = examPerformance.length
    ? Number((examPerformance.reduce((sum, row) => sum + row.passStudentPercentage, 0) / examPerformance.length).toFixed(2))
    : 0;
  const overallClassAverageMarks = examPerformance.length
    ? Number((examPerformance.reduce((sum, row) => sum + row.averageMarks, 0) / examPerformance.length).toFixed(2))
    : 0;

  res.json({
    teacherId,
    teacherName: teacher?.fullName || teacher?.email || '',
    summary: {
      overallClassAverageMarks,
      overallClassAveragePercentage,
      passStudentPercentage,
      totalExams: exams.length,
      totalClasses: classComparison.length,
      totalSubmissions,
      passMarkPercentage,
    },
    examPerformance,
    classComparison,
    chartData: {
      examAverages: examPerformance.map((row) => ({
        label: row.examCode || row.examTitle,
        averagePercentage: row.averagePercentage,
        passStudentPercentage: row.passStudentPercentage,
      })),
      classComparison: classComparison.map((row) => ({
        className: row.className,
        averagePercentage: row.averagePercentage,
        passStudentPercentage: row.passStudentPercentage,
      })),
    },
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  return res.status(500).json({ message: 'Internal server error.' });
});

async function startServer() {
  const dbInfo = await initDb();
  ensureDirectory(path.join(__dirname, '..', 'uploads', '.keep'));
  app.listen(PORT, () => {
    console.log(`Nanasa backend running on http://localhost:${PORT}`);
    console.log(`Storage engine: ${dbInfo.engine}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
