import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Mail, Phone, ArrowRight, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { register, clearAuthError } from '../../store/slices/authSlice';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'manager',
    phone: '',
  });

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    dispatch(register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      phone: formData.phone,
    }));
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    paddingLeft: '42px', paddingRight: '14px', paddingTop: '10px', paddingBottom: '10px',
    background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px',
    fontSize: '0.875rem', color: '#0f172a', outline: 'none',
    transition: 'border-color 0.2s, background 0.2s',
  };
  const labelStyle = {
    display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#374151',
    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '7px',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f0f4ff', fontFamily: "'Inter', sans-serif" }}>
      {/* Left decorative panel */}
      <div
        className="auth-left-panel"
        style={{
          display: 'none', flex: '0 0 380px',
          background: 'linear-gradient(145deg, #1e3a8a 0%, #2563eb 55%, #3b82f6 100%)',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '48px 36px', position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '-40px', width: '260px', height: '260px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: '56px', marginBottom: '20px' }}>🚚</div>
          <h1 style={{ fontSize: '1.7rem', fontWeight: 800, marginBottom: '10px' }}>Join Tracely</h1>
          <p style={{ fontSize: '0.875rem', opacity: 0.8, lineHeight: 1.6, marginBottom: '32px' }}>
            Start managing your transport operations smarter.
          </p>
          {[
            { icon: '✅', text: 'Free to get started' },
            { icon: '🔒', text: 'Secure & role-based access' },
            { icon: '📊', text: 'Powerful analytics dashboard' },
            { icon: '🌐', text: 'Track fleet in real-time' },
          ].map((f) => (
            <div key={f.text} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'rgba(255,255,255,0.1)', borderRadius: '10px',
              padding: '9px 14px', marginBottom: '8px',
              border: '1px solid rgba(255,255,255,0.15)', textAlign: 'left',
            }}>
              <span style={{ fontSize: '16px' }}>{f.icon}</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px 16px' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '56px', height: '56px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
              fontSize: '26px', boxShadow: '0 8px 24px rgba(37,99,235,0.3)',
              marginBottom: '12px',
            }}>🚚</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
              Create Account
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Join Tracely Transport Operations System
            </p>
          </div>

          {/* Card */}
          <div style={{
            background: '#ffffff', borderRadius: '20px', padding: '32px 28px',
            boxShadow: '0 4px 32px rgba(15,23,42,0.08), 0 1px 4px rgba(15,23,42,0.04)',
            border: '1px solid #e2e8f0',
          }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Full Name */}
              <div>
                <label style={labelStyle}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#94a3b8' }} />
                  <input
                    type="text" required name="name"
                    value={formData.name} onChange={handleChange}
                    placeholder="John Doe"
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = '#2563eb'; e.target.style.background = '#fff'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={labelStyle}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#94a3b8' }} />
                  <input
                    type="email" required name="email"
                    value={formData.email} onChange={handleChange}
                    placeholder="john@example.com"
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = '#2563eb'; e.target.style.background = '#fff'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
                  />
                </div>
              </div>

              {/* Role + Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Role</label>
                  <select
                    name="role" value={formData.role} onChange={handleChange}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '10px 12px',
                      background: '#f8fafc', border: '1.5px solid #e2e8f0',
                      borderRadius: '12px', fontSize: '0.875rem', color: '#0f172a',
                      outline: 'none', cursor: 'pointer',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#2563eb'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; }}
                  >
                    <option value="manager">Manager</option>
                    <option value="driver">Driver</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <div style={{ position: 'relative' }}>
                    <Phone style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#94a3b8' }} />
                    <input
                      type="tel" name="phone"
                      value={formData.phone} onChange={handleChange}
                      placeholder="+91 98765 43210"
                      style={{ ...inputStyle, paddingLeft: '36px' }}
                      onFocus={(e) => { e.target.style.borderColor = '#2563eb'; e.target.style.background = '#fff'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#94a3b8' }} />
                  <input
                    type="password" required name="password"
                    value={formData.password} onChange={handleChange}
                    placeholder="••••••••"
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = '#2563eb'; e.target.style.background = '#fff'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label style={labelStyle}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#94a3b8' }} />
                  <input
                    type="password" required name="confirmPassword"
                    value={formData.confirmPassword} onChange={handleChange}
                    placeholder="••••••••"
                    style={inputStyle}
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
                  width: '100%', marginTop: '4px', padding: '12px',
                  borderRadius: '12px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                  color: '#fff', fontSize: '0.9rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
                  opacity: loading ? 0.7 : 1, transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,99,235,0.45)'; } }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.35)'; }}
              >
                {loading ? (
                  <div style={{ width: '20px', height: '20px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight style={{ width: '16px', height: '16px' }} />
                  </>
                )}
              </button>
            </form>

            {/* Sign in link */}
            <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
              Already registered?{' '}
              <Link to="/login" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>
                Sign In
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
