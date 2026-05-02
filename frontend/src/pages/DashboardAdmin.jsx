import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function DashboardAdmin() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackError, setFeedbackError] = useState('');

  useEffect(() => {
    api.get('/feedbacks')
      .then((response) => setFeedbacks((response.data || []).slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))))
      .catch((error) => {
        console.error('Error fetching feedback:', error);
        setFeedbackError('Unable to load feedback right now.');
      });
  }, []);

  const averageRating = useMemo(() => {
    if (!feedbacks.length) return 0;
    const total = feedbacks.reduce((sum, feedback) => sum + (feedback.rating || 0), 0);
    return (total / feedbacks.length).toFixed(1);
  }, [feedbacks]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-red-500 to-rose-700 flex items-center p-8 rounded-3xl shadow-lg text-white">
        <div>
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <p className="mt-2 text-red-100 text-lg">System overview and control center.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
          <h2 className="text-3xl font-black text-slate-800">45</h2>
          <p className="text-slate-500 font-medium">Total Teachers</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
          <h2 className="text-3xl font-black text-slate-800">1,240</h2>
          <p className="text-slate-500 font-medium">Active Students</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
          <h2 className="text-3xl font-black text-slate-800">12</h2>
          <p className="text-slate-500 font-medium">System Modules</p>
        </div>
      </div>
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Admin Control Sections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/admin/teachers" className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-2xl shadow-sm text-white hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold">Teacher</h3>
            <p className="mt-2 text-green-100">Create, edit, and remove teachers.</p>
          </Link>
          <Link to="/admin/students" className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-2xl shadow-sm text-white hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold">Student</h3>
            <p className="mt-2 text-blue-100">Create, edit, and manage students.</p>
          </Link>
          <Link to="/payments" className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-2xl shadow-sm text-white hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold">Payment</h3>
            <p className="mt-2 text-yellow-100">Manage payment records and transactions.</p>
          </Link>
          <Link to="/exams" className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-2xl shadow-sm text-white hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold">Exams</h3>
            <p className="mt-2 text-red-100">Control exams, quizzes, and submissions.</p>
          </Link>
          <Link to="/classes" className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-6 rounded-2xl shadow-sm text-white hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold">Classes</h3>
            <p className="mt-2 text-indigo-100">Manage class schedules and allocations.</p>
          </Link>
          <Link to="/feedback" className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-2xl shadow-sm text-white hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold">Feedback</h3>
            <p className="mt-2 text-purple-100">Review and manage user feedback.</p>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Recent Feedback</h2>
            <p className="text-slate-500 mt-1">Latest submissions from students across the platform.</p>
          </div>
          <Link to="/feedback" className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors">
            Open feedback page
          </Link>
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
            <p className="text-sm text-slate-500">Anonymous submissions</p>
            <p className="text-3xl font-black text-slate-800 mt-2">{feedbacks.filter((feedback) => feedback.isAnonymous).length}</p>
          </div>
        </div>

        {feedbackError ? (
          <div className="rounded-2xl bg-red-50 text-red-700 border border-red-200 p-4 text-sm font-medium">
            {feedbackError}
          </div>
        ) : feedbacks.length > 0 ? (
          <div className="space-y-4">
            {feedbacks.slice(0, 5).map((feedback) => (
              <div key={feedback.id} className="rounded-2xl border border-slate-200 p-4 bg-white shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <p className="font-semibold text-slate-800">
                      {feedback.isAnonymous ? 'Anonymous student' : (feedback.student?.fullName || feedback.student?.user?.username || 'Student')}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {feedback.teacher?.fullName || 'Unknown teacher'}{feedback.module?.name ? ` • ${feedback.module.name}` : ''}
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
            <p className="text-slate-500 font-medium">No feedback has been submitted yet.</p>
          </div>
        )}
      </div>

    </div>
  );
}
