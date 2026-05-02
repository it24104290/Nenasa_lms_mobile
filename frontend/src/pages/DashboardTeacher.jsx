import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../services/AuthContext';

export default function DashboardTeacher() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [showStudents, setShowStudents] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackError, setFeedbackError] = useState('');
  const [showFeedbacks, setShowFeedbacks] = useState(true);

  useEffect(() => {
    if (showStudents) {
      fetchStudents();
    }
  }, [showStudents]);

  useEffect(() => {
    if (user?.teacherId) {
      fetchTeacherFeedbacks(user.teacherId);
    }
  }, [user?.teacherId]);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchTeacherFeedbacks = async (teacherId) => {
    try {
      setFeedbackError('');
      const response = await api.get(`/feedbacks/teacher/${teacherId}`);
      const data = response.data || [];
      const feedbackArray = Array.isArray(data) ? data : [];
      setFeedbacks(feedbackArray.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error('Error fetching teacher feedback:', error);
      setFeedbackError('Unable to load feedback right now.');
      setFeedbacks([]);
    }
  };

  const averageRating = useMemo(() => {
    if (!feedbacks.length) return 0;
    const total = feedbacks.reduce((sum, feedback) => sum + (feedback.rating || 0), 0);
    return (total / feedbacks.length).toFixed(1);
  }, [feedbacks]);

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-xl p-8 shadow-sm border border-white/20 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Teacher Dashboard</h1>
          <p className="text-slate-500 text-lg">Manage your classes, modules, exams, and students from a unified view.</p>
        </div>
        <div className="hidden sm:block">
          <span className="inline-flex items-center justify-center p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/classes" className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/20 hover:shadow-lg transition-all group">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-5 group-hover:-translate-y-1 transition-transform">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800">My Classes</h3>
          <p className="text-slate-500 text-sm mt-2">View and manage assigned tuition classes</p>
        </Link>

        <Link to="/exams" className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/20 hover:shadow-lg transition-all group">
          <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-5 group-hover:-translate-y-1 transition-transform">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800">Exams & Quizzes</h3>
          <p className="text-slate-500 text-sm mt-2">Create MCQ exams and view student analytics</p>
        </Link>

        <Link to="/lessons" className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/20 hover:shadow-lg transition-all group">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-5 group-hover:-translate-y-1 transition-transform">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800">Lessons</h3>
          <p className="text-slate-500 text-sm mt-2">Upload and manage lesson materials</p>
        </Link>

        <button
          onClick={() => setShowStudents(!showStudents)}
          className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/20 hover:shadow-lg transition-all group"
        >
          <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-5 group-hover:-translate-y-1 transition-transform">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path></svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800">My Students</h3>
          <p className="text-slate-500 text-sm mt-2">View and manage enrolled students</p>
        </button>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Teacher Feedback</h2>
            <p className="text-slate-500 text-sm mt-1">Feedback submitted by students for your teacher profile.</p>
          </div>
          <button
            onClick={() => setShowFeedbacks(!showFeedbacks)}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            {showFeedbacks ? 'Hide feedback' : 'View feedback'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Total feedback</p>
            <p className="text-3xl font-black text-slate-800 mt-2">{feedbacks.length}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Average rating</p>
            <p className="text-3xl font-black text-slate-800 mt-2">{feedbacks.length ? `${averageRating}/5` : 'N/A'}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Anonymous feedback</p>
            <p className="text-3xl font-black text-slate-800 mt-2">
              {feedbacks.filter((feedback) => feedback.isAnonymous).length}
            </p>
          </div>
        </div>

        {feedbackError ? (
          <div className="rounded-2xl bg-red-50 text-red-700 border border-red-200 p-4 text-sm font-medium">
            {feedbackError}
          </div>
        ) : showFeedbacks ? (
          feedbacks.length > 0 ? (
            <div className="space-y-4">
              {feedbacks.slice(0, 5).map((feedback) => (
                <div key={feedback.id} className="rounded-2xl border border-slate-200 p-4 bg-white shadow-sm">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <p className="font-semibold text-slate-800">
                        {feedback.isAnonymous ? 'Anonymous student' : (feedback.student?.fullName || 'Student')}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {feedback.module?.name || 'General feedback'}
                      </p>
                    </div>
                    <div className="text-sm font-bold text-amber-600">{feedback.rating}/5</div>
                  </div>
                  <p className="text-sm text-slate-600">
                    {feedback.comment || 'No written comment was provided.'}
                  </p>
                  <p className="text-xs text-slate-400 mt-3">
                    {feedback.createdAt ? new Date(feedback.createdAt).toLocaleDateString() : ''}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-50 border border-dashed border-slate-200 p-8 text-center">
              <p className="text-slate-500 font-medium">No feedback has been submitted for your teacher profile yet.</p>
            </div>
          )
        ) : (
          <div className="rounded-2xl bg-slate-50 border border-dashed border-slate-200 p-8 text-center">
            <p className="text-slate-500 font-medium">Click “View feedback” to see student feedback.</p>
          </div>
        )}
      </div>

      {showStudents && (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">My Students</h2>
            <button
              onClick={() => setShowStudents(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          {students.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map(student => (
                <div key={student.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-600 font-bold text-sm">
                        {student.username?.charAt(0).toUpperCase() || 'S'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{student.username}</h3>
                      <p className="text-sm text-slate-500">{student.email}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      Active
                    </span>
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      Student
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">No Students Found</h3>
              <p className="text-slate-500">Students will appear here once they enroll in your classes.</p>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Performance Analytics Overview</h2>
        <div className="h-64 flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-slate-400 font-medium">Analytics chart will be loaded here...</p>
        </div>
      </div>
    </div>
  );
}
