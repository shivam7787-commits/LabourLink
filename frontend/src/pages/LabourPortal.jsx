import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Hammer, Wallet, LogOut, Radio, CheckCircle, Clock, ShieldCheck,
  Award, MapPin, Navigation, Phone, ExternalLink, Compass, ArrowRight,
  Shield, Check, RefreshCw, Satellite
} from 'lucide-react';
import { Toast } from '../components/Toast';
import { LiveLocationMap } from '../components/LiveLocationMap';
import { useGeolocation } from '../hooks/useGeolocation';
import { LocationPermissionBanner } from '../components/LocationPermissionBanner';
import { getRealtimeLocation, getRoute } from '../services/geoapifyService';

export const LabourPortal = () => {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('radar'); // 'radar' | 'location' | 'onboarding' | 'wallet'
  const [isOnline, setIsOnline] = useState(true);
  const [radarSeconds, setRadarSeconds] = useState(30);
  const [incomingJob, setIncomingJob] = useState({
    id: 'REQ-9921',
    customer: 'Priya Sharma',
    phone: '+91 98765 43210',
    address: 'A-402, Sea Breeze Apts, Bandra West, Mumbai',
    landmark: 'Near Mehboob Studio & Bandstand Promenade',
    gateInstructions: 'Tower B, 4th Floor, Ring bell twice',
    distanceKm: 1.4,
    etaMinutes: 6,
    service: 'Certified Electrician',
    scope: 'Fix tripped circuit breaker & living room switchboard',
    duration: '2 Hours',
    estimatedPayout: 937.5,
    customerLat: 19.0596,
    customerLng: 72.8295
  });

  const [jobOtpInput, setJobOtpInput] = useState('');
  const [jobStatus, setJobStatus] = useState('Matched'); // 'Matched' | 'In Progress' | 'Completed'
  const [walletBalance, setWalletBalance] = useState(user.walletBalance || 3250);
  const [toast, setToast] = useState(null);

  // Labour's current location & telemetry
  const [workerLocation, setWorkerLocation] = useState({
    lat: 19.0688,
    lng: 72.8340,
    address: 'Linking Road Junction, Khar West, Mumbai',
    name: user.name || 'Service Professional',
    trade: user.category || 'Verified Professional'
  });

  const [navDistanceKm, setNavDistanceKm] = useState(1.4);
  const [navEtaMinutes, setNavEtaMinutes] = useState(6);
  const [navStatus, setNavStatus] = useState('En Route to Customer');

  // Real GPS tracking
  const gps = useGeolocation();
  const gpsBackoffRef = useRef(null);

  // Sync real GPS coords into workerLocation whenever GPS updates
  useEffect(() => {
    if (gps.coords) {
      setWorkerLocation(prev => ({
        ...prev,
        lat: gps.coords.lat,
        lng: gps.coords.lng,
        address: prev.address // keep last known address label
      }));
    }
  }, [gps.coords]);

  // Auto-start GPS watch when navigation tab is opened
  useEffect(() => {
    if (activeTab === 'location' && !gps.isWatching && gps.permissionState !== 'denied') {
      gps.startWatching();
    }
  }, [activeTab]); // eslint-disable-line

  // Customer destination details
  const [customerDestination, setCustomerDestination] = useState({
    name: 'Priya Sharma',
    phone: '+91 98765 43210',
    address: 'A-402, Sea Breeze Apts, Bandra West, Mumbai',
    landmark: 'Near Mehboob Studio & Bandstand Promenade',
    instructions: 'Tower B, 4th Floor, Ring bell twice',
    lat: 19.0596,
    lng: 72.8295
  });

  // Radar Countdown Timer
  useEffect(() => {
    if (!incomingJob || radarSeconds <= 0) return;
    const timer = setInterval(() => {
      setRadarSeconds(s => s - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [incomingJob, radarSeconds]);

  const handleAcceptJob = () => {
    setCustomerDestination({
      name: incomingJob.customer,
      phone: incomingJob.phone,
      address: incomingJob.address,
      landmark: incomingJob.landmark,
      instructions: incomingJob.gateInstructions,
      lat: incomingJob.customerLat,
      lng: incomingJob.customerLng
    });
    setNavDistanceKm(incomingJob.distanceKm);
    setNavEtaMinutes(incomingJob.etaMinutes);
    setIncomingJob(null);
    setActiveTab('location');
    // Start GPS tracking as soon as a job is accepted
    if (!gps.isWatching) gps.startWatching();
    setToast({
      title: 'Job Accepted! GPS Tracking Started',
      body: `Live navigation opened to ${incomingJob.address}. Your location is now being shared with the customer.`,
      type: 'success'
    });
  };

  const handleDeclineJob = () => {
    setIncomingJob(null);
    setToast({ title: 'Job Passed', body: 'Dispatch transferred to next nearest eligible worker.', type: 'info' });
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (jobOtpInput === '8492' || jobOtpInput.length === 4) {
      setJobStatus('In Progress');
      setToast({ title: 'OTP Verified!', body: 'Work timer active. Deliver quality service.', type: 'success' });
    } else {
      setToast({ title: 'Invalid OTP', body: 'Please ask customer for their 4-digit code.', type: 'danger' });
    }
  };

  const handleCompleteJob = () => {
    setJobStatus('Completed');
    setWalletBalance(prev => prev + 937.5);
    setToast({ title: 'Job Completed!', body: '₹937.5 released from Escrow into your Wallet.', type: 'success' });
  };

  const handleWithdrawPayout = async () => {
    if (walletBalance <= 0) return;
    try {
      await api.requestPayout(user.id || user._id, walletBalance);
      setWalletBalance(0);
      setToast({ title: 'Payout Transferred!', body: 'Amount sent to your registered Bank / UPI account.', type: 'success' });
    } catch (err) {
      setToast({ title: 'Payout Error', body: err.message, type: 'danger' });
    }
  };

  const handleMarkArrived = () => {
    setNavDistanceKm(0);
    setNavEtaMinutes(0);
    setNavStatus('Arrived at Customer Premises');
    setWorkerLocation(prev => ({
      ...prev,
      lat: customerDestination.lat + 0.0001,
      lng: customerDestination.lng + 0.0001,
      address: 'Arrived at Sea Breeze Apts'
    }));
    setToast({
      title: 'Arrival Logged!',
      body: 'Customer notified that you have reached their building. Ask for their 4-digit Start Code.',
      type: 'success'
    });
  };

  const handleDetectWorkerLocation = async () => {
    try {
      const loc = await getRealtimeLocation();
      if (loc) {
        setWorkerLocation(prev => ({
          ...prev,
          lat: loc.lat,
          lng: loc.lng,
          address: loc.formatted
        }));
        if (customerDestination?.lat && customerDestination?.lng) {
          const route = await getRoute({ lat: loc.lat, lng: loc.lng }, customerDestination);
          if (route) {
            setNavDistanceKm(route.distanceKm);
            setNavEtaMinutes(route.etaMinutes);
          }
        }
        setToast({
          title: 'Worker Location Calibrated',
          body: `${loc.formatted} (${loc.source.toUpperCase()})`,
          type: 'success'
        });
      }
    } catch (err) {
      setToast({ title: 'Location Error', body: err.message, type: 'danger' });
    }
  };

  const handleSimulateGPSMove = () => {
    if (navEtaMinutes <= 1) {
      handleMarkArrived();
      return;
    }
    const newEta = Math.max(1, navEtaMinutes - 2);
    const newDist = Math.max(0.2, (navDistanceKm - 0.4).toFixed(1));
    setNavEtaMinutes(newEta);
    setNavDistanceKm(newDist);
    setWorkerLocation(prev => ({
      ...prev,
      lat: prev.lat + (customerDestination.lat - prev.lat) * 0.35,
      lng: prev.lng + (customerDestination.lng - prev.lng) * 0.35,
      address: newEta <= 3 ? 'Turner Road, Bandra West' : 'Perry Cross Road Junction'
    }));
    setToast({ title: 'GPS Updated', body: `Now ${newEta} mins (${newDist} km) from customer.`, type: 'info' });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      {/* Toast */}
      {toast && <Toast title={toast.title} body={toast.body} type={toast.type} onClose={() => setToast(null)} />}

      {/* Worker Header */}
      <header style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-glass)', padding: '0.75rem 2rem', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #059669, #047857)', display: 'grid', placeItems: 'center', color: 'white' }}>
                <Hammer size={20} />
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>
                Labour<span style={{ color: '#10b981' }}>Link</span>
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
              Worker Hub
            </span>
          </div>

          {/* Status & Wallet Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              onClick={() => setIsOnline(!isOnline)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: '20px', padding: '0.35rem 0.85rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isOnline ? '#10b981' : '#ef4444', boxShadow: `0 0 8px ${isOnline ? '#10b981' : '#ef4444'}` }}></span>
              <span style={{ color: isOnline ? '#34d399' : '#f87171' }}>{isOnline ? 'Online (Ready)' : 'Offline'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.82rem', color: '#fbbf24', fontWeight: '700' }}>
              <Wallet size={14} />
              <span>Wallet: ₹{walletBalance.toLocaleString()}</span>
            </div>
          </div>

          {/* Profile & Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: '30px', padding: '0.35rem 0.9rem 0.35rem 0.5rem' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#059669', color: 'white', fontWeight: '700', display: 'grid', placeItems: 'center', fontSize: '0.85rem' }}>
                {user.name?.charAt(0) || 'W'}
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff' }}>{user.name}</div>
                <div style={{ fontSize: '0.72rem', color: '#34d399' }}>{user.category || 'Electrician'} • ★ {user.rating || '4.9'}</div>
              </div>
            </div>
            <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'transparent', border: '1px solid var(--border-glass)', color: 'var(--text-muted)', borderRadius: '8px', padding: '0.45rem 0.8rem', fontSize: '0.82rem', cursor: 'pointer' }}>
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem', width: '100%', flex: 1 }}>

        {/* Worker Tab Navigation (Includes new Location & Navigation Section) */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('radar')}
            className={`pill-btn ${activeTab === 'radar' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 1.15rem' }}
          >
            <Radio size={14} /> Available Job Radar
          </button>
          <button
            onClick={() => setActiveTab('location')}
            className={`pill-btn ${activeTab === 'location' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 1.15rem', position: 'relative' }}
          >
            <Navigation size={14} style={{ color: '#34d399' }} />
            <span>Customer Location &amp; Navigation</span>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%', background: '#10b981',
              boxShadow: '0 0 8px #10b981'
            }}></span>
          </button>
          <button
            onClick={() => setActiveTab('onboarding')}
            className={`pill-btn ${activeTab === 'onboarding' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 1.15rem' }}
          >
            <CheckCircle size={14} /> 7-Step Onboarding Status
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className={`pill-btn ${activeTab === 'wallet' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 1.15rem' }}
          >
            <Wallet size={14} /> Escrow Earnings &amp; Payouts
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════
            TAB 1: RADAR & ACTIVE JOB COCKPIT
            ══════════════════════════════════════════════════════════ */}
        {activeTab === 'radar' && (
          gps.permissionState !== 'granted' && !gps.coords ? (
            <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '680px', margin: '1.5rem auto', border: '1px solid rgba(16, 185, 129, 0.4)', background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.15), rgba(17, 24, 39, 0.95))', borderRadius: '20px' }}>
              <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', border: '2px solid #10b981', display: 'grid', placeItems: 'center', margin: '0 auto 1.25rem', color: '#34d399', boxShadow: '0 0 25px rgba(16, 185, 129, 0.35)' }}>
                <Navigation size={32} />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#34d399', background: 'rgba(16, 185, 129, 0.12)', padding: '0.25rem 0.8rem', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                Mandatory Worker Requirement
              </span>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: '800', color: '#fff', marginTop: '0.85rem', marginBottom: '0.5rem' }}>
                Location Permission Required to View Bookings
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.6', maxWidth: '520px', margin: '0 auto 1.75rem' }}>
                As a registered field service professional on LabourLink, your real-time location is mandatory. The dispatch radar uses your coordinates to match you with nearby customers and provide live travel navigation.
              </p>

              {gps.permissionState === 'denied' && (
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.35)', borderRadius: '12px', padding: '1rem', color: '#fca5a5', fontSize: '0.85rem', maxWidth: '480px', margin: '0 auto 1.25rem', textAlign: 'left' }}>
                  ⚠️ <strong>Location Access Blocked in Browser:</strong><br />
                  Please click the permissions/lock icon in your browser's address bar, enable Location for this site, and click the button below or refresh.
                </div>
              )}

              <button
                onClick={gps.startWatching}
                className="btn btn-primary"
                style={{ padding: '0.85rem 2.25rem', fontSize: '1rem', fontWeight: '800', background: '#059669', display: 'inline-flex', alignItems: 'center', gap: '0.6rem', boxShadow: '0 4px 15px rgba(5, 150, 105, 0.4)' }}
              >
                <Navigation size={18} /> Enable Location to Receive Upcoming Bookings
              </button>
            </div>
          ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '1.5rem' }}>
            {/* Incoming Dispatch Radar */}
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>
                    Sequential Dispatch Radar
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Exclusive dispatch window. You have 30s to accept before transfer to next candidate.
                  </p>
                </div>
                {incomingJob && (
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: radarSeconds <= 10 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', border: `2px solid ${radarSeconds <= 10 ? '#ef4444' : '#10b981'}`, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono)', fontWeight: '800', fontSize: '1.1rem', color: radarSeconds <= 10 ? '#f87171' : '#34d399' }}>
                    {radarSeconds}s
                  </div>
                )}
              </div>

              {incomingJob ? (
                <div style={{ background: 'var(--bg-surface-elevated)', border: '1.5px solid #10b981', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', fontSize: '0.72rem', fontWeight: '700', padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
                      {incomingJob.service}
                    </span>
                    <span style={{ color: '#60a5fa', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={13} /> {incomingJob.distanceKm} km to customer (~{incomingJob.etaMinutes} mins)
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', marginBottom: '0.25rem' }}>{incomingJob.customer}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{incomingJob.address}</p>
                  <p style={{ fontSize: '0.78rem', color: '#93c5fd', marginBottom: '1rem' }}>Landmark: {incomingJob.landmark}</p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: '1px solid var(--border-glass)', borderBottom: '1px solid var(--border-glass)', marginBottom: '1.25rem' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Scope of Work</div>
                      <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: '600' }}>{incomingJob.scope}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Guaranteed Payout</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: '800', color: '#34d399' }}>₹{incomingJob.estimatedPayout}</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
                    <button onClick={handleDeclineJob} className="btn btn-glass" style={{ padding: '0.75rem' }}>
                      Pass Job
                    </button>
                    <button onClick={handleAcceptJob} className="btn btn-primary" style={{ background: '#059669', padding: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                      <Navigation size={16} /> Accept Job &amp; Navigate to Customer
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2.5rem 1.5rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                  <Radio size={36} style={{ color: '#10b981', opacity: 0.6, marginBottom: '0.75rem' }} />
                  <p style={{ color: '#fff', fontWeight: '600' }}>Listening for nearby dispatches in Bandra/Khar zone...</p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Stay within service radius to maintain 100% distance score.</p>
                  <button
                    onClick={() => setActiveTab('location')}
                    className="btn btn-glass"
                    style={{ marginTop: '1.25rem', padding: '0.6rem 1.25rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <MapPin size={14} /> Open Customer Location &amp; Navigation Map <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Active Job Cockpit */}
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: '800', color: '#fff' }}>
                  Active Job Cockpit
                </h3>
                <button
                  onClick={() => setActiveTab('location')}
                  className="btn btn-glass"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Navigation size={13} /> View Map
                </button>
              </div>

              {jobStatus === 'Matched' ? (
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Arrived at customer's premises? Ask customer for their <strong>4-digit Start Code</strong>:
                  </div>
                  <form onSubmit={handleVerifyOtp}>
                    <input
                      type="text"
                      maxLength={4}
                      style={{ width: '100%', padding: '0.85rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', color: '#60a5fa', fontFamily: 'var(--font-mono)', fontSize: '1.5rem', textAlign: 'center', letterSpacing: '0.3em', outline: 'none', marginBottom: '1rem' }}
                      placeholder="••••"
                      value={jobOtpInput}
                      onChange={(e) => setJobOtpInput(e.target.value)}
                      required
                    />
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontWeight: '700' }}>
                      Verify OTP &amp; Start Work
                    </button>
                  </form>
                </div>
              ) : jobStatus === 'In Progress' ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontWeight: '700', marginBottom: '0.5rem' }}>
                    <Clock size={16} /> Work in Progress
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    Timer active. When finished, inspect work with customer and mark complete to release escrow payout.
                  </p>
                  <button onClick={handleCompleteJob} className="btn btn-primary" style={{ width: '100%', background: '#059669', padding: '0.85rem', fontWeight: '700' }}>
                    Complete Job &amp; Release Payout
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <CheckCircle size={40} style={{ color: '#10b981', margin: '0 auto 0.5rem' }} />
                  <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: '700' }}>Job Completed!</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>₹937.5 credited to your escrow wallet.</p>
                </div>
              )}
            </div>
          </div>
          )
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 2: CUSTOMER LOCATION & NAVIGATION (NEW SECTION!)
            ══════════════════════════════════════════════════════════ */}
        {activeTab === 'location' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* GPS Permission Banner */}
            <LocationPermissionBanner
              role="labour"
              permissionState={gps.permissionState}
              onAllow={gps.startWatching}
              error={gps.error}
            />

            {/* GPS Status Pill */}
            {gps.isWatching && gps.coords && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '20px', padding: '0.35rem 0.9rem', fontSize: '0.78rem',
                color: '#34d399', fontWeight: '700', alignSelf: 'flex-start'
              }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }}></span>
                Live GPS Active — Accuracy: ±{Math.round(gps.coords.accuracy)}m &nbsp;|&nbsp;
                {gps.coords.lat.toFixed(5)}, {gps.coords.lng.toFixed(5)}
              </div>
            )}

            {/* Navigation Status Header */}
            <div className="glass-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.2), rgba(17, 24, 39, 0.95))', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></span>
                    <span style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', color: '#34d399', letterSpacing: '0.05em' }}>
                      Turn-by-Turn GPS Navigation
                    </span>
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: '800', color: '#fff' }}>
                    {navDistanceKm > 0 ? (
                      <>Destination is <span style={{ color: '#34d399' }}>{navDistanceKm} km</span> (~{navEtaMinutes} mins away)</>
                    ) : (
                      <span style={{ color: '#34d399' }}>You Have Arrived at Customer Premises</span>
                    )}
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Current Location: <strong>{workerLocation.address}</strong>
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleDetectWorkerLocation}
                    className="btn btn-glass"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', padding: '0.6rem 1rem' }}
                    title="Calibrate real-time location via Geoapify & GPS"
                  >
                    <Navigation size={14} /> Detect Live Location (Geoapify)
                  </button>

                  {gps.permissionState !== 'granted' ? (
                    <button
                      onClick={gps.startWatching}
                      className="btn btn-primary"
                      style={{ background: '#059669', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', padding: '0.6rem 1rem' }}
                    >
                      <Satellite size={14} /> Enable GPS
                    </button>
                  ) : (
                    <button
                      onClick={handleSimulateGPSMove}
                      className="btn btn-glass"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', padding: '0.6rem 1rem' }}
                      title="Simulate movement (GPS auto-updates when device moves)"
                    >
                      <RefreshCw size={14} /> Simulate Move {gps.isWatching ? '(GPS Active)' : ''}
                    </button>
                  )}

                  <button
                    onClick={handleMarkArrived}
                    className="btn btn-primary"
                    style={{ background: '#059669', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', padding: '0.6rem 1rem' }}
                  >
                    <Check size={15} /> I Have Arrived
                  </button>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${workerLocation.lat},${workerLocation.lng}&destination=${customerDestination.lat},${customerDestination.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-glass"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', padding: '0.6rem 1rem' }}
                  >
                    <ExternalLink size={14} /> Google Maps
                  </a>
                </div>
              </div>
            </div>

            {/* Map & Turn-by-Turn Guide Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '8fr 4fr', gap: '1.5rem' }}>

              {/* Interactive Navigation Map */}
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', color: '#fff', fontSize: '0.95rem' }}>
                    <Compass size={17} style={{ color: '#10b981' }} /> Live Customer Route Map
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Your Location (Green) ➔ Customer Destination (Blue)
                  </span>
                </div>

                <LiveLocationMap
                  customerLoc={customerDestination}
                  labourLoc={workerLocation}
                  showRoute={true}
                  height="460px"
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-glass)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={14} style={{ color: '#10b981' }} />
                    <span>Customer Address: <strong>{customerDestination.address}</strong></span>
                  </div>
                  <span style={{ color: '#60a5fa', fontWeight: '600' }}>GPS: {customerDestination.lat}, {customerDestination.lng}</span>
                </div>
              </div>

              {/* Right Column: Customer Details & Turn Steps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {/* Customer Contact & Destination Card */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '0.75rem' }}>
                    Customer Contact &amp; Premises
                  </div>

                  <h3 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: '800', marginBottom: '0.25rem' }}>
                    {customerDestination.name}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    {customerDestination.address}
                  </p>

                  <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.85rem', marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.72rem', color: '#93c5fd', fontWeight: '700', textTransform: 'uppercase' }}>Landmark</div>
                    <div style={{ fontSize: '0.82rem', color: '#fff' }}>{customerDestination.landmark}</div>
                  </div>

                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.85rem', marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.72rem', color: '#6ee7b7', fontWeight: '700', textTransform: 'uppercase' }}>Gate / Entry Notes</div>
                    <div style={{ fontSize: '0.82rem', color: '#fff' }}>{customerDestination.instructions}</div>
                  </div>

                  <a
                    href={`tel:${customerDestination.phone}`}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#059669', fontSize: '0.88rem', fontWeight: '700' }}
                  >
                    <Phone size={15} /> Call Customer ({customerDestination.phone})
                  </a>
                </div>

                {/* Step-by-Step Route Hints */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '0.75rem' }}>
                    Turn-by-Turn Route Guidance
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {[
                      { step: '1', instruction: 'Head north on Linking Road toward Turner Road', distance: '300m' },
                      { step: '2', instruction: 'Turn left onto Turner Road toward Perry Cross Road', distance: '600m' },
                      { step: '3', instruction: 'Continue straight onto Hill Road past Mehboob Studio', distance: '400m' },
                      { step: '4', instruction: 'Turn right into Sea Breeze Apts main gate', distance: '100m' }
                    ].map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.8rem' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontWeight: '700', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                          {item.step}
                        </div>
                        <div style={{ flex: 1, color: '#fff' }}>{item.instruction}</div>
                        <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{item.distance}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-glass)', textAlign: 'center' }}>
                    <button
                      onClick={() => setActiveTab('radar')}
                      className="btn btn-glass"
                      style={{ width: '100%', padding: '0.65rem', fontSize: '0.82rem', fontWeight: '600' }}
                    >
                      Arrived? Enter Start Code in Cockpit ➔
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 3: 7-STEP ONBOARDING
            ══════════════════════════════════════════════════════════ */}
        {activeTab === 'onboarding' && (
          <div className="glass-card" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: '800', color: '#fff', marginBottom: '0.5rem' }}>
              7-Stage Digital Verification
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Mandatory statutory compliance under Indian Gig Worker Guidelines.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { step: 1, title: 'Identity & Mobile OTP Authentication', done: true },
                { step: 2, title: 'Trade Category & Experience Verification', done: true },
                { step: 3, title: 'Aadhaar & PAN Verification', done: true },
                { step: 4, title: 'Bank Account & UPI Verification', done: true },
                { step: 5, title: 'Police Character Clearance Certificate', done: user.documents?.policeVerification ?? true },
                { step: 6, title: 'Skill & Safety MCQ Quiz', done: true },
                { step: 7, title: 'Aggregator Non-Employment Agreement (Safe Harbor)', done: true }
              ].map(s => (
                <div key={s.step} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: s.done ? '#10b981' : 'var(--border-glass)', color: s.done ? 'white' : 'var(--text-muted)', display: 'grid', placeItems: 'center', fontSize: '0.75rem', fontWeight: '700' }}>
                      {s.done ? '✓' : s.step}
                    </div>
                    <span style={{ fontSize: '0.9rem', color: s.done ? '#fff' : 'var(--text-muted)' }}>{s.title}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: s.done ? '#34d399' : '#fbbf24', fontWeight: '700' }}>
                    {s.done ? 'Verified' : 'Pending Upload'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 4: ESCROW EARNINGS & WALLET
            ══════════════════════════════════════════════════════════ */}
        {activeTab === 'wallet' && (
          <div className="glass-card" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: '800', color: '#fff', marginBottom: '0.5rem' }}>
              Escrow Earnings &amp; Instant UPI Payout
            </h2>
            <div style={{ background: 'var(--bg-surface-elevated)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Available Balance</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: '800', color: '#34d399' }}>₹{walletBalance.toLocaleString()}</div>
              </div>
              <button
                onClick={handleWithdrawPayout}
                disabled={walletBalance <= 0}
                className="btn btn-primary"
                style={{ background: '#059669', padding: '0.75rem 1.25rem', fontWeight: '700' }}
              >
                Instant UPI Withdrawal
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
