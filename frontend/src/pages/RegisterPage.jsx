import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function RegisterPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'STUDENT',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.post('/auth/register', formData);
            navigate('/login');
        } catch (err) {
            const responseData = err.response?.data;
            const message =
                (typeof responseData === 'string' && responseData) ||
                responseData?.message ||
                'Registration failed';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 relative overflow-hidden">
            {/* Animated Background Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-[50%] left-[50%] w-72 h-72 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" style={{animationDelay: '4s'}}></div>

            {/* Floating Decorative Elements */}
            <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-20 animate-float"></div>
            <div className="absolute bottom-20 left-10 w-24 h-24 bg-gradient-to-br from-green-400 to-teal-500 rounded-full opacity-20 animate-float" style={{animationDelay: '1s'}}></div>

            <div className="w-full max-w-md relative z-10">
                <div className="bg-gradient-to-br from-slate-900/80 to-purple-900/80 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl relative animate-fadeIn" style={{animation: 'fadeIn 0.8s ease-out', boxShadow: '0 0 40px rgba(168, 85, 247, 0.3)'}}>
                    {/* Top decorative element */}
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full blur-xl opacity-30 animate-pulse"></div>

                    <div className="text-center mb-8 animate-slideInDown">
                        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 tracking-tight mb-2">
                            🎓 Register
                        </h1>
                        <p className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-purple-200 text-base font-semibold">
                            Join Nanasa LMS today
                        </p>
                        <div className="mt-3 h-1 w-16 mx-auto bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"></div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-500/50 rounded-xl flex flex-col text-red-100 text-sm animate-slideInUp shadow-lg">
                            <span className="font-semibold mb-1">⚠️ Error:</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5 animate-slideInUp">
                        <div className="group">
                            <label className="block text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300 mb-2">
                                👤 Username
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent focus:bg-white/10 transition-all duration-300 hover:border-white/40"
                                    placeholder="johndoe"
                                />
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 opacity-0 blur group-focus-within:opacity-20 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300 mb-2">
                                ✉️ Email
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent focus:bg-white/10 transition-all duration-300 hover:border-white/40"
                                    placeholder="john@example.com"
                                />
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 blur group-focus-within:opacity-20 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300 mb-2">
                                🔐 Password
                            </label>
                            <div className="relative">
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent focus:bg-white/10 transition-all duration-300 hover:border-white/40"
                                    placeholder="••••••••"
                                />
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 blur group-focus-within:opacity-20 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300 mb-2">
                                👥 Role
                            </label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent focus:bg-white/10 transition-all duration-300 hover:border-white/40 cursor-pointer"
                            >
                                <option value="STUDENT" className="bg-slate-800 text-white">Student</option>
                                <option value="TEACHER" className="bg-slate-800 text-white">Teacher</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold rounded-xl shadow-xl transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:shadow-purple-500/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-900 mt-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-xl disabled:hover:-translate-y-0 flex justify-center items-center overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-700"></div>
                            <span className="relative z-10">{loading ? '⏳ Creating...' : '✨ Create Account'}</span>
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-white/70 animate-slideInUp" style={{animationDelay: '0.2s'}}>
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 hover:from-cyan-300 hover:to-purple-300 transition-all duration-300 relative">
                            Sign In
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 group-hover:w-full transition-all duration-300"></span>
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
