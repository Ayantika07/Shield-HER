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
  Info
} from 'lucide-react';
import { getEmergencyContacts, getCachedResources } from '../services/db';

export default function OfflineHandbook() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [contacts, setContacts] = useState([]);
  const [resources, setResources] = useState([]);
  const [cachedTime, setCachedTime] = useState(() => {
    return localStorage.getItem('shield_her_cache_time') || new Date().toLocaleString();
  });
  const [downloadingBundle, setDownloadingBundle] = useState(false);
  const [bundleSuccess, setBundleSuccess] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    getEmergencyContacts().then(setContacts);
    getCachedResources('all').then(setResources);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleDownloadBundle = async () => {
    setDownloadingBundle(true);
    setBundleSuccess(false);

    // Ensure resources and contacts are populated in IndexedDB
    await getEmergencyContacts();
    await getCachedResources('all');

    // If cache API available, pre-cache static routes
    if ('caches' in window) {
      try {
        const cache = await caches.open('shield-her-v1.0');
        await cache.addAll(['/', '/index.html', '/manifest.json', '/favicon.svg']);
      } catch (err) {
        console.warn('Cache API pre-cache notice:', err);
      }
    }

    const now = new Date().toLocaleString();
    localStorage.setItem('shield_her_cache_time', now);
    setCachedTime(now);

    setTimeout(() => {
      setDownloadingBundle(false);
      setBundleSuccess(true);
      setTimeout(() => setBundleSuccess(false), 4000);
    }, 800);
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
          Zero-internet preparedness: Access saved contacts, local police help desks, and emergency survival guides without cellular data.
        </p>
      </div>

      {/* Online / Offline Status & Sync Card */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: `1px solid ${isOnline ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.4)'}`,
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span className={`badge ${isOnline ? 'badge-safe' : 'badge-warning'}`}>
              {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
              {isOnline ? 'Device Online' : 'Device Offline (Safe Mode Active)'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Last bundle update: {cachedTime}
            </span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {isOnline ? 'All Offline Bundles Cached & Up to Date' : 'Operating from Local IndexedDB Cache'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            {contacts.length} emergency contacts and {resources.length} verified police/medical facilities stored on this phone.
          </p>
        </div>

        <button
          onClick={handleDownloadBundle}
          disabled={downloadingBundle}
          className="btn btn-primary"
          style={{ gap: '0.4rem', fontWeight: 700 }}
        >
          {downloadingBundle ? (
            <span>Pre-caching Assets...</span>
          ) : bundleSuccess ? (
            <>
              <CheckCircle2 size={16} color="#10b981" /> Bundle Prepared!
            </>
          ) : (
            <>
              <Download size={16} /> Update Offline Safety Bundle
            </>
          )}
        </button>
      </div>

      {/* Quick Offline Contacts Directory */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <PhoneCall size={20} color="var(--brand-purple-light)" />
            <span>Cached Offline Emergency Contacts ({contacts.length})</span>
          </div>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
          Voice calls to 112, 1091, and saved contacts operate over standard GSM cellular towers even without mobile data or internet.
        </p>

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
      </div>

      {/* Offline Actionable Safety Handbook */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen size={22} color="var(--brand-lavender)" />
          Actionable Crisis Handbook (Saved Offline)
        </h2>

        {/* Guide 1: Street Confrontation Protocols */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            🚶 Street Safety & Being Followed Protocols
          </h3>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <li><strong>Cross the street immediately:</strong> If you suspect someone is following you on foot or on a two-wheeler, cross the road deliberately. If they cross too, you have confirmed their intent.</li>
            <li><strong>Divert to an illuminated public space:</strong> Head directly to a 24x7 pharmacy, metro station security gate, ATM booth with guard, or brightly lit restaurant. Never head down an unlit alley towards your home.</li>
            <li><strong>Make purposeful noise:</strong> Speak loudly on the phone stating your exact street location, e.g., "I am standing right outside Gate 2, see you in 30 seconds."</li>
            <li><strong>If physically grabbed:</strong> Target vulnerable points (eyes, throat, groin, shins) with maximum explosive force, yell "FIRE" (crowds respond faster to fire than help), and run toward lights.</li>
          </ul>
        </div>

        {/* Guide 2: Legal Rights of Women in India */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Scale size={18} color="var(--brand-purple-light)" />
            Your Fundamental Legal Rights in India
          </h3>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <li><strong>Right to Zero FIR:</strong> Under Indian criminal law, a woman can register an FIR at ANY police station regardless of jurisdiction where the incident occurred. The station must accept it and transfer it.</li>
            <li><strong>Arrest Restrictions for Women:</strong> Section 46(4) of CrPC mandates that no woman can be arrested after sunset and before sunrise, except under extraordinary circumstances by a female police officer with prior magistrate sanction.</li>
            <li><strong>Virtual / Postal Complaints:</strong> If a woman cannot visit a police station in person, she can send a written complaint via registered speed post or official police portal directly to the Deputy Commissioner of Police (DCP).</li>
            <li><strong>Right to Privacy during Statements:</strong> Under Section 164 of CrPC, a rape or assault survivor can record her statement before a magistrate in camera (private chamber) without public presence.</li>
          </ul>
        </div>

        {/* Guide 3: First 10 Minutes of Cyber Harassment */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            💻 First 10 Minutes: Cyber Extortion & Stalking Action
          </h3>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <li><strong>DO NOT delete the chat immediately:</strong> Screenshots, phone numbers, and message timestamps are critical legal evidence under the Information Technology Act. Capture screenshots before blocking.</li>
            <li><strong>DO NOT pay extortion money:</strong> Blackmailers never delete compromising photos after receiving payment; payment only signals compliance and attracts escalated demands.</li>
            <li><strong>Report to StopNCII.org:</strong> If someone threatens to distribute intimate images, generate anonymous cryptographic hashes via StopNCII.org to prevent their upload across major social platforms.</li>
            <li><strong>Dial 1930 immediately:</strong> If financial loss or banking extortion is involved, call the National Cyber Helpline 1930 within the golden hour to freeze unauthorized transactions.</li>
          </ul>
        </div>
      </div>

      {/* Safety Notice */}
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
          <strong>Offline Operating Capability:</strong> This handbook, all emergency contacts, and previously viewed safety maps are cached on your device. However, active automated AI endpoints or live traffic rerouting require an active data connection.
        </div>
      </div>
    </div>
  );
}
