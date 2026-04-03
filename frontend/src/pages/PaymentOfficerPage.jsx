import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function PaymentOfficerPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchPending = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await api.get('/payments/pending');
      setPayments(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load pending payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const updateStatus = async (id, action) => {
    try {
      if (action === 'approve') {
        await api.post(`/payments/${id}/approve`);
        setMessage('Payment approved. Success message sent to student.');
      } else {
        await api.post(`/payments/${id}/decline`);
        setMessage('Payment marked unsuccessful and removed from pending list. Unsuccessful message sent to student.');
      }
      fetchPending();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h1 className="text-3xl font-bold text-slate-800">Payment Officer Panel</h1>
        <p className="text-slate-500 mt-2">Review student payment submissions and validate admissions/class fees.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-xl">{error}</div>
      )}

      {message && (
        <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 p-4 rounded-xl">{message}</div>
      )}

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold mb-4">Pending Payments</h2>

        {loading ? (
          <div className="py-10 text-center text-slate-500">Loading...</div>
        ) : payments.length === 0 ? (
          <div className="py-10 text-center text-slate-500">No pending payments right now.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-sm">
                  <th className="py-3 pl-4 font-semibold">Student</th>
                  <th className="py-3 font-semibold">Type</th>
                  <th className="py-3 font-semibold">Class/Module</th>
                  <th className="py-3 font-semibold">Amount</th>
                  <th className="py-3 font-semibold">Status</th>
                  <th className="py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map(payment => (
                  <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 pl-4 text-sm font-medium text-slate-800">{payment.student?.username || payment.student?.email}</td>
                    <td className="py-4 text-sm text-slate-600">{payment.type}</td>
                    <td className="py-4 text-sm text-slate-600">{payment.tuitionClass?.name || 'N/A'}</td>
                    <td className="py-4 text-sm font-semibold text-slate-800">LKR {payment.amount}</td>
                    <td className="py-4 text-sm text-amber-600 font-semibold">{payment.status}</td>
                    <td className="py-4 text-right space-x-2">
                      <button
                        onClick={() => updateStatus(payment.id, 'approve')}
                        className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700"
                      >Approve</button>
                      <button
                        onClick={() => updateStatus(payment.id, 'decline')}
                        className="px-3 py-1 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
                      >Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
