import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Droplets,
  HelpCircle,
  X,
  Server,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../services/authContext';

export default function Login() {
  const { login, register, loginDemo, resetPassword, authError, setAuthError, loading, backendOnline } = useAuth();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotResult, setForgotResult] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bloodGroup: 'B+',
    password: '',
    confirmPassword: ''
  });

  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.email || !formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!formData.email.includes('@') || !formData.email.includes('.')) {
      errs.email = 'Enter a valid email address (e.g. name@domain.com).';
    }

    if (!formData.password) {
      errs.password = 'Password is required.';
    } else if (isRegister && formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters long.';
    } else if (!isRegister && formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    if (isRegister) {
      if (!formData.name || formData.name.trim().length < 2) {
        errs.name = 'Full legal name is required (min. 2 characters).';
      }
      if (formData.password !== formData.confirmPassword) {
        errs.confirmPassword = 'Passwords do not match.';
      }
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (isRegister) {
      const ok = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.phone,
        formData.bloodGroup
      );
      if (ok) navigate('/');
    } else {
      const ok = await login(formData.email, formData.password);
      if (ok) navigate('/');
    }
  };

  // Prefill Demo Credentials into the form
  const handlePrefillDemo = () => {
    setFormData({
      ...formData,
      email: 'aanya.sharma@shieldher.org',
      password: 'demo1234'
    });
    setFieldErrors({});
    setAuthError('');
  };

  // 1-Click Demo Login
  const handleInstantDemo = () => {
    loginDemo();
    navigate('/');
  };

  // Handle Password Recovery
  const handleForgotSubmit = (e) => {
    e.preventDefault();
    const res = resetPassword(forgotEmail, forgotNewPass);
    setForgotResult(res);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-main)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      position: 'relative'
    }}>
      {/* Background Ambience */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79, 70, 229, 0.12) 0%, rgba(15, 23, 42, 0) 70%)',
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div style={{
        width: '100%',
        maxWidth: '480px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '2.25rem 2rem',
        boxShadow: 'var(--shadow-xl)',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #ec4899 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(79, 70, 229, 0.45)',
            marginBottom: '0.85rem'
          }}>
            <Shield size={30} color="#ffffff" strokeWidth={2.5} />
          </div>

          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            fontFamily: 'Plus Jakarta Sans, sans-serif'
          }}>
            SHIELD HER
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--brand-purple-light)', fontWeight: 600, marginTop: '0.2rem' }}>
            Women's Safety & Digital Protection Platform
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            Your Safety. Your Privacy. Your Power.
          </p>

          {/* Security Architecture Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            marginTop: '0.75rem',
            padding: '0.25rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: backendOnline ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.12)',
            border: `1px solid ${backendOnline ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`,
            fontSize: '0.75rem',
            color: backendOnline ? 'var(--status-safe)' : 'var(--brand-lavender)',
            fontWeight: 600
          }}>
            {backendOnline ? <Server size={12} /> : <Smartphone size={12} />}
            <span>{backendOnline ? 'Secure Auth API Online (JWT + Bcrypt)' : 'Local Client Storage (Offline Ready)'}</span>
          </div>
        </div>

        {/* Demo Credentials Quick-Access Card */}
        <div style={{
          backgroundColor: 'rgba(79, 70, 229, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--brand-lavender)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Sparkles size={14} /> Evaluation / Demo Account
            </span>
            <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>Ready</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: 1.4 }}>
            <div><strong>Email:</strong> <code style={{ color: '#c7d2fe' }}>aanya.sharma@shieldher.org</code></div>
            <div><strong>Password:</strong> <code style={{ color: '#c7d2fe' }}>demo1234</code></div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handlePrefillDemo}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1, fontSize: '0.775rem', gap: '0.3rem' }}
            >
              Fill Credentials
            </button>
            <button
              type="button"
              onClick={handleInstantDemo}
              className="btn btn-primary btn-sm"
              style={{ flex: 1, fontSize: '0.775rem', gap: '0.3rem' }}
            >
              <Sparkles size={13} /> 1-Click Sign In
            </button>
          </div>
        </div>

        {/* Tab Switcher: Sign In vs Register */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '1.25rem'
        }}>
          <button
            type="button"
            onClick={() => { setIsRegister(false); setAuthError(''); setFieldErrors({}); }}
            style={{
              flex: 1,
              padding: '0.65rem 0',
              fontWeight: 700,
              fontSize: '0.9rem',
              backgroundColor: 'transparent',
              color: !isRegister ? 'var(--brand-purple-light)' : 'var(--text-muted)',
              borderBottom: !isRegister ? '2px solid var(--brand-purple-light)' : 'none',
              cursor: 'pointer'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setAuthError(''); setFieldErrors({}); }}
            style={{
              flex: 1,
              padding: '0.65rem 0',
              fontWeight: 700,
              fontSize: '0.9rem',
              backgroundColor: 'transparent',
              color: isRegister ? 'var(--brand-purple-light)' : 'var(--text-muted)',
              borderBottom: isRegister ? '2px solid var(--brand-purple-light)' : 'none',
              cursor: 'pointer'
            }}
          >
            Create Account
          </button>
        </div>

        {/* Global Error Banner */}
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
            <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
            <span>{authError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {isRegister && (
            <>
              {/* Full Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="name">
                  <User size={14} /> Full Legal Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="e.g. Aanya Sharma"
                  className={`form-input ${fieldErrors.name ? 'border-danger' : ''}`}
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                {fieldErrors.name && (
                  <span style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '0.2rem', display: 'block' }}>
                    {fieldErrors.name}
                  </span>
                )}
              </div>

              {/* Phone & Blood Group */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="phone">
                    <Phone size={14} /> Mobile Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="+91 98765 43210"
                    className="form-input"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="bloodGroup">
                    <Droplets size={14} /> Blood Group
                  </label>
                  <select
                    id="bloodGroup"
                    name="bloodGroup"
                    className="form-input"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Email Address */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              <Mail size={14} /> Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="you@domain.com"
              className={`form-input ${fieldErrors.email ? 'border-danger' : ''}`}
              value={formData.email}
              onChange={handleChange}
              required
            />
            {fieldErrors.email && (
              <span style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '0.2rem', display: 'block' }}>
                {fieldErrors.email}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="password">
                <Lock size={14} /> Password
              </label>
              {!isRegister && (
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(formData.email);
                    setForgotResult(null);
                    setShowForgotModal(true);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--brand-purple-light)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder={isRegister ? 'Minimum 8 characters' : 'Enter password'}
                className={`form-input ${fieldErrors.password ? 'border-danger' : ''}`}
                style={{ paddingRight: '2.5rem' }}
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors.password && (
              <span style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '0.2rem', display: 'block' }}>
                {fieldErrors.password}
              </span>
            )}
          </div>

          {/* Confirm Password (Registration only) */}
          {isRegister && (
            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">
                <Lock size={14} /> Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  className={`form-input ${fieldErrors.confirmPassword ? 'border-danger' : ''}`}
                  style={{ paddingRight: '2.5rem' }}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <span style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '0.2rem', display: 'block' }}>
                  {fieldErrors.confirmPassword}
                </span>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem', fontWeight: 700 }}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : isRegister ? (
              'Create Secure Account'
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
        </form>

        {/* Security & Privacy Notice */}
        <div style={{
          marginTop: '1.25rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          textAlign: 'center',
          lineHeight: 1.5
        }}>
          🛡️ <strong>Encrypted & Client-Audited:</strong> Your credentials, live journeys, and forensic evidence remain protected. No data is shared with advertisers or untrusted third parties.
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 300,
          padding: '1.5rem'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            width: '100%',
            maxWidth: '420px',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <KeyRound size={18} color="var(--brand-purple-light)" />
                <span>Account Password Recovery</span>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Enter your registered email address and choose a new password (min. 8 characters).
            </p>

            {forgotResult && (
              <div style={{
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: forgotResult.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: `1px solid ${forgotResult.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                color: forgotResult.success ? '#a7f3d0' : '#fca5a5',
                fontSize: '0.8rem',
                marginBottom: '1rem'
              }}>
                {forgotResult.message}
              </div>
            )}

            <form onSubmit={handleForgotSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@domain.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password (Min. 8 characters)</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter new password"
                  value={forgotNewPass}
                  onChange={(e) => setForgotNewPass(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
