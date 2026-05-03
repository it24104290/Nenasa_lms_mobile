import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../services/AuthContext';

export default function BottomNavBar() {
  const { user } = useAuth();
  const location = useLocation();
  const role = String(user?.role || '').toUpperCase().replace(/^ROLE_/, '');

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Navigation items based on role
  const getNavItems = () => {
    const baseItems = {
      ADMIN: [
        { path: '/admin', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4', label: 'Admin', viewBox: '0 0 24 24' },
        { path: '/admin/teachers', icon: 'M12 4.354a4 4 0 110 5.292M15 12H9m6 0H9m6 12H9m6 0a4 4 0 110-5.292M9 12h6m0 12H9m0 0a4 4 0 110-5.292', label: 'Teachers', viewBox: '0 0 24 24' },
        { path: '/admin/students', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z', label: 'Students', viewBox: '0 0 24 24' },
        { path: '/exams', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Exams', viewBox: '0 0 24 24' },
        { path: '/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', label: 'Profile', viewBox: '0 0 24 24' },
      ],
      TEACHER: [
        { path: '/teacher', icon: 'M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-4m0 0l4 4m-4-4v4', label: 'Dashboard', viewBox: '0 0 24 24' },
        { path: '/lessons', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', label: 'Lessons', viewBox: '0 0 24 24' },
        { path: '/classes', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5.581m0 0H9m5.581 0a2 2 0 100-4H9m0 4a2 2 0 010-4m0 0H7a2 2 0 100 4h5.581', label: 'Classes', viewBox: '0 0 24 24' },
        { path: '/exams', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Exams', viewBox: '0 0 24 24' },
        { path: '/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', label: 'Profile', viewBox: '0 0 24 24' },
      ],
      STUDENT: [
        { path: '/classes', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5.581m0 0H9m5.581 0a2 2 0 100-4H9m0 4a2 2 0 010-4m0 0H7a2 2 0 100 4h5.581', label: 'Classes', viewBox: '0 0 24 24' },
        { path: '/lessons', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', label: 'Lessons', viewBox: '0 0 24 24' },
        { path: '/exams', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Exams', viewBox: '0 0 24 24' },
        { path: '/payments', icon: 'M3 10a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM7 14h.01M17 7V5a2 2 0 00-2-2H5a2 2 0 00-2 2v2h16z', label: 'Payments', viewBox: '0 0 24 24' },
        { path: '/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', label: 'Profile', viewBox: '0 0 24 24' },
      ],
      PAYMENT_OFFICER: [
        { path: '/payment-officer', icon: 'M3 10a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM7 14h.01M17 7V5a2 2 0 00-2-2H5a2 2 0 00-2 2v2h16z', label: 'Payments', viewBox: '0 0 24 24' },
        { path: '/exams', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Exams', viewBox: '0 0 24 24' },
        { path: '/feedback', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Feedback', viewBox: '0 0 24 24' },
        { path: '/classes', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5.581m0 0H9m5.581 0a2 2 0 100-4H9m0 4a2 2 0 010-4m0 0H7a2 2 0 100 4h5.581', label: 'Classes', viewBox: '0 0 24 24' },
        { path: '/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', label: 'Profile', viewBox: '0 0 24 24' },
      ],
    };

    return baseItems[role] || [];
  };

  const navItems = getNavItems();

  if (!user) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center w-full h-full py-2 px-1 transition-all ${
              isActive(item.path)
                ? 'text-indigo-600 border-t-2 border-indigo-600 bg-indigo-50'
                : 'text-gray-600 hover:text-indigo-500'
            }`}
          >
            <svg
              className="w-6 h-6 mb-1"
              fill="none"
              stroke="currentColor"
              viewBox={item.viewBox}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={item.icon}
              ></path>
            </svg>
            <span className="text-xs font-semibold text-center truncate">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
