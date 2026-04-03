import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../services/AuthContext';

export default function ProfileFormPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        fullName: '',
        age: '',
        grade: '',
        stream: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.post('/profile', {
                ...formData,
                age: parseInt(formData.age),
            });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save profile');
        } finally {
            setLoading(false);
        }
    };

    const isALLevel = formData.grade === 'A/L';

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
                    <h2 className="text-2xl font-bold text-white">Complete Your Profile</h2>
                    <p className="text-indigo-100 text-sm mt-1">Tell us a bit about yourself to get started</p>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                            <input
                                type="text"
                                required
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700"
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Age</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    max="100"
                                    value={formData.age}
                                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700"
                                    placeholder="16"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Grade</label>
                                <select
                                    required
                                    value={formData.grade}
                                    onChange={(e) => setFormData({ ...formData, grade: e.target.value, stream: '' })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700"
                                >
                                    <option value="" disabled>Select Grade</option>
                                    {[...Array(11)].map((_, i) => (
                                        <option key={i + 1} value={`${i + 1}`}>Grade {i + 1}</option>
                                    ))}
                                    <option value="O/L">O/L</option>
                                    <option value="A/L">A/L</option>
                                </select>
                            </div>
                        </div>

                        {isALLevel && (
                            <div className="animate-fade-in-up">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Stream</label>
                                <select
                                    required
                                    value={formData.stream}
                                    onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-indigo-200 bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700"
                                >
                                    <option value="" disabled>Select Stream</option>
                                    <option value="BIO">BIO</option>
                                    <option value="MATHS">MATHS</option>
                                    <option value="ART">ART</option>
                                    <option value="TEC">TEC</option>
                                    <option value="COMMERCE">COMMERCE</option>
                                </select>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transform transition-all hover:-translate-y-0.5 mt-8 disabled:opacity-70 flex justify-center"
                        >
                            {loading ? 'Saving...' : 'Save Profile Dashboard'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
