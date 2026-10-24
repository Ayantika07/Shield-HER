import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  PhoneCall,
  MapPin,
  Share2,
  Copy,
  Check,
  UserPlus,
  Trash2,
  Shield,
  Clock,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { useAuth } from '../services/authContext';
import { getEmergencyContacts, saveContact, deleteContact } from '../services/db';
import { getCurrentCoordinates, reverseGeocode, createEmergencyMessage, shareEmergencyAlert } from '../services/deviceService';
import DiscreetModeModal from '../components/layout/DiscreetModeModal';

export default function SOS() {
  const { user } = useAuth();

  const [contacts, setContacts] = useState([]);
  const [coordinates, setCoordinates] = useState(null);
  const [address, setAddress] = useState('');
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState('');
  
  // SOS countdown activation state
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [sosActivated, setSosActivated] = useState(false);

  // Copy / Share feedback
  const [copied, setCopied] = useState(false);
  const [shareStatus, setShareStatus] = useState('');

  // Contact management modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: 'Family', isPrimary: false });

  // Discreet disguise
  const [showDiscreet, setShowDiscreet] = useState(false);

  // Load contacts on mount
  useEffect(() => {
    loadContacts();
    fetchLocation();
  }, []);

  const loadContacts = async () => {
    const list = await getEmergencyContacts();
    setContacts(list);
  };

  const fetchLocation = async () => {
    setLocLoading(true);
    setLocError('');
    try {
      const coords = await getCurrentCoordinates();
      setCoordinates(coords);
      const addr = await reverseGeocode(coords.latitude, coords.longitude);
      if (addr) setAddress(addr);
    } catch (err) {
      setLocError(err.message);
    } finally {
      setLocLoading(false);
    }
  };

  // SOS Countdown handling
  useEffect(() => {
    let timer;
    if (isCountingDown && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (isCountingDown && countdown === 0) {
      setIsCountingDown(false);
      setSosActivated(true);
      // Auto-trigger share options
      handleShare();
    }
    return () => clearTimeout(timer);
  }, [isCountingDown, countdown]);

  const handleStartCountdown = () => {
    setCountdown(5);
    setIsCountingDown(true);
    setSosActivated(false);
  };

  const handleCancelCountdown = () => {
    setIsCountingDown(false);
    setCountdown(5);
  };

  const handleCopyAlert = () => {
    const message = createEmergencyMessage({
      userName: user?.name,
      coordinates,
      address
    });
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShare = async () => {
    setShareStatus('Opening device sharing...');
    const res = await shareEmergencyAlert({
      userName: user?.name,
      coordinates,
      address
    });
    if (res.success) {
      setShareStatus(res.method === 'web-share' ? 'Emergency alert shared via device apps.' : 'Emergency message copied to clipboard!');
    } else if (res.aborted) {
      setShareStatus('Sharing was closed.');
    } else {
      setShareStatus('Please copy coordinates manually below.');
    }
    setTimeout(() => setShareStatus(''), 4000);
  };

  const handleAddContactSubmit = async (e) => {
    e.preventDefault();
    if (!newContact.name || !newContact.phone) return;
    await saveContact(newContact);
    setNewContact({ name: '', phone: '', relationship: 'Family', isPrimary: false });
    setShowAddModal(false);
    loadContacts();
  };

  const handleDeleteContact = async (id) => {
    if (window.confirm('Remove this emergency contact?')) {
      await deleteContact(id);
      loadContacts();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Title & Quick Disguise */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertTriangle size={28} color="#ef4444" />
            Discreet SOS & Emergency Assistance
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Instant emergency dialing, live GPS broadcasting, and trusted contact activation.
          </p>
        </div>

        <button
          onClick={() => setShowDiscreet(true)}
          className="btn btn-secondary"
          style={{ gap: '0.4rem' }}
        >
          <EyeOff size={16} /> Privacy Disguise (Notes)
        </button>
      </div>

      {/* Main SOS Trigger Hub */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '2px solid rgba(239, 68, 68, 0.4)',
        borderRadius: 'var(--radius-xl)',
        padding: '2rem 1.5rem',
        textAlign: 'center',
        boxShadow: 'var(--shadow-glow-red)'
      }}>
        {isCountingDown ? (
          /* Active Countdown View with Instant Cancel */
          <div style={{ padding: '1rem 0' }}>
            <div style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              border: '4px solid #ef4444',
              color: '#ef4444',
              fontSize: '2.5rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              animation: 'scaleIn 500ms ease infinite alternate'
            }}>
              {countdown}
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
              Broadcasting SOS Alert in {countdown} seconds...
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
              Accidental touch? Click cancel below immediately to abort. Otherwise, sharing will activate automatically.
            </p>
            <button
              onClick={handleCancelCountdown}
              className="btn btn-secondary btn-lg"
              style={{ backgroundColor: 'var(--bg-elevated)', minWidth: '180px', fontWeight: 700 }}
            >
              Cancel SOS Alert
            </button>
          </div>
        ) : sosActivated ? (
          /* Activated Alert Confirmation & Broadcast Actions */
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              fontWeight: 700,
              fontSize: '0.9rem',
              marginBottom: '1rem',
              border: '1px solid #ef4444'
            }}>
              <AlertTriangle size={18} /> SOS Protocol Activated
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Call 112 & Share Coordinates with Contacts
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 1.25rem auto' }}>
              Click below to initiate an immediate voice call to official emergency authorities, or share your GPS pin via messaging apps.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              <a
                href="tel:112"
                className="btn btn-danger btn-lg pulse-emergency"
                style={{ padding: '0.85rem 1.8rem', fontSize: '1.1rem', fontWeight: 800, gap: '0.65rem' }}
              >
                <PhoneCall size={22} /> DIAL 112 NOW
              </a>
              <button
                onClick={handleShare}
                className="btn btn-primary btn-lg"
                style={{ padding: '0.85rem 1.8rem', fontSize: '1.05rem', fontWeight: 700, gap: '0.65rem' }}
              >
                <Share2 size={20} /> Broadcast Live Location
              </button>
            </div>

            <button
              onClick={() => setSosActivated(false)}
              className="btn btn-outline btn-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              Dismiss / Reset SOS Screen
            </button>
          </div>
        ) : (
          /* Default SOS Ready State */
          <div>
            <button
              onClick={handleStartCountdown}
              className="pulse-emergency"
              style={{
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                boxShadow: '0 8px 30px rgba(220, 38, 38, 0.5)',
                margin: '0.5rem 0 1.25rem 0',
                transition: 'transform 150ms ease'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.96)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <AlertTriangle size={38} strokeWidth={2.5} />
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.04em' }}>SOS</span>
              <span style={{ fontSize: '0.7rem', opacity: 0.9 }}>TAP TO ACTIVATE</span>
            </button>

            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Emergency Quick Activation (5-Second Safety Buffer)
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0.35rem auto 1rem auto' }}>
              Tapping SOS initiates a 5-second countdown to prevent accidental triggers before opening direct emergency channels.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <a
                href="tel:112"
                className="btn btn-danger btn-sm"
                style={{ fontWeight: 700, gap: '0.4rem' }}
              >
                <PhoneCall size={14} /> Direct 112 Call
              </a>
              <a
                href="tel:1091"
                className="btn btn-secondary btn-sm"
                style={{ fontWeight: 600, gap: '0.4rem' }}
              >
                <PhoneCall size={14} /> Women Helpline 1091
              </a>
            </div>
          </div>
        )}

        {shareStatus && (
          <div style={{
            marginTop: '1rem',
            padding: '0.5rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            color: 'var(--brand-lavender)',
            fontSize: '0.8rem',
            fontWeight: 600
          }}>
            {shareStatus}
          </div>
        )}
      </div>

      {/* Live GPS Coordinates Card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <MapPin size={20} color="var(--brand-purple-light)" />
            <span>Live Coordinates & Broadcast Payload</span>
          </div>
          <button
            onClick={fetchLocation}
            className="btn btn-outline btn-sm"
            disabled={locLoading}
          >
            {locLoading ? 'Updating GPS...' : 'Refresh GPS'}
          </button>
        </div>

        {coordinates ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.75rem'
            }}>
              <div style={{ backgroundColor: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Latitude</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{coordinates.latitude.toFixed(6)}</div>
              </div>
              <div style={{ backgroundColor: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Longitude</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{coordinates.longitude.toFixed(6)}</div>
              </div>
              <div style={{ backgroundColor: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Accuracy</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--status-safe)' }}>±{coordinates.accuracy} meters</div>
              </div>
            </div>

            {address && (
              <div style={{
                backgroundColor: 'var(--bg-surface)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.85rem'
              }}>
                <strong style={{ color: 'var(--text-primary)' }}>Detected Location:</strong>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>{address}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
              <button onClick={handleCopyAlert} className="btn btn-secondary btn-sm" style={{ gap: '0.4rem' }}>
                {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                {copied ? 'Emergency Alert Copied!' : 'Copy Formatted Emergency Text'}
              </button>
              <button onClick={handleShare} className="btn btn-primary btn-sm" style={{ gap: '0.4rem' }}>
                <Share2 size={14} /> Send Location via WhatsApp / SMS
              </button>
            </div>
          </div>
        ) : locError ? (
          <div style={{
            backgroundColor: 'var(--status-warning-bg)',
            border: '1px solid var(--status-warning)',
            padding: '0.85rem',
            borderRadius: 'var(--radius-md)',
            color: '#fef3c7',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={18} color="#f59e0b" />
            <span>{locError}</span>
          </div>
        ) : (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Retrieving satellite location... Please ensure GPS is enabled on your device.
          </p>
        )}
      </div>

      {/* Emergency Contacts Management */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <PhoneCall size={20} color="var(--brand-purple-light)" />
            <span>Trusted Emergency Contacts ({contacts.length})</span>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary btn-sm"
            style={{ gap: '0.35rem' }}
          >
            <UserPlus size={14} /> Add Contact
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          These contacts are stored locally on your device in IndexedDB and remain accessible 100% offline.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {contacts.map((contact) => (
            <div
              key={contact.id}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    {contact.name}
                  </span>
                  <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                    {contact.relationship}
                  </span>
                  {contact.isPrimary && (
                    <span className="badge badge-safe" style={{ fontSize: '0.65rem' }}>Primary</span>
                  )}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  {contact.phone}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <a
                  href={`tel:${contact.phone}`}
                  className="btn btn-success btn-sm"
                  style={{ gap: '0.3rem' }}
                >
                  <PhoneCall size={13} /> Call
                </a>
                <a
                  href={`sms:${contact.phone}?body=${encodeURIComponent(createEmergencyMessage({ userName: user?.name, coordinates, address }))}`}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '0.3rem' }}
                >
                  <Share2 size={13} /> SMS
                </a>
                <button
                  onClick={() => handleDeleteContact(contact.id)}
                  className="btn btn-outline btn-sm"
                  title="Remove contact"
                  style={{ color: 'var(--status-danger)' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Notice & Limitations Disclaimer */}
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
          <strong>Safety & Operational Notice:</strong> Web browsers cannot directly transmit closed-loop police dispatches without telecommunications operator routing. The "DIAL 112" button connects directly to your phone's cellular dialer. Always verify your cellular signal strength and share location directly with trusted contacts.
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Add Trusted Emergency Contact</h3>
            </div>
            <form onSubmit={handleAddContactSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Maya Sharma"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="e.g. +91 98765 43210"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Relationship</label>
                <select
                  className="form-select"
                  value={newContact.relationship}
                  onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                >
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Sister">Sister</option>
                  <option value="Brother">Brother</option>
                  <option value="Partner / Spouse">Partner / Spouse</option>
                  <option value="Friend / Flatmate">Friend / Flatmate</option>
                  <option value="Colleague">Colleague</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1rem 0' }}>
                <input
                  type="checkbox"
                  id="primaryContact"
                  checked={newContact.isPrimary}
                  onChange={(e) => setNewContact({ ...newContact, isPrimary: e.target.checked })}
                  style={{ accentColor: 'var(--brand-purple)' }}
                />
                <label htmlFor="primaryContact" style={{ fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  Mark as Primary Emergency Contact
                </label>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Discreet Mode Overlay */}
      <DiscreetModeModal isOpen={showDiscreet} onClose={() => setShowDiscreet(false)} />
    </div>
  );
}
