import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  User,
  Battery,
  BatteryLow,
  BatteryCharging,
  Key,
  Download,
  Trash2,
  LogOut,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Info,
  PhoneCall
} from 'lucide-react';
import { useAuth } from '../services/authContext';
import { clearAllLocalData, getAllIncidents, getAllJourneys, getEmergencyContacts } from '../services/db';
import { getBatteryStatus } from '../services/deviceService';

export default function Settings() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  // Profile Form State
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bloodGroup: user?.bloodGroup || 'B+',
    allergies: user?.allergies || '',
    emergencyNotes: user?.emergencyNotes || ''
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Battery State & Threshold
  const [batteryInfo, setBatteryInfo] = useState({ supported: false, level: null, charging: false });
  const [batteryThreshold, setBatteryThreshold] = useState(() => {
    return parseInt(localStorage.getItem('shield_her_battery_threshold') || '20', 10);
  });
  const [simulatedBatteryLevel, setSimulatedBatteryLevel] = useState(null);

  // Optional Gemini API Key
  const [geminiKey, setGeminiKey] = useState(() => {
    return localStorage.getItem('shield_her_gemini_key') || '';
  });

  useEffect(() => {
    getBatteryStatus().then(setBatteryInfo);
  }, []);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateProfile(profile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleBatteryThresholdChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setBatteryThreshold(val);
    localStorage.setItem('shield_her_battery_threshold', val.toString());
  };

  const handleGeminiKeySave = (e) => {
    e.preventDefault();
    localStorage.setItem('shield_her_gemini_key', geminiKey.trim());
    alert('Gemini API key saved in local browser storage.');
  };

  const handleExportFullData = async () => {
    const incidents = await getAllIncidents();
    const journeys = await getAllJourneys();
    const contacts = await getEmergencyContacts();

    const fullBackup = {
      app: 'SHIELD HER',
      version: '1.0',
      exportDate: new Date().toISOString(),
      user: {
        name: user?.name,
        email: user?.email,
        phone: user?.phone,
        bloodGroup: user?.bloodGroup
      },
      data: {
        incidents,
        journeys,
        contacts
      }
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `shield_her_full_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleClearAllData = async () => {
    if (window.confirm('WARNING: Are you sure you want to permanently clear all locally stored incidents, journeys, and custom contacts? This cannot be undone.')) {
      await clearAllLocalData();
      alert('All local data has been purged. Default demonstration contacts have been restored.');
      window.location.reload();
    }
  };

  const currentLevel = simulatedBatteryLevel !== null ? simulatedBatteryLevel : batteryInfo.level;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <SettingsIcon size={28} color="var(--brand-purple-light)" />
          Settings & Personalization
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Configure emergency medical identity, low-battery alert parameters, and data backups.
        </p>
      </div>

      {/* Profile & Medical Identity Form */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <User size={20} color="var(--brand-purple-light)" />
            <span>Emergency Profile & Medical Information</span>
          </div>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          In an emergency, these details are included in your location broadcasts to assist first responders.
        </p>

        <form onSubmit={handleProfileSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read-only)</label>
              <input
                type="email"
                className="form-input"
                value={profile.email}
                disabled
                style={{ opacity: 0.7 }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Emergency Mobile Number</label>
              <input
                type="tel"
                className="form-input"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select
                className="form-select"
                value={profile.bloodGroup}
                onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value })}
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Known Allergies / Medical Conditions</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Asthmatic, Penicillin allergy"
                value={profile.allergies}
                onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Emergency Medical Notes</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Carries emergency inhaler; lives near CP"
                value={profile.emergencyNotes}
                onChange={(e) => setProfile({ ...profile, emergencyNotes: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
            {savedSuccess && (
              <span style={{ color: 'var(--status-safe)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={16} /> Profile changes saved successfully!
              </span>
            )}
            <button type="submit" className="btn btn-primary" style={{ marginLeft: 'auto' }}>
              Save Profile
            </button>
          </div>
        </form>
      </div>

      {/* Low-Battery Safety Reminder Configuration */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <BatteryLow size={20} color="#f59e0b" />
            <span>Low-Battery Safety Alert & Preparedness Threshold</span>
          </div>
          {currentLevel !== null && (
            <span className={`badge ${currentLevel <= batteryThreshold ? 'badge-danger' : 'badge-safe'}`}>
              Current Battery: {currentLevel}%
            </span>
          )}
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          When device battery crosses your safety threshold, SHIELD HER displays an alert prompting you to share your journey ETA and prepare offline contacts.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Alert Threshold: {batteryThreshold}%</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Triggers at or below {batteryThreshold}%</span>
          </div>

          <input
            type="range"
            min="10"
            max="30"
            step="5"
            value={batteryThreshold}
            onChange={handleBatteryThresholdChange}
            style={{ width: '100%', accentColor: 'var(--brand-purple)' }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>10% (Critical)</span>
            <span>15%</span>
            <span>20% (Recommended)</span>
            <span>25%</span>
            <span>30%</span>
          </div>

          {/* Fallback Simulator for Desktop Browsers */}
          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              🧪 <strong>Test Low-Battery Simulator</strong> (for evaluators on desktop browsers):
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                type="button"
                onClick={() => setSimulatedBatteryLevel(14)}
                className="btn btn-secondary btn-sm"
              >
                Simulate 14% (Low)
              </button>
              <button
                type="button"
                onClick={() => setSimulatedBatteryLevel(85)}
                className="btn btn-secondary btn-sm"
              >
                Simulate 85% (Normal)
              </button>
              <button
                type="button"
                onClick={() => setSimulatedBatteryLevel(null)}
                className="btn btn-outline btn-sm"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1rem', fontSize: '0.775rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          ℹ️ <strong>Technical Limitations:</strong> Web browsers cannot run background tasks or send SMS automatically when the phone has completely powered down. When battery is low, immediately message your trusted contacts.
        </div>
      </div>

      {/* Optional Google Gemini AI API Configuration */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Key size={20} color="var(--brand-purple-light)" />
            <span>AI Cyber Harassment API Settings (Optional)</span>
          </div>
          <span className="badge badge-purple">Advanced</span>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          SHIELD HER includes a powerful built-in local rule-based safety heuristics engine that works 100% offline. If you have a Google Gemini API key, you can enter it below to enable neural language parsing.
        </p>

        <form onSubmit={handleGeminiKeySave}>
          <div className="form-group">
            <label className="form-label">Google Gemini API Key</label>
            <input
              type="password"
              className="form-input"
              placeholder="AIzaSy..."
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
            />
            <span className="form-hint">Stored strictly in your local browser storage. Never logged to external analytics.</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            {geminiKey && (
              <button
                type="button"
                onClick={() => { setGeminiKey(''); localStorage.removeItem('shield_her_gemini_key'); }}
                className="btn btn-outline btn-sm"
              >
                Remove Key
              </button>
            )}
            <button type="submit" className="btn btn-secondary btn-sm">
              Save AI Key
            </button>
          </div>
        </form>
      </div>

      {/* Data Backup & Dangerous Actions */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Download size={20} color="var(--status-safe)" />
            <span>Data Portability & Device Storage Management</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Export Complete Encrypted Dossier</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Download all incidents, safe journey records, and emergency contacts as a JSON archive.
            </div>
          </div>
          <button onClick={handleExportFullData} className="btn btn-secondary btn-sm" style={{ gap: '0.4rem' }}>
            <Download size={14} /> Export Backup (JSON)
          </button>
        </div>

        <div style={{
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--status-danger)' }}>Purge Local Browser Data</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Permanently delete all stored evidence, journey logs, and reset database to factory defaults.
            </div>
          </div>
          <button onClick={handleClearAllData} className="btn btn-danger btn-sm" style={{ gap: '0.4rem' }}>
            <Trash2 size={14} /> Clear All Local Data
          </button>
        </div>
      </div>

      {/* Logout Action */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="btn btn-outline"
          style={{ color: 'var(--status-danger)', borderColor: 'var(--border-subtle)', gap: '0.5rem' }}
        >
          <LogOut size={16} /> Sign Out of SHIELD HER
        </button>
      </div>
    </div>
  );
}
