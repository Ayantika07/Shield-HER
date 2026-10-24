import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  Building2,
  Cross,
  Navigation,
  Search,
  Filter,
  PhoneCall,
  ExternalLink,
  List,
  Map as MapIcon,
  Compass,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { getCachedResources } from '../services/db';
import { getCurrentCoordinates } from '../services/deviceService';

// Component to dynamically re-center map
function CenterMap({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView([coords.latitude, coords.longitude], 14);
    }
  }, [coords, map]);
  return null;
}

// Custom styled Leaflet DivIcons matching brand colors
function createCustomMarkerIcon(category, isUser = false) {
  if (isUser) {
    return L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div style="
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #4f46e5;
          border: 3px solid #ffffff;
          box-shadow: 0 0 15px rgba(79, 70, 229, 0.8);
          animation: pulseSOS 2s infinite;
        "></div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });
  }

  let bg = '#4f46e5';
  let letter = 'P';
  if (category === 'police') { bg = '#3b82f6'; letter = '🚓'; }
  else if (category === 'hospital') { bg = '#ef4444'; letter = '🏥'; }
  else if (category === 'transit') { bg = '#8b5cf6'; letter = '🚇'; }
  else if (category === 'public') { bg = '#10b981'; letter = '🛡️'; }

  return L.divIcon({
    className: 'custom-resource-marker',
    html: `
      <div style="
        background: ${bg};
        color: #ffffff;
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #ffffff;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      ">
        <span style="transform: rotate(45deg); font-size: 14px;">${letter}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -28]
  });
}

export default function MapHub() {
  const [resources, setResources] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [userCoords, setUserCoords] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState('');
  const [viewMode, setViewMode] = useState('map'); // 'map' | 'list'

  // Default center (New Delhi Central / Connaught Place)
  const defaultCenter = [28.6315, 77.2167];

  useEffect(() => {
    loadResources();
    getUserLocation();
  }, []);

  const loadResources = async () => {
    const list = await getCachedResources('all');
    setResources(list);
  };

  const getUserLocation = async () => {
    setLocLoading(true);
    setLocError('');
    try {
      const coords = await getCurrentCoordinates();
      setUserCoords(coords);
    } catch (err) {
      setLocError(err.message);
    } finally {
      setLocLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Resources' },
    { id: 'police', label: 'Police Stations & Women Desks' },
    { id: 'hospital', label: '24x7 Hospitals & Trauma' },
    { id: 'transit', label: 'Metro & Railway Safety Posts' },
    { id: 'public', label: 'Safe Havens & Pharmacies' }
  ];

  const filteredResources = resources.filter((res) => {
    const matchesCat = selectedCategory === 'all' || res.category === selectedCategory;
    const matchesSearch =
      res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (res.address && res.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (res.notes && res.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Title & View Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <MapPin size={28} color="var(--brand-purple-light)" />
            GPS Safety Map & Verified Resource Hub
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Locate 24x7 Women Help Desks, emergency trauma care, CISF metro booths, and illuminated safe zones.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--bg-surface)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setViewMode('map')}
            className="btn btn-sm"
            style={{
              backgroundColor: viewMode === 'map' ? 'var(--brand-purple)' : 'transparent',
              color: viewMode === 'map' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            <MapIcon size={14} /> Map View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className="btn btn-sm"
            style={{
              backgroundColor: viewMode === 'list' ? 'var(--brand-purple)' : 'transparent',
              color: viewMode === 'list' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            <List size={14} /> Directory List
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--bg-card)',
        padding: '0.875rem 1rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            className="form-input"
            placeholder="Search verified police stations, hospitals, metro booths..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ margin: 0 }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className="btn btn-sm"
              style={{
                backgroundColor: selectedCategory === cat.id ? 'var(--brand-purple)' : 'var(--bg-surface)',
                color: selectedCategory === cat.id ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.775rem'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <button
          onClick={getUserLocation}
          className="btn btn-secondary btn-sm"
          disabled={locLoading}
          style={{ gap: '0.35rem' }}
        >
          <Compass size={14} />
          {locLoading ? 'Locating...' : 'My Location'}
        </button>
      </div>

      {/* MAP VIEW */}
      {viewMode === 'map' ? (
        <div style={{
          height: '540px',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-md)',
          position: 'relative'
        }}>
          <MapContainer
            center={userCoords ? [userCoords.latitude, userCoords.longitude] : defaultCenter}
            zoom={14}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}.png"
            />

            {userCoords && <CenterMap coords={userCoords} />}

            {/* User Location Marker */}
            {userCoords && (
              <Marker
                position={[userCoords.latitude, userCoords.longitude]}
                icon={createCustomMarkerIcon('user', true)}
              >
                <Popup>
                  <div style={{ color: '#0f172a' }}>
                    <strong>Your Current Location</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Accuracy: ±{userCoords.accuracy}m
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Resource Markers */}
            {filteredResources.map((res) => (
              <Marker
                key={res.id}
                position={[res.lat, res.lng]}
                icon={createCustomMarkerIcon(res.category)}
              >
                <Popup>
                  <div style={{ color: '#0f172a', maxWidth: '240px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                      {res.name}
                    </div>
                    {res.isWomenDesk && (
                      <span style={{
                        display: 'inline-block',
                        padding: '0.15rem 0.4rem',
                        borderRadius: '4px',
                        backgroundColor: '#dbeafe',
                        color: '#1d4ed8',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        marginBottom: '0.4rem'
                      }}>
                        🛡️ 24x7 Women Help Desk
                      </span>
                    )}
                    <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '0.4rem' }}>
                      {res.address}
                    </div>
                    {res.phone && (
                      <a
                        href={`tel:${res.phone}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          color: '#059669',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          textDecoration: 'none',
                          marginBottom: '0.4rem'
                        }}
                      >
                        📞 Call: {res.phone}
                      </a>
                    )}
                    <div style={{ marginTop: '0.4rem' }}>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${res.lat},${res.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '0.75rem',
                          color: '#4f46e5',
                          fontWeight: 600,
                          textDecoration: 'none'
                        }}
                      >
                        Get Directions ↗
                      </a>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      ) : (
        /* DIRECTORY LIST VIEW */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filteredResources.map((res) => (
            <div
              key={res.id}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span className={`badge ${res.category === 'police' ? 'badge-purple' : res.category === 'hospital' ? 'badge-danger' : 'badge-safe'}`}>
                    {res.category.toUpperCase()}
                  </span>
                  {res.isWomenDesk && (
                    <span className="badge badge-safe">Women Help Desk Active</span>
                  )}
                  {res.available247 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--status-safe)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Clock size={12} /> 24x7 Emergency
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {res.name}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {res.address}
                </p>

                {res.notes && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--brand-lavender)', marginTop: '0.4rem' }}>
                    ℹ️ {res.notes}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {res.phone && (
                  <a href={`tel:${res.phone}`} className="btn btn-success btn-sm" style={{ gap: '0.35rem' }}>
                    <PhoneCall size={13} /> {res.phone}
                  </a>
                )}
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${res.lat},${res.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                  style={{ gap: '0.35rem' }}
                >
                  <Navigation size={13} /> Directions
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Offline Caching & Data Provenance Notice */}
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
        <ShieldCheck size={18} color="var(--brand-purple-light)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Verified Safety Data & Offline Availability:</strong> All resource locations, police phone numbers, and hospital emergency contact details are cached in your device’s IndexedDB and remain accessible when completely offline. Tiles are served via standard OpenStreetMap terms of service.
        </div>
      </div>
    </div>
  );
}
