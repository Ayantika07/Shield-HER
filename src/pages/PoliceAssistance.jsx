import React, { useState, useEffect } from 'react';
import {
  Building2,
  PhoneCall,
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
  Plus,
  ShieldCheck,
  ChevronRight,
  Shield
} from 'lucide-react';
import { getCachedResources, getPoliceReferences, savePoliceReference } from '../services/db';

const CITY_POLICE_DATA = {
  delhi: {
    name: 'Delhi NCR',
    emergencyHelpline: '112',
    womenHelpline: '1091',
    controlRoomPhone: '011-23490010',
    officialWebsite: 'https://delhipolice.gov.in',
    cyberReportingUrl: 'https://cybercrime.gov.in',
    patrolServices: [
      {
        name: 'Delhi Police PCR Night Drop Initiative',
        area: 'All 15 Police Districts across Delhi NCT',
        officialSource: 'Delhi Police Public Safety Order',
        verifiedContact: '112',
        operatingHours: '10:00 PM to 6:00 AM',
        eligibility: 'Women stranded late at night without safe public or private transit.',
        procedure: 'Dial 112. State your location and request night assistance. The PCR dispatcher coordinates the nearest patrol vehicle to escort or safely drop you to your destination or nearest safe facility.'
      }
    ]
  },
  bengaluru: {
    name: 'Bengaluru (Karnataka)',
    emergencyHelpline: '112',
    womenHelpline: '1091',
    controlRoomPhone: '080-22942222',
    officialWebsite: 'https://bengalurucitypolice.gov.in',
    cyberReportingUrl: 'https://cybercrime.gov.in',
    patrolServices: [
      {
        name: 'Pink Hoysala Women Safety Patrols',
        area: 'Bengaluru City Commissionerate (Commercial hubs, IT parks, colleges)',
        officialSource: 'Bengaluru City Police Women Safety Division',
        verifiedContact: '112',
        operatingHours: '24x7 Dedicated Patrol Units',
        eligibility: 'Women facing street harassment, stalking, or stranded during late transit.',
        procedure: 'Dial 112. Dedicated all-women Pink Hoysala vehicles stationed across Bengaluru are prioritized for female distress calls.'
      }
    ]
  },
  mumbai: {
    name: 'Mumbai (Maharashtra)',
    emergencyHelpline: '112',
    womenHelpline: '103',
    controlRoomPhone: '022-22620111',
    officialWebsite: 'https://mumbaipolice.gov.in',
    cyberReportingUrl: 'https://cybercrime.gov.in',
    patrolServices: [
      {
        name: 'Nirbhaya Squad & Mobile Patrols',
        area: 'Greater Mumbai Police Commissionerate',
        officialSource: 'Mumbai Police Nirbhaya Initiative',
        verifiedContact: '103 / 112',
        operatingHours: '24x7 Continuous Patrols',
        eligibility: 'Women, students, and citizens facing harassment or threats in public transit corridors.',
        procedure: 'Dial helpline 103 (Mumbai Women Helpline) or 112. Mobile Nirbhaya vans patrol railway stations, bus terminuses, and isolated routes.'
      }
    ]
  },
  kolkata: {
    name: 'Kolkata (West Bengal)',
    emergencyHelpline: '112',
    womenHelpline: '1091',
    controlRoomPhone: '033-22143230',
    officialWebsite: 'https://kolkatapolice.gov.in',
    cyberReportingUrl: 'https://cybercrime.gov.in',
    patrolServices: [
      {
        name: 'The Winners - All-Women Motorcycle Patrol',
        area: 'Kolkata Police jurisdiction',
        officialSource: 'Kolkata Police Special Safety Division',
        verifiedContact: '112',
        operatingHours: 'Evening transit hours & late night',
        eligibility: 'Targeted anti-harassment interventions near colleges, metro stations, and crowded shopping hubs.',
        procedure: 'Call 112 or local police station. All-women scooter patrol units are dispatched for rapid tactical response.'
      }
    ]
  },
  hyderabad: {
    name: 'Hyderabad (Telangana)',
    emergencyHelpline: '112',
    womenHelpline: '1091',
    controlRoomPhone: '040-27852435',
    officialWebsite: 'https://hyderabadpolice.gov.in',
    cyberReportingUrl: 'https://cybercrime.gov.in',
    patrolServices: [
      {
        name: 'SHE Teams Safety Network',
        area: 'Hyderabad, Cyberabad, and Rachakonda Commissionerates',
        officialSource: 'Telangana Police SHE Teams Directorate',
        verifiedContact: '112',
        operatingHours: '24x7 Citizen Assistance',
        eligibility: 'Women facing eve-teasing, physical stalking, social media harassment, or distress.',
        procedure: 'Call 112 or official SHE Teams WhatsApp line (+91 94906 16555). Covert and uniformed teams operate across bus stops and metro stations.'
      }
    ]
  },
  other: {
    name: 'All-India / Other Cities',
    emergencyHelpline: '112',
    womenHelpline: '1091',
    controlRoomPhone: '112',
    officialWebsite: 'https://112.gov.in',
    cyberReportingUrl: 'https://cybercrime.gov.in',
    patrolServices: [
      {
        name: 'National Emergency Response Support System (ERSS)',
        area: 'Pan-India coverage across all States & UTs',
        officialSource: 'Ministry of Home Affairs (MHA), Govt. of India',
        verifiedContact: '112',
        operatingHours: '24x7 Nationwide Service',
        eligibility: 'All citizens in need of immediate emergency police, medical, or fire dispatch.',
        procedure: 'Dial 112 from any mobile or landline phone without a SIM card or active recharge balance.'
      }
    ]
  }
};

