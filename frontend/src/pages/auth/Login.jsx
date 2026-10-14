import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Truck, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { login, clearAuthError } from '../../store/slices/authSlice';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAuthError());
    }
  }, [error, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    dispatch(login({ email, password }));
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    dispatch(login({ email: demoEmail, password: demoPassword }));
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative gradient glow backgrounds */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 shadow-xl shadow-brand-500/25 mb-4 text-3xl">
          🚚
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight font-heading">
          Tracely TMS
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Smart Truck Logistics & Transport Operations
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-dark-850/80 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl border border-slate-700/60 sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@tracely.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-dark-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-dark-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 shadow-lg shadow-brand-500/25 transition disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Buttons */}
          <div className="mt-8 border-t border-slate-700/60 pt-6">
            <p className="text-xs text-center font-semibold text-slate-400 uppercase tracking-wider mb-3">
              ⚡ Quick Demo 1-Click Access
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@tracely.com', 'admin123')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-dark-900/60 border border-purple-500/30 hover:border-purple-500 hover:bg-purple-500/10 transition group text-center"
              >
                <ShieldCheck className="w-4 h-4 text-purple-400 group-hover:scale-110 transition" />
                <span className="text-[11px] font-bold text-slate-200 mt-1">Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('manager@tracely.com', 'manager123')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-dark-900/60 border border-blue-500/30 hover:border-blue-500 hover:bg-blue-500/10 transition group text-center"
              >
                <UserCheck className="w-4 h-4 text-blue-400 group-hover:scale-110 transition" />
                <span className="text-[11px] font-bold text-slate-200 mt-1">Manager</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('driver@tracely.com', 'driver123')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-dark-900/60 border border-brand-500/30 hover:border-brand-500 hover:bg-brand-500/10 transition group text-center"
              >
                <Truck className="w-4 h-4 text-brand-400 group-hover:scale-110 transition" />
                <span className="text-[11px] font-bold text-slate-200 mt-1">Driver</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold underline underline-offset-4">
              Register now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
