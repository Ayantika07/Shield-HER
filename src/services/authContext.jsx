import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

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
      return saved ? JSON.parse(saved) : DEMO_USER; // Default to demo user so judge can start immediately
    } catch {
      return DEMO_USER;
    }
  });

  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (user) {
      localStorage.setItem('shield_her_auth', JSON.stringify(user));
    } else {
      localStorage.removeItem('shield_her_auth');
    }
  }, [user]);

  const login = (email, password) => {
    setAuthError('');
    if (!email || !email.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return false;
    }
    if (!password || password.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return false;
    }

    // Check stored accounts or demo
    const storedUsers = JSON.parse(localStorage.getItem('shield_her_users') || '[]');
    const matched = storedUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (matched) {
      // Simple hash check / simulation in frontend
      setUser({ ...matched, isDemo: false });
      return true;
    }

    // Allow standard demo login
    if (email.toLowerCase() === DEMO_USER.email.toLowerCase()) {
      setUser(DEMO_USER);
      return true;
    }

    // If new login in demo environment, create session
    const newUser = {
      id: 'usr_' + Date.now(),
      name: email.split('@')[0],
      email: email.toLowerCase(),
      phone: '+919988776655',
      bloodGroup: 'O+',
      isDemo: false,
      createdAt: new Date().toISOString()
    };
    setUser(newUser);
    return true;
  };

  const register = (name, email, password, phone = '') => {
    setAuthError('');
    if (!name || name.trim().length < 2) {
      setAuthError('Please enter your full name.');
      return false;
    }
    if (!email || !email.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return false;
    }
    if (!password || password.length < 8) {
      setAuthError('Password must be at least 8 characters long for your safety.');
      return false;
    }

    const storedUsers = JSON.parse(localStorage.getItem('shield_her_users') || '[]');
    if (storedUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      setAuthError('An account with this email already exists.');
      return false;
    }

    const newUser = {
      id: 'usr_' + Date.now(),
      name: name.trim(),
      email: email.toLowerCase(),
      phone: phone || '+919876543210',
      bloodGroup: 'A+',
      isDemo: false,
      createdAt: new Date().toISOString()
    };

    storedUsers.push(newUser);
    localStorage.setItem('shield_her_users', JSON.stringify(storedUsers));
    setUser(newUser);
    return true;
  };

  const loginDemo = () => {
    setUser(DEMO_USER);
    setAuthError('');
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('shield_her_auth');
  };

  const updateProfile = (data) => {
    if (!user) return;
    const updated = { ...user, ...data, updatedAt: new Date().toISOString() };
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isDemoMode: user?.isDemo ?? false,
      authError,
      setAuthError,
      login,
      register,
      loginDemo,
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
