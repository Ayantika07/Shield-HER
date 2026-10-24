import React, { useState, useEffect } from 'react';
import {
  Navigation,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  XCircle,
  PhoneCall,
  Share2,
  Car,
  History,
  AlertCircle,
  Info
} from 'lucide-react';
import { useAuth } from '../services/authContext';
import { getActiveJourney, getAllJourneys, saveJourney, getEmergencyContacts } from '../services/db';
import { getCurrentCoordinates, shareEmergencyAlert } from '../services/deviceService';

export default function Journey() {
  const { user } = useAuth();

  const [activeJourney, setActiveJourney] = useState(null);
  const [journeyHistory, setJourneyHistory] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [checkInCountdown, setCheckInCountdown] = useState(0);
  const [missedCheckIns, setMissedCheckIns] = useState(0);

  // New Journey Form
  const [form, setForm] = useState({
    origin: '',
    destination: '',
    vehicleMode: 'Cab / Ride Share',
    driverDetails: '',
    expectedArrival: '',
    checkInInterval: '15'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const active = await getActiveJourney();
    setActiveJourney(active);
    const history = await getAllJourneys();
    setJourneyHistory(history.filter(j => j.status === 'completed' || j.status === 'cancelled'));
    const conts = await getEmergencyContacts();
    setContacts(conts);

    if (active) {
      setMissedCheckIns(active.missedCheckIns || 0);
      calculateTimeLeft(active.expectedArrival);
      // set check-in countdown
      const intervalSec = (parseInt(active.checkInInterval, 10) || 15) * 60;
      setCheckInCountdown(intervalSec);
    }
  };

  // Live timer for active journey
  useEffect(() => {
    if (!activeJourney || activeJourney.status !== 'active') return;

    const interval = setInterval(() => {
      calculateTimeLeft(activeJourney.expectedArrival);

      setCheckInCountdown((prev) => {
        if (prev <= 1) {
          // Missed check-in increment
          setMissedCheckIns((m) => {
            const nextMissed = m + 1;
            // update in DB
            saveJourney({ ...activeJourney, missedCheckIns: nextMissed });
            return nextMissed;
          });
          return (parseInt(activeJourney.checkInInterval, 10) || 15) * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeJourney]);

  const calculateTimeLeft = (etaStr) => {
    if (!etaStr) return;
    const [hours, minutes] = etaStr.split(':').map(Number);
    const now = new Date();
    const eta = new Date();
    eta.setHours(hours, minutes, 0, 0);

    if (eta < now) {
      // Past ETA
      const diffMins = Math.round((now - eta) / 60000);
      setTimeRemaining(`Overdue by ${diffMins} min${diffMins === 1 ? '' : 's'}`);
    } else {
      const diffMins = Math.round((eta - now) / 60000);
      const h = Math.floor(diffMins / 60);
      const m = diffMins % 60;
      setTimeRemaining(`${h > 0 ? `${h}h ` : ''}${m}m remaining`);
    }
  };

  const handleStartJourney = async (e) => {
    e.preventDefault();
    if (!form.origin || !form.destination || !form.expectedArrival) return;

    const newJourney = {
      id: 'jny_' + Date.now(),
      ...form,
      status: 'active',
      startTime: new Date().toISOString(),
      checkIns: [
        { time: new Date().toISOString(), note: 'Journey initiated' }
      ],
      missedCheckIns: 0
    };

    await saveJourney(newJourney);
    setActiveJourney(newJourney);
    loadData();
  };

  const handleCheckIn = async () => {
    if (!activeJourney) return;
    const updatedCheckIns = [
      ...(activeJourney.checkIns || []),
      { time: new Date().toISOString(), note: 'Routine safety confirmation' }
    ];

    const updated = {
      ...activeJourney,
      checkIns: updatedCheckIns,
      missedCheckIns: 0,
      lastCheckInTime: new Date().toISOString()
    };

    await saveJourney(updated);
    setActiveJourney(updated);
    setMissedCheckIns(0);
    // Reset countdown
    setCheckInCountdown((parseInt(activeJourney.checkInInterval, 10) || 15) * 60);
  };

  const handlePauseResume = async () => {
    if (!activeJourney) return;
    const newStatus = activeJourney.status === 'active' ? 'paused' : 'active';
    const updated = { ...activeJourney, status: newStatus };
    await saveJourney(updated);
    setActiveJourney(updated);
  };

  const handleCompleteJourney = async () => {
    if (!activeJourney) return;
    const updated = {
      ...activeJourney,
      status: 'completed',
      completedTime: new Date().toISOString()
    };
    await saveJourney(updated);
    setActiveJourney(null);
    loadData();
  };

  const handleCancelJourney = async () => {
    if (!window.confirm('Cancel this active journey?')) return;
    const updated = {
      ...activeJourney,
      status: 'cancelled',
      cancelledTime: new Date().toISOString()
    };
    await saveJourney(updated);
    setActiveJourney(null);
    loadData();
  };

  const handleShareJourney = async () => {
    if (!activeJourney) return;
    const text = `SHIELD HER Safe Journey Update from ${user?.name || 'Aanya'}:
Traveling from ${activeJourney.origin} to ${activeJourney.destination}
Mode: ${activeJourney.vehicleMode} ${activeJourney.driverDetails ? `(${activeJourney.driverDetails})` : ''}
Expected Arrival: ${activeJourney.expectedArrival}
Status: In Transit. Checking in every ${activeJourney.checkInInterval} minutes.`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Live Safe Journey', text });
      } catch {
        navigator.clipboard.writeText(text);
        alert('Journey details copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Journey details copied to clipboard!');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Navigation size={28} color="var(--brand-purple-light)" />
          Safe Journey Companion
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Real-time transit check-in timer, automated missed check-in alerts, and emergency contact sharing.
        </p>
      </div>

      {/* Active Journey View */}
      {activeJourney ? (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--brand-purple)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-md)'
        }}>
          {/* Status Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <span className={`badge ${activeJourney.status === 'active' ? 'badge-safe' : 'badge-warning'}`} style={{ marginBottom: '0.4rem' }}>
                {activeJourney.status === 'active' ? '● Active Transit Monitoring' : '❚❚ Paused'}
              </span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {activeJourney.origin} → {activeJourney.destination}
              </h2>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estimated Arrival</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--brand-lavender)' }}>
                {activeJourney.expectedArrival} ({timeRemaining})
              </div>
            </div>
          </div>

          {/* Missed Check-in Warning if > 0 */}
          {missedCheckIns > 0 && (
            <div style={{
              backgroundColor: 'var(--status-danger-bg)',
              border: '1px solid var(--status-danger)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fca5a5' }}>
                <AlertTriangle size={20} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                  Safety Alert: {missedCheckIns} Missed Check-in{missedCheckIns > 1 ? 's' : ''}!
                </span>
              </div>
              <button
                onClick={handleCheckIn}
                className="btn btn-success btn-sm"
              >
                I am Safe (Reset Alert)
              </button>
            </div>
          )}

          {/* Transit Details Box */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            backgroundColor: 'var(--bg-card)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            border: '1px solid var(--border-subtle)'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mode & Vehicle</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                {activeJourney.vehicleMode}
              </div>
            </div>
            {activeJourney.driverDetails && (
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cab / Driver Info</div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {activeJourney.driverDetails}
                </div>
              </div>
            )}
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Next Check-in Due In</div>
              <div style={{ fontWeight: 700, color: checkInCountdown < 60 ? 'var(--status-danger)' : 'var(--brand-purple-light)', marginTop: '0.2rem' }}>
                {Math.floor(checkInCountdown / 60)}m {checkInCountdown % 60}s
              </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <button
              onClick={handleCheckIn}
              className="btn btn-success btn-lg"
              style={{ flex: 2, minWidth: '180px', fontWeight: 700, gap: '0.5rem' }}
            >
              <CheckCircle2 size={20} /> I'm Safe (Confirm Check-In)
            </button>
            <button
              onClick={handleCompleteJourney}
              className="btn btn-primary btn-lg"
              style={{ flex: 1, minWidth: '140px' }}
            >
              Reached Destination
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleShareJourney}
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.4rem' }}
            >
              <Share2 size={14} /> Share Status with Contacts
            </button>
            <button
              onClick={handlePauseResume}
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.4rem' }}
            >
              {activeJourney.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
              {activeJourney.status === 'active' ? 'Pause Journey' : 'Resume Journey'}
            </button>
            <button
              onClick={handleCancelJourney}
              className="btn btn-outline btn-sm"
              style={{ color: 'var(--status-danger)', gap: '0.4rem' }}
            >
              <XCircle size={14} /> Cancel Journey
            </button>
          </div>
        </div>
      ) : (
        /* Create New Journey Card */
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Navigation size={20} color="var(--brand-purple-light)" />
              <span>Start a New Monitored Journey</span>
            </div>
          </div>

          <form onSubmit={handleStartJourney}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1rem'
            }}>
              <div className="form-group">
                <label className="form-label">
                  <MapPin size={14} /> Starting Point (Origin)
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Cyber City Office, Tower B"
                  value={form.origin}
                  onChange={(e) => setForm({ ...form, origin: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <MapPin size={14} /> Destination
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Connaught Place Apartment"
                  value={form.destination}
                  onChange={(e) => setForm({ ...form, destination: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              <div className="form-group">
                <label className="form-label">
                  <Car size={14} /> Mode of Travel
                </label>
                <select
                  className="form-select"
                  value={form.vehicleMode}
                  onChange={(e) => setForm({ ...form, vehicleMode: e.target.value })}
                >
                  <option value="Cab / Ride Share">Cab / Ride Share (Uber / Ola / Rapido)</option>
                  <option value="Auto Rickshaw">Auto Rickshaw</option>
                  <option value="Metro / Train">Metro / Train</option>
                  <option value="Public Bus">Public Bus</option>
                  <option value="Walking">Walking Alone</option>
                  <option value="Personal Vehicle">Personal Vehicle</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Clock size={14} /> Expected Arrival Time (ETA)
                </label>
                <input
                  type="time"
                  className="form-input"
                  value={form.expectedArrival}
                  onChange={(e) => setForm({ ...form, expectedArrival: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Clock size={14} /> Check-In Interval
                </label>
                <select
                  className="form-select"
                  value={form.checkInInterval}
                  onChange={(e) => setForm({ ...form, checkInInterval: e.target.value })}
                >
                  <option value="10">Every 10 minutes</option>
                  <option value="15">Every 15 minutes (Standard)</option>
                  <option value="30">Every 30 minutes</option>
                  <option value="45">Every 45 minutes</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Cab Number / Driver Details (Optional)
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. White Dzire DL-1Z-9988, Driver: Ramesh"
                value={form.driverDetails}
                onChange={(e) => setForm({ ...form, driverDetails: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.5rem', fontWeight: 700 }}
            >
              Start Monitored Journey
            </button>
          </form>
        </div>
      )}

      {/* Limitation Notice */}
      <div style={{
        padding: '1rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.5,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.6rem'
      }}>
        <Info size={18} color="var(--brand-purple-light)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Browser Execution Disclaimer:</strong> Mobile web browsers suspend background JavaScript timers when the screen turns off or the tab is switched. For unattended 24/7 background geofencing, keep this web tab active or install SHIELD HER as a PWA on your home screen.
        </div>
      </div>

      {/* Previous Journeys History */}
      {journeyHistory.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <History size={20} color="var(--brand-purple-light)" />
              <span>Previous Journeys ({journeyHistory.length})</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {journeyHistory.map((jny) => (
              <div
                key={jny.id}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {jny.origin} → {jny.destination}
                    </span>
                    <span className={`badge ${jny.status === 'completed' ? 'badge-safe' : 'badge-neutral'}`} style={{ fontSize: '0.65rem' }}>
                      {jny.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {new Date(jny.startTime).toLocaleDateString()} • Mode: {jny.vehicleMode} • ETA: {jny.expectedArrival}
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {jny.checkIns?.length || 1} check-ins logged
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
