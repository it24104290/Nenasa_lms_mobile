import React, { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '../services/api';
import { useAuth } from '../services/AuthContext';

export default function AnalyticsDashboard() {
    const { user } = useAuth();
    const role = String(user?.role || '').toUpperCase().replace(/^ROLE_/, '');
    const username = String(user?.username || '').trim().toLowerCase();
    const [activeTab, setActiveTab] = useState('performance');
    const [leaderboardPayload, setLeaderboardPayload] = useState({ subjects: [], date: '', lastUpdatedAt: '' });
    const [selectedSubject, setSelectedSubject] = useState('');
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
    const [leaderboardError, setLeaderboardError] = useState('');

    // Hardcoded mockup data as specified
    const performanceData = [
        { name: 'Term 1', 'Physics': 65, 'Chemistry': 70, 'Math': 55 },
        { name: 'Term 2', 'Physics': 72, 'Chemistry': 75, 'Math': 68 },
        { name: 'Term 3', 'Physics': 85, 'Chemistry': 82, 'Math': 78 },
    ];

    const loadDailyLeaderboard = async () => {
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
                const exists = subjects.some((s) => s.subject === selectedSubject);
                if (!exists) {
                    setSelectedSubject(subjects[0].subject);
                }
            } else {
                setSelectedSubject('');
            }
        } catch (error) {
            const message = error?.response?.data?.message || error?.response?.data || 'Failed to load daily leaderboard.';
            setLeaderboardError(String(message));
            setLeaderboardPayload({ subjects: [], date: '', lastUpdatedAt: '' });
        } finally {
            setLoadingLeaderboard(false);
        }
    };

    useEffect(() => {
        loadDailyLeaderboard();
        const id = setInterval(loadDailyLeaderboard, 60000);
        return () => clearInterval(id);
    }, []);

    const selectedLeaderboard = useMemo(() => {
        if (!Array.isArray(leaderboardPayload.subjects)) return null;
        return leaderboardPayload.subjects.find((s) => s.subject === selectedSubject) || leaderboardPayload.subjects[0] || null;
    }, [leaderboardPayload.subjects, selectedSubject]);

    const leaderboardData = selectedLeaderboard?.rankings || [];

    const mySubjectRanks = useMemo(() => {
        if (!username || !Array.isArray(leaderboardPayload.subjects)) return [];

        return leaderboardPayload.subjects
            .map((subjectEntry) => {
                const rankings = Array.isArray(subjectEntry.rankings) ? subjectEntry.rankings : [];
                const mine = rankings.find((row) => {
                    const studentName = String(row.studentName || '').trim().toLowerCase();
                    const studentEmail = String(row.studentEmail || '').trim().toLowerCase();
                    return studentName === username || studentEmail === username;
                });
                if (!mine) return null;

                return {
                    subject: subjectEntry.subject,
                    rank: mine.rank,
                    averagePercentage: mine.averagePercentage,
                    score: mine.score,
                    totalMarks: mine.totalMarks,
                    trend: mine.trend,
                    submissionCount: mine.submissionCount,
                };
            })
            .filter(Boolean);
    }, [leaderboardPayload.subjects, username]);

    const renderRankBadge = (rank) => {
        if (rank === 1) return <span className="text-lg" title="Gold">🥇</span>;
        if (rank === 2) return <span className="text-lg" title="Silver">🥈</span>;
        if (rank === 3) return <span className="text-lg" title="Bronze">🥉</span>;
        return <span>{rank}</span>;
    };

    const renderTrend = (trend) => {
        if (trend === 'up') {
            return <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold"><span>↑</span><span>Up</span></span>;
        }
        if (trend === 'down') {
            return <span className="inline-flex items-center gap-1 text-rose-700 font-semibold"><span>↓</span><span>Down</span></span>;
        }
        if (trend === 'new') {
            return <span className="inline-flex items-center gap-1 text-indigo-700 font-semibold"><span>★</span><span>New</span></span>;
        }
        return <span className="inline-flex items-center gap-1 text-slate-600 font-semibold"><span>→</span><span>Same</span></span>;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Panel */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-10 shadow-lg text-white flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold mb-3 flex items-center">
                        <svg className="w-10 h-10 mr-4 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>
                        Analytics & Insights
                    </h1>
                    <p className="text-emerald-100 text-lg max-w-2xl">Monitor class performance, track student progress, and view daily leaderboards.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 border-b border-slate-200">
                <button
                    className={`pb-4 px-6 text-sm font-bold tracking-wide transition-colors relative ${activeTab === 'performance' ? 'text-teal-700' : 'text-slate-500 hover:text-slate-800'}`}
                    onClick={() => setActiveTab('performance')}
                >
                    CLASS PERFORMANCE
                    {activeTab === 'performance' && <span className="absolute bottom-0 left-0 w-full h-1 bg-teal-600 rounded-t-lg"></span>}
                </button>
                <button
                    className={`pb-4 px-6 text-sm font-bold tracking-wide transition-colors relative ${activeTab === 'leaderboard' ? 'text-teal-700' : 'text-slate-500 hover:text-slate-800'}`}
                    onClick={() => setActiveTab('leaderboard')}
                >
                    DAILY LEADERBOARD
                    {activeTab === 'leaderboard' && <span className="absolute bottom-0 left-0 w-full h-1 bg-teal-600 rounded-t-lg"></span>}
                </button>
            </div>

            {/* Dashboard View */}
            {activeTab === 'performance' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Bar Chart Container */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                        <h2 className="text-xl font-bold text-slate-800 mb-6">Average Marks by Subject</h2>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                    <Bar dataKey="Physics" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Chemistry" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Math" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Line Chart Container */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                        <h2 className="text-xl font-bold text-slate-800 mb-6">Subject Growth Trend</h2>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={performanceData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                    <Line type="monotone" dataKey="Physics" stroke="#4f46e5" strokeWidth={3} dot={{ strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="Chemistry" stroke="#06b6d4" strokeWidth={3} dot={{ strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="Math" stroke="#8b5cf6" strokeWidth={3} dot={{ strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* Leaderboard View */}
            {activeTab === 'leaderboard' && (
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-bold text-slate-800">{selectedLeaderboard?.subject || 'Subject'} - Daily Top Performers</h2>
                        <span className="px-4 py-1.5 bg-amber-100 text-amber-800 text-sm font-bold rounded-full flex items-center">
                            <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                            Auto updates daily
                        </span>
                    </div>

                    {role === 'STUDENT' && (
                        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                            <h3 className="text-sm font-bold text-emerald-800 mb-2">My Rank In Each Subject</h3>
                            {mySubjectRanks.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {mySubjectRanks.map((item) => (
                                        <div key={item.subject} className="rounded-xl border border-emerald-200 bg-white p-3">
                                            <p className="text-xs text-slate-500">{item.subject}</p>
                                            <p className="text-lg font-bold text-emerald-700">Rank #{item.rank}</p>
                                            <p className="text-xs text-slate-600">{item.averagePercentage ?? 0}% ({item.score ?? 0}/{item.totalMarks ?? 0})</p>
                                            <p className="text-xs text-slate-600">Submissions: {item.submissionCount ?? 0}</p>
                                            <div className="text-xs mt-1">{renderTrend(item.trend)}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-600">No rank yet today. Submit today&apos;s quizzes/exams to appear on the leaderboard.</p>
                            )}
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2 mb-5">
                        {(leaderboardPayload.subjects || []).map((entry) => (
                            <button
                                key={entry.subject}
                                onClick={() => setSelectedSubject(entry.subject)}
                                className={`px-3 py-1 rounded-full text-sm font-semibold border ${selectedLeaderboard?.subject === entry.subject ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-700 border-slate-300 hover:border-teal-500'}`}
                            >
                                {entry.subject}
                            </button>
                        ))}
                        <button
                            onClick={loadDailyLeaderboard}
                            className="px-3 py-1 rounded-full text-sm font-semibold border border-amber-300 text-amber-700 hover:bg-amber-50"
                        >
                            Refresh
                        </button>
                    </div>

                    {leaderboardPayload.date && (
                        <p className="text-xs text-slate-500 mb-4">Date: {leaderboardPayload.date} | Last updated: {leaderboardPayload.lastUpdatedAt ? new Date(leaderboardPayload.lastUpdatedAt).toLocaleString() : '-'}</p>
                    )}

                    {loadingLeaderboard && <p className="text-sm text-slate-500 mb-3">Loading leaderboard...</p>}
                    {leaderboardError && <p className="text-sm text-rose-600 mb-3">{leaderboardError}</p>}
                    {!loadingLeaderboard && !leaderboardError && leaderboardData.length === 0 && (
                        <p className="text-sm text-slate-500 mb-3">No results submitted today yet.</p>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider w-24 text-center">Rank</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider">Student Name</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider">Subject</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Average Score</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Submissions</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Trend</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {leaderboardData.map((student) => (
                                    <tr key={student.rank} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4 text-center">
                                            <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold
                        ${student.rank === 1 ? 'bg-amber-100 text-amber-600' :
                                                    student.rank === 2 ? 'bg-slate-200 text-slate-600' :
                                                        student.rank === 3 ? 'bg-orange-100 text-orange-700' : 'text-slate-500'}`}>
                                                {renderRankBadge(student.rank)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800 flex items-center">
                                                {student.studentName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                {selectedLeaderboard?.subject || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-lg font-bold text-slate-800 tracking-tight">{student.averagePercentage ?? 0}%</span>
                                            <p className="text-xs text-slate-500">{student.score ?? 0}/{student.totalMarks ?? 0}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-semibold text-slate-700">{student.submissionCount ?? 0}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {renderTrend(student.trend)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
