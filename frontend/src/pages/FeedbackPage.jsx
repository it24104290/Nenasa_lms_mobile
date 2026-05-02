import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../services/AuthContext';

export default function FeedbackPage() {
  const { user } = useAuth();
  const role = String(user?.role || '').toUpperCase().replace(/^ROLE_/, '');
  const [feedbacks, setFeedbacks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackForm, setFeedbackForm] = useState({
    teacherId: '',
    rating: 5,
    comment: '',
    isAnonymous: false
  });
  const [teachers, setTeachers] = useState([]);
  const [submitMessage, setSubmitMessage] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [loadMessage, setLoadMessage] = useState('');

  const load = () => {
    setLoadMessage('');

    if (role === 'TEACHER' && user?.teacherId) {
      api.get(`/feedbacks/teacher/${user.teacherId}`)
        .then((res) => {
          const data = res.data || [];
          setFeedbacks(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          console.error(err);
          setLoadMessage('Unable to load your feedback right now.');
          setFeedbacks([]);
        });
      return;
    }

    api.get('/feedbacks')
      .then((res) => {
        const data = res.data || [];
        setFeedbacks(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error(err);
        setLoadMessage('Unable to load feedback right now.');
        setFeedbacks([]);
      });
  };

  useEffect(() => {
    if (role === 'ADMIN' || role === 'TEACHER') {
      load();
    }
    if (role === 'STUDENT') {
      api.get('/teachers').then(res => setTeachers(res.data)).catch(err => console.error(err));
    }
  }, [role, user?.teacherId]);

  const handleFeedbackChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFeedbackForm({
      ...feedbackForm,
      [name]: type === 'checkbox' ? checked : (name === 'rating' ? parseInt(value) : value)
    });
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!String(feedbackForm.teacherId || '').trim()) {
      setSubmitMessage('✗ Select a teacher.');
      setTimeout(() => setSubmitMessage(''), 5000);
      return;
    }
    if (feedbackForm.rating < 1 || feedbackForm.rating > 5) {
      setSubmitMessage('✗ Rating must be between 1 and 5.');
      setTimeout(() => setSubmitMessage(''), 5000);
      return;
    }
    try {
      await api.post('/feedbacks', {
        ...feedbackForm,
        moduleId: null
      });
      setSubmitMessage('✓ Feedback submitted successfully!');
      setFeedbackForm({ teacherId: '', rating: 5, comment: '', isAnonymous: false });
      load();
      setTimeout(() => setSubmitMessage(''), 3000);
    } catch (err) {
      console.error(err);
      const errorMsg = err?.response?.data?.message || err?.response?.data || 'Failed to submit feedback';
      setSubmitMessage(`✗ ${errorMsg}`);
      setTimeout(() => setSubmitMessage(''), 5000);
    }
  };

  const filteredFeedbacks = feedbacks.filter(f =>
    String(f?.comment || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.student ? String(f.student.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) : 'anonymous'.includes(searchQuery.toLowerCase())) ||
    String(f?.teacher?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {role === 'STUDENT' && (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Submit Your Feedback</h2>
          {submitMessage && (
            <div className={`mb-6 p-4 rounded-xl text-sm font-semibold ${submitMessage.startsWith('✓') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {submitMessage}
            </div>
          )}
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Teacher</label>
              <select
                name="teacherId"
                value={feedbackForm.teacherId}
                onChange={handleFeedbackChange}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 transition-all font-medium text-slate-700"
              >
                <option value="">Select Teacher</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>{teacher.fullName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none transition-transform hover:scale-125"
                  >
                    <span className={`text-4xl cursor-pointer ${
                      star <= (hoverRating || feedbackForm.rating) ? '⭐' : '☆'
                    }`}>
                      {star <= (hoverRating || feedbackForm.rating) ? '⭐' : '☆'}
                    </span>
                  </button>
                ))}
                <span className="ml-2 text-sm font-medium text-slate-600">
                  {hoverRating || feedbackForm.rating} / 5
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Your Feedback</label>
              <textarea
                name="comment"
                placeholder="Share your feedback about this teacher and module... (optional)"
                value={feedbackForm.comment}
                onChange={handleFeedbackChange}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 transition-all font-medium text-slate-700"
                rows="4"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isAnonymous"
                name="isAnonymous"
                checked={feedbackForm.isAnonymous}
                onChange={handleFeedbackChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer"
              />
              <label htmlFor="isAnonymous" className="ml-3 text-sm text-slate-700 cursor-pointer">
                Submit anonymously
              </label>
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-colors font-medium"
            >
              Submit Feedback
            </button>
          </form>
        </div>
      )}

      {(role === 'TEACHER' || role === 'ADMIN') && (
        <>
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Feedback Management</h1>
          <p className="text-slate-500 mt-2">View and manage student feedback for teachers and modules.</p>
        </div>

        <div className="w-full md:w-96 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 transition-all font-medium text-slate-700"
            placeholder="Search feedback..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {loadMessage && (
          <div className="p-4 border-b border-slate-200 bg-amber-50 text-amber-800 text-sm font-medium">
            {loadMessage}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Student</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Teacher</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Module</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Rating</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Comment</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeedbacks.map((feedback) => (
                <tr key={feedback.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-700">{feedback.student ? feedback.student.fullName : 'Anonymous'}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{feedback.teacher?.fullName}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{feedback.module?.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{feedback.rating}/5</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{feedback.comment}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{new Date(feedback.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}
    </div>
  );
}