import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  AlertTriangle, 
  EyeOff, 
  Wifi, 
  WifiOff, 
  BatteryCharging, 
  Battery, 
  BatteryLow, 
  Menu, 
  X, 
  User, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../services/authContext';
import { getBatteryStatus } from '../../services/deviceService';
import DiscreetModeModal from './DiscreetModeModal';

export default function Navbar({ onToggleSidebar, isSidebarOpen }) {
  const { user, logout, isDemoMode } = useAuth();
  const navigate = useNavigate();

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [batteryInfo, setBatteryInfo] = useState({ supported: false, level: null, charging: false });
  const [showDiscreet, setShowDiscreet] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Monitor online / offline network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial battery check
    getBatteryStatus().then((info) => {
      if (info.supported) {
        setBatteryInfo(info);
        if (info.batteryRef) {
          const update = () => {
            setBatteryInfo({
              supported: true,
              level: Math.round(info.batteryRef.level * 100),
              charging: info.batteryRef.charging
            });
          };
          info.batteryRef.addEventListener('levelchange', update);
          info.batteryRef.addEventListener('chargingchange', update);
        }
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header style={{
        height: '64px',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.25rem',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        {/* Left: Hamburger & Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle Navigation Menu"
            style={{
              background: 'transparent',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #ec4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(79, 70, 229, 0.4)'
            }}>
              <Shield size={20} color="#ffffff" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{
                fontFamily: 'Plus Jakarta Sans',
                fontWeight: 800,
                fontSize: '1.15rem',
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                SHIELD HER
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.4rem',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(236, 72, 153, 0.15)',
                  color: '#fb7185',
                  border: '1px solid rgba(236, 72, 153, 0.3)'
                }}>
                  recHERsion'26
                </span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1 }}>
                Safety • Privacy • Power
              </div>
            </div>
          </Link>
        </div>

        {/* Center / Right: Status Badges, Discreet Mode & Emergency SOS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Online / Offline Status */}
          <div
            title={isOnline ? 'Online: System synced' : 'Offline Safety Mode: Local cached records active'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: isOnline ? 'var(--status-safe-bg)' : 'var(--status-warning-bg)',
              color: isOnline ? 'var(--status-safe)' : 'var(--status-warning)',
              border: `1px solid ${isOnline ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
            }}
          >
            {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
            <span style={{ display: 'none', md: 'inline' }}>
              {isOnline ? 'Online' : 'Offline Mode'}
            </span>
          </div>

          {/* Battery Status Indicator */}
          {batteryInfo.supported && (
            <div
              title={`Battery: ${batteryInfo.level}% ${batteryInfo.charging ? '(Charging)' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.3rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: batteryInfo.level <= 20 && !batteryInfo.charging ? 'var(--status-danger-bg)' : 'var(--bg-card)',
                color: batteryInfo.level <= 20 && !batteryInfo.charging ? 'var(--status-danger)' : 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              {batteryInfo.charging ? (
                <BatteryCharging size={14} color="#10b981" />
              ) : batteryInfo.level <= 20 ? (
                <BatteryLow size={14} color="#ef4444" />
              ) : (
                <Battery size={14} />
              )}
              <span>{batteryInfo.level}%</span>
            </div>
          )}

          {/* Quick Privacy Disguise Button */}
          <button
            onClick={() => setShowDiscreet(true)}
            className="btn btn-secondary btn-sm"
            title="Switch immediately to notepad/calculator disguise"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <EyeOff size={15} />
            <span style={{ display: 'none', sm: 'inline' }}>Disguise</span>
          </button>

          {/* Prominent SOS Button */}
          <Link
            to="/sos"
            className="btn btn-danger btn-sm pulse-emergency"
            style={{
              padding: '0.45rem 1rem',
              fontWeight: 700,
              letterSpacing: '0.04em'
            }}
          >
            <AlertTriangle size={16} />
            <span>SOS 112</span>
          </Link>

          {/* User Account Menu */}
          {user && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.3rem 0.65rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.825rem'
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--brand-purple)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown size={14} color="var(--text-muted)" />
              </button>

              {showUserMenu && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '120%',
                  width: '200px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '0.5rem',
                  zIndex: 200
                }}>
                  <div style={{ padding: '0.5rem 0.65rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.35rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                    {isDemoMode && (
                      <span className="badge badge-purple" style={{ marginTop: '0.35rem', fontSize: '0.65rem' }}>Demo Mode</span>
                    )}
                  </div>

                  <Link
                    to="/settings"
                    onClick={() => setShowUserMenu(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <User size={15} /> Profile & Settings
                  </Link>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      handleLogout();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--status-danger)',
                      fontSize: '0.85rem',
                      background: 'transparent',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--status-danger-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Discreet Mode Overlay */}
      <DiscreetModeModal isOpen={showDiscreet} onClose={() => setShowDiscreet(false)} />
    </>
  );
}
