import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function DashboardTeacher() {
  const [students, setStudents] = useState([]);
  const [showStudents, setShowStudents] = useState(false);

  useEffect(() => {
    if (showStudents) {
      fetchStudents();
    }
  }, [showStudents]);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

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
