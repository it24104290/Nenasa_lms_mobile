const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');
const { id, nowIso } = require('./utils/helpers');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');
const MONGO_STATE_ID = 'nanasa_lms_state';

let runtimeDb = null;
let mongoCollection = null;
let useMongo = false;
let persistQueue = Promise.resolve();

function baseData() {
  const timestamp = nowIso();
  const adminId = id('usr');
  const teacherUserId = id('usr');
  const studentUserId = id('usr');
  const officerUserId = id('usr');

  const teacherId = id('tch');
  const studentId = id('std');
  const classId = id('cls');
  const moduleId = id('mod');

  return {
    meta: { createdAt: timestamp, updatedAt: timestamp },
    users: [
      {
        id: adminId,
        username: 'admin',
        email: 'admin@nanasa.local',
        passwordHash: bcrypt.hashSync('admin123', 10),
        role: 'ADMIN',
        teacherId: null,
        studentId: null,
        profile: null,
        createdAt: timestamp,
      },
      {
        id: teacherUserId,
        username: 'teacher',
        email: 'teacher@nanasa.local',
        passwordHash: bcrypt.hashSync('teacher123', 10),
        role: 'TEACHER',
        teacherId,
        studentId: null,
        profile: null,
        createdAt: timestamp,
      },
      {
        id: studentUserId,
        username: 'student',
        email: 'student@nanasa.local',
        passwordHash: bcrypt.hashSync('student123', 10),
        role: 'STUDENT',
        teacherId: null,
        studentId,
        profile: {
          fullName: 'Demo Student',
          age: 17,
          grade: 'A/L',
          stream: 'MATHS',
          updatedAt: timestamp,
        },
        createdAt: timestamp,
      },
      {
        id: officerUserId,
        username: 'officer',
        email: 'officer@nanasa.local',
        passwordHash: bcrypt.hashSync('officer123', 10),
        role: 'PAYMENT_OFFICER',
        teacherId: null,
        studentId: null,
        profile: null,
        createdAt: timestamp,
      },
    ],
    teachers: [
      {
        id: teacherId,
        userId: teacherUserId,
        fullName: 'Demo Teacher',
        email: 'teacher@nanasa.local',
        subject: 'Combined Maths',
        contactNumber: '0770000000',
        experience: 5,
        createdAt: timestamp,
      },
    ],
    students: [
      {
        id: studentId,
        userId: studentUserId,
        fullName: 'Demo Student',
        email: 'student@nanasa.local',
        contactNumber: '',
        dateOfBirth: '2008-01-01',
        admissionNumber: 'ADM-1001',
        status: 'ACTIVE',
        createdAt: timestamp,
      },
    ],
    modules: [
      {
        id: moduleId,
        name: 'Combined Maths Foundations',
        description: 'Core mathematics module',
        subject: 'maths',
        grade: 'A/L',
        teacherId,
        createdAt: timestamp,
      },
    ],
    classes: [
      {
        id: classId,
        name: 'A/L Theory Batch',
        grade: 'A/L',
        subjectId: 'maths',
        type: 'THEORY',
        dayOfWeek: 'SATURDAY',
        startTime: '08:00',
        endTime: '10:00',
        teacherId,
        createdAt: timestamp,
      },
    ],
    studentClassEnrollments: [
      {
        id: id('enr'),
        studentId,
        classId,
        createdAt: timestamp,
      },
    ],
    lessons: [],
    feedbacks: [],
    payments: [],
    moduleApplications: [],
    exams: [],
    examEnrollments: [],
    examSubmissions: [],
  };
}

function ensureDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(baseData(), null, 2), 'utf-8');
  }
}

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

function readLocalDb() {
  ensureDb();
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeLocalDb(next) {
  fs.writeFileSync(DB_PATH, JSON.stringify(next, null, 2), 'utf-8');
}

function schedulePersist() {
  const snapshot = clone(runtimeDb);

  if (useMongo && mongoCollection) {
    persistQueue = persistQueue
      .then(() =>
        mongoCollection.updateOne(
          { _id: MONGO_STATE_ID },
          {
            $set: {
              data: snapshot,
              updatedAt: new Date(),
            },
          },
          { upsert: true }
        )
      )
      .catch((error) => {
        console.error('MongoDB persist failed:', error.message);
      });
    return;
  }

  writeLocalDb(snapshot);
}

async function initDb() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    runtimeDb = readLocalDb();
    useMongo = false;
    return { engine: 'file' };
  }

  const dbName = process.env.MONGODB_DB_NAME || 'nanasa_lms';
  const collectionName = process.env.MONGODB_COLLECTION || 'app_state';

  try {
    const client = new MongoClient(mongoUri);
    await client.connect();

    mongoCollection = client.db(dbName).collection(collectionName);

    const doc = await mongoCollection.findOne({ _id: MONGO_STATE_ID });
    if (doc && doc.data) {
      runtimeDb = doc.data;
    } else {
      runtimeDb = fs.existsSync(DB_PATH) ? readLocalDb() : baseData();
      await mongoCollection.updateOne(
        { _id: MONGO_STATE_ID },
        {
          $set: {
            data: runtimeDb,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );
    }

    useMongo = true;
    return { engine: 'mongodb', dbName, collectionName };
  } catch (error) {
    console.error('MongoDB connection failed, using local JSON DB:', error.message);
    runtimeDb = readLocalDb();
    useMongo = false;
    return { engine: 'file-fallback' };
  }
}

function readDb() {
  if (!runtimeDb) {
    runtimeDb = readLocalDb();
  }
  return clone(runtimeDb);
}

function writeDb(next) {
  const data = { ...next, meta: { ...(next.meta || {}), updatedAt: nowIso() } };
  runtimeDb = clone(data);
  schedulePersist();
  return clone(runtimeDb);
}

function updateDb(mutator) {
  const current = readDb();
  const draft = JSON.parse(JSON.stringify(current));
  mutator(draft);
  return writeDb(draft);
}

module.exports = {
  initDb,
  readDb,
  writeDb,
  updateDb,
};
