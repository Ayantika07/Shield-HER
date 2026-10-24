import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  AlertTriangle,
  Navigation,
  ShieldAlert,
  Lock,
  MapPin,
  Building2,
  CheckSquare,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  BatteryCharging,
  ArrowRight,
  PhoneCall,
  Clock,
  Compass,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../services/authContext';
import { getActiveJourney, getAllIncidents, getChecklistItems, getEmergencyContacts } from '../services/db';
import { getBatteryStatus, getCurrentCoordinates } from '../services/deviceService';

export default function Dashboard() {
  const { user } = useAuth();

  const [activeJourney, setActiveJourney] = useState(null);
  const [incidentsCount, setIncidentsCount] = useState(0);
  const [checklistProgress, setChecklistProgress] = useState({ total: 7, completed: 3, percent: 42 });
  const [batteryInfo, setBatteryInfo] = useState({ supported: false, level: null, charging: false });
  const [gpsLocation, setGpsLocation] = useState(null);
  const [gpsError, setGpsError] = useState(null);
  const [contactsCount, setContactsCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // 1. Fetch DB data
    getActiveJourney().then(setActiveJourney);
    getAllIncidents().then((list) => setIncidentsCount(list.length));
    getEmergencyContacts().then((list) => setContactsCount(list.length));

    getChecklistItems().then((items) => {
      const comp = items.filter(i => i.completed).length;
      setChecklistProgress({
        total: items.length,
        completed: comp,
        percent: Math.round((comp / items.length) * 100)
      });
    });

    // 2. Battery status
    getBatteryStatus().then(setBatteryInfo);

    // 3. Online/offline listener
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 4. Attempt non-blocking GPS coordinates
    getCurrentCoordinates()
      .then(setGpsLocation)
      .catch((err) => setGpsError(err.message));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Greeting based on current time
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner / Welcome Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        padding: '1.5rem',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--brand-purple-light)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span style={{ color: 'var(--border-subtle)' }}>•</span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.75rem',
              color: isOnline ? 'var(--status-safe)' : 'var(--status-warning)'
            }}>
              {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
              {isOnline ? 'Cloud Synced' : 'Offline Ready'}
            </span>
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {getGreeting()}, {user?.name ? user.name.split(' ')[0] : 'Citizen'}
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {gpsLocation ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--brand-lavender)' }}>
                <Compass size={14} /> GPS Active: Lat {gpsLocation.latitude.toFixed(4)}, Lon {gpsLocation.longitude.toFixed(4)} (±{gpsLocation.accuracy}m)
              </span>
            ) : gpsError ? (
              <span style={{ color: 'var(--text-muted)' }}>Location permission not yet granted (click SOS to verify)</span>
            ) : (
              <span>Locating nearest safe zones...</span>
            )}
          </p>
        </div>

        {/* Quick Emergency Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <a
            href="tel:112"
            className="btn btn-danger btn-lg pulse-emergency"
            style={{ fontWeight: 800, letterSpacing: '0.02em', gap: '0.65rem' }}
          >
            <PhoneCall size={20} />
            <span>EMERGENCY 112</span>
          </a>
          <Link to="/sos" className="btn btn-secondary btn-lg" style={{ fontWeight: 600 }}>
            Discreet SOS Hub
          </Link>
        </div>
      </div>

      {/* Low-Battery Safety Warning Banner (if supported and low) */}
      {batteryInfo.supported && batteryInfo.level !== null && batteryInfo.level <= 20 && !batteryInfo.charging && (
        <div style={{
          backgroundColor: 'var(--status-danger-bg)',
          border: '1px solid var(--status-danger)',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <BatteryLow size={28} color="#ef4444" />
            <div>
              <div style={{ fontWeight: 700, color: '#fca5a5', fontSize: '0.95rem' }}>
                Low Battery Advisory ({batteryInfo.level}%)
              </div>
              <div style={{ fontSize: '0.825rem', color: '#f8fafc' }}>
                Your device battery is running low. Ensure your Safe Journey is logged and pre-cache offline emergency contacts.
              </div>
            </div>
          </div>
          <Link to="/offline" className="btn btn-outline btn-sm" style={{ color: '#ffffff', borderColor: '#ef4444' }}>
            Prepare Offline Guide
          </Link>
        </div>
      )}

      {/* Grid: Priority Safety Features */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* Card 1: Safe Journey Companion */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header">
              <div className="card-title">
                <Navigation size={20} color="var(--brand-purple-light)" />
                <span>Safe Journey Companion</span>
              </div>
              {activeJourney ? (
                <span className="badge badge-safe">In Transit</span>
              ) : (
                <span className="badge badge-neutral">Inactive</span>
              )}
            </div>

            {activeJourney ? (
              <div style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                border: '1px solid var(--border-subtle)',
                marginBottom: '1rem'
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {activeJourney.origin} → {activeJourney.destination}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Expected Arrival: {activeJourney.expectedArrival || 'Not specified'} • Via {activeJourney.vehicleMode || 'Transit'}
                </div>
                <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--brand-purple-light)', fontSize: '0.8rem' }}>
                  <Clock size={14} /> Next Check-in: Due in {activeJourney.checkInInterval || 15} mins
                </div>
              </div>
            ) : (
              <p style={{ marginBottom: '1.25rem', fontSize: '0.875rem' }}>
                Traveling alone or late at night? Start an active transit companion with timed check-in reminders and quick emergency location sharing.
              </p>
            )}
          </div>

          <Link
            to="/journey"
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'space-between' }}
          >
            <span>{activeJourney ? 'View Live Journey & Check In' : 'Plan & Start a Journey'}</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Card 2: AI Cyber Harassment Detector */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header">
              <div className="card-title">
                <ShieldAlert size={20} color="#fb7185" />
                <span>AI Harassment Detector</span>
              </div>
              <span className="badge badge-purple">Heuristics + AI</span>
            </div>
            <p style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
              Received an abusive, threatening, or stalking message? Instantly analyze threat level, preserve forensic evidence, and get immediate reporting guidance.
            </p>
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1rem',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)'
            }}>
              💡 <em>Detects: Bodily harm threats, blackmail/nudes extortion, location tracking, and boundary coercion.</em>
            </div>
          </div>

          <Link
            to="/detector"
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'space-between' }}
          >
            <span>Analyze Suspicious Message</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Card 3: Private Evidence Locker */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header">
              <div className="card-title">
                <Lock size={20} color="var(--brand-lavender)" />
                <span>Private Evidence Locker</span>
              </div>
              <span className="badge badge-neutral">{incidentsCount} Logged</span>
            </div>
            <p style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
              Locally encrypted vault on your device for incident logs, screenshots, dates, and suspect usernames. Never uploaded without your consent.
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.85rem',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1rem',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.825rem'
            }}>
              <span>Storage status:</span>
              <strong style={{ color: 'var(--status-safe)' }}>IndexedDB Active</strong>
            </div>
          </div>

          <Link
            to="/evidence"
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'space-between' }}
          >
            <span>Open Evidence Locker</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Row: Quick Map & Police Station Hub + Digital Privacy Progress */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* GPS Map & Verified Police Stations */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Building2 size={20} color="var(--status-safe)" />
              <span>Official Police Assistance & Safe Havens</span>
            </div>
            <Link to="/map" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              Interactive Map
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  Connaught Place Women Police Station
                </div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  24x7 Women Help Desk • B-Block, CP, New Delhi
                </div>
              </div>
              <a href="tel:01123747100" className="btn btn-outline btn-sm" style={{ gap: '0.35rem' }}>
                <PhoneCall size={13} /> Call
              </a>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-surface)',
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  Lady Hardinge 24x7 Trauma & Medical Care
                </div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  Emergency Wing • Shaheed Bhagat Singh Marg
                </div>
              </div>
              <a href="tel:01123363728" className="btn btn-outline btn-sm" style={{ gap: '0.35rem' }}>
                <PhoneCall size={13} /> Call
              </a>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/police" className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
              View Police Helplines
            </Link>
            <Link to="/map" className="btn btn-primary btn-sm" style={{ flex: 1 }}>
              Open GPS Safety Map
            </Link>
          </div>
        </div>

        {/* Digital Privacy Guardian Progress */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header">
              <div className="card-title">
                <CheckSquare size={20} color="var(--brand-purple-light)" />
                <span>Digital Privacy Guardian</span>
              </div>
              <span className="badge badge-purple">{checklistProgress.percent}% Ready</span>
            </div>

            <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
              Protect your online presence, audit location permissions, stop stalkerware, and lock down social accounts.
            </p>

            {/* Progress Bar */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                height: '8px',
                width: '100%',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{
                  height: '100%',
                  width: `${checklistProgress.percent}%`,
                  background: 'linear-gradient(90deg, #4f46e5 0%, #10b981 100%)',
                  transition: 'width 300ms ease'
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                <span>{checklistProgress.completed} of {checklistProgress.total} safety tasks completed</span>
                <span>{checklistProgress.total - checklistProgress.completed} recommended</span>
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)'
            }}>
              🛡️ <strong>Next task:</strong> Review continuous location permissions on food and cab apps.
            </div>
          </div>

          <Link
            to="/privacy"
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'space-between', marginTop: '1rem' }}
          >
            <span>Complete Privacy Checklist</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
