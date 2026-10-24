import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Lock, Mail, User, Phone, Eye, EyeOff, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../services/authContext';

export default function Login() {
  const { login, register, loginDemo, authError, setAuthError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegister) {
      const ok = register(formData.name, formData.email, formData.password, formData.phone);
      if (ok) navigate('/');
    } else {
      const ok = login(formData.email, formData.password);
      if (ok) navigate('/');
    }
  };

  const handleDemoAccess = () => {
    loginDemo();
    navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-main)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '2rem',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #ec4899 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(79, 70, 229, 0.4)',
            marginBottom: '0.75rem'
          }}>
            <Shield size={28} color="#ffffff" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            SHIELD HER
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Your Safety. Your Privacy. Your Power.
          </p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            marginTop: '0.5rem',
            padding: '0.2rem 0.6rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            fontSize: '0.75rem',
            color: 'var(--brand-purple-light)',
            fontWeight: 600
          }}>
            <span>recHERsion'26 Hackathon Edition</span>
          </div>
        </div>

        {/* 1-Click Demo Evaluation Entry Button */}
        <div style={{
          backgroundColor: 'rgba(79, 70, 229, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem',
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--brand-lavender)', marginBottom: '0.35rem' }}>
            ⚡ Hackathon Quick Evaluation
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Click below to instantly sign in as a pre-configured demo user (Aanya Sharma) with sample incidents and contacts.
          </p>
          <button
            onClick={handleDemoAccess}
            className="btn btn-primary"
            style={{ width: '100%', fontSize: '0.9rem', gap: '0.5rem' }}
          >
            <Sparkles size={16} /> Instant Demo Access
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '1.25rem'
        }}>
          <button
            onClick={() => { setIsRegister(false); setAuthError(''); }}
            style={{
              flex: 1,
              padding: '0.65rem 0',
              fontWeight: 600,
              fontSize: '0.9rem',
              backgroundColor: 'transparent',
              color: !isRegister ? 'var(--brand-purple-light)' : 'var(--text-muted)',
              borderBottom: !isRegister ? '2px solid var(--brand-purple-light)' : 'none'
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsRegister(true); setAuthError(''); }}
            style={{
              flex: 1,
              padding: '0.65rem 0',
              fontWeight: 600,
              fontSize: '0.9rem',
              backgroundColor: 'transparent',
              color: isRegister ? 'var(--brand-purple-light)' : 'var(--text-muted)',
              borderBottom: isRegister ? '2px solid var(--brand-purple-light)' : 'none'
            }}
          >
            Register Account
          </button>
        </div>

        {/* Error message */}
        {authError && (
          <div style={{
            backgroundColor: 'var(--status-danger-bg)',
            border: '1px solid var(--status-danger)',
            color: '#fca5a5',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} />
            <span>{authError}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <div className="form-group">
                <label className="form-label">
                  <User size={14} /> Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Aanya Sharma"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Phone size={14} /> Emergency Mobile Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+91 98765 43210"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">
              <Mail size={14} /> Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="you@domain.com"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Lock size={14} /> Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder={isRegister ? 'Min. 8 characters' : 'Enter password'}
                className="form-input"
                style={{ paddingRight: '2.5rem' }}
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {isRegister && (
              <span className="form-hint">
                Use a unique password you do not use on social platforms.
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem' }}
          >
            {isRegister ? 'Create Secure Account' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div style={{
          marginTop: '1.25rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          textAlign: 'center',
          lineHeight: 1.5
        }}>
          🛡️ <strong>Privacy First:</strong> Your credentials and incident records are kept secure. In local demo mode, data is securely stored on your device in browser IndexedDB.
        </div>
      </div>
    </div>
  );
}
