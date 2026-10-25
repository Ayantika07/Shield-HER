import React, { useState, useEffect, useRef } from 'react';
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
  Check,
  Send,
  X,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../services/authContext';
import { getActiveJourney, getAllJourneys, saveJourney, getEmergencyContacts } from '../services/db';
import { getCurrentCoordinates } from '../services/deviceService';

export default function Journey() {
  const { user } = useAuth();

  const [activeJourney, setActiveJourney] = useState(null);
  const [journeyHistory, setJourneyHistory] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [checkInRemainingSec, setCheckInRemainingSec] = useState(0);
  const [isOverdue, setIsOverdue] = useState(false);
  const [overdueMinutes, setOverdueMinutes] = useState(0);

  // Modals
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showArrivalModal, setShowArrivalModal] = useState(false);
  const [selectedContactIds, setSelectedContactIds] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [lastCompletedJourney, setLastCompletedJourney] = useState(null);

  // Form State
  const [form, setForm] = useState({
    origin: '',
    destination: '',
    vehicleMode: 'Cab / Ride Share',
    driverDetails: '',
    expectedArrival: '',
    checkInInterval: '15'
  });

  const timerRef = useRef(null);

  useEffect(() => {
    loadData();
    // Non-blocking location check
    getCurrentCoordinates()
      .then(setCurrentLocation)
      .catch(() => {/* Location optional */});

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const loadData = async () => {
    const active = await getActiveJourney();
    setActiveJourney(active);
    const history = await getAllJourneys();
    setJourneyHistory(history.filter(j => j.status === 'completed' || j.status === 'cancelled'));
    const conts = await getEmergencyContacts();
    setContacts(conts);
    if (conts.length > 0) {
      setSelectedContactIds([conts[0].id]);
    }

    if (active) {
      calculateTimeLeft(active.expectedArrival);
      syncCheckInTimer(active);
    }
  };

  const syncCheckInTimer = (journey) => {
    if (!journey || journey.status !== 'active') return;

    const intervalMinutes = parseInt(journey.checkInInterval, 10) || 15;
    const now = Date.now();

    // If journey doesn't have a nextCheckInTimestamp, set it
    let target = journey.nextCheckInTimestamp;
    if (!target) {
      target = now + intervalMinutes * 60 * 1000;
      journey.nextCheckInTimestamp = target;
      saveJourney(journey);
    }

    const diffSec = Math.round((target - now) / 1000);
    if (diffSec <= 0) {
      setIsOverdue(true);
      setOverdueMinutes(Math.max(1, Math.round(Math.abs(diffSec) / 60)));
      setCheckInRemainingSec(0);
    } else {
      setIsOverdue(false);
      setCheckInRemainingSec(diffSec);
    }
  };

  // Timer loop for active journey
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (activeJourney && activeJourney.status === 'active') {
      timerRef.current = setInterval(() => {
        calculateTimeLeft(activeJourney.expectedArrival);

        const now = Date.now();
        const target = activeJourney.nextCheckInTimestamp || (now + (parseInt(activeJourney.checkInInterval, 10) || 15) * 60 * 1000);
        const diffSec = Math.round((target - now) / 1000);

        if (diffSec <= 0) {
          setIsOverdue(true);
          const mins = Math.max(1, Math.round(Math.abs(diffSec) / 60));
          setOverdueMinutes(mins);
          setCheckInRemainingSec(0);
        } else {
          setIsOverdue(false);
          setCheckInRemainingSec(diffSec);
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeJourney]);

  const calculateTimeLeft = (etaStr) => {
    if (!etaStr) return;
    const [hours, minutes] = etaStr.split(':').map(Number);
    const now = new Date();
    const eta = new Date();
    eta.setHours(hours, minutes, 0, 0);

    if (eta < now) {
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

    const intervalMinutes = parseInt(form.checkInInterval, 10) || 15;
    const nextCheckIn = Date.now() + intervalMinutes * 60 * 1000;

    const newJourney = {
      id: 'jny_' + Date.now(),
      ...form,
      status: 'active',
      startTime: new Date().toISOString(),
      nextCheckInTimestamp: nextCheckIn,
      checkIns: [
        { time: new Date().toISOString(), note: 'Journey initiated' }
      ]
    };

    await saveJourney(newJourney);
    setActiveJourney(newJourney);
    setIsOverdue(false);
    setCheckInRemainingSec(intervalMinutes * 60);
    loadData();
  };

  const handleCheckIn = async () => {
    if (!activeJourney) return;
    const intervalMinutes = parseInt(activeJourney.checkInInterval, 10) || 15;
    const nextCheckIn = Date.now() + intervalMinutes * 60 * 1000;

    const updatedCheckIns = [
      ...(activeJourney.checkIns || []),
      { time: new Date().toISOString(), note: 'Confirmed safe by user' }
    ];

    const updated = {
      ...activeJourney,
      nextCheckInTimestamp: nextCheckIn,
      lastCheckInTime: new Date().toISOString(),
      checkIns: updatedCheckIns
    };

    await saveJourney(updated);
    setActiveJourney(updated);
    setIsOverdue(false);
    setOverdueMinutes(0);
    setCheckInRemainingSec(intervalMinutes * 60);
  };

  const handlePauseResume = async () => {
    if (!activeJourney) return;
    if (activeJourney.status === 'active') {
      // Pause
      const remainingBeforePause = Math.max(0, Math.round((activeJourney.nextCheckInTimestamp - Date.now()) / 1000));
      const updated = {
        ...activeJourney,
        status: 'paused',
        pausedRemainingSec: remainingBeforePause
      };
      await saveJourney(updated);
      setActiveJourney(updated);
    } else {
      // Resume
      const remainingSec = activeJourney.pausedRemainingSec || (parseInt(activeJourney.checkInInterval, 10) || 15) * 60;
      const updated = {
        ...activeJourney,
        status: 'active',
        nextCheckInTimestamp: Date.now() + remainingSec * 1000
      };
      await saveJourney(updated);
      setActiveJourney(updated);
      syncCheckInTimer(updated);
    }
  };

  const handleCompleteJourney = async () => {
    if (!activeJourney) return;
    const completedRecord = {
      ...activeJourney,
      status: 'completed',
      completedTime: new Date().toISOString()
    };
    await saveJourney(completedRecord);
    setLastCompletedJourney(completedRecord);
    setActiveJourney(null);
    setIsOverdue(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setShowArrivalModal(true);
    loadData();
  };

  const handleCancelJourney = async () => {
    if (!window.confirm('Are you sure you want to cancel this journey?')) return;
    const cancelledRecord = {
      ...activeJourney,
      status: 'cancelled',
      cancelledTime: new Date().toISOString()
    };
    await saveJourney(cancelledRecord);
    setActiveJourney(null);
    setIsOverdue(false);
    if (timerRef.current) clearInterval(timerRef.current);
    loadData();
  };

  // Prepare Missed Check-in Emergency Message
  const getEmergencyMessageText = () => {
    const userName = user?.name || 'A traveler using SHIELD HER';
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let locStr = 'Location permission not enabled';
    if (currentLocation) {
      locStr = `Lat: ${currentLocation.latitude.toFixed(4)}, Lon: ${currentLocation.longitude.toFixed(4)} (±${currentLocation.accuracy}m)`;
    }

    return `SAFETY ALERT from ${userName}:
I missed my scheduled journey check-in.
Origin: ${activeJourney?.origin}
Destination: ${activeJourney?.destination}
Mode: ${activeJourney?.vehicleMode} ${activeJourney?.driverDetails ? `(${activeJourney?.driverDetails})` : ''}
Expected Arrival: ${activeJourney?.expectedArrival}
Alert Time: ${time} (Overdue by ${overdueMinutes} min${overdueMinutes === 1 ? '' : 's'})
Last Location: ${locStr}

Please call me immediately. If I am unreachable, please call 112.`;
  };

  const getArrivalMessageText = () => {
    const userName = user?.name || 'I';
    return `Hi! ${userName} has safely reached the destination (${lastCompletedJourney?.destination || 'home'}). Journey monitoring is now completed.`;
  };

  const handleToggleContactSelection = (id) => {
    if (selectedContactIds.includes(id)) {
      setSelectedContactIds(selectedContactIds.filter(cId => cId !== id));
    } else {
      setSelectedContactIds([...selectedContactIds, id]);
    }
  };

  const handleShareViaWebShare = async (text) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SHIELD HER Journey Update',
          text
        });
      } catch {
        // Fallback to clipboard
        navigator.clipboard.writeText(text);
        alert('Message copied to clipboard! You can paste it into your messaging application.');
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Message copied to clipboard! You can paste it into your messaging application.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Navigation size={28} color="var(--brand-purple-light)" />
          Safe Journey Companion
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Real-time transit check-in monitoring, overdue alerts, and direct contact notifications.
        </p>
      </div>

      {/* Active Journey View */}
      {activeJourney ? (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: `1px solid ${isOverdue ? '#ef4444' : 'var(--brand-purple)'}`,
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem',
          boxShadow: isOverdue ? '0 0 20px rgba(239, 68, 68, 0.25)' : 'var(--shadow-md)'
        }}>
          {/* Header Status */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <span className={`badge ${isOverdue ? 'badge-danger' : activeJourney.status === 'active' ? 'badge-safe' : 'badge-warning'}`}>
                  {isOverdue ? '⚠️ Check-in Overdue' : activeJourney.status === 'active' ? '● Active Transit Monitoring' : '❚❚ Paused'}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Started {new Date(activeJourney.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
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

          {/* MISSED CHECK-IN OVERDUE ALERT WORKFLOW */}
          {isOverdue ? (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '2px solid #ef4444',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fca5a5', marginBottom: '0.5rem' }}>
                <AlertTriangle size={24} color="#ef4444" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fecaca' }}>
                  Scheduled Check-in is Overdue by {overdueMinutes} minute{overdueMinutes === 1 ? '' : 's'}!
                </h3>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#f8fafc', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Your check-in deadline has passed without confirmation. If you are safe, please tap <strong>"I'm Safe — Confirm Check-in"</strong>. If you feel uncomfortable, delayed, or in danger, tap <strong>"Send Emergency Message"</strong> to notify your trusted contacts.
              </p>

              <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowEmergencyModal(true)}
                  className="btn btn-danger btn-lg pulse-emergency"
                  style={{ flex: 1, minWidth: '220px', fontWeight: 800, gap: '0.5rem' }}
                >
                  <Send size={18} /> Send Emergency Message
                </button>
                <button
                  onClick={handleCheckIn}
                  className="btn btn-success btn-lg"
                  style={{ flex: 1, minWidth: '220px', fontWeight: 800, gap: '0.5rem' }}
                >
                  <CheckCircle2 size={20} /> I'm Safe — Confirm Check-in
                </button>
              </div>
            </div>
          ) : (
            /* Normal Countdown State */
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
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Travel Mode</div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {activeJourney.vehicleMode}
                </div>
              </div>
              {activeJourney.driverDetails && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Driver / Cab Info</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                    {activeJourney.driverDetails}
                  </div>
                </div>
              )}
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Next Scheduled Check-in</div>
                <div style={{ fontWeight: 700, color: 'var(--brand-purple-light)', marginTop: '0.2rem', fontSize: '1.1rem' }}>
                  {activeJourney.status === 'paused'
                    ? 'Paused'
                    : `${Math.floor(checkInRemainingSec / 60)}m ${checkInRemainingSec % 60}s`}
                </div>
              </div>
            </div>
          )}

          {/* Primary Journey Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {!isOverdue && (
              <button
                onClick={handleCheckIn}
                className="btn btn-success btn-lg"
                style={{ flex: 2, minWidth: '180px', fontWeight: 700, gap: '0.5rem' }}
              >
                <CheckCircle2 size={20} /> I'm Safe (Confirm Check-in)
              </button>
            )}
            <button
              onClick={handleCompleteJourney}
              className="btn btn-primary btn-lg"
              style={{ flex: 1, minWidth: '160px', fontWeight: 700, gap: '0.5rem' }}
            >
              <UserCheck size={18} /> Reached Destination
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowEmergencyModal(true)}
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.4rem' }}
            >
              <Send size={14} /> Send Status to Contacts
            </button>
            <button
              onClick={handlePauseResume}
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.4rem' }}
            >
              {activeJourney.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
              {activeJourney.status === 'active' ? 'Pause Monitoring' : 'Resume Monitoring'}
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
              <span>Plan & Start a Monitored Journey</span>
            </div>
          </div>

          <form onSubmit={handleStartJourney}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
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
                  <option value="Walking Alone">Walking Alone</option>
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
                placeholder="e.g. White Swift Dzire DL-1Z-9988, Driver: Ramesh"
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

      {/* EMERGENCY MESSAGE MODAL */}
      {showEmergencyModal && (
        <div className="modal-overlay" onClick={() => setShowEmergencyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={22} color="#ef4444" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Send Emergency Journey Alert</h3>
              </div>
              <button onClick={() => setShowEmergencyModal(false)} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Select which contacts to notify. Clicking an action opens your device messaging application with the message pre-filled.
            </p>

            {/* Prepared Message Preview */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1.25rem'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                Prepared Message Preview:
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                {getEmergencyMessageText()}
              </div>
            </div>

            {/* Select Contacts */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Select Emergency Contacts ({contacts.length} saved):
              </div>

              {contacts.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      style={{
                        padding: '0.65rem 0.85rem',
                        backgroundColor: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', flex: 1 }}>
                        <input
                          type="checkbox"
                          checked={selectedContactIds.includes(contact.id)}
                          onChange={() => handleToggleContactSelection(contact.id)}
                          style={{ accentColor: 'var(--brand-purple)', width: '16px', height: '16px' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{contact.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{contact.relationship} • {contact.phone}</div>
                        </div>
                      </label>

                      {/* Direct SMS Action */}
                      <a
                        href={`sms:${contact.phone}?body=${encodeURIComponent(getEmergencyMessageText())}`}
                        className="btn btn-secondary btn-sm"
                        style={{ gap: '0.3rem' }}
                      >
                        <Send size={13} /> Open SMS
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  No contacts found. Please add emergency contacts in the SOS section.
                </div>
              )}
            </div>

            <div style={{
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.775rem',
              color: 'var(--text-secondary)',
              marginBottom: '1.25rem',
              lineHeight: 1.4
            }}>
              ℹ️ <strong>Note:</strong> Clicking "Open SMS" or "Share" transfers this text to your phone's SMS or messaging app. You will need to press <strong>Send</strong> in that application. Delivery depends on cellular network availability.
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <button
                type="button"
                onClick={() => handleShareViaWebShare(getEmergencyMessageText())}
                className="btn btn-outline btn-sm"
                style={{ gap: '0.35rem' }}
              >
                <Share2 size={14} /> Broadcast via Share Sheet
              </button>
              <button
                type="button"
                onClick={() => setShowEmergencyModal(false)}
                className="btn btn-primary btn-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ARRIVAL CONFIRMATION MODAL */}
      {showArrivalModal && (
        <div className="modal-overlay" onClick={() => setShowArrivalModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={24} color="#10b981" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Destination Reached Safely!</h3>
              </div>
              <button onClick={() => setShowArrivalModal(false)} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Your journey has been marked as <strong>COMPLETED</strong>. All check-in reminders have been turned off. Would you like to notify your trusted contacts that you have arrived?
            </p>

            <div style={{
              backgroundColor: 'var(--bg-card)',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
              marginBottom: '1.25rem'
            }}>
              <strong>Prepared message:</strong> "{getArrivalMessageText()}"
            </div>

            {contacts.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Send safe arrival SMS to:
                </div>
                {contacts.slice(0, 3).map((c) => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{c.name} ({c.relationship})</span>
                    <a
                      href={`sms:${c.phone}?body=${encodeURIComponent(getArrivalMessageText())}`}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                    >
                      <Send size={12} /> Send Arrival SMS
                    </a>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => handleShareViaWebShare(getArrivalMessageText())}
                className="btn btn-secondary btn-sm"
              >
                <Share2 size={14} /> Share via Apps
              </button>
              <button
                type="button"
                onClick={() => setShowArrivalModal(false)}
                className="btn btn-primary btn-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

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
