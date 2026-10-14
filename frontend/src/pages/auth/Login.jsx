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
    if (user) navigate('/dashboard');
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
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f0f4ff', fontFamily: "'Inter', 'Outfit', sans-serif" }}>
      {/* Left decorative panel */}
      <div style={{
        display: 'none',
        flex: '0 0 420px',
        background: 'linear-gradient(145deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 40px',
        position: 'relative',
        overflow: 'hidden',
      }}
        className="auth-left-panel"
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '-40px', width: '260px', height: '260px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', top: '40%', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🚚</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '12px', lineHeight: 1.2 }}>Tracely TMS</h1>
          <p style={{ fontSize: '0.95rem', opacity: 0.8, lineHeight: 1.6, marginBottom: '40px' }}>
            Smart Truck Logistics &amp; Transport Operations Platform
          </p>

          {/* Feature pills */}
          {[
            { icon: '📍', text: 'Real-time GPS Tracking' },
            { icon: '📦', text: 'Shipment Management' },
            { icon: '🧾', text: 'Automated Billing & Invoicing' },
            { icon: '👷', text: 'Driver & Fleet Management' },
          ].map((f) => (
            <div key={f.text} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              background: 'rgba(255,255,255,0.1)', borderRadius: '12px',
              padding: '10px 16px', marginBottom: '10px', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.15)', textAlign: 'left',
            }}>
              <span style={{ fontSize: '20px' }}>{f.icon}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '32px 16px',
      }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          {/* Logo for mobile / right side */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '60px', height: '60px', borderRadius: '16px',
              background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
              fontSize: '28px', boxShadow: '0 8px 24px rgba(37,99,235,0.3)',
              marginBottom: '16px',
            }}>🚚</div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              Welcome Back
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
              Sign in to your Tracely dashboard
            </p>
          </div>

          {/* Card */}
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '36px 32px',
            boxShadow: '0 4px 32px rgba(15,23,42,0.08), 0 1px 4px rgba(15,23,42,0.04)',
            border: '1px solid #e2e8f0',
          }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94a3b8' }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@tracely.com"
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      paddingLeft: '42px', paddingRight: '16px', paddingTop: '11px', paddingBottom: '11px',
                      background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px',
                      fontSize: '0.875rem', color: '#0f172a', outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#2563eb'; e.target.style.background = '#fff'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94a3b8' }} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      paddingLeft: '42px', paddingRight: '16px', paddingTop: '11px', paddingBottom: '11px',
                      background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px',
                      fontSize: '0.875rem', color: '#0f172a', outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#2563eb'; e.target.style.background = '#fff'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '12px', borderRadius: '12px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                  color: '#fff', fontSize: '0.9rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
                  opacity: loading ? 0.7 : 1,
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={(e) => { if (!loading) { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 6px 20px rgba(37,99,235,0.45)'; } }}
                onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 14px rgba(37,99,235,0.35)'; }}
              >
                {loading ? (
                  <div style={{ width: '20px', height: '20px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight style={{ width: '16px', height: '16px' }} />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo */}
            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: '0.72rem', textAlign: 'center', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
                ⚡ Quick Demo Access
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {[
                  { label: 'Admin', email: 'admin@tracely.com', pw: 'admin123', icon: <ShieldCheck style={{ width: '16px', height: '16px' }} />, color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
                  { label: 'Manager', email: 'manager@tracely.com', pw: 'manager123', icon: <UserCheck style={{ width: '16px', height: '16px' }} />, color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
                  { label: 'Driver', email: 'driver@tracely.com', pw: 'driver123', icon: <Truck style={{ width: '16px', height: '16px' }} />, color: '#059669', bg: '#f0fdf4', border: '#a7f3d0' },
                ].map((d) => (
                  <button
                    key={d.label}
                    type="button"
                    onClick={() => handleQuickLogin(d.email, d.pw)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      padding: '10px 6px', borderRadius: '12px', border: `1.5px solid ${d.border}`,
                      background: d.bg, cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s',
                      color: d.color,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    {d.icon}
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, marginTop: '5px', color: d.color }}>{d.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Register link */}
            <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>
                Register now
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 768px) {
          .auth-left-panel { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
