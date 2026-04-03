import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function ModulesPage() {
  const [modules, setModules] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    subject: '',
    grade: ''
  });
  const [editingId, setEditingId] = useState(null);

  const load = () => {
    api.get('/modules')
      .then((res) => setModules(res.data))
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
    try {
      if (editingId) {
        await api.put(`/modules/${editingId}`, form);
      } else {
        await api.post('/modules', form);
      }
      setForm({ name: '', description: '', subject: '', grade: '' });
      setEditingId(null);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (module) => {
    setEditingId(module.id);
    setForm({
      name: module.name || '',
      description: module.description || '',
      subject: module.subject || '',
      grade: module.grade || ''
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this module?')) {
      try {
        await api.delete(`/modules/${id}`);
        load();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Module Management</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <input
            type="text"
            name="name"
            placeholder="Module Name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 transition-all font-medium text-slate-700"
            required
          />
          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={form.subject}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 transition-all font-medium text-slate-700"
            required
          />
          <input
            type="text"
            name="grade"
            placeholder="Grade"
            value={form.grade}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 transition-all font-medium text-slate-700"
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 transition-all font-medium text-slate-700"
            rows="3"
          />
          <div className="md:col-span-2">
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-colors font-medium"
            >
              {editingId ? 'Update Module' : 'Add Module'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({ name: '', description: '', subject: '', grade: '' });
                }}
                className="ml-4 px-6 py-3 bg-slate-500 text-white rounded-2xl hover:bg-slate-600 transition-colors font-medium"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Name</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Subject</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Grade</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Description</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {modules.map((module) => (
                  <tr key={module.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-700">{module.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{module.subject}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{module.grade}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{module.description}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      <button
                        onClick={() => handleEdit(module)}
                        className="mr-2 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(module.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}