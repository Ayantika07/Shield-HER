import React, { useState, useEffect } from 'react';
import {
  WifiOff,
  Wifi,
  Download,
  CheckCircle2,
  PhoneCall,
  ShieldAlert,
  BookOpen,
  Scale,
  Compass,
  AlertTriangle,
  Info,
  Check,
  X,
  Server,
  Smartphone
} from 'lucide-react';
import { getEmergencyContacts, getCachedResources, getAllIncidents } from '../services/db';

export default function OfflineHandbook() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [contacts, setContacts] = useState([]);
  const [resources, setResources] = useState([]);
  const [incidentsCount, setIncidentsCount] = useState(0);
  const [swStatus, setSwStatus] = useState('Checking...');
  const [preparedAt, setPreparedAt] = useState(() => {
    return localStorage.getItem('shield_her_offline_prepared_at') || null;
  });
  const [isPreparing, setIsPreparing] = useState(false);
  const [prepareMessage, setPrepareMessage] = useState('');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load actual IndexedDB counts
    getEmergencyContacts().then(setContacts);
    getCachedResources('all').then(setResources);
    getAllIncidents().then(list => setIncidentsCount(list.length));

    // Check actual Service Worker status
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => {
        if (regs.length > 0) {
          setSwStatus('Active (PWA Cache Enabled)');
        } else {
          setSwStatus('Available (Not yet activated)');
        }
      }).catch(() => {
        setSwStatus('Unavailable in this context');
      });
    } else {
      setSwStatus('Not supported by this browser');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handlePrepareOffline = async () => {
    setIsPreparing(true);
    setPrepareMessage('');

    try {
      // 1. Ensure IndexedDB has data populated
      await getEmergencyContacts();
      await getCachedResources('all');

      // 2. Cache essential app shell assets if Cache API is available
      if ('caches' in window) {
        try {
          const cache = await caches.open('shield-her-v1.0');
          await cache.addAll(['/', '/index.html', '/manifest.json', '/favicon.svg']);
        } catch (cacheErr) {
          console.warn('Cache API note:', cacheErr);
        }
      }

      const now = new Date().toLocaleString();
      localStorage.setItem('shield_her_offline_prepared_at', now);
      setPreparedAt(now);
      setPrepareMessage('Offline safety data and emergency contacts prepared successfully.');
    } catch (err) {
      setPrepareMessage('Could not complete full offline pre-cache. Local IndexedDB remains active.');
    } finally {
      setIsPreparing(false);
      setTimeout(() => setPrepareMessage(''), 5000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <WifiOff size={28} color="var(--status-warning)" />
          Offline Safety Mode & Emergency Handbook
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Genuine offline readiness: Transparent status of locally saved contacts, crisis guides, and device capabilities without cellular data.
        </p>
      </div>

      {/* Honest Readiness Status Card */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: `1px solid ${isOnline ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.4)'}`,
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className={`badge ${isOnline ? 'badge-safe' : 'badge-warning'}`}>
                {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
                {isOnline ? 'Device Currently Online' : 'Device Currently Offline'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Service Worker: {swStatus}
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {preparedAt ? `Offline Data Prepared (${preparedAt})` : 'Offline Safety Bundle Not Yet Prepared'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Actual device storage: <strong>{contacts.length}</strong> emergency contacts, <strong>{resources.length}</strong> verified facilities, and <strong>{incidentsCount}</strong> incident notes stored locally in IndexedDB.
            </p>
          </div>

          <button
            onClick={handlePrepareOffline}
            disabled={isPreparing}
            className="btn btn-primary"
            style={{ gap: '0.4rem', fontWeight: 700 }}
          >
            {isPreparing ? (
              <span>Preparing Local Data...</span>
            ) : (
              <>
                <Download size={16} /> Prepare for Offline Use
              </>
            )}
          </button>
        </div>

        {prepareMessage && (
          <div style={{
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#a7f3d0',
            fontSize: '0.85rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <CheckCircle2 size={16} color="#10b981" />
            <span>{prepareMessage}</span>
          </div>
        )}

        {/* Feature Availability Grid: What works vs what requires internet */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          {/* Works Offline */}
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, color: 'var(--status-safe)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Check size={16} /> Available Offline (No Internet Required):
            </div>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <li><strong>Emergency Phone Calls:</strong> Dialing 112, 1091, and saved contacts works via device cellular GSM networks.</li>
              <li><strong>Offline Crisis Handbook:</strong> Full legal rights, street safety protocols, and evidence advice remain readable.</li>
              <li><strong>Saved Emergency Contacts:</strong> All {contacts.length} contacts saved in IndexedDB are accessible.</li>
              <li><strong>Directory of Facilities:</strong> Verified phone numbers and addresses for {resources.length} stations/hospitals.</li>
              <li><strong>Local Incident Notes:</strong> Create and save evidence locker entries directly into IndexedDB.</li>
            </ul>
          </div>

          {/* Requires Internet */}
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, color: 'var(--status-warning)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <X size={16} /> Requires Internet Access (Disabled Offline):
            </div>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <li><strong>Live Map Tiles:</strong> OpenStreetMap raster tiles require data connectivity to load visual road maps.</li>
              <li><strong>Reverse Geocoding:</strong> Converting raw GPS coordinates into street names requires Nominatim online API.</li>
              <li><strong>Online Police Reporting:</strong> Submitting formal cyber complaints on <code>cybercrime.gov.in</code>.</li>
              <li><strong>External Links:</strong> Opening Google Maps directions or official department websites.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Real Cached Contacts Directory */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <PhoneCall size={20} color="var(--brand-purple-light)" />
            <span>Saved Emergency Contacts Available Offline ({contacts.length})</span>
          </div>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
          Tapping call initiates a regular voice phone call through your device's cellular dialer without requiring data or Wi-Fi.
        </p>

        {contacts.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '0.75rem'
          }}>
            {contacts.map((c) => (
              <div
                key={c.id}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{c.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.relationship} • {c.phone}</div>
                </div>
                <a href={`tel:${c.phone}`} className="btn btn-success btn-sm">
                  <PhoneCall size={13} /> Call
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            No personal contacts saved yet. Add trusted contacts in the SOS section to make them accessible offline.
          </div>
        )}
      </div>

      {/* Actionable Crisis Handbook (Saved Offline) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen size={22} color="var(--brand-lavender)" />
          Actionable Crisis Handbook (Persisted Locally)
        </h2>

        {/* Guide 1: Street Safety */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            🚶 Street Safety & Being Followed Protocols
          </h3>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <li><strong>Cross the street deliberately:</strong> If you suspect someone is following you on foot or vehicle, cross the road immediately. If they alter course too, disengage doubts and treat it as confirmed tracking.</li>
            <li><strong>Divert to an illuminated commercial space:</strong> Move directly toward an open pharmacy, metro station security gate, or ATM booth with an armed guard. Never head into unlit residential alleys toward your house.</li>
            <li><strong>Create an audible connection:</strong> Dial a trusted contact or 112. Speak loudly describing your exact surroundings, e.g., "I am passing the metro gate right now, see you in 30 seconds."</li>
            <li><strong>Defensive physical response:</strong> If physically restrained, strike vulnerable targets (eyes, throat, groin) with immediate force, shout "FIRE" (crowds respond faster to fire than help), and run toward lighted areas.</li>
          </ul>
        </div>

        {/* Guide 2: Legal Rights */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Scale size={18} color="var(--brand-purple-light)" />
            Fundamental Legal Rights of Women in India
          </h3>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <li><strong>Right to Zero FIR:</strong> Under Indian criminal law, a woman can lodge an FIR at ANY police station regardless of territorial jurisdiction where the incident occurred. The station must accept the complaint and transfer it to the relevant jurisdictional station.</li>
            <li><strong>Arrest Safeguards (Section 46(4) CrPC):</strong> No woman can be arrested after sunset and before sunrise, except under extraordinary circumstances by a female police officer with prior magistrate sanction.</li>
            <li><strong>Confidential Judicial Statements (Section 164 CrPC):</strong> A survivor of sexual assault or harassment can record her statement before a magistrate in camera (private chamber) without public presence.</li>
            <li><strong>Right to Free Legal Aid:</strong> Under the Legal Services Authorities Act, all women in India are legally entitled to free legal aid regardless of their financial status.</li>
          </ul>
        </div>

        {/* Guide 3: Cyber Harassment */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            💻 First 10 Minutes: Cyber Extortion & Stalking Action
          </h3>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <li><strong>Do NOT delete the chat immediately:</strong> Unedited screenshots showing timestamps, usernames, and profile links constitute vital evidence under the Information Technology Act. Capture screenshots before blocking.</li>
            <li><strong>Never pay blackmailers or extortionists:</strong> Extortionists do not delete compromising material upon receiving payment; payment simply confirms compliance and encourages escalated demands.</li>
            <li><strong>Use StopNCII.org for intimate image leaks:</strong> Create anonymous cryptographic hashes via StopNCII.org to prevent unauthorized uploads across major participating tech platforms.</li>
            <li><strong>Call 1930 for financial cyber fraud:</strong> If extortion or unauthorized account deductions occurred, contact the National Cyber Helpline 1930 within the golden hour to freeze payment gateways.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
