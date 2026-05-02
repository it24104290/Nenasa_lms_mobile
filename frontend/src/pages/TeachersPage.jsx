import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    subject: '',
    contactNumber: '',
    experience: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState('');

  const load = () => {
    api.get('/teachers')
      .then((res) => setTeachers(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    const experienceValue = form.experience === '' ? null : Number(form.experience);
    if (experienceValue !== null && Number.isNaN(experienceValue)) {
      setStatus('Experience must be a number.');
      return;
    }

    const payload = {
      ...form,
      experience: experienceValue,
    };

    try {
      if (editingId) {
        await api.put(`/teachers/${editingId}`, payload);
      } else {
        await api.post('/teachers', payload);
      }
      setForm({ fullName: '', email: '', subject: '', contactNumber: '', experience: '' });
      setEditingId(null);
      setStatus(editingId ? 'Teacher updated successfully.' : 'Teacher added successfully.');
      load();
    } catch (err) {
      const message = err?.response?.data?.message || err?.response?.data || 'Failed to save teacher.';
      setStatus(String(message));
      console.error(err);
    }
  };

  const handleEdit = (teacher) => {
    setEditingId(teacher.id);
    setForm({
      fullName: teacher.fullName || '',
      email: teacher.email || '',
      subject: teacher.subject || '',
      contactNumber: teacher.contactNumber || '',
      experience: teacher.experience || ''
    });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/teachers/${id}`);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form Section */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sticky top-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
            {editingId ? (
              <span className="text-indigo-600 bg-indigo-50 px-3 py-1 pb-1.5 rounded-lg mr-2 text-sm">EDIT</span>
            ) : (
              <span className="text-emerald-600 bg-emerald-50 px-3 py-1 pb-1.5 rounded-lg mr-2 text-sm">ADD</span>
            )}
            Teacher
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {status && (
              <div className="p-3 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-700">
                {status}
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                required
                value={form.fullName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Contact</label>
                <input
                  type="text"
                  name="contactNumber"
                  value={form.contactNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Years Exp.</label>
                <input
                  type="number"
                  name="experience"
                  value={form.experience}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center space-x-3">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold shadow-sm transition-colors"
              >
                {editingId ? 'Update Teacher' : 'Add Teacher'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm({ fullName: '', email: '', subject: '', contactNumber: '', experience: '' });
                  }}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* List Section */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
            <h2 className="text-xl font-bold text-slate-800">Teacher Directory</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-sm border-b border-slate-100">
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Teacher</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-center">Exp.</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teachers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-400">
                      No teachers added yet.
                    </td>
                  </tr>
                ) : (
                  teachers.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{t.fullName}</div>
                        <div className="text-sm text-slate-500">{t.email}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{t.contactNumber}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {t.subject || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-medium text-slate-700">{t.experience ? `${t.experience}y` : '-'}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleEdit(t)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors mr-1"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
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
    </div>
  );
}
