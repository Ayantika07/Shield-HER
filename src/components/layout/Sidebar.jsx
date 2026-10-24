import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  Navigation,
  ShieldAlert,
  Lock,
  MapPin,
  Building2,
  CheckSquare,
  WifiOff,
  Settings,
  HelpCircle,
  PhoneCall
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const navItems = [
    { to: '/', label: 'Main Dashboard', icon: LayoutDashboard, badge: null },
    { to: '/sos', label: 'Discreet SOS (112)', icon: AlertTriangle, badge: 'Urgent', badgeClass: 'badge-danger' },
    { to: '/journey', label: 'Safe Journey Companion', icon: Navigation, badge: null },
    { to: '/detector', label: 'AI Cyber Harassment', icon: ShieldAlert, badge: 'AI', badgeClass: 'badge-purple' },
    { to: '/evidence', label: 'Private Evidence Locker', icon: Lock, badge: null },
    { to: '/map', label: 'GPS Safety Map & Hub', icon: MapPin, badge: null },
    { to: '/police', label: 'Police Assistance & Help Desks', icon: Building2, badge: 'Verified', badgeClass: 'badge-safe' },
    { to: '/privacy', label: 'Digital Privacy Guardian', icon: CheckSquare, badge: null },
    { to: '/offline', label: 'Offline Safety Mode', icon: WifiOff, badge: null },
    { to: '/settings', label: 'Settings & Data Backup', icon: Settings, badge: null }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(2px)',
            zIndex: 90
          }}
        />
      )}

      {/* Sidebar Container */}
      <aside style={{
        width: '260px',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'fixed',
        top: '64px',
        bottom: 0,
        left: isOpen ? 0 : '-260px',
        transition: 'left 250ms ease-in-out',
        zIndex: 95,
        overflowY: 'auto'
      }}>
        {/* Navigation List */}
        <div style={{ padding: '1rem 0.75rem' }}>
          <div style={{
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-muted)',
            fontWeight: 700,
            padding: '0 0.75rem 0.6rem 0.75rem'
          }}>
            Safety Platform Modules
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.625rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 500,
                    backgroundColor: isActive ? 'var(--brand-purple)' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    transition: 'all var(--transition-fast)'
                  })}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`badge ${item.badgeClass}`} style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Quick Emergency Helplines Callout Box */}
        <div style={{
          padding: '1rem',
          margin: '0.75rem',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--status-danger)', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.4rem' }}>
            <PhoneCall size={14} /> Official Helplines (India)
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            <div><strong style={{ color: 'var(--text-primary)' }}>112:</strong> National Emergency</div>
            <div><strong style={{ color: 'var(--text-primary)' }}>1091:</strong> Women Helpline</div>
            <div><strong style={{ color: 'var(--text-primary)' }}>1930:</strong> Cyber Fraud & Crime</div>
          </div>
        </div>
      </aside>
    </>
  );
}
