import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function PaymentsPage() {
  const location = useLocation();
  const isAdmissionPayment = location.state?.paymentType === 'ADMISSION';
  const initialAmount = Number(location.state?.amount) || (isAdmissionPayment ? 1500 : 2500);
  const [amount] = useState(initialAmount);
  const [studentName, setStudentName] = useState(location.state?.studentName || '');
  const [studentId, setStudentId] = useState('');
  const [classId, setClassId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isAdmissionPayment) {
        await api.post(`/payments/admission?studentName=${encodeURIComponent(studentName)}`, {
          amount,
          type: 'ADMISSION',
          transactionId: `ADMIT-${Date.now()}`,
        });
      } else {
        await api.post(`/payments?studentId=${encodeURIComponent(studentId)}&classId=${encodeURIComponent(classId)}`, {
          amount,
          type: 'CLASS_FEE',
        });
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Payment Successful!</h1>
        <p className="text-slate-500 text-lg text-center max-w-md">Your enrollment has been confirmed. A receipt has been sent to your email and SMS.</p>
        <p className="mt-8 text-sm text-slate-400 font-medium animate-pulse">Redirecting to Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Complete Payment</h1>
        <p className="text-slate-500 mt-2">
          {isAdmissionPayment
            ? 'Pay your admission fee to complete the new subject application.'
            : 'Securely enroll in your selected modules and classes.'}
        </p>
        {error && <div className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Payment Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Payment Method</h2>

            <form onSubmit={handlePayment} className="space-y-6">

              {/* Fake Credit Card Visual */}
              <div className="w-full max-w-sm h-56 bg-gradient-to-tr from-slate-800 to-slate-600 rounded-2xl shadow-xl overflow-hidden relative p-6 text-white transform hover:scale-105 transition-transform duration-300">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-5"></div>
                <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-white opacity-5"></div>

                <div className="flex justify-between items-center mb-8">
                  <svg className="w-12 h-8" viewBox="0 0 48 32" fill="none"><rect width="48" height="32" rx="4" fill="#E2E8F0" /><path d="M14 16H34M14 20H26" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" /><rect x="4" y="8" width="8" height="8" rx="2" fill="#CBD5E1" /></svg>
                  <span className="font-bold tracking-widest italic opacity-80">VISA</span>
                </div>

                <div className="mb-6">
                  <p className="text-sm opacity-70 mb-1">Card Number</p>
                  <p className="text-xl tracking-widest font-mono">**** **** **** 4242</p>
                </div>

                <div className="flex justify-between">
                  <div>
                    <p className="text-xs opacity-70 mb-1">Card Holder</p>
                    <p className="font-medium tracking-wide">STUDENT NAME</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-70 mb-1">Expires</p>
                    <p className="font-medium tracking-wide">12 / 28</p>
                  </div>
                </div>
              </div>

              {isAdmissionPayment ? (
                <div className="grid grid-cols-1 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Student Name</label>
                    <input
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Student Name"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 bg-slate-50"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Student ID</label>
                    <input
                      type="text"
                      required
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="Student ID"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Class ID</label>
                    <input
                      type="text"
                      required
                      value={classId}
                      onChange={(e) => setClassId(e.target.value)}
                      placeholder="Class ID"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 bg-slate-50"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Cardholder Name</label>
                  <input type="text" required placeholder="Name on card" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 bg-slate-50" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Card Number</label>
                  <input type="text" required placeholder="0000 0000 0000 0000" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono text-slate-700 bg-slate-50" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Expiry Date</label>
                  <input type="text" required placeholder="MM/YY" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 bg-slate-50" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">CVC</label>
                  <input type="password" required maxLength="4" placeholder="***" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 bg-slate-50" />
                </div>
              </div>

              <button disabled={loading} type="submit" className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg mt-8 transition-all flex justify-center items-center">
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  `Pay LKR ${Number(amount).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 sticky top-8">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-slate-800">{isAdmissionPayment ? 'New Subject Admission Fee' : 'Combined Maths - Revision'}</h3>
                  <p className="text-sm text-slate-500 mt-1">{isAdmissionPayment ? 'Student enrollment payment' : 'Mr. Amila Perera'}</p>
                </div>
                <span className="font-semibold text-slate-800">LKR {Number(amount).toLocaleString('en-LK')}</span>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6 space-y-3">
              <div className="flex justify-between text-slate-500 text-sm">
                <span>Subtotal</span>
                <span>LKR {Number(amount).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-sm">
                <span>Platform Fee</span>
                <span>LKR 0.00</span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-200 mt-3">
                <span className="font-bold text-slate-800">Total</span>
                <span className="text-2xl font-bold text-indigo-600">LKR {Number(amount).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="mt-8 bg-indigo-50 rounded-xl p-4 flex items-start space-x-3">
              <svg className="w-6 h-6 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              <p className="text-xs text-indigo-700 font-medium leading-relaxed">Payments are securely encrypted. Your card details are never stored on our servers.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
