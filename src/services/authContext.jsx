import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const BACKEND_URL = 'http://localhost:5000';

const DEMO_USER = {
  id: 'usr_demo_01',
  name: 'Aanya Sharma',
  email: 'aanya.sharma@shieldher.org',
  phone: '+919876543210',
  bloodGroup: 'B+',
  allergies: 'Penicillin',
  emergencyNotes: 'Carries emergency inhaler; lives near Connaught Place.',
  isDemo: true,
  createdAt: '2026-10-01T10:00:00.000Z'
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('shield_her_auth');
      // STRICT REQUIREMENT: Fresh session without saved auth MUST start unauthenticated (null)
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('shield_her_token') || null);
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);

  // Probe backend health status on mount
  useEffect(() => {
    let isMounted = true;
    fetch(`${BACKEND_URL}/api/health`, { method: 'GET', headers: { 'Accept': 'application/json' } })
      .then((res) => res.json())
      .then(() => {
        if (isMounted) setBackendOnline(true);
      })
      .catch(() => {
        if (isMounted) setBackendOnline(false);
      });
    return () => { isMounted = false; };
  }, []);

  // Synchronize user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('shield_her_auth', JSON.stringify(user));
    } else {
      localStorage.removeItem('shield_her_auth');
      localStorage.removeItem('shield_her_token');
    }
  }, [user]);

  // LOGIN: Connects to Express API with bcrypt validation or local demo fallback
  const login = async (email, password) => {
    setAuthError('');
    setLoading(true);

    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const cleanPassword = password ? password.trim() : '';

    if (!cleanEmail) {
      setAuthError('Please enter your email address.');
      setLoading(false);
      return false;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setAuthError('Please enter a valid email address (e.g. name@domain.com).');
      setLoading(false);
      return false;
    }

    if (!cleanPassword) {
      setAuthError('Please enter your password.');
      setLoading(false);
      return false;
    }

    if (cleanPassword.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      setLoading(false);
      return false;
    }

    // 1. Try real Express backend authentication
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        if (data.token) {
          setToken(data.token);
          localStorage.setItem('shield_her_token', data.token);
        }
        setBackendOnline(true);
        setLoading(false);
        return true;
      } else {
        const errData = await response.json().catch(() => ({}));
        // If server explicitly returned 401 or 400
        setAuthError(errData.error || 'Invalid email or password.');
        setLoading(false);
        return false;
      }
    } catch (networkErr) {
      // Backend is unreachable; gracefully fallback to verified local demo authentication
      setBackendOnline(false);
    }

    // 2. Local Fallback for Demo and Local Accounts
    if (cleanEmail === DEMO_USER.email.toLowerCase()) {
      if (cleanPassword === 'demo1234') {
        setUser(DEMO_USER);
        setLoading(false);
        return true;
      } else {
        setAuthError('Invalid demo password. The demo password is "demo1234".');
        setLoading(false);
        return false;
      }
    }

    // Check locally registered accounts
    try {
      const storedUsers = JSON.parse(localStorage.getItem('shield_her_users') || '[]');
      const matched = storedUsers.find((u) => u.email.toLowerCase() === cleanEmail);
      if (matched) {
        if (matched.password === cleanPassword || !matched.password) {
          const { password: _, ...safeUser } = matched;
          setUser(safeUser);
          setLoading(false);
          return true;
        } else {
          setAuthError('Invalid password for this account.');
          setLoading(false);
          return false;
        }
      }
    } catch {
      // ignore
    }

    setAuthError('No account found with this email. Please check your credentials or register.');
    setLoading(false);
    return false;
  };

  // REGISTER: Connects to backend API or stores safely locally
  const register = async (name, email, password, phone = '', bloodGroup = 'O+') => {
    setAuthError('');
    setLoading(true);

    const cleanName = name ? name.trim() : '';
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const cleanPassword = password ? password.trim() : '';

    if (!cleanName || cleanName.length < 2) {
      setAuthError('Please enter your full legal name (minimum 2 characters).');
      setLoading(false);
      return false;
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setAuthError('Please enter a valid email address.');
      setLoading(false);
      return false;
    }

    if (!cleanPassword || cleanPassword.length < 8) {
      setAuthError('For your security, passwords must be at least 8 characters long.');
      setLoading(false);
      return false;
    }

    // 1. Try real Express backend registration
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          password: cleanPassword,
          phone: phone.trim(),
          bloodGroup
        })
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        if (data.token) {
          setToken(data.token);
          localStorage.setItem('shield_her_token', data.token);
        }
        setBackendOnline(true);
        setLoading(false);
        return true;
      } else {
        const errData = await response.json().catch(() => ({}));
        setAuthError(errData.error || 'Registration failed.');
        setLoading(false);
        return false;
      }
    } catch (networkErr) {
      setBackendOnline(false);
    }

    // 2. Local Fallback Registration
    try {
      const storedUsers = JSON.parse(localStorage.getItem('shield_her_users') || '[]');
      if (storedUsers.some((u) => u.email.toLowerCase() === cleanEmail) || cleanEmail === DEMO_USER.email.toLowerCase()) {
        setAuthError('An account with this email address already exists.');
        setLoading(false);
        return false;
      }

      const newUser = {
        id: 'usr_' + Date.now(),
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword,
        phone: phone.trim() || '+919876543210',
        bloodGroup: bloodGroup || 'O+',
        isDemo: false,
        createdAt: new Date().toISOString()
      };

      storedUsers.push(newUser);
      localStorage.setItem('shield_her_users', JSON.stringify(storedUsers));

      const { password: _, ...safeUser } = newUser;
      setUser(safeUser);
      setLoading(false);
      return true;
    } catch (err) {
      setAuthError('Could not save local user account.');
      setLoading(false);
      return false;
    }
  };

  // Instant 1-Click Demo Login
  const loginDemo = () => {
    setAuthError('');
    setUser(DEMO_USER);
    return true;
  };

  // FORGOT PASSWORD / RESET PASSWORD FLOW
  const resetPassword = (email, newPassword) => {
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const cleanPass = newPassword ? newPassword.trim() : '';

    if (!cleanEmail) {
      return { success: false, message: 'Please enter the email associated with your account.' };
    }
    if (!cleanPass || cleanPass.length < 8) {
      return { success: false, message: 'New password must be at least 8 characters long.' };
    }

    if (cleanEmail === DEMO_USER.email.toLowerCase()) {
      return {
        success: true,
        message: 'Demo account credentials verified: Email: aanya.sharma@shieldher.org | Password: demo1234'
      };
    }

    try {
      const storedUsers = JSON.parse(localStorage.getItem('shield_her_users') || '[]');
      const index = storedUsers.findIndex((u) => u.email.toLowerCase() === cleanEmail);
      if (index === -1) {
        return { success: false, message: 'No registered account found with that email address.' };
      }
      storedUsers[index].password = cleanPass;
      localStorage.setItem('shield_her_users', JSON.stringify(storedUsers));
      return { success: true, message: 'Password reset successfully! You can now sign in with your new password.' };
    } catch {
      return { success: false, message: 'Failed to update password.' };
    }
  };

  // SIGN OUT / LOGOUT
  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthError('');
    localStorage.removeItem('shield_her_auth');
    localStorage.removeItem('shield_her_token');
  };

  const updateProfile = (data) => {
    if (!user) return;
    const updated = { ...user, ...data, updatedAt: new Date().toISOString() };
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!user,
      isDemoMode: user?.isDemo ?? false,
      authError,
      setAuthError,
      loading,
      backendOnline,
      login,
      register,
      loginDemo,
      resetPassword,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
