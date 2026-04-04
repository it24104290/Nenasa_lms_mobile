import React, { useEffect, useMemo, useState } from 'react';
import api, { buildBackendUrl } from '../services/api';
import { useAuth } from '../services/AuthContext';

const EMPTY_ADMIN_FORM = {
  title: '',
  examCode: '',
  description: '',
  scheduledAt: '',
  endAt: '',
  examType: 'MCQ',
  teacherId: '',
  moduleId: '',
  classId: '',
};

const EMPTY_TEACHER_EDIT = {
  scheduledAt: '',
  endAt: '',
  examType: 'MCQ',
};

const EMPTY_MCQ_QUESTION = {
  text: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  optionE: '',
  correctOption: 'A',
  marks: 1,
};

const toInputDateTime = (value) => {
  if (!value) return '';
  if (typeof value === 'string') {
    const match = value.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);
    if (match) return match[1];
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

const toIso = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const offsetMs = date.getTimezoneOffset() * 60000;
  const local = new Date(date.getTime() - offsetMs);
  return local.toISOString().slice(0, 19);
};

const isOngoing = (exam) => {
  const start = exam?.scheduledAt ? new Date(exam.scheduledAt) : null;
  const end = exam?.endAt ? new Date(exam.endAt) : null;
  if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false;
  const now = new Date();
  return now >= start && now < end;
};

const formatDateTime = (value) => {
  if (!value) return '-';
  if (typeof value === 'string') {
    const normalized = value.replace('T', ' ').replace(/\.\d+$/, '');
    if (normalized) return normalized;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
};

const Countdown = ({ endAt }) => {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const target = new Date(endAt);
    if (Number.isNaN(target.getTime())) {
      setRemaining('-');
      return;
    }

    const tick = () => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setRemaining('Time finished');
        return;
      }
      const totalSec = Math.floor(diff / 1000);
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;
      setRemaining(`${h}h ${m}m ${s}s`);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endAt]);

  return <span>{remaining}</span>;
};

