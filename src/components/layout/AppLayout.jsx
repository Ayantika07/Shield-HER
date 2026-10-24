import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { WifiOff, AlertTriangle } from 'lucide-react';

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('resize', handleResize);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Offline Alert Strip if device loses internet */}
      {isOffline && (
        <div style={{
          backgroundColor: '#78350f',
          color: '#fef3c7',
          padding: '0.4rem 1rem',
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          fontWeight: 600,
          borderBottom: '1px solid #b45309',
          position: 'sticky',
          top: '64px',
          zIndex: 80
        }}>
          <WifiOff size={15} />
          <span>Offline Safety Mode Active: You can access saved emergency contacts, offline safety handbook, and evidence locker without internet.</span>
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main style={{
          flex: 1,
          marginLeft: isSidebarOpen && window.innerWidth >= 1024 ? '260px' : '0',
          transition: 'margin-left 250ms ease-in-out',
          padding: '1.5rem',
          maxWidth: '1400px',
          width: '100%',
          margin: '0 auto',
          minHeight: 'calc(100vh - 64px)'
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
