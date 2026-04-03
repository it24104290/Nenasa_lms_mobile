import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../services/AuthContext';

export default function ClassesPage() {
  const { user } = useAuth();
  const isTeacherUser = user?.role === 'TEACHER';
  const isAdmin = user?.role === 'ADMIN';
  const isStudent = user?.role === 'STUDENT';
  const canSchedule = isTeacherUser || isAdmin;
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [status, setStatus] = useState(null);
  const [form, setForm] = useState({
    name: '',
    grade: '',
    subjectId: '',
    type: 'THEORY',
    dayOfWeek: 'MONDAY',
    startTime: '08:00',
    endTime: '10:00',
    teacherId: '',
  });

  const inferredTeacherId = useMemo(() => {
    if (!isTeacherUser) return '';
    if (user?.teacherId) return user.teacherId;
    const matchedTeacher = teachers.find((t) => t.email && t.email.toLowerCase() === (user?.username || '').toLowerCase());
    return matchedTeacher?.id || '';
  }, [isTeacherUser, teachers, user?.teacherId, user?.username]);

  const dayOptions = useMemo(
    () => ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
    []
  );

  const loadData = async () => {
    setLoading(true);
    try {
      if (isStudent) {
        const classesRes = await api.get('/classes');
        setClasses(classesRes.data || []);
        setTeachers([]);
      } else {
        const [classesRes, teachersRes] = await Promise.all([
          api.get('/classes'),
          api.get('/teachers'),
        ]);
        setClasses(classesRes.data || []);
        setTeachers(teachersRes.data || []);
      }
    } catch (error) {
      console.error('Error loading classes page data:', error);
      const message = error?.response?.data?.message || error?.response?.data || 'Failed to load classes.';
      setStatus({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isStudent]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    const teacherIdForCreate = isTeacherUser ? inferredTeacherId : form.teacherId;
    if (isTeacherUser && !teacherIdForCreate) {
      setSaving(false);
      setStatus({ type: 'error', message: 'Teacher profile is not linked to this login. Ask admin to create/update your teacher record with the same email as your user account.' });
      return;
    }

    try {
      await api.post('/classes', {
        name: form.name,
        grade: form.grade,
        subjectId: form.subjectId,
        type: form.type,
        dayOfWeek: form.dayOfWeek,
        startTime: form.startTime,
        endTime: form.endTime,
      }, {
        params: {
          teacherId: teacherIdForCreate || undefined,
        },
      });

      setStatus({ type: 'success', message: 'Class scheduled successfully.' });
      setShowForm(false);
      setForm({
        name: '',
        grade: '',
        subjectId: '',
        type: 'THEORY',
        dayOfWeek: 'MONDAY',
        startTime: '08:00',
        endTime: '10:00',
        teacherId: '',
      });
      await loadData();
    } catch (error) {
      console.error('Error creating class:', error);
      const message = error?.response?.data?.message || error?.response?.data || 'Failed to schedule class.';
      setStatus({ type: 'error', message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {isStudent ? (
        // Student View: Browse Available Classes
        <>
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 shadow-lg flex items-center justify-between text-white">
            <div>
              <h1 className="text-3xl font-bold mb-2">Available Classes</h1>
              <p className="text-indigo-100 text-lg">Browse and enroll in classes scheduled by our teachers.</p>
            </div>
          </div>

          {loading ? (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
              <p className="text-slate-500">Loading classes...</p>
            </div>
          ) : classes.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
              <p className="text-slate-500 text-lg">No classes scheduled yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((cls) => (
                <div key={cls.id} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl hover:shadow-lg hover:border-indigo-200 transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                      cls.type === 'THEORY' ? 'bg-blue-100 text-blue-700' :
                      cls.type === 'REVISION' ? 'bg-purple-100 text-purple-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {cls.type}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{cls.grade}</span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-800 mb-1">{cls.name || 'Class'}</h3>
                  <p className="text-sm text-indigo-600 font-semibold mb-4">{cls.subjectId || 'Subject'}</p>

                  <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl">
                    <div className="flex items-center text-slate-700 text-sm">
                      <svg className="w-5 h-5 mr-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      <span className="font-medium">{cls.dayOfWeek || 'TBA'}</span>
                    </div>
                    <div className="flex items-center text-slate-700 text-sm">
                      <svg className="w-5 h-5 mr-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span className="font-medium">{cls.startTime || '-'} - {cls.endTime || '-'}</span>
                    </div>
                    <div className="flex items-center text-slate-700 text-sm">
                      <svg className="w-5 h-5 mr-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      <span className="font-medium">{cls.teacher?.fullName || 'TBA'}</span>
                    </div>
                  </div>

                  <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors group-hover:shadow-md">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        // Teacher/Admin View: Manage and Schedule Classes
        <>
          <h1 className="text-3xl font-bold text-slate-800">Classes Directory</h1>

          {status && (
            <div className={`p-3 rounded-lg text-sm border ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {status.message}
            </div>
          )}

          {showForm && (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Schedule New Class</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Class Name</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Grade</label>
                    <input
                      type="text"
                      required
                      value={form.grade}
                      onChange={(e) => handleChange('grade', e.target.value)}
                      placeholder="e.g. A/L"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Subject</label>
                    <input
                      type="text"
                      required
                      value={form.subjectId}
                      onChange={(e) => handleChange('subjectId', e.target.value)}
                      placeholder="e.g. mathematics"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Class Type</label>
                    <select
                      value={form.type}
                      onChange={(e) => handleChange('type', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="THEORY">THEORY</option>
                      <option value="REVISION">REVISION</option>
                      <option value="PAPER">PAPER</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Day</label>
                    <select
                      value={form.dayOfWeek}
                      onChange={(e) => handleChange('dayOfWeek', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      {dayOptions.map((day) => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      required
                      value={form.startTime}
                      onChange={(e) => handleChange('startTime', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">End Time</label>
                    <input
                      type="time"
                      required
                      value={form.endTime}
                      onChange={(e) => handleChange('endTime', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Teacher (optional)</label>
                  {isTeacherUser ? (
                    <input
                      type="text"
                      readOnly
                      value={teachers.find((t) => t.id === inferredTeacherId)?.fullName || 'Auto-assigned from your teacher account'}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600"
                    />
                  ) : (
                    <select
                      value={form.teacherId}
                      onChange={(e) => handleChange('teacherId', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="">Not selected</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>{teacher.fullName} ({teacher.subject || 'N/A'})</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-60"
                  >
                    {saving ? 'Scheduling...' : 'Schedule Class'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
              <h2 className="text-lg font-bold text-slate-700">All Scheduled Classes</h2>
              {canSchedule && (
                <button
                  onClick={() => {
                    setStatus(null);
                    setShowForm((prev) => !prev);
                  }}
                  className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  + Schedule Class
                </button>
              )}
            </div>

            {loading ? (
              <p className="text-slate-500 text-center py-10">Loading classes...</p>
            ) : classes.length === 0 ? (
              <p className="text-slate-500 text-center py-10">No tuition classes are actively registered in the system right now.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-500 text-sm border-b border-slate-100">
                      <th className="px-4 py-3 font-semibold uppercase tracking-wider">Class</th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wider">Grade</th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wider">Subject</th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wider">Schedule</th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wider">Teacher</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {classes.map((cls) => (
                      <tr key={cls.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-800">{cls.name || 'Untitled Class'}</td>
                        <td className="px-4 py-3 text-slate-600">{cls.grade || '-'}</td>
                        <td className="px-4 py-3 text-slate-600">{cls.subjectId || '-'}</td>
                        <td className="px-4 py-3 text-slate-600">{cls.dayOfWeek || '-'} {cls.startTime || '-'} - {cls.endTime || '-'}</td>
                        <td className="px-4 py-3 text-slate-600">{cls.teacher?.fullName || 'Not assigned'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