export default function ExamsPage() {
  const { user } = useAuth();
  const role = String(user?.role || '').toUpperCase().replace(/^ROLE_/, '');
  const isAdmin = role === 'ADMIN';
  const isTeacher = role === 'TEACHER';
  const isStudent = role === 'STUDENT';

  const [exams, setExams] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [modules, setModules] = useState([]);
  const [classes, setClasses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [adminForm, setAdminForm] = useState(EMPTY_ADMIN_FORM);
  const [saving, setSaving] = useState(false);

  const [editingExamId, setEditingExamId] = useState(null);
  const [teacherEditForm, setTeacherEditForm] = useState(EMPTY_TEACHER_EDIT);

  const [uploading, setUploading] = useState({});
  const [studentAnswers, setStudentAnswers] = useState({});
  const [studentStatuses, setStudentStatuses] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [essayAnswerFiles, setEssayAnswerFiles] = useState({});
  const [essaySubmissions, setEssaySubmissions] = useState({});
  const [loadingSubmissions, setLoadingSubmissions] = useState({});
  const [gradingForms, setGradingForms] = useState({});
  const [gradingSubmissions, setGradingSubmissions] = useState({});
  const [mcqQuestions, setMcqQuestions] = useState([{ ...EMPTY_MCQ_QUESTION }]);
  const [essayPaperFile, setEssayPaperFile] = useState(null);

  const fetchAll = async ({ clearStatus = true } = {}) => {
    setLoading(true);
    if (clearStatus) {
      setStatus(null);
    }
    try {
      const examRes = await api.get('/exams');
      let teacherRes = null;
      let moduleRes = null;
      let classRes = null;

      if (isAdmin) {
        [teacherRes, moduleRes, classRes] = await Promise.all([
          api.get('/teachers'),
          api.get('/modules'),
          api.get('/classes'),
        ]);
      } else if (isTeacher) {
        [moduleRes, classRes] = await Promise.all([
          api.get('/modules'),
          api.get('/classes'),
        ]);
      }

      const examList = examRes.data || [];
      setExams(examList);
      setTeachers(teacherRes?.data || []);
      setModules(moduleRes?.data || []);
      setClasses(classRes?.data || []);

      if (isStudent && examList.length > 0) {
        const statuses = await Promise.all(
          examList.map(async (exam) => {
            try {
              const res = await api.get(`/exams/${exam.id}/status`);
              return [exam.id, res.data];
            } catch {
              return [exam.id, null];
            }
          })
        );
        setStudentStatuses(Object.fromEntries(statuses));
      } else {
        setStudentStatuses({});
      }
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data || 'Failed to load exams.';
      setStatus({ type: 'error', message: String(message) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [role]);

  const availableModules = useMemo(() => {
    if (isTeacher) {
      return modules.filter((m) => {
        const teacherId = m.teacher?.id || m.teacher?._id;
        if (!teacherId) return false;
        if (user?.teacherId) return teacherId === user.teacherId;
        return exams.some((e) => (e.teacher?.id || e.teacher?._id) === teacherId);
      });
    }
    if (!isAdmin || !adminForm.teacherId) return modules;
    return modules.filter((m) => (m.teacher?.id || m.teacher?._id) === adminForm.teacherId);
  }, [isAdmin, isTeacher, modules, adminForm.teacherId, user?.teacherId, exams]);

  const availableTeacherClasses = useMemo(() => {
    if (!isTeacher) return classes;
    return classes.filter((c) => {
      const teacherId = c.teacher?.id || c.teacher?._id;
      if (!teacherId) return false;
      if (user?.teacherId) return teacherId === user.teacherId;
      return exams.some((e) => (e.teacher?.id || e.teacher?._id) === teacherId);
    });
  }, [isTeacher, classes, user?.teacherId, exams]);

  const createExamAsAdmin = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const payload = {
        title: adminForm.title,
        examCode: adminForm.examCode,
        description: adminForm.description,
        scheduledAt: toIso(adminForm.scheduledAt),
        endAt: toIso(adminForm.endAt),
        examType: adminForm.examType,
        questions: adminForm.examType === 'MCQ'
          ? mcqQuestions.map((q) => ({
              text: q.text,
              optionA: q.optionA,
              optionB: q.optionB,
              optionC: q.optionC,
              optionD: q.optionD,
              optionE: q.optionE || null,
              correctOption: q.correctOption,
              marks: Number(q.marks || 1),
            }))
          : [],
      };

      await api.post('/exams', payload, {
        params: {
          teacherId: adminForm.teacherId,
          moduleId: adminForm.moduleId,
          classId: adminForm.classId || undefined,
        },
      });

      setAdminForm(EMPTY_ADMIN_FORM);
      setMcqQuestions([{ ...EMPTY_MCQ_QUESTION }]);
      setShowCreateForm(false);
      await fetchAll({ clearStatus: false });
      setStatus({ type: 'success', message: 'Exam created successfully.' });
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data || 'Failed to create exam.';
      setStatus({ type: 'error', message: String(message) });
    } finally {
      setSaving(false);
    }
  };

  const createExamAsTeacher = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const payload = {
        title: adminForm.title,
        examCode: adminForm.examCode,
        description: adminForm.description,
        scheduledAt: toIso(adminForm.scheduledAt),
        endAt: toIso(adminForm.endAt),
        examType: adminForm.examType,
        questions: adminForm.examType === 'MCQ'
          ? mcqQuestions.map((q) => ({
              text: q.text,
              optionA: q.optionA,
              optionB: q.optionB,
              optionC: q.optionC,
              optionD: q.optionD,
              optionE: q.optionE || null,
              correctOption: q.correctOption,
              marks: Number(q.marks || 1),
            }))
          : [],
      };

      const created = await api.post('/exams/teacher', payload, {
        params: {
          classId: adminForm.classId || undefined,
        },
      });

      let uploadWarning = null;
      if (adminForm.examType === 'ESSAY' && essayPaperFile && created?.data?.id) {
        try {
          const formData = new FormData();
          formData.append('file', essayPaperFile);
          await api.post(`/exams/${created.data.id}/upload/paper`, formData);
        } catch (uploadError) {
          uploadWarning = uploadError?.response?.data?.message || uploadError?.response?.data || 'Exam created, but PDF upload failed.';
        }
      }

      setAdminForm(EMPTY_ADMIN_FORM);
      setMcqQuestions([{ ...EMPTY_MCQ_QUESTION }]);
      setEssayPaperFile(null);
      setShowCreateForm(false);
      await fetchAll({ clearStatus: false });
      if (uploadWarning) {
        setStatus({ type: 'success', message: `Exam created successfully. Paper upload failed: ${String(uploadWarning)}` });
      } else {
        setStatus({ type: 'success', message: 'Exam created successfully.' });
      }
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data || 'Failed to create exam.';
      setStatus({ type: 'error', message: String(message) });
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (exam) => {
    setEditingExamId(exam.id);
    if (isTeacher) {
      setTeacherEditForm({
        scheduledAt: toInputDateTime(exam.scheduledAt),
        endAt: toInputDateTime(exam.endAt),
        examType: String(exam.examType || 'MCQ').toUpperCase(),
      });
      return;
    }

    setAdminForm({
      title: exam.title || '',
      examCode: exam.examCode || '',
      description: exam.description || '',
      scheduledAt: toInputDateTime(exam.scheduledAt),
      endAt: toInputDateTime(exam.endAt),
      examType: String(exam.examType || 'MCQ').toUpperCase(),
      teacherId: exam.teacher?.id || exam.teacher?._id || '',
      moduleId: exam.module?.id || exam.module?._id || '',
      classId: exam.tuitionClass?.id || exam.tuitionClass?._id || '',
    });
    setShowCreateForm(true);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editingExamId) return;
    setSaving(true);
    setStatus(null);
    try {
      if (isTeacher) {
        await api.put(`/exams/${editingExamId}/teacher`, {
          scheduledAt: toIso(teacherEditForm.scheduledAt),
          endAt: toIso(teacherEditForm.endAt),
          examType: teacherEditForm.examType,
        });
      } else if (isAdmin) {
        const payload = {
          title: adminForm.title,
          examCode: adminForm.examCode,
          description: adminForm.description,
          scheduledAt: toIso(adminForm.scheduledAt),
          endAt: toIso(adminForm.endAt),
          examType: adminForm.examType,
        };
        await api.put(`/exams/${editingExamId}/admin`, payload, {
          params: {
            teacherId: adminForm.teacherId,
            moduleId: adminForm.moduleId,
            classId: adminForm.classId || undefined,
          },
        });
      }

      setStatus({ type: 'success', message: 'Exam updated successfully.' });
      setEditingExamId(null);
      setShowCreateForm(false);
      setAdminForm(EMPTY_ADMIN_FORM);
      setTeacherEditForm(EMPTY_TEACHER_EDIT);
      fetchAll({ clearStatus: false });
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data || 'Failed to update exam.';
      setStatus({ type: 'error', message: String(message) });
    } finally {
      setSaving(false);
    }
  };

  const deleteExam = async (exam) => {
    if (!window.confirm('Delete this exam?')) return;
    setStatus(null);
    try {
      await api.delete(`/exams/${exam.id}`);
      setStatus({ type: 'success', message: 'Exam deleted successfully.' });
      fetchAll({ clearStatus: false });
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data || 'Failed to delete exam.';
      setStatus({ type: 'error', message: String(message) });
    }
  };

  const toggleExamActive = async (exam) => {
    const nextActive = !Boolean(exam.active);
    const action = nextActive ? 'activate' : 'deactivate';
    if (!window.confirm(`Are you sure you want to ${action} this exam?`)) return;
    setStatus(null);
    try {
      await api.patch(`/exams/${exam.id}/active`, null, { params: { active: nextActive } });
      setStatus({ type: 'success', message: `Exam ${nextActive ? 'activated' : 'deactivated'} successfully.` });
      fetchAll({ clearStatus: false });
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data || 'Failed to update exam status.';
      setStatus({ type: 'error', message: String(message) });
    }
  };

  const uploadEssayPaper = async (examId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    setUploading((prev) => ({ ...prev, [examId]: true }));
    setStatus(null);
    try {
      await api.post(`/exams/${examId}/upload/paper`, formData);
      setStatus({ type: 'success', message: 'Essay attachment uploaded successfully.' });
      fetchAll({ clearStatus: false });
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data || 'Failed to upload exam paper.';
      setStatus({ type: 'error', message: String(message) });
    } finally {
      setUploading((prev) => ({ ...prev, [examId]: false }));
    }
  };

  const setAnswer = (examId, questionKey, option) => {
    setStudentAnswers((prev) => ({
      ...prev,
      [examId]: {
        ...(prev[examId] || {}),
        [questionKey]: option,
      },
    }));
  };

  const addMcqQuestion = () => {
    setMcqQuestions((prev) => [...prev, { ...EMPTY_MCQ_QUESTION }]);
  };

  const removeMcqQuestion = (index) => {
    setMcqQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateMcqQuestion = (index, field, value) => {
    setMcqQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, [field]: value } : q)));
  };

  const submitMcqAnswers = async (exam) => {
    const payload = studentAnswers[exam.id] || {};
    if (Object.keys(payload).length === 0) {
      setStatus({ type: 'error', message: 'Select at least one MCQ answer before submitting.' });
      return;
    }

    setSubmitting((prev) => ({ ...prev, [exam.id]: true }));
    setStatus(null);
    try {
      await api.post(`/exams/${exam.id}/submit/mcq`, payload);
      setStatus({ type: 'success', message: 'MCQ answers submitted and auto-marked successfully.' });
      fetchAll({ clearStatus: false });
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data || 'Failed to submit MCQ answers.';
      setStatus({ type: 'error', message: String(message) });
    } finally {
      setSubmitting((prev) => ({ ...prev, [exam.id]: false }));
    }
  };

  const submitEssayAnswer = async (exam, file) => {
    if (!file) {
      setStatus({ type: 'error', message: 'Please select your essay answer file before submitting.' });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setSubmitting((prev) => ({ ...prev, [exam.id]: true }));
    setStatus(null);
    try {
      await api.post(`/exams/${exam.id}/submit/essay`, formData);
      setStatus({ type: 'success', message: 'Essay answer uploaded successfully.' });
      setEssayAnswerFiles((prev) => ({ ...prev, [exam.id]: null }));
      fetchAll({ clearStatus: false });
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data || 'Failed to upload essay answer.';
      setStatus({ type: 'error', message: String(message) });
    } finally {
      setSubmitting((prev) => ({ ...prev, [exam.id]: false }));
    }
  };

  const enrollExam = async (examId) => {
    setStatus(null);
    try {
      await api.post(`/exams/${examId}/enroll`);
      setStatus({ type: 'success', message: 'Enrolled successfully. You can now attempt this exam/quiz.' });
      await fetchAll({ clearStatus: false });
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data || 'Failed to enroll exam.';
      setStatus({ type: 'error', message: String(message) });
    }
  };

  const loadEssaySubmissions = async (examId) => {
    setLoadingSubmissions((prev) => ({ ...prev, [examId]: true }));
    setStatus(null);
    try {
      const res = await api.get(`/exams/${examId}/submissions`);
      setEssaySubmissions((prev) => ({ ...prev, [examId]: Array.isArray(res.data) ? res.data : [] }));
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data || 'Failed to load student submissions.';
      setStatus({ type: 'error', message: String(message) });
    } finally {
      setLoadingSubmissions((prev) => ({ ...prev, [examId]: false }));
    }
  };

  const updateGradingForm = (resultId, field, value) => {
    setGradingForms((prev) => ({
      ...prev,
      [resultId]: {
        ...(prev[resultId] || {}),
        [field]: value,
      },
    }));
  };

  const publishResultSheet = async (examId, submission) => {
    const form = gradingForms[submission.resultId] || {};
    const scoreValue = form.score ?? submission.score ?? '';
    const totalValue = form.totalMarks ?? submission.totalMarks ?? '';
    if (scoreValue === '' || totalValue === '') {
      setStatus({ type: 'error', message: 'Score and total marks are required to publish result sheet.' });
      return;
    }

    setGradingSubmissions((prev) => ({ ...prev, [submission.resultId]: true }));
    setStatus(null);
    try {
      await api.patch(`/exams/${examId}/submissions/${submission.resultId}/result`, {
        score: Number(scoreValue),
        totalMarks: Number(totalValue),
        teacherRemark: form.teacherRemark ?? submission.teacherRemark ?? '',
      });
      setStatus({ type: 'success', message: 'Result sheet published successfully.' });
      await loadEssaySubmissions(examId);
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data || 'Failed to publish result sheet.';
      setStatus({ type: 'error', message: String(message) });
    } finally {
      setGradingSubmissions((prev) => ({ ...prev, [submission.resultId]: false }));
    }
  };

  const canAdminEditDelete = (exam) => !isOngoing(exam);
  const sortedExams = [...exams].sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="backdrop-blur-2xl bg-gradient-to-r from-blue-700/40 to-indigo-800/40 rounded-3xl p-8 text-white shadow-2xl border border-white/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Exam Center</h1>
            <p className="text-white/90 mt-2">
              {isAdmin && 'Create and manage all exams.'}
              {isTeacher && 'Manage only your assigned exams.'}
              {isStudent && 'View exam schedules and materials.'}
            </p>
          </div>
          {(isAdmin || isTeacher) && (
            <button
              onClick={() => {
                setEditingExamId(null);
                setShowCreateForm(true);
                setAdminForm(EMPTY_ADMIN_FORM);
                setMcqQuestions([{ ...EMPTY_MCQ_QUESTION }]);
                setEssayPaperFile(null);
              }}
              className="bg-white text-indigo-700 font-bold px-5 py-2.5 rounded-xl"
            >
              Create Exam
            </button>
          )}
        </div>
      </div>

      {status && (
        <div className={`p-3 rounded-lg border text-sm ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
          {status.message}
        </div>
      )}

      {((isAdmin || isTeacher) && showCreateForm) && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-4">{editingExamId ? 'Edit Exam (Admin)' : isTeacher ? 'Create Exam (Teacher)' : 'Create Exam (Admin)'}</h2>
          <form onSubmit={editingExamId ? saveEdit : isTeacher ? createExamAsTeacher : createExamAsAdmin} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Exam name"
              value={adminForm.title}
              onChange={(e) => setAdminForm((p) => ({ ...p, title: e.target.value }))}
              className="px-3 py-2 border border-slate-300 rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="Exam id/code"
              value={adminForm.examCode}
              onChange={(e) => setAdminForm((p) => ({ ...p, examCode: e.target.value }))}
              className="px-3 py-2 border border-slate-300 rounded-lg"
              required
            />
            <input
              type="datetime-local"
              value={adminForm.scheduledAt}
              onChange={(e) => setAdminForm((p) => ({ ...p, scheduledAt: e.target.value }))}
              className="px-3 py-2 border border-slate-300 rounded-lg"
              required
            />
            <input
              type="datetime-local"
              value={adminForm.endAt}
              onChange={(e) => setAdminForm((p) => ({ ...p, endAt: e.target.value }))}
              className="px-3 py-2 border border-slate-300 rounded-lg"
              required
            />
            {isAdmin ? (
              <select
                value={adminForm.teacherId}
                onChange={(e) => setAdminForm((p) => ({ ...p, teacherId: e.target.value, moduleId: '' }))}
                className="px-3 py-2 border border-slate-300 rounded-lg"
                required
              >
                <option value="">Select Teacher</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>{t.fullName || t.email}</option>
                ))}
              </select>
            ) : (
              <div className="px-3 py-2 border border-slate-200 rounded-lg text-slate-500 bg-slate-50">Teacher: My Account</div>
            )}
            {isAdmin ? (
              <select
                value={adminForm.moduleId}
                onChange={(e) => setAdminForm((p) => ({ ...p, moduleId: e.target.value }))}
                className="px-3 py-2 border border-slate-300 rounded-lg"
                required
              >
                <option value="">Select Module</option>
                {availableModules.map((m) => (
                  <option key={m.id} value={m.id}>{m.name || m.subjectId}</option>
                ))}
              </select>
            ) : (
              <div className="px-3 py-2 border border-slate-200 rounded-lg text-slate-500 bg-slate-50">Module: Auto-selected from your profile</div>
            )}
            <select
              value={adminForm.examType}
              onChange={(e) => setAdminForm((p) => ({ ...p, examType: e.target.value }))}
              className="px-3 py-2 border border-slate-300 rounded-lg"
              required
            >
              <option value="MCQ">MCQ</option>
              <option value="ESSAY">ESSAY</option>
            </select>
            <select
              value={adminForm.classId}
              onChange={(e) => setAdminForm((p) => ({ ...p, classId: e.target.value }))}
              className="px-3 py-2 border border-slate-300 rounded-lg"
            >
              <option value="">No class (optional)</option>
              {(isTeacher ? availableTeacherClasses : classes).map((c) => (
                <option key={c.id} value={c.id}>{c.name} - {c.grade}</option>
              ))}
            </select>
            <textarea
              placeholder="Description"
              value={adminForm.description}
              onChange={(e) => setAdminForm((p) => ({ ...p, description: e.target.value }))}
              className="md:col-span-2 px-3 py-2 border border-slate-300 rounded-lg"
              rows="3"
            />

            {adminForm.examType === 'MCQ' && (
              <div className="md:col-span-2 space-y-3 border border-slate-200 rounded-lg p-3 bg-slate-50">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">MCQ Question Sheet</p>
                  <button type="button" onClick={addMcqQuestion} className="text-xs font-semibold text-indigo-700 hover:underline">+ Add Question</button>
                </div>

                {mcqQuestions.map((q, idx) => (
                  <div key={`create-mcq-${idx}`} className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-white border border-slate-200 rounded-lg p-3">
                    <input
                      type="text"
                      placeholder={`Question ${idx + 1}`}
                      value={q.text}
                      onChange={(e) => updateMcqQuestion(idx, 'text', e.target.value)}
                      className="md:col-span-2 px-3 py-2 border border-slate-300 rounded-lg"
                      required
                    />
                    <input type="text" placeholder="Option A" value={q.optionA} onChange={(e) => updateMcqQuestion(idx, 'optionA', e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg" required />
                    <input type="text" placeholder="Option B" value={q.optionB} onChange={(e) => updateMcqQuestion(idx, 'optionB', e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg" required />
                    <input type="text" placeholder="Option C" value={q.optionC} onChange={(e) => updateMcqQuestion(idx, 'optionC', e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg" required />
                    <input type="text" placeholder="Option D" value={q.optionD} onChange={(e) => updateMcqQuestion(idx, 'optionD', e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg" required />
                    <input type="text" placeholder="Option E (optional)" value={q.optionE} onChange={(e) => updateMcqQuestion(idx, 'optionE', e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg" />
                    <select value={q.correctOption} onChange={(e) => updateMcqQuestion(idx, 'correctOption', e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg">
                      <option value="A">Correct: A</option>
                      <option value="B">Correct: B</option>
                      <option value="C">Correct: C</option>
                      <option value="D">Correct: D</option>
                      <option value="E">Correct: E</option>
                    </select>
                    <input type="number" min="1" placeholder="Marks" value={q.marks} onChange={(e) => updateMcqQuestion(idx, 'marks', e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg" required />
                    <div className="md:col-span-2">
                      <button type="button" onClick={() => removeMcqQuestion(idx)} disabled={mcqQuestions.length === 1} className="text-xs font-semibold text-rose-700 hover:underline disabled:opacity-40">
                        Remove Question
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isTeacher && adminForm.examType === 'ESSAY' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Essay Question Paper (PDF)</label>
                <input
                  type="file"
                  accept=".pdf"
                  className="w-full text-sm"
                  onChange={(e) => setEssayPaperFile(e.target.files?.[0] || null)}
                />
              </div>
            )}

            <div className="md:col-span-2 flex gap-2">
              <button type="submit" disabled={saving} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold">
                {saving ? 'Saving...' : editingExamId ? 'Save Changes' : 'Create Exam'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingExamId(null);
                  setAdminForm(EMPTY_ADMIN_FORM);
                  setMcqQuestions([{ ...EMPTY_MCQ_QUESTION }]);
                  setEssayPaperFile(null);
                }}
                className="bg-slate-500 text-white px-4 py-2 rounded-lg font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="bg-white p-6 rounded-2xl border border-slate-100">Loading exams...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedExams.map((exam) => (
            <div key={exam.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              {isStudent && studentStatuses[exam.id] && !studentStatuses[exam.id]?.canSubmit && (
                <div className="mb-3 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2">
                  You can submit answers only after enrolling and during active exam time.
                </div>
              )}

              {isStudent && (
                <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 p-2">
                  {studentStatuses[exam.id]?.enrolled ? (
                    <p className="text-xs text-emerald-700 font-semibold">You are enrolled for this exam.</p>
                  ) : (
                    <p className="text-xs text-blue-800">Enroll to attempt this exam/quiz and submit answers.</p>
                  )}

                  {studentStatuses[exam.id]?.enrolled ? (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-1 rounded">Enrolled</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => enrollExam(exam.id)}
                      className="text-xs font-semibold text-white bg-blue-600 px-2 py-1 rounded"
                    >
                      Enroll
                    </button>
                  )}
                </div>
              )}

              {isStudent && studentStatuses[exam.id] && (
                <div className="mb-3 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-2">
                  Enrolled: {studentStatuses[exam.id]?.enrolled ? 'Yes' : 'No'}
                  {' | '}
                  Attempts: {studentStatuses[exam.id]?.attemptCount ?? 0}
                  {studentStatuses[exam.id]?.latestSubmissionType ? ` | Last: ${studentStatuses[exam.id].latestSubmissionType}` : ''}
                  {studentStatuses[exam.id]?.latestScore != null && studentStatuses[exam.id]?.latestTotalMarks != null
                    ? ` | Score: ${studentStatuses[exam.id].latestScore}/${studentStatuses[exam.id].latestTotalMarks}`
                    : ''}
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-bold text-slate-800">{exam.title}</h3>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${exam.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
                  {exam.active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>

              <p className="text-sm text-slate-500 mt-1">Exam ID: {exam.examCode || '-'}</p>
              <p className="text-sm text-slate-500">Type: {exam.examType || '-'}</p>
              <p className="text-sm text-slate-500">Teacher: {exam.teacher?.fullName || '-'}</p>
              <p className="text-sm text-slate-500">Module: {exam.module?.name || '-'}</p>
              <p className="text-sm text-slate-500">Start: {formatDateTime(exam.scheduledAt)}</p>
              <p className="text-sm text-slate-500">End: {formatDateTime(exam.endAt)}</p>

              {isStudent && isOngoing(exam) && (
                <p className="text-sm text-amber-700 font-semibold mt-2">Time Remaining: <Countdown endAt={exam.endAt} /></p>
              )}

              <div className="mt-4 space-y-2">
                {exam.examType === 'ESSAY' ? (
                  <>
                    {exam.examPaperUrl ? (
                      isStudent ? (
                        isOngoing(exam) ? (
                          <a href={buildBackendUrl(exam.examPaperUrl)} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-sm font-semibold hover:underline">
                            Open Essay Attachment
                          </a>
                        ) : (
                          <p className="text-sm text-slate-500">Essay attachment is visible during exam time only.</p>
                        )
                      ) : (
                        <a href={buildBackendUrl(exam.examPaperUrl)} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-sm font-semibold hover:underline">
                          Open Essay Attachment
                        </a>
                      )
                    ) : (
                      <p className="text-sm text-slate-500">Essay attachment not uploaded yet</p>
                    )}
                    {(isTeacher || isAdmin) && (
                      <p className="text-xs text-slate-500">Attachment edit attempts: {exam.examPaperEditCount || 0}</p>
                    )}

                    {(isTeacher || isAdmin) && (
                      <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-700">Student Result Sheet</p>
                          <button
                            type="button"
                            onClick={() => loadEssaySubmissions(exam.id)}
                            disabled={loadingSubmissions[exam.id]}
                            className="text-xs font-semibold text-indigo-700 hover:underline disabled:opacity-50"
                          >
                            {loadingSubmissions[exam.id] ? 'Loading...' : 'Refresh'}
                          </button>
                        </div>

                        {Array.isArray(essaySubmissions[exam.id]) && essaySubmissions[exam.id].length > 0 ? (
                          <div className="mt-2 space-y-2">
                            {essaySubmissions[exam.id].map((submission) => (
                              <div key={submission.resultId} className="rounded border border-slate-200 bg-white p-2 text-xs text-slate-700">
                                <p className="font-semibold">{submission.studentName || '-'} {submission.studentEmail ? `(${submission.studentEmail})` : ''}</p>
                                <p>Type: {submission.submissionType || '-'} | Attempt: {submission.attemptNumber || 1}</p>
                                <p>Submitted: {formatDateTime(submission.submittedAt)} | Graded: {formatDateTime(submission.gradedAt)}</p>
                                <p>Status: {submission.status || '-'}</p>

                                {submission.essayAnswerUrl && (
                                  <a
                                    href={buildBackendUrl(submission.essayAnswerUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-700 font-semibold hover:underline"
                                  >
                                    Open Uploaded Essay Answer
                                  </a>
                                )}

                                {submission.answers && Object.keys(submission.answers).length > 0 && (
                                  <div className="mt-1 rounded bg-slate-50 border border-slate-200 p-2">
                                    <p className="font-semibold text-slate-700">MCQ Answers</p>
                                    {Object.entries(submission.answers).map(([qId, ans]) => (
                                      <p key={`${submission.resultId}-${qId}`} className="text-slate-600">{qId}: {String(ans)}</p>
                                    ))}
                                  </div>
                                )}

                                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                                  <input
                                    type="number"
                                    min="0"
                                    placeholder="Score"
                                    value={gradingForms[submission.resultId]?.score ?? submission.score ?? ''}
                                    onChange={(e) => updateGradingForm(submission.resultId, 'score', e.target.value)}
                                    className="px-2 py-1 border border-slate-300 rounded"
                                  />
                                  <input
                                    type="number"
                                    min="0"
                                    placeholder="Total Marks"
                                    value={gradingForms[submission.resultId]?.totalMarks ?? submission.totalMarks ?? ''}
                                    onChange={(e) => updateGradingForm(submission.resultId, 'totalMarks', e.target.value)}
                                    className="px-2 py-1 border border-slate-300 rounded"
                                  />
                                  <textarea
                                    rows="2"
                                    placeholder="Teacher remark (optional)"
                                    value={gradingForms[submission.resultId]?.teacherRemark ?? submission.teacherRemark ?? ''}
                                    onChange={(e) => updateGradingForm(submission.resultId, 'teacherRemark', e.target.value)}
                                    className="md:col-span-2 px-2 py-1 border border-slate-300 rounded"
                                  />
                                </div>

                                <button
                                  type="button"
                                  onClick={() => publishResultSheet(exam.id, submission)}
                                  disabled={gradingSubmissions[submission.resultId]}
                                  className="mt-2 bg-emerald-600 text-white px-2 py-1 rounded font-semibold disabled:opacity-50"
                                >
                                  {gradingSubmissions[submission.resultId] ? 'Publishing...' : 'Publish Result'}
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-2 text-xs text-slate-500">No student submissions yet.</p>
                        )}
                      </div>
                    )}

                    {isStudent && studentStatuses[exam.id]?.latestEssayAnswerUrl && (
                      <a
                        href={buildBackendUrl(studentStatuses[exam.id].latestEssayAnswerUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-emerald-700 font-semibold hover:underline"
                      >
                        View My Last Essay Submission
                      </a>
                    )}
                  </>
                ) : (
                  <div className="text-sm text-slate-600">
                    {isStudent ? (
                      <>
                        <p className="font-semibold text-slate-700">MCQ Answer Sheet</p>
                        {Array.isArray(exam.questions) && exam.questions.length > 0 ? (
                          <div className="mt-2 space-y-2">
                            {exam.questions.map((q, idx) => (
                              <div key={q.id || idx} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                <p className="text-xs font-semibold mb-1">Q{idx + 1}: {q.text}</p>
                                {['A', 'B', 'C', 'D', 'E'].map((opt) => {
                                  const questionKey = q.id || `q-${idx}`;
                                  const optionText = q[`option${opt}`];
                                  if (!optionText) return null;
                                  return (
                                    <label key={opt} className="flex items-center gap-2 text-xs">
                                      <input
                                        type="radio"
                                        name={`${exam.id}-${questionKey}`}
                                        value={opt}
                                        checked={(studentAnswers[exam.id] || {})[questionKey] === opt}
                                        onChange={() => setAnswer(exam.id, questionKey, opt)}
                                        disabled={!studentStatuses[exam.id]?.canSubmit || submitting[exam.id]}
                                      />
                                      <span>{opt}. {optionText}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => submitMcqAnswers(exam)}
                              disabled={!studentStatuses[exam.id]?.canSubmit || submitting[exam.id]}
                              className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
                            >
                              {submitting[exam.id] ? 'Submitting...' : 'Submit MCQ Answers'}
                            </button>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">MCQ question sheet will appear when added by teacher/admin.</p>
                        )}
                      </>
                    ) : (
                      <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-700">Student Result Sheet (Auto Graded)</p>
                          <button
                            type="button"
                            onClick={() => loadEssaySubmissions(exam.id)}
                            disabled={loadingSubmissions[exam.id]}
                            className="text-xs font-semibold text-indigo-700 hover:underline disabled:opacity-50"
                          >
                            {loadingSubmissions[exam.id] ? 'Loading...' : 'Refresh'}
                          </button>
                        </div>

                        {Array.isArray(essaySubmissions[exam.id]) && essaySubmissions[exam.id].length > 0 ? (
                          <div className="mt-2 space-y-2">
                            {essaySubmissions[exam.id]
                              .filter((submission) => String(submission.submissionType || '').toUpperCase() === 'MCQ')
                              .map((submission) => (
                                <div key={submission.resultId} className="rounded border border-slate-200 bg-white p-2 text-xs text-slate-700">
                                  <p className="font-semibold">{submission.studentName || '-'} {submission.studentEmail ? `(${submission.studentEmail})` : ''}</p>
                                  <p>Attempt: {submission.attemptNumber || 1} | Submitted: {formatDateTime(submission.submittedAt)}</p>
                                  <p>Status: {submission.status || '-'}</p>
                                  <p className="font-semibold text-emerald-700">
                                    Score: {submission.score ?? 0}/{submission.totalMarks ?? 0}
                                  </p>

                                  {submission.answers && Object.keys(submission.answers).length > 0 && (
                                    <div className="mt-1 rounded bg-slate-50 border border-slate-200 p-2">
                                      <p className="font-semibold text-slate-700">Student Selected Answers</p>
                                      {Object.entries(submission.answers).map(([qId, ans]) => (
                                        <p key={`${submission.resultId}-${qId}`} className="text-slate-600">{qId}: {String(ans)}</p>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="mt-2 text-xs text-slate-500">No MCQ submissions yet.</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {isTeacher && editingExamId === exam.id && (
                <form onSubmit={saveEdit} className="mt-4 p-3 border border-slate-200 rounded-xl space-y-2">
                  <p className="text-sm font-semibold text-slate-700">Edit (Teacher)</p>
                  <input
                    type="datetime-local"
                    value={teacherEditForm.scheduledAt}
                    onChange={(e) => setTeacherEditForm((p) => ({ ...p, scheduledAt: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    required
                  />
                  <input
                    type="datetime-local"
                    value={teacherEditForm.endAt}
                    onChange={(e) => setTeacherEditForm((p) => ({ ...p, endAt: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    required
                  />
                  <select
                    value={teacherEditForm.examType}
                    onChange={(e) => setTeacherEditForm((p) => ({ ...p, examType: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="MCQ">MCQ</option>
                    <option value="ESSAY">ESSAY</option>
                  </select>
                  <div className="flex gap-2">
                    <button type="submit" disabled={saving} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold">
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingExamId(null);
                        setTeacherEditForm(EMPTY_TEACHER_EDIT);
                      }}
                      className="bg-slate-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                {(isAdmin || isTeacher) && (
                  <button
                    onClick={() => toggleExamActive(exam)}
                    className="text-sm font-semibold text-amber-700 hover:underline"
                  >
                    {exam.active ? 'Deactivate' : 'Activate'}
                  </button>
                )}

                {isAdmin && (
                  <>
                    <button
                      onClick={() => {
                        if (!canAdminEditDelete(exam)) {
                          setStatus({ type: 'error', message: 'Cannot edit ongoing exam.' });
                          return;
                        }
                        openEdit(exam);
                      }}
                      className="text-sm font-semibold text-indigo-700 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (!canAdminEditDelete(exam)) {
                          setStatus({ type: 'error', message: 'Cannot delete ongoing exam.' });
                          return;
                        }
                        deleteExam(exam);
                      }}
                      className="text-sm font-semibold text-rose-700 hover:underline"
                    >
                      Delete
                    </button>
                  </>
                )}

                {isTeacher && (
                  <button
                    onClick={() => openEdit(exam)}
                    className="text-sm font-semibold text-indigo-700 hover:underline"
                  >
                    Edit
                  </button>
                )}
              </div>

              {isTeacher && String(exam.examType || '').toUpperCase() === 'ESSAY' && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Teacher Essay Attachment Upload</label>
                  <input
                    type="file"
                    accept=".pdf"
                    className="w-full text-sm"
                    disabled={uploading[exam.id]}
                    onChange={(e) => e.target.files?.[0] && uploadEssayPaper(exam.id, e.target.files[0])}
                  />
                </div>
              )}

              {isStudent && String(exam.examType || '').toUpperCase() === 'ESSAY' && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Upload Essay Answer</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="w-full text-sm"
                    disabled={!studentStatuses[exam.id]?.canSubmit || submitting[exam.id]}
                    onChange={(e) => setEssayAnswerFiles((prev) => ({ ...prev, [exam.id]: e.target.files?.[0] || null }))}
                  />
                  {essayAnswerFiles[exam.id] && (
                    <p className="text-xs text-slate-600 mt-1">Selected: {essayAnswerFiles[exam.id].name}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => submitEssayAnswer(exam, essayAnswerFiles[exam.id])}
                    disabled={!studentStatuses[exam.id]?.canSubmit || submitting[exam.id] || !essayAnswerFiles[exam.id]}
                    className="mt-2 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
                  >
                    {submitting[exam.id] ? 'Submitting...' : 'Submit Essay Answer'}
                  </button>
                  <p className="text-xs text-slate-500 mt-1">Essay answer upload is available only during active exam time.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && sortedExams.length === 0 && (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center text-slate-500">
          No exams found.
        </div>
      )}
    </div>
  );
}
