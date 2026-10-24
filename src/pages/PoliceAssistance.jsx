import React, { useState, useEffect } from 'react';
import {
  Building2,
  PhoneCall,
  ShieldAlert,
  Search,
  ExternalLink,
  MapPin,
  Clock,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  Info,
  Car,
  FileText,
  Plus
} from 'lucide-react';
import { getCachedResources, getPoliceReferences, savePoliceReference } from '../services/db';

export default function PoliceAssistance() {
  const [stations, setStations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [savedStationIds, setSavedStationIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('shield_her_saved_stations') || '[]');
    } catch {
      return [];
    }
  });

  // Police Official Reference Tracker State
  const [references, setReferences] = useState([]);
  const [showRefModal, setShowRefModal] = useState(false);
  const [refForm, setRefForm] = useState({
    referenceNumber: '',
    stationName: '',
    officerName: '',
    contactPhone: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadStations();
    loadReferences();
  }, []);

  const loadStations = async () => {
    const list = await getCachedResources('police');
    setStations(list);
  };

  const loadReferences = async () => {
    const list = await getPoliceReferences();
    setReferences(list);
  };

  const handleToggleSaveStation = (id) => {
    let next;
    if (savedStationIds.includes(id)) {
      next = savedStationIds.filter(s => s !== id);
    } else {
      next = [...savedStationIds, id];
    }
    setSavedStationIds(next);
    localStorage.setItem('shield_her_saved_stations', JSON.stringify(next));
  };

  const handleSaveReference = async (e) => {
    e.preventDefault();
    if (!refForm.referenceNumber) return;
    await savePoliceReference(refForm);
    setRefForm({
      referenceNumber: '',
      stationName: '',
      officerName: '',
      contactPhone: '',
      notes: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowRefModal(false);
    loadReferences();
  };

  const filteredStations = stations.filter((st) =>
    st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    st.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Building2 size={28} color="var(--brand-purple-light)" />
          Women's Police Assistance & Official Escort Support
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Direct access to verified 24x7 Women Help Desks, official night patrol services, and formal complaint reference tracking.
        </p>
      </div>

      {/* Critical Legal & Operational Disclaimer */}
      <div style={{
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem'
      }}>
        <AlertTriangle size={20} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.85rem', color: '#f8fafc', lineHeight: 1.5 }}>
          <strong>Legal Independence Notice:</strong> SHIELD HER is an independent civic safety application and is not an official law enforcement dispatch service. In immediate physical danger, dial <strong>112</strong> immediately. Safe escort availability is subject to official police jurisdiction and patrol vehicle deployment.
        </div>
      </div>

      {/* Priority Helpline Banner */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem'
      }}>
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            All-India Emergency
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444', margin: '0.25rem 0' }}>
            112
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.875rem' }}>
            Unified police, fire, and ambulance emergency response.
          </p>
          <a href="tel:112" className="btn btn-danger btn-sm" style={{ width: '100%', gap: '0.4rem' }}>
            <PhoneCall size={14} /> Call 112 Direct
          </a>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-surface)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Women in Distress Helpline
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-purple-light)', margin: '0.25rem 0' }}>
            1091
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.875rem' }}>
            Specialized state women safety helpline (verify regional service).
          </p>
          <a href="tel:1091" className="btn btn-secondary btn-sm" style={{ width: '100%', gap: '0.4rem' }}>
            <PhoneCall size={14} /> Call 1091
          </a>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-surface)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            National Cyber Crime Helpline
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--status-warning)', margin: '0.25rem 0' }}>
            1930
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.875rem' }}>
            Immediate reporting for online harassment and financial fraud.
          </p>
          <a href="tel:1930" className="btn btn-secondary btn-sm" style={{ width: '100%', gap: '0.4rem' }}>
            <PhoneCall size={14} /> Call 1930
          </a>
        </div>
      </div>

      {/* Official Night Patrol & Safe Escort Protocols */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Car size={20} color="var(--brand-lavender)" />
            <span>Official Police Night Escort & Safe Transit Policies</span>
          </div>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.6 }}>
          Several metropolitan police commissionerates in India provide dedicated safe escort and patrol services for stranded women between 10:00 PM and 6:00 AM:
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              🚓 Delhi Police PCR Night Drop Initiative
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Women stranded late at night without safe transport can dial 112. The nearest PCR vehicle will be dispatched to escort or safely drop the woman to her residence or nearest police post.
            </p>
          </div>

          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              🚨 Bengaluru Police: Pink Hoysala Patrols
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Dedicated all-women police response vehicles (Pink Hoysalas) stationed across commercial hubs, IT corridors, and colleges to respond exclusively to distress calls from women.
            </p>
          </div>

          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              🛡️ Mumbai Police: Nirbhaya Squads
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Trained undercover and uniformed teams equipped with mobile vans, conducting continuous night patrols around railway stations, bus stands, and secluded streets.
            </p>
          </div>
        </div>
      </div>

      {/* Official Government Reporting Portals */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <ExternalLink size={20} color="var(--brand-purple-light)" />
            <span>Official Government Portals & Grievance Lodging</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1rem',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              textDecoration: 'none'
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                National Cyber Crime Reporting Portal (cybercrime.gov.in)
              </div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                Official Ministry of Home Affairs portal for reporting cyber harassment, obscene content, and extortion.
              </div>
            </div>
            <ExternalLink size={16} color="var(--brand-purple-light)" />
          </a>

          <a
            href="https://ncw.nic.in"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1rem',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              textDecoration: 'none'
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                National Commission for Women (ncw.nic.in)
              </div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                Online complaint registration for domestic violence, dowry harassment, and workplace harassment.
              </div>
            </div>
            <ExternalLink size={16} color="var(--brand-purple-light)" />
          </a>

          <a
            href="https://112.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1rem',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              textDecoration: 'none'
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                Emergency Response Support System (ERSS 112 India)
              </div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                Pan-India single emergency number portal for real-time dispatch monitoring.
              </div>
            </div>
            <ExternalLink size={16} color="var(--brand-purple-light)" />
          </a>
        </div>
      </div>

      {/* Official Complaint / Reference Number Tracker */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <FileText size={20} color="var(--status-safe)" />
            <span>Official Police Complaint Reference Tracker ({references.length})</span>
          </div>
          <button
            onClick={() => setShowRefModal(true)}
            className="btn btn-primary btn-sm"
            style={{ gap: '0.35rem' }}
          >
            <Plus size={14} /> Log Official Reference
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Record FIR numbers, 112 CAD incident numbers, and investigating officer details for official case follow-up. Stored securely on your device.
        </p>

        {references.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {references.map((ref) => (
              <div
                key={ref.id}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--brand-lavender)' }}>
                      Ref #{ref.referenceNumber}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      • Logged on {ref.date}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Station: {ref.stationName || 'Local Police Station'} {ref.officerName ? `• Officer: ${ref.officerName}` : ''}
                  </div>
                  {ref.notes && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Notes: {ref.notes}
                    </div>
                  )}
                </div>

                {ref.contactPhone && (
                  <a href={`tel:${ref.contactPhone}`} className="btn btn-outline btn-sm">
                    <PhoneCall size={13} /> {ref.contactPhone}
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-subtle)' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              No official complaint reference numbers logged yet. When you receive a 112 SMS reference or FIR copy, click "Log Official Reference" to store it.
            </p>
          </div>
        )}
      </div>

      {/* Directory of Verified Women Help Desks */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Building2 size={20} color="var(--brand-purple-light)" />
            <span>Verified Nearby Police Stations & Women Desks</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              className="form-input"
              placeholder="Search station..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '180px', margin: 0, padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredStations.map((st) => {
            const isSaved = savedStationIds.includes(st.id);
            return (
              <div
                key={st.id}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span className="badge badge-purple">Official Station</span>
                    {st.isWomenDesk && (
                      <span className="badge badge-safe">24x7 Women Help Desk</span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {st.name}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    {st.address}
                  </div>
                  {st.notes && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--brand-lavender)', marginTop: '0.3rem' }}>
                      🛡️ {st.notes}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    onClick={() => handleToggleSaveStation(st.id)}
                    className="btn btn-outline btn-sm"
                    title={isSaved ? 'Remove bookmark' : 'Bookmark station'}
                    style={{ color: isSaved ? 'var(--brand-purple-light)' : 'var(--text-secondary)' }}
                  >
                    <Bookmark size={14} fill={isSaved ? 'currentColor' : 'none'} />
                  </button>
                  {st.phone && (
                    <a href={`tel:${st.phone}`} className="btn btn-success btn-sm" style={{ gap: '0.3rem' }}>
                      <PhoneCall size={13} /> {st.phone}
                    </a>
                  )}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${st.lat},${st.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm"
                  >
                    Directions
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Log Police Reference */}
      {showRefModal && (
        <div className="modal-overlay" onClick={() => setShowRefModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Log Official Complaint Reference</h3>
            </div>
            <form onSubmit={handleSaveReference}>
              <div className="form-group">
                <label className="form-label">Reference / FIR / CAD Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 112-CAD-2026-9921 OR FIR #45/2026"
                  value={refForm.referenceNumber}
                  onChange={(e) => setRefForm({ ...refForm, referenceNumber: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Police Station Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Connaught Place Women Police Station"
                  value={refForm.stationName}
                  onChange={(e) => setRefForm({ ...refForm, stationName: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Investigating Officer Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. SI Sunita Rao"
                    value={refForm.officerName}
                    onChange={(e) => setRefForm({ ...refForm, officerName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Station / Officer Contact</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="e.g. 011-23747100"
                    value={refForm.contactPhone}
                    onChange={(e) => setRefForm({ ...refForm, contactPhone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Date Reported</label>
                <input
                  type="date"
                  className="form-input"
                  value={refForm.date}
                  onChange={(e) => setRefForm({ ...refForm, date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Follow-up Notes / Status</label>
                <textarea
                  rows={3}
                  className="form-textarea"
                  placeholder="e.g. Officer visited premises; promised CCTV review by Monday."
                  value={refForm.notes}
                  onChange={(e) => setRefForm({ ...refForm, notes: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowRefModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Reference
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
