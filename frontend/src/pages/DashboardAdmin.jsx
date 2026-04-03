import React from 'react';
import { Link } from 'react-router-dom';

export default function DashboardAdmin() {

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

    </div>
  );
}