export default function PoliceAssistance() {
  const [selectedCityKey, setSelectedCityKey] = useState('delhi');
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

  const currentCityData = CITY_POLICE_DATA[selectedCityKey] || CITY_POLICE_DATA.other;

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
          Police Assistance & Women's Safety Services
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Official helplines, verified municipal patrol initiatives, local women's help desks, and formal case reference tracking.
        </p>
      </div>

      {/* Critical Legal Disclaimer */}
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
          <strong>Independence Disclosure:</strong> SHIELD HER is an independent civic safety application and is not an official police agency. Pressing buttons here does not automatically dispatch a vehicle. In immediate physical danger, dial <strong>112</strong> immediately via cellular network.
        </div>
      </div>

      {/* City / Area Selector */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        padding: '1.25rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Select Your City / Jurisdiction
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Showing Services for: {currentCityData.name}
            </div>
          </div>

          <select
            value={selectedCityKey}
            onChange={(e) => setSelectedCityKey(e.target.value)}
            className="form-select"
            style={{ width: 'auto', minWidth: '220px', fontWeight: 600 }}
          >
            <option value="delhi">Delhi NCR</option>
            <option value="bengaluru">Bengaluru (Karnataka)</option>
            <option value="mumbai">Mumbai (Maharashtra)</option>
            <option value="kolkata">Kolkata (West Bengal)</option>
            <option value="hyderabad">Hyderabad (Telangana)</option>
            <option value="other">All-India / Other Cities</option>
          </select>
        </div>

        {/* Quick Official Action Bar for selected city */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.75rem',
          marginTop: '0.5rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Emergency (Police)</div>
              <div style={{ fontWeight: 800, color: '#ef4444', fontSize: '1.1rem' }}>{currentCityData.emergencyHelpline}</div>
            </div>
            <a href={`tel:${currentCityData.emergencyHelpline}`} className="btn btn-danger btn-sm">
              <PhoneCall size={13} /> Call
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Women's Helpline</div>
              <div style={{ fontWeight: 800, color: 'var(--brand-purple-light)', fontSize: '1.1rem' }}>{currentCityData.womenHelpline}</div>
            </div>
            <a href={`tel:${currentCityData.womenHelpline}`} className="btn btn-secondary btn-sm">
              <PhoneCall size={13} /> Call
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Official Police Web Portal</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>Verified Source</div>
            </div>
            <a href={currentCityData.officialWebsite} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
              <ExternalLink size={13} /> Portal
            </a>
          </div>
        </div>
      </div>

      {/* Verified City Patrol & Escort Policies */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Car size={20} color="var(--brand-lavender)" />
            <span>Official Women's Night Transit & Patrol Initiatives ({currentCityData.name})</span>
          </div>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
          Verified municipal police patrol services operating in <strong>{currentCityData.name}</strong>. Availability is subject to official police vehicle deployment.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {currentCityData.patrolServices.map((service, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: 'var(--bg-surface)',
                padding: '1.15rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {service.name}
                </h3>
                <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                  {service.operatingHours}
                </span>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <div><strong>Operational Area:</strong> {service.area}</div>
                <div><strong>Eligibility:</strong> {service.eligibility}</div>
                <div style={{ marginTop: '0.25rem' }}><strong>Procedure:</strong> {service.procedure}</div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
                paddingTop: '0.65rem',
                borderTop: '1px solid var(--border-subtle)',
                marginTop: '0.25rem'
              }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Source: {service.officialSource}
                </span>
                <a
                  href={`tel:${service.verifiedContact}`}
                  className="btn btn-primary btn-sm"
                  style={{ gap: '0.35rem' }}
                >
                  <PhoneCall size={13} /> Contact Official Route ({service.verifiedContact})
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Official Government Reporting Portals */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <ExternalLink size={20} color="var(--brand-purple-light)" />
            <span>Official Government Reporting Portals & Helplines</span>
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
                Official portal for reporting online harassment, non-consensual imagery, and digital extortion. Helpline: 1930.
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
                Online complaint registration and 24x7 Women Helpline (7827170170).
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
                Pan-India single emergency response support system portal.
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

      {/* Directory of Verified Police Stations & Women Desks */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Building2 size={20} color="var(--brand-purple-light)" />
            <span>Verified Police Stations & Women Help Desks</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              className="form-input"
              placeholder="Filter stations..."
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
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Source: {st.source || 'Delhi Police Directory'} ({st.verifiedDate || 'Verified'})
                  </div>
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
                  {st.phone ? (
                    <a href={`tel:${st.phone}`} className="btn btn-success btn-sm" style={{ gap: '0.3rem' }}>
                      <PhoneCall size={13} /> {st.phone}
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Local contact not verified (Use 112)</span>
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
                <label className="form-label">Follow-up Notes / Case Status</label>
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
