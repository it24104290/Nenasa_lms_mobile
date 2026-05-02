import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../services/AuthContext';

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const role = String(user?.role || '').toUpperCase().replace(/^ROLE_/, '');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const activeClass = (path) => {
    return isActive(path) ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-lg z-50 sticky top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <svg className="w-8 h-8 text-blue-200 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
            <Link to="/" className="text-xl font-bold tracking-wider hover:text-indigo-200 transition-colors">
              නැනස LMS
            </Link>
          </div>

          <div className="hidden md:block flex-grow ml-10">
            {user && (
              <div className="flex space-x-1">
                {role === 'ADMIN' ? (
                  <>
                    <Link to="/admin" className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${activeClass('/admin')}`}>Admin</Link>
                    <Link to="/admin/teachers" className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${activeClass('/admin/teachers')}`}>Teacher</Link>
                    <Link to="/admin/students" className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${activeClass('/admin/students')}`}>Student</Link>
                    <Link to="/payment-officer" className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${activeClass('/payment-officer')}`}>Payment</Link>
                    <Link to="/exams" className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${activeClass('/exams')}`}>Exams</Link>
                    <Link to="/classes" className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${activeClass('/classes')}`}>Classes</Link>
                    <Link to="/feedback" className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${activeClass('/feedback')}`}>Feedback</Link>
                    <Link to="/analytics" className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center ${isActive('/analytics') ? 'bg-amber-500/40 text-amber-100' : 'hover:bg-amber-500/20 text-amber-300'}`}>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                      Analytics
                    </Link>
                  </>
                ) : (
                  <>
                    {role === 'TEACHER' || role === 'PAYMENT_OFFICER' ? (
                      <Link to="/teacher" className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${activeClass('/teacher')}`}>Teacher</Link>
                    ) : null}
                    {role === 'PAYMENT_OFFICER' ? (
                      <Link to="/payment-officer" className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${activeClass('/payment-officer')}`}>Payment Office</Link>
                    ) : null}
                    {role === 'STUDENT' || role === 'TEACHER' ? (
                      <Link to="/lessons" className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${activeClass('/lessons')}`}>Lessons</Link>
                    ) : null}
                    {role === 'STUDENT' ? (
                      <>
                        <Link to="/recommendations" className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${activeClass('/recommendations')}`}>Registration</Link>
                        <Link to="/classes" className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${activeClass('/classes')}`}>Classes</Link>
                      </>
                    ) : (
                      <Link to="/classes" className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${activeClass('/classes')}`}>Classes</Link>
                    )}
                    <Link to="/exams" className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${activeClass('/exams')}`}>Exams</Link>
                    {role !== 'TEACHER' && (
                      <Link to="/payments" className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${activeClass('/payments')}`}>Payments</Link>
                    )}
                    <Link to="/feedback" className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${activeClass('/feedback')}`}>Feedback</Link>
                    {role === 'TEACHER' || role === 'STUDENT' ? (
                      <Link to="/analytics" className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center ${isActive('/analytics') ? 'bg-amber-500/40 text-amber-100' : 'hover:bg-amber-500/20 text-amber-300'}`}>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                        Analytics
                      </Link>
                    ) : null}
                  </>
                )}
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-3">
            {user && (
              <Link to="/profile" className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${activeClass('/profile')} flex items-center`}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                Profile
              </Link>
            )}
          </div>

          {/* Hamburger menu button for mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-white/10 transition-colors"
          >
            {mobileMenuOpen ? (
              // Close icon (X)
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            ) : (
              // Hamburger icon (three lines)
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            )}
          </button>

          <div className="hidden md:flex items-center ml-4 space-x-4">
            {user ? (
              <>
                <div className="text-sm font-medium text-indigo-100 hidden sm:flex items-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold mr-2 text-xs">
                    {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="flex flex-col">
                    <span className="leading-tight">{user.username}</span>
                    <span className="text-[10px] uppercase text-indigo-300 tracking-wider font-bold">{role || user.role}</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="border border-indigo-400 hover:bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-white text-indigo-700 hover:bg-indigo-50 px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-md transform hover:-translate-y-0.5"
              >
                Login Platform
              </Link>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && user && (
          <div className="md:hidden pb-4 bg-gradient-to-b from-blue-700/50 to-indigo-800/50">
            <div className="space-y-1 px-2 pt-2">
              {role === 'ADMIN' ? (
                <>
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className={`block px-3 py-2 rounded-lg font-semibold transition-colors ${activeClass('/admin')}`}>Admin</Link>
                  <Link to="/admin/teachers" onClick={() => setMobileMenuOpen(false)} className={`block px-3 py-2 rounded-lg font-semibold transition-colors ${activeClass('/admin/teachers')}`}>Teachers</Link>
                  <Link to="/admin/students" onClick={() => setMobileMenuOpen(false)} className={`block px-3 py-2 rounded-lg font-semibold transition-colors ${activeClass('/admin/students')}`}>Students</Link>
                  <Link to="/payment-officer" onClick={() => setMobileMenuOpen(false)} className={`block px-3 py-2 rounded-lg font-semibold transition-colors ${activeClass('/payment-officer')}`}>Payments</Link>
                  <Link to="/exams" onClick={() => setMobileMenuOpen(false)} className={`block px-3 py-2 rounded-lg font-semibold transition-colors ${activeClass('/exams')}`}>Exams</Link>
                  <Link to="/classes" onClick={() => setMobileMenuOpen(false)} className={`block px-3 py-2 rounded-lg font-semibold transition-colors ${activeClass('/classes')}`}>Classes</Link>
                  <Link to="/feedback" onClick={() => setMobileMenuOpen(false)} className={`block px-3 py-2 rounded-lg font-semibold transition-colors ${activeClass('/feedback')}`}>Feedback</Link>
                  <Link to="/analytics" onClick={() => setMobileMenuOpen(false)} className={`flex items-center px-3 py-2 rounded-lg font-semibold transition-colors ${isActive('/analytics') ? 'bg-amber-500/40 text-amber-100' : 'hover:bg-amber-500/20 text-amber-300'}`}>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                    Analytics
                  </Link>
                </>
              ) : (
                <>
                  {role === 'TEACHER' || role === 'PAYMENT_OFFICER' ? (
                    <Link to="/teacher" onClick={() => setMobileMenuOpen(false)} className={`block px-3 py-2 rounded-lg font-semibold transition-colors ${activeClass('/teacher')}`}>Dashboard</Link>
                  ) : null}
                  {role === 'PAYMENT_OFFICER' ? (
                    <Link to="/payment-officer" onClick={() => setMobileMenuOpen(false)} className={`block px-3 py-2 rounded-lg font-semibold transition-colors ${activeClass('/payment-officer')}`}>Payment Office</Link>
                  ) : null}
                  {role === 'STUDENT' || role === 'TEACHER' ? (
                    <Link to="/lessons" onClick={() => setMobileMenuOpen(false)} className={`block px-3 py-2 rounded-lg font-semibold transition-colors ${activeClass('/lessons')}`}>Lessons</Link>
                  ) : null}
                  {role === 'STUDENT' ? (
                    <>
                      <Link to="/recommendations" onClick={() => setMobileMenuOpen(false)} className={`block px-3 py-2 rounded-lg font-semibold transition-colors ${activeClass('/recommendations')}`}>Registration</Link>
                      <Link to="/classes" onClick={() => setMobileMenuOpen(false)} className={`block px-3 py-2 rounded-lg font-semibold transition-colors ${activeClass('/classes')}`}>Classes</Link>
                    </>
                  ) : (
                    <Link to="/classes" onClick={() => setMobileMenuOpen(false)} className={`block px-3 py-2 rounded-lg font-semibold transition-colors ${activeClass('/classes')}`}>Classes</Link>
                  )}
                  <Link to="/exams" onClick={() => setMobileMenuOpen(false)} className={`block px-3 py-2 rounded-lg font-semibold transition-colors ${activeClass('/exams')}`}>Exams</Link>
                  {role !== 'TEACHER' && (
                    <Link to="/payments" onClick={() => setMobileMenuOpen(false)} className={`block px-3 py-2 rounded-lg font-semibold transition-colors ${activeClass('/payments')}`}>Payments</Link>
                  )}
                  <Link to="/feedback" onClick={() => setMobileMenuOpen(false)} className={`block px-3 py-2 rounded-lg font-semibold transition-colors ${activeClass('/feedback')}`}>Feedback</Link>
                  {role === 'TEACHER' || role === 'STUDENT' ? (
                    <Link to="/analytics" onClick={() => setMobileMenuOpen(false)} className={`flex items-center px-3 py-2 rounded-lg font-semibold transition-colors ${isActive('/analytics') ? 'bg-amber-500/40 text-amber-100' : 'hover:bg-amber-500/20 text-amber-300'}`}>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                      Analytics
                    </Link>
                  ) : null}
                </>
              )}
            </div>

            <div className="px-2 pt-4 border-t border-white/10 space-y-1">
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className={`flex items-center px-3 py-2 rounded-lg font-semibold transition-colors ${activeClass('/profile')}`}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                Profile
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Logout
              </button>
            </div>

            <div className="px-2 pt-3 flex items-center space-x-2 border-t border-white/10">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{user.username}</span>
                <span className="text-xs text-indigo-200">{role || user.role}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
