import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Building2,
  Navigation,
  Search,
  PhoneCall,
  ExternalLink,
  List,
  Map as MapIcon,
  Compass,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Car,
  Pill,
  Bus,
  Train,
  WifiOff
} from 'lucide-react';
import { getCachedResources } from '../services/db';
import { getCurrentCoordinates } from '../services/deviceService';

// Component to dynamically re-center map and invalidate size on mount
function MapController({ coords }) {
  const map = useMap();

  useEffect(() => {
    // Invalidate size after layout renders to prevent gray/empty tile glitch
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (coords) {
      map.setView([coords.latitude, coords.longitude], 14, { animate: true });
    }
  }, [coords, map]);

  return null;
}

// Calculate haversine distance in km or meters
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon/ 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  if (d < 1) {
    return `${Math.round(d * 1000)} m away`;
  }
  return `${d.toFixed(1)} km away`;
}

// Custom styled Leaflet DivIcons matching brand categories
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
          box-shadow: 0 0 15px rgba(79, 70, 229, 0.9);
          animation: pulseSOS 2s infinite;
        "></div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });
  }

  let bg = '#4f46e5';
  let emoji = '📍';
  if (category === 'police') { bg = '#2563eb'; emoji = '🚓'; }
  else if (category === 'hospital') { bg = '#dc2626'; emoji = '🏥'; }
  else if (category === 'transit') { bg = '#7c3aed'; emoji = '🚇'; }
  else if (category === 'bus') { bg = '#d97706'; emoji = '🚌'; }
  else if (category === 'pharmacy') { bg = '#059669'; emoji = '💊'; }
  else if (category === 'public') { bg = '#0284c7'; emoji = '🛡️'; }

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
        box-shadow: 0 3px 8px rgba(0,0,0,0.4);
      ">
        <span style="transform: rotate(45deg); font-size: 14px;">${emoji}</span>
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
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Default center: Connaught Place, Central Delhi
  const defaultCenter = [28.6315, 77.2167];

  useEffect(() => {
    loadResources();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
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
      setLocError(err.message || 'Location access could not be retrieved.');
    } finally {
      setLocLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Resources' },
    { id: 'police', label: 'Police Stations & Women Desks' },
    { id: 'hospital', label: 'Hospitals & Medical' },
    { id: 'transit', label: 'Metro & Railway Stations' },
    { id: 'bus', label: 'Bus Terminals & Hubs' },
    { id: 'pharmacy', label: '24x7 Pharmacies' },
    { id: 'public', label: 'Safe Havens & Landmarks' }
  ];

  const filteredResources = resources.filter((res) => {
    const matchesCat = selectedCategory === 'all' || res.category === selectedCategory;
    const matchesSearch =
      res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (res.address && res.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (res.notes && res.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (res.categoryLabel && res.categoryLabel.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Title & View Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <MapPin size={28} color="var(--brand-purple-light)" />
            GPS Safety Map & Verified Resource Hub
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Locate 24x7 Women Help Desks, emergency hospitals, transit security booths, and safe public havens.
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

      {/* Offline Notice if connection is down */}
      {!isOnline && (
        <div style={{
          backgroundColor: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid var(--status-warning)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#fef3c7',
          fontSize: '0.85rem'
        }}>
          <WifiOff size={16} color="#f59e0b" />
          <span><strong>Offline Mode:</strong> Street map tiles require internet to refresh. All previously verified emergency facilities and phone numbers are available in the Directory List below.</span>
        </div>
      )}

      {/* Search & Category Filter Bar */}
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
            placeholder="Search verified police stations, hospitals, bus stands, chemists..."
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

      {locError && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '0.65rem 1rem',
          fontSize: '0.8rem',
          color: '#fca5a5',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle size={16} />
          <span>{locError}</span>
        </div>
      )}

      {/* MAP VIEW */}
      {viewMode === 'map' ? (
        <div style={{
          height: '560px',
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
            {/* Standard OpenStreetMap Street Tiles with recognizable roads, names, landmarks */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />

            <MapController coords={userCoords} />

            {/* User Live Location Marker (if granted) */}
            {userCoords && (
              <Marker
                position={[userCoords.latitude, userCoords.longitude]}
                icon={createCustomMarkerIcon('user', true)}
              >
                <Popup>
                  <div style={{ color: '#0f172a', padding: '0.2rem' }}>
                    <strong style={{ fontSize: '0.9rem' }}>Your Current Location</strong>
                    <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.15rem' }}>
                      Accuracy: ±{userCoords.accuracy} meters
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Verified Safety Resource Markers */}
            {filteredResources.map((res) => {
              const distanceText = userCoords
                ? calculateDistance(userCoords.latitude, userCoords.longitude, res.lat, res.lng)
                : null;

              return (
                <Marker
                  key={res.id}
                  position={[res.lat, res.lng]}
                  icon={createCustomMarkerIcon(res.category)}
                >
                  <Popup>
                    <div style={{ color: '#0f172a', maxWidth: '260px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem', color: '#0f172a' }}>
                        {res.name}
                      </div>

                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.4rem',
                          borderRadius: '4px',
                          backgroundColor: '#e0e7ff',
                          color: '#3730a3'
                        }}>
                          {res.categoryLabel || res.category.toUpperCase()}
                        </span>
                        {res.isWomenDesk && (
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.4rem',
                            borderRadius: '4px',
                            backgroundColor: '#dbeafe',
                            color: '#1d4ed8'
                          }}>
                            🛡️ Women Desk Active
                          </span>
                        )}
                        {distanceText && (
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.4rem',
                            borderRadius: '4px',
                            backgroundColor: '#dcfce7',
                            color: '#15803d'
                          }}>
                            {distanceText}
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.8rem', color: '#334155', marginBottom: '0.4rem', lineHeight: 1.4 }}>
                        {res.address}
                      </div>

                      {res.notes && (
                        <div style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '0.4rem', fontStyle: 'italic' }}>
                          {res.notes}
                        </div>
                      )}

                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.5rem' }}>
                        Source: {res.source || 'Official Directory'} ({res.verifiedDate || 'Verified'})
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', borderTop: '1px solid #cbd5e1', paddingTop: '0.4rem' }}>
                        {res.phone && (
                          <a
                            href={`tel:${res.phone}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              color: '#059669',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              textDecoration: 'none'
                            }}
                          >
                            📞 Call: {res.phone}
                          </a>
                        )}
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${res.lat},${res.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '0.8rem',
                            color: '#4f46e5',
                            fontWeight: 600,
                            textDecoration: 'none',
                            marginLeft: 'auto'
                          }}
                        >
                          Directions ↗
                        </a>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      ) : (
        /* DIRECTORY LIST VIEW */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filteredResources.map((res) => {
            const distanceText = userCoords
              ? calculateDistance(userCoords.latitude, userCoords.longitude, res.lat, res.lng)
              : null;

            return (
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-purple">
                      {res.categoryLabel || res.category.toUpperCase()}
                    </span>
                    {res.isWomenDesk && (
                      <span className="badge badge-safe">Women Help Desk Active</span>
                    )}
                    {res.available247 && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--status-safe)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Clock size={12} /> 24x7 Operational
                      </span>
                    )}
                    {distanceText && (
                      <span className="badge badge-neutral" style={{ color: 'var(--brand-purple-light)' }}>
                        {distanceText}
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
                    <div style={{ fontSize: '0.8rem', color: 'var(--brand-lavender)', marginTop: '0.35rem' }}>
                      ℹ️ {res.notes}
                    </div>
                  )}

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Data Source: {res.source || 'Official Registry'} • Last verified: {res.verifiedDate || '2026'}
                  </div>
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
            );
          })}
        </div>
      )}

      {/* Verified Provenance Disclaimer */}
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
          <strong>Verified Safety Data Sources:</strong> Map coordinates and facility phone numbers are drawn from official state police directories, DMRC transit security, and public hospital databases. When offline, resource listings remain fully accessible in the Directory List.
        </div>
      </div>
    </div>
  );
}
