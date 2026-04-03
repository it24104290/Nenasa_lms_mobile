import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../services/AuthContext';

export default function ClassRecommendationsPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const currentUsername = String(user?.username || '').trim().toLowerCase();
    const [teachers, setTeachers] = useState([]);
    const [subjects, setSubjects] = useState([
        { id: 'maths', name: 'Combined Maths' },
        { id: 'physics', name: 'Physics' },
        { id: 'chemistry', name: 'Chemistry' },
        { id: 'biology', name: 'Biology' },
        { id: 'ict', name: 'ICT' },
    ]);

    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [recommendations, setRecommendations] = useState([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);

    const [leaderboardPayload, setLeaderboardPayload] = useState({ subjects: [], date: '', lastUpdatedAt: '' });
    const [leaderboardSubject, setLeaderboardSubject] = useState('');
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
    const [leaderboardError, setLeaderboardError] = useState('');

    const [application, setApplication] = useState({
        studentName: '',
        age: '',
        grade: '',
        subjectId: '',
        teacherId: '',
    });
    const [applicationStatus, setApplicationStatus] = useState(null);
    const [loadingApplication, setLoadingApplication] = useState(false);

    useEffect(() => {
        api.get('/teachers').then((res) => setTeachers(res.data)).catch(console.error);
    }, []);

    useEffect(() => {
        const loadLeaderboard = async () => {
            setLoadingLeaderboard(true);
            setLeaderboardError('');
            try {
                const res = await api.get('/exams/leaderboard/daily-subject');
                const payload = res?.data || { subjects: [] };
                const subjects = Array.isArray(payload.subjects) ? payload.subjects : [];
                setLeaderboardPayload({
                    subjects,
                    date: payload.date || '',
                    lastUpdatedAt: payload.lastUpdatedAt || '',
                });

                if (subjects.length > 0) {
                    const found = subjects.some((s) => s.subject === leaderboardSubject);
                    if (!found) {
                        setLeaderboardSubject(subjects[0].subject);
                    }
                } else {
                    setLeaderboardSubject('');
                }
            } catch (error) {
                const message = error?.response?.data?.message || error?.response?.data || 'Failed to load daily leaderboard.';
                setLeaderboardError(String(message));
            } finally {
                setLoadingLeaderboard(false);
            }
        };

        loadLeaderboard();
        const id = setInterval(loadLeaderboard, 60000);
        return () => clearInterval(id);
    }, [leaderboardSubject]);

    const selectedLeaderboard = (leaderboardPayload.subjects || []).find((s) => s.subject === leaderboardSubject)
        || (leaderboardPayload.subjects || [])[0]
        || null;
    const selectedRows = selectedLeaderboard?.rankings || [];

    const isCurrentStudentRow = (row) => {
        if (!currentUsername) return false;
        const studentName = String(row?.studentName || '').trim().toLowerCase();
        const studentEmail = String(row?.studentEmail || '').trim().toLowerCase();
        return studentName === currentUsername || studentEmail === currentUsername;
    };

    const trendLabel = (trend) => {
        if (trend === 'up') return '↑ Up';
        if (trend === 'down') return '↓ Down';
        if (trend === 'new') return '★ New';
        return '→ Same';
    };

    const rankBadge = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return rank;
    };

    const handleApplicationChange = (field, value) => {
        setApplication((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubjectSelect = (subjectId) => {
        handleApplicationChange('subjectId', subjectId);
        if (subjectId) setSelectedSubject(subjectId);
    };

    const handleApplySubject = async (e) => {
        e.preventDefault();
        if (!application.studentName || !application.age || !application.grade || !application.subjectId || !application.teacherId) {
            setApplicationStatus({ type: 'error', message: 'Please fill out all fields in the subject application.' });
            return;
        }

        setLoadingApplication(true);
        setApplicationStatus(null);

        try {
            await api.post('/module-applications', {
                studentName: application.studentName,
                age: Number(application.age),
                grade: application.grade,
                moduleId: null,
                teacherId: application.teacherId,
            });

            const admissionAmount = 1500; // fixed admission fee, adjust as needed
            navigate('/payments', {
                state: {
                    paymentType: 'ADMISSION',
                    studentName: application.studentName,
                    amount: admissionAmount,
                    source: 'NEW_SUBJECT_APPLICATION',
                },
            });

            setApplicationStatus({ type: 'success', message: 'Subject application submitted. Continue with admission payment.' });
            setApplication({ studentName: '', age: '', grade: '', subjectId: '', teacherId: '' });
        } catch (err) {
            console.error(err);
            const apiMessage = err?.response?.data?.message || err?.response?.data;
            setApplicationStatus({ type: 'error', message: apiMessage || 'Failed to submit application or payment. Try again.' });
        } finally {
            setLoadingApplication(false);
        }
    };

    const handleRecommend = async () => {
        if (!selectedSubject || !selectedTeacher) return;
        setLoadingRecommendations(true);

        try {
            const response = await api.get(`/recommendations?subjectId=${selectedSubject}&teacherId=${selectedTeacher}`);
            setRecommendations(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingRecommendations(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 shadow-lg flex items-center justify-between text-white">
                <div>
                    <h1 className="text-3xl font-bold mb-2 flex items-center">Smart Class Engine</h1>
                    <p className="text-indigo-100 text-lg">Choose subject + teacher, and get paper/revision class recommendations instantly.</p>
                </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Daily Subject Leaderboard</h2>
                        <p className="text-sm text-slate-500">Subject-wise ranking based on today&apos;s exam and quiz results.</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">Auto Refresh: 60s</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    {(leaderboardPayload.subjects || []).map((entry) => (
                        <button
                            key={entry.subject}
                            type="button"
                            onClick={() => setLeaderboardSubject(entry.subject)}
                            className={`px-3 py-1 rounded-full text-sm font-semibold border ${selectedLeaderboard?.subject === entry.subject ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-300 hover:border-indigo-400'}`}
                        >
                            {entry.subject}
                        </button>
                    ))}
                </div>

                {leaderboardPayload.date && (
                    <p className="text-xs text-slate-500 mb-3">Date: {leaderboardPayload.date} | Last updated: {leaderboardPayload.lastUpdatedAt ? new Date(leaderboardPayload.lastUpdatedAt).toLocaleString() : '-'}</p>
                )}

                {loadingLeaderboard && <p className="text-sm text-slate-500">Loading leaderboard...</p>}
                {leaderboardError && <p className="text-sm text-red-600">{leaderboardError}</p>}
                {!loadingLeaderboard && !leaderboardError && selectedRows.length === 0 && (
                    <p className="text-sm text-slate-500">No submissions found for today yet.</p>
                )}

                {!loadingLeaderboard && !leaderboardError && selectedRows.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                                    <th className="px-4 py-3 font-semibold uppercase tracking-wider">Rank</th>
                                    <th className="px-4 py-3 font-semibold uppercase tracking-wider">Student</th>
                                    <th className="px-4 py-3 font-semibold uppercase tracking-wider text-right">Score</th>
                                    <th className="px-4 py-3 font-semibold uppercase tracking-wider text-right">Trend</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {selectedRows.map((row) => {
                                    const mine = isCurrentStudentRow(row);
                                    return (
                                        <tr key={`${selectedLeaderboard?.subject}-${row.rank}-${row.studentId || row.studentName}`} className={`${mine ? 'bg-emerald-50' : 'hover:bg-slate-50/60'} transition-colors`}>
                                            <td className="px-4 py-3 font-bold text-slate-700">{rankBadge(row.rank)}</td>
                                            <td className="px-4 py-3">
                                                <div className="font-semibold text-slate-800">{row.studentName}{mine ? ' (You)' : ''}</div>
                                                <div className="text-xs text-slate-500">Submissions: {row.submissionCount ?? 0}</div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="font-bold text-slate-800">{row.averagePercentage ?? 0}%</div>
                                                <div className="text-xs text-slate-500">{row.score ?? 0}/{row.totalMarks ?? 0}</div>
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm font-semibold text-slate-700">{trendLabel(row.trend)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                    <h2 className="text-xl font-bold text-slate-800 mb-6">Apply for a New subject</h2>

                    {applicationStatus && (
                        <div className={`mb-4 p-3 rounded-lg text-sm ${applicationStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {applicationStatus.message}
                        </div>
                    )}

                    <form onSubmit={handleApplySubject} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Name</label>
                            <input value={application.studentName} onChange={(e) => handleApplicationChange('studentName', e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Age</label>
                                <input value={application.age} onChange={(e) => handleApplicationChange('age', e.target.value)} type="number" min="5" max="100" required className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Grade</label>
                                <select value={application.grade} onChange={(e) => handleApplicationChange('grade', e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                                    <option value="" disabled>Select grade</option>
                                    <option value="O/L">O/L</option>
                                    <option value="A/L">A/L</option>
                                    <option value="11">Grade 11</option>
                                    <option value="12">Grade 12</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Subject</label>
                            <select value={application.subjectId} onChange={(e) => handleSubjectSelect(e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                                <option value="" disabled>Select subject</option>
                                {subjects.map((subject) => (
                                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Teacher</label>
                            <select value={application.teacherId} onChange={(e) => handleApplicationChange('teacherId', e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                                <option value="" disabled>Select teacher</option>
                                {teachers.map((teacher) => (
                                    <option key={teacher.id} value={teacher.id}>{teacher.fullName} ({teacher.subject})</option>
                                ))}
                            </select>
                        </div>

                        <button type="submit" disabled={loadingApplication} className="w-full mt-2 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors disabled:opacity-60">
                            {loadingApplication ? 'Submitting...' : 'Apply Subject'}
                        </button>
                    </form>
                </div>

                <div className="xl:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                        <h2 className="text-xl font-bold text-slate-800 mb-6">Smart Class Recommendation</h2>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Subject</label>
                                <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                                    <option value="" disabled>Select subject</option>
                                    {subjects.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Teacher</label>
                                <select value={selectedTeacher} onChange={(e) => setSelectedTeacher(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                                    <option value="" disabled>Select teacher</option>
                                    {teachers.map((t) => (
                                        <option key={t.id} value={t.id}>{t.fullName} ({t.subject})</option>
                                    ))}
                                </select>
                            </div>

                            <button type="button" onClick={handleRecommend} disabled={!selectedSubject || !selectedTeacher || loadingRecommendations} className="w-full mt-2 py-3 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 transition-colors disabled:opacity-60">
                                {loadingRecommendations ? 'Searching...' : 'Find Paper + Revision Classes'}
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-100 rounded-3xl p-8 h-full border border-slate-200">
                        <h2 className="text-xl font-bold text-slate-800 mb-6">Suggested Sessions</h2>
                        {recommendations.length > 0 ? (
                            <div className="space-y-4">
                                {recommendations.map((cls) => (
                                    <div key={cls.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                                        <div className="flex justify-between mb-2">
                                            <span className={`text-xs font-semibold px-2 py-1 rounded ${cls.type === 'PAPER' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {cls.type}
                                            </span>
                                            <span className="text-xs text-slate-500">{cls.subjectId}</span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-800">{cls.name}</h3>
                                        <p className="text-sm text-slate-500 mt-1">Teacher: {cls.teacher?.fullName || 'Unknown'}</p>
                                        <p className="text-sm text-slate-500 mt-1">{cls.dayOfWeek} {cls.startTime} - {cls.endTime}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500">Select subject and teacher to receive Paper/Revision class suggestions.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
