/**
 * LocationPermissionBanner
 *
 * Shows a friendly prompt explaining WHY location is needed,
 * with an "Allow Location" CTA that triggers the browser dialog.
 *
 * Props:
 *  - role: 'customer' | 'labour' | 'b2b'
 *  - permissionState: 'unknown' | 'prompt' | 'granted' | 'denied'
 *  - onAllow: () => void   - calls startWatching / getOnce
 *  - error: string | null
 */
import React from 'react';
import { MapPin, Navigation, Shield, AlertTriangle } from 'lucide-react';

const ROLE_COPY = {
  customer: {
    icon: '🏠',
    title: 'Share Your Location for Accurate Tracking',
    reason: 'Your GPS coordinates are used to:\n• Show your worker their route to your home\n• Give you a real-time ETA as the worker travels\n• Auto-fill your service address on new bookings',
    cta: 'Allow Location Access',
    color: '#3b82f6'
  },
  labour: {
    icon: '🛵',
    title: 'Enable GPS for Live Navigation',
    reason: 'Your live location is used to:\n• Send real-time route & ETA updates to your customer\n• Navigate you to the job site\n• Auto-stop sharing when the job is completed',
    cta: 'Start GPS Tracking',
    color: '#10b981'
  },
  b2b: {
    icon: '🏗️',
    title: 'Site Location Tracking',
    reason: 'Location access lets you:\n• Monitor worker batch arrivals at your project site\n• See live ETA for each incoming crew\n• Log geo-verified site check-ins',
    cta: 'Enable Site Tracking',
    color: '#a855f7'
  }
};

export const LocationPermissionBanner = ({ role = 'customer', permissionState, onAllow, error }) => {
  const copy = ROLE_COPY[role] || ROLE_COPY.customer;

  if (permissionState === 'granted') return null; // already allowed — hide banner

  const isDenied = permissionState === 'denied' || (error && error.includes('denied'));

  return (
    <div style={{
      background: isDenied
        ? 'rgba(239, 68, 68, 0.06)'
        : 'rgba(59, 130, 246, 0.06)',
      border: `1px solid ${isDenied ? 'rgba(239,68,68,0.3)' : 'rgba(59,130,246,0.25)'}`,
      borderRadius: '16px',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      display: 'flex',
      gap: '1.25rem',
      alignItems: 'flex-start'
    }}>
      {/* Icon */}
      <div style={{
        width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0,
        background: `${copy.color}18`,
        border: `1.5px solid ${copy.color}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '22px'
      }}>
        {isDenied ? <AlertTriangle size={22} color="#ef4444" /> : copy.icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontWeight: '700', fontSize: '1rem', color: '#fff',
          marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
        }}>
          {isDenied ? '📵 Location Access Blocked' : copy.title}
        </div>

        {isDenied ? (
          <p style={{ color: '#fca5a5', fontSize: '0.84rem', lineHeight: 1.6, margin: 0 }}>
            You previously denied location access. To enable it, open your browser's <strong>site settings</strong> (🔒 icon in address bar) and set Location to <strong>Allow</strong>, then refresh the page.
          </p>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-line' }}>
            {copy.reason}
          </p>
        )}

        {/* Privacy note */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          marginTop: '0.75rem', fontSize: '0.75rem', color: '#64748b'
        }}>
          <Shield size={12} />
          Your location is only shared during active bookings and never stored after job completion.
        </div>

        {/* CTA */}
        {!isDenied && (
          <button
            type="button"
            onClick={onAllow}
            style={{
              marginTop: '1rem',
              background: `linear-gradient(135deg, ${copy.color}, ${copy.color}cc)`,
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '0.6rem 1.25rem',
              fontWeight: '700',
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: `0 4px 15px ${copy.color}40`,
              transition: 'transform 0.15s, box-shadow 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Navigation size={15} />
            {copy.cta}
          </button>
        )}

        {/* Non-denied error */}
        {error && !isDenied && (
          <p style={{ marginTop: '0.5rem', color: '#fca5a5', fontSize: '0.78rem' }}>
            ⚠ {error}
          </p>
        )}
      </div>
    </div>
  );
};
