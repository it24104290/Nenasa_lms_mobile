import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [enrollClass, setEnrollClass] = useState({});
  const [message, setMessage] = useState('');

  const loadStudents = () => {
    api.get('/students')
      .then((res) => setStudents(res.data))
      .catch(err => console.error(err));
  };

  const loadClasses = () => {
    api.get('/classes')
      .then((res) => setClasses(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadStudents();
    loadClasses();
  }, []);

  const filteredStudents = students.filter(s =>
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Student Management</h1>
          <p className="text-slate-500 mt-2">Manage student enrollments and track active users.</p>
        </div>
      </div>

      {message && (
        <div className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-4 py-3 rounded-lg">{message}</div>
      )}

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <div className="w-full md:w-96 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 transition-all font-medium text-slate-700"
            placeholder="Search by name or admission number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-sm border-b border-slate-100">
                <th className="px-8 py-5 font-semibold uppercase tracking-wider">Student Details</th>
                <th className="px-8 py-5 font-semibold uppercase tracking-wider">Contact Info</th>
                <th className="px-8 py-5 font-semibold uppercase tracking-wider">Admiss. No</th>
                <th className="px-8 py-5 font-semibold uppercase tracking-wider">Status</th>
                <th className="px-8 py-5 font-semibold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                      No students found matching your criteria.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center flex-shrink-0">
                          {s.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{s.fullName}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Joined {s.dateOfBirth ? s.dateOfBirth : 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-medium text-slate-700">{s.email || 'N/A'}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{s.contactNumber || 'No Contact'}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-mono text-sm font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                        {s.admissionNumber}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      {s.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5"></span> ACTIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <span className="w-2 h-2 bg-amber-500 rounded-full mr-1.5 animate-pulse"></span> PENDING
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right space-y-2">
                      <select
                        value={enrollClass[s.id] || ''}
                        onChange={(e) => setEnrollClass(prev => ({ ...prev, [s.id]: e.target.value }))}
                        className="w-full mb-2 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      >
                        <option value="">Choose class</option>
                        {classes.map((cl) => (
                          <option key={cl.id} value={cl.id}>{cl.name} ({cl.grade})</option>
                        ))}
                      </select>
                      <button
                        onClick={async () => {
                          const classId = enrollClass[s.id];
                          if (!classId) {
                            setMessage('Please choose a class first for enrollment.');
                            return;
                          }
                          try {
                            await api.post(`/students/${s.id}/enroll/${classId}`);
                            setMessage(`Enrolled ${s.fullName} successfully`);
                            loadStudents();
                          } catch (err) {
                            console.error(err);
                            setMessage('Failed to enroll student.');
                          }
                        }}
                        className="w-full text-sm font-bold text-white bg-green-600 hover:bg-green-700 py-2 rounded-lg transition-colors"
                      >
                        Enroll
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
