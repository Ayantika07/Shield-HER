import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  User,
  Battery,
  BatteryLow,
  BatteryCharging,
  Download,
  Trash2,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Navigation,
  Clock,
  Car
} from 'lucide-react';
import { useAuth } from '../services/authContext';
import { clearAllLocalData, getAllIncidents, getAllJourneys, getEmergencyContacts, getCachedResources } from '../services/db';
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

  // Journey Preferences
  const [journeyPref, setJourneyPref] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('shield_her_journey_pref') || '{"interval":"15","defaultMode":"Cab / Ride Share"}');
    } catch {
      return { interval: '15', defaultMode: 'Cab / Ride Share' };
    }
  });

  // Battery State & Threshold
  const [batteryInfo, setBatteryInfo] = useState({ supported: false, level: null, charging: false });
  const [batteryThreshold, setBatteryThreshold] = useState(() => {
    return parseInt(localStorage.getItem('shield_her_battery_threshold') || '20', 10);
  });
  const [simulatedBatteryLevel, setSimulatedBatteryLevel] = useState(null);

  // Storage Counts
  const [counts, setCounts] = useState({ incidents: 0, journeys: 0, contacts: 0, resources: 0 });

  useEffect(() => {
    getBatteryStatus().then(setBatteryInfo);

    // Read real storage counts from IndexedDB
    Promise.all([
      getAllIncidents(),
      getAllJourneys(),
      getEmergencyContacts(),
      getCachedResources('all')
    ]).then(([inc, jny, cnt, res]) => {
      setCounts({
        incidents: inc.length,
        journeys: jny.length,
        contacts: cnt.length,
        resources: res.length
      });
    });
  }, []);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateProfile(profile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveJourneyPref = (e) => {
    e.preventDefault();
    localStorage.setItem('shield_her_journey_pref', JSON.stringify(journeyPref));
    alert('Journey preferences saved.');
  };

  const handleBatteryThresholdChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setBatteryThreshold(val);
    localStorage.setItem('shield_her_battery_threshold', val.toString());
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
          Settings & Safety Preferences
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Configure emergency medical identity, transit defaults, battery thresholds, and local device storage.
        </p>
      </div>

      {/* Emergency Profile & Medical Identity Form */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <User size={20} color="var(--brand-purple-light)" />
            <span>Emergency Profile & Medical Information</span>
          </div>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          In an emergency, these details can be attached to your location broadcasts to assist first responders.
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

      {/* Safe Journey Companion Preferences */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Navigation size={20} color="var(--brand-purple-light)" />
            <span>Safe Journey Defaults</span>
          </div>
        </div>

        <form onSubmit={handleSaveJourneyPref}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Default Check-In Interval</label>
              <select
                className="form-select"
                value={journeyPref.interval}
                onChange={(e) => setJourneyPref({ ...journeyPref, interval: e.target.value })}
              >
                <option value="10">Every 10 minutes</option>
                <option value="15">Every 15 minutes (Standard)</option>
                <option value="30">Every 30 minutes</option>
                <option value="45">Every 45 minutes</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Primary Travel Mode</label>
              <select
                className="form-select"
                value={journeyPref.defaultMode}
                onChange={(e) => setJourneyPref({ ...journeyPref, defaultMode: e.target.value })}
              >
                <option value="Cab / Ride Share">Cab / Ride Share (Uber/Ola)</option>
                <option value="Auto Rickshaw">Auto Rickshaw</option>
                <option value="Metro / Train">Metro / Train</option>
                <option value="Public Bus">Public Bus</option>
                <option value="Walking Alone">Walking Alone</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="submit" className="btn btn-secondary btn-sm">
              Save Journey Defaults
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
          When device battery crosses your safety threshold, SHIELD HER displays an advisory banner prompting you to confirm your journey ETA and prepare offline contacts.
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

          {/* Evaluator Simulator for Testing */}
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
      </div>

      {/* Browser Background Timer Guidance */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Clock size={20} color="var(--brand-purple-light)" />
            <span>Mobile Browser Background Timer Behavior</span>
          </div>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Mobile operating systems (iOS and Android) aggressively suspend active JavaScript timers when a phone's screen is locked or another application is brought to the foreground.
        </p>

        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginTop: '0.5rem', fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <strong>Recommended Best Practice:</strong> During active night travel, keep this web page open or add SHIELD HER to your mobile home screen (as a PWA). When you unlock your device, check-in deadlines calculate immediately against your true timestamp to show if you are overdue.
        </div>
      </div>

      {/* Data Sovereignty & Storage Counts */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <ShieldCheck size={20} color="var(--status-safe)" />
            <span>Device Storage Status & Data Portability</span>
          </div>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          All data is stored client-side in your device's IndexedDB. Your records are not uploaded to remote servers.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Emergency Contacts</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{counts.contacts}</div>
          </div>
          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Logged Incidents</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{counts.incidents}</div>
          </div>
          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Travel Records</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{counts.journeys}</div>
          </div>
          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified Facilities</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{counts.resources}</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Export Safety Archive</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Download contacts, journey records, and incidents as a portable JSON file.
            </div>
          </div>
          <button onClick={handleExportFullData} className="btn btn-secondary btn-sm" style={{ gap: '0.4rem' }}>
            <Download size={14} /> Download Archive (JSON)
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
            <div style={{ fontWeight: 600, color: 'var(--status-danger)' }}>Reset Local Data</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Erase custom incidents and restore default emergency demonstration data.
            </div>
          </div>
          <button onClick={handleClearAllData} className="btn btn-danger btn-sm" style={{ gap: '0.4rem' }}>
            <Trash2 size={14} /> Reset Local Data
          </button>
        </div>
      </div>

      {/* Logout Action */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
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
