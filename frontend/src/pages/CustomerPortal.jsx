import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Home, ShieldCheck, LogOut, Clock, UserCheck, AlertTriangle, Zap,
  CheckCircle, MapPin, Navigation, Phone, ExternalLink, Compass,
  Share2, Shield, Calendar, ArrowRight, RefreshCw
} from 'lucide-react';
import { Toast } from '../components/Toast';
import { LiveLocationMap } from '../components/LiveLocationMap';
import { useGeolocation } from '../hooks/useGeolocation';
import { LocationPermissionBanner } from '../components/LocationPermissionBanner';
import { getRealtimeLocation, searchAddress, reverseGeocode } from '../services/geoapifyService';

export const CustomerPortal = () => {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('book'); // 'book' | 'location' | 'history'
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [pricingType, setPricingType] = useState('Hourly');
  const [duration, setDuration] = useState(3);
  const [isEmergency, setIsEmergency] = useState(false);
  const [quote, setQuote] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Active Job Timer simulation
  const [timerSeconds, setTimerSeconds] = useState(1420);
  const [timerRunning, setTimerRunning] = useState(true);

  // Dispute modal state
  const [disputeBookingId, setDisputeBookingId] = useState(null);
  const [disputeReason, setDisputeReason] = useState('');

  // Booking location permission prompt modal
  const [showBookingLocationPrompt, setShowBookingLocationPrompt] = useState(false);

  // Active booking if any
  const activeBooking = bookings.find(b => b.status === 'In Progress' || b.status === 'Matched');

  // Live Location & ETA State (null when no active booking)
  const [etaMinutes, setEtaMinutes] = useState(null);
  const [distanceKm, setDistanceKm] = useState(null);
  const [trackingStatus, setTrackingStatus] = useState(null);
  const [gateNotes, setGateNotes] = useState('');

  // Coordinates (defaults to null or user address, populated by Geoapify real-time)
  const [customerLocation, setCustomerLocation] = useState({
    lat: null,
    lng: null,
    address: user.address || '',
    name: user.name || 'Customer',
    landmark: ''
  });

  // Assigned labour worker location (only populated if an active booking exists)
  const [labourLocation, setLabourLocation] = useState(null);

  // Address search autocomplete state
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isLocating, setIsLocating] = useState(false);

  // Real browser GPS for customer home pin / current location
  const gps = useGeolocation();

  // Auto-detect Shivam's real-time location via Geoapify & GPS on mount
  useEffect(() => {
    async function initUserLocation() {
      try {
        setIsLocating(true);
        const loc = await getRealtimeLocation();
        if (loc) {
          setCustomerLocation(prev => ({
            ...prev,
            lat: loc.lat,
            lng: loc.lng,
            address: prev.address && !prev.address.includes('Mumbai') ? prev.address : loc.formatted,
            name: user.name || 'Shivam',
            landmark: loc.landmark || prev.landmark
          }));
        }
      } catch (err) {
        console.warn('[CustomerPortal] Auto location init:', err);
      } finally {
        setIsLocating(false);
      }
    }
    initUserLocation();
  }, [user.name]);

  // Sync real GPS coords into customerLocation if available
  useEffect(() => {
    if (gps.coords) {
      setCustomerLocation(prev => ({
        ...prev,
        lat: parseFloat(gps.coords.lat.toFixed(5)),
        lng: parseFloat(gps.coords.lng.toFixed(5))
      }));
    }
  }, [gps.coords]);

  // Fetch services and customer bookings on mount
  useEffect(() => {
    async function loadData() {
      try {
        const srvList = await api.getServices();
        setServices(srvList);
        if (srvList.length > 0) setSelectedService(srvList[0]);

        const bkList = await api.getBookings();
        setBookings(bkList);

        // If there's an active booking with location data, sync state
        const active = bkList.find(b => b.status === 'In Progress' || b.status === 'Matched');
        if (active) {
          if (active.customerLocation) {
            setCustomerLocation({
              lat: active.customerLocation.lat,
              lng: active.customerLocation.lng,
              address: active.customerLocation.address,
              name: active.customerName || user.name,
              landmark: active.customerLocation.landmark || ''
            });
            if (active.customerLocation.instructions) {
              setGateNotes(active.customerLocation.instructions);
            }
          }
          if (active.labourLocation && active.labourName) {
            setLabourLocation({
              lat: active.labourLocation.lat,
              lng: active.labourLocation.lng,
              address: active.labourLocation.address || 'In transit',
              name: active.labourName,
              trade: active.serviceName || 'Verified Professional'
            });
          } else {
            setLabourLocation(null);
          }
          if (active.etaMinutes !== undefined) setEtaMinutes(active.etaMinutes);
          if (active.distanceKm !== undefined) setDistanceKm(active.distanceKm);
          if (active.trackingStatus) setTrackingStatus(active.trackingStatus);
        } else {
          setLabourLocation(null);
          setEtaMinutes(null);
          setDistanceKm(null);
          setTrackingStatus(null);
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  // Recalculate quote whenever parameters change
  useEffect(() => {
    if (!selectedService) return;
    async function fetchQuote() {
      try {
        const res = await api.getQuote({
          serviceId: selectedService.serviceId || selectedService.id,
          pricingType,
          duration,
          isEmergency
        });
        setQuote(res.quote);
      } catch (err) {
        console.error('Quote error:', err);
      }
    }
    fetchQuote();
  }, [selectedService, pricingType, duration, isEmergency]);

  // Live Timer
  useEffect(() => {
    let interval = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTimer = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0');
    const secs = (totalSec % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const handleBookNow = () => {
    // If user denied/skipped location earlier, ask at booking time as requested:
    if (gps.permissionState !== 'granted' && !gps.coords) {
      setShowBookingLocationPrompt(true);
      return;
    }
    executeBooking();
  };

  const executeBooking = async (coordsOverride = null) => {
    try {
      const activeLat = coordsOverride?.lat || customerLocation.lat || 19.0596;
      const activeLng = coordsOverride?.lng || customerLocation.lng || 72.8295;

      const res = await api.createBooking({
        customerId: user.id || user._id,
        customerName: user.name,
        customerPhone: user.phone,
        address: customerLocation.address || user.address || 'A-402, Sea Breeze Apts, Bandra West, Mumbai',
        serviceId: selectedService.serviceId || selectedService.id,
        duration,
        pricingType,
        isEmergency,
        customerLocation: {
          address: customerLocation.address || user.address || 'A-402, Sea Breeze Apts, Bandra West, Mumbai',
          lat: activeLat,
          lng: activeLng,
          landmark: customerLocation.landmark || 'Near Mehboob Studio',
          instructions: gateNotes,
          phone: user.phone || '9876543210'
        }
      });
      setBookings([res.booking, ...bookings]);
      setToast({
        title: 'Booking Confirmed!',
        body: `₹${res.quote?.totalCustomerAmount || quote?.totalCustomerAmount || 0} securely held in Escrow. Worker assigned and en route!`,
        type: 'success'
      });
      // Switch directly to the location tracking section to see the worker!
      setActiveTab('location');
    } catch (err) {
      setToast({ title: 'Booking Failed', body: err.message, type: 'danger' });
    }
  };

  const handleFileDispute = async (e) => {
    e.preventDefault();
    try {
      await api.createDispute({
        bookingId: disputeBookingId,
        raisedBy: `${user.name} (Customer)`,
        reason: disputeReason,
        escrowHeld: 950
      });
      setToast({ title: 'Dispute Filed', body: 'Escrow payment frozen pending admin resolution.', type: 'warning' });
      setDisputeBookingId(null);
      setDisputeReason('');
    } catch (err) {
      setToast({ title: 'Error', body: err.message, type: 'danger' });
    }
  };

  // Simulate worker movement closer to customer
  const handleSimulateMovement = () => {
    if (!labourLocation) return;
    const workerName = activeBooking?.labourName || 'Your assigned professional';
    if (etaMinutes <= 1) {
      setEtaMinutes(0);
      setDistanceKm(0);
      setTrackingStatus('Arrived at Building Gate');
      setLabourLocation(prev => ({
        ...prev,
        lat: customerLocation.lat + 0.0002,
        lng: customerLocation.lng + 0.0002,
        address: 'Customer Gate'
      }));
      setToast({ title: 'Worker Has Arrived!', body: `${workerName} is at your building entrance. Please share your Start Code.`, type: 'success' });
      return;
    }

    const nextEta = Math.max(1, etaMinutes - 2);
    const nextDist = Math.max(0.2, parseFloat((distanceKm - 0.35).toFixed(1)));
    setEtaMinutes(nextEta);
    setDistanceKm(nextDist);

    // Interpolate worker closer towards customer
    setLabourLocation(prev => ({
      ...prev,
      lat: prev.lat + (customerLocation.lat - prev.lat) * 0.3,
      lng: prev.lng + (customerLocation.lng - prev.lng) * 0.3,
      address: nextEta <= 3 ? 'Approaching Building Gate' : prev.address
    }));
    setTrackingStatus(nextEta <= 3 ? 'Approaching Building Gate' : 'En Route');
    setToast({ title: 'Live Update', body: `Worker is now ${nextEta} mins (${nextDist} km) away.`, type: 'info' });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      {/* Toast */}
      {toast && <Toast title={toast.title} body={toast.body} type={toast.type} onClose={() => setToast(null)} />}

      {/* Customer Header */}
      <header style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-glass)', padding: '0.75rem 2rem', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', display: 'grid', placeItems: 'center', color: 'white' }}>
                <Home size={20} />
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>
                Labour<span style={{ color: '#3b82f6' }}>Link</span>
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', background: 'rgba(37, 99, 235, 0.15)', color: '#60a5fa', border: '1px solid rgba(37, 99, 235, 0.3)', padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
              Customer Portal
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#34d399', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', padding: '0.35rem 0.85rem', borderRadius: '20px' }}>
            <ShieldCheck size={15} />
            <span>100% Escrow Protection Active</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: '30px', padding: '0.35rem 0.9rem 0.35rem 0.5rem' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#2563eb', color: 'white', fontWeight: '700', display: 'grid', placeItems: 'center', fontSize: '0.85rem' }}>
                {user.name?.charAt(0) || 'C'}
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff' }}>{user.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{user.city || 'Mumbai'} • {user.tier || 'Gold'} Member</div>
              </div>
            </div>
            <button onClick={logout} className="btn-logout" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'transparent', border: '1px solid var(--border-glass)', color: 'var(--text-muted)', borderRadius: '8px', padding: '0.45rem 0.8rem', fontSize: '0.82rem', cursor: 'pointer' }}>
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.75rem 1.5rem', width: '100%', flex: 1 }}>

        {/* Top Section Navigation Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('book')}
            className={`pill-btn ${activeTab === 'book' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 1.15rem' }}
          >
            <Zap size={15} /> Book Service &amp; Cockpit
          </button>
          <button
            onClick={() => setActiveTab('location')}
            className={`pill-btn ${activeTab === 'location' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 1.15rem', position: 'relative' }}
          >
            <MapPin size={15} style={{ color: '#34d399' }} />
            <span>Live Worker Location &amp; ETA</span>
            {activeBooking && (
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%', background: '#10b981',
                boxShadow: '0 0 8px #10b981', animation: 'pulse-ring 1.8s infinite'
              }}></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pill-btn ${activeTab === 'history' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 1.15rem' }}
          >
            <Calendar size={15} /> Booking History &amp; Escrow ({bookings.length})
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════
            TAB 1: BOOK SERVICE & COCKPIT
            ══════════════════════════════════════════════════════════ */}
        {activeTab === 'book' && (
          <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '1.5rem' }}>

            {/* Left Column: Booking Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="glass-card" style={{ padding: '1.75rem' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '800', color: '#fff', marginBottom: '0.35rem' }}>
                  Book Verified Professional
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  Choose trade service, duration, and inspect upfront transparent price.
                </p>

                {/* Service Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {services.map(srv => (
                    <div
                      key={srv.serviceId || srv.id}
                      onClick={() => setSelectedService(srv)}
                      style={{
                        background: (selectedService?.serviceId || selectedService?.id) === (srv.serviceId || srv.id) ? 'rgba(37, 99, 235, 0.15)' : 'var(--bg-surface-elevated)',
                        border: `1.5px solid ${(selectedService?.serviceId || selectedService?.id) === (srv.serviceId || srv.id) ? '#3b82f6' : 'var(--border-glass)'}`,
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#fff' }}>{srv.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#60a5fa', marginTop: '0.2rem' }}>₹{srv.baseHourlyRate}/hr • {srv.skillLevel}</div>
                    </div>
                  ))}
                </div>

                {/* Pricing & Duration Config */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                      Pricing Structure
                    </label>
                    <select
                      style={{ width: '100%', padding: '0.7rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                      value={pricingType}
                      onChange={(e) => setPricingType(e.target.value)}
                    >
                      <option value="Hourly">Hourly Rate (Flexible duration)</option>
                      <option value="Daily">Full Day Shift (8 Hours)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                      {pricingType === 'Hourly' ? 'Duration (Hours)' : 'Work Days'}
                    </label>
                    <input
                      type="number"
                      style={{ width: '100%', padding: '0.7rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                      value={duration}
                      onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      max="24"
                    />
                  </div>
                </div>

                {/* Destination Location with Geoapify Search & Real-Time Detection */}
                <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label style={{ fontSize: '0.76rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Service Destination Address
                    </label>
                    <button
                      type="button"
                      disabled={isLocating}
                      onClick={async () => {
                        try {
                          setIsLocating(true);
                          const loc = await getRealtimeLocation();
                          if (loc) {
                            setCustomerLocation(prev => ({
                              ...prev,
                              lat: loc.lat,
                              lng: loc.lng,
                              address: loc.formatted,
                              landmark: loc.landmark || prev.landmark
                            }));
                            setToast({
                              title: 'Real-Time Location Captured',
                              body: `${loc.formatted} (${loc.source === 'gps' ? 'Device GPS' : 'Geoapify IP Geolocation'})`,
                              type: 'success'
                            });
                          }
                        } catch (e) {
                          setToast({ title: 'Location Error', body: e.message || 'Could not fetch location', type: 'danger' });
                        } finally {
                          setIsLocating(false);
                        }
                      }}
                      style={{
                        background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.35)',
                        borderRadius: '6px', color: '#60a5fa', fontSize: '0.72rem', padding: '0.25rem 0.65rem',
                        cursor: isLocating ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '700'
                      }}
                    >
                      <Navigation size={12} className={isLocating ? 'spin' : ''} />
                      {isLocating ? 'Detecting Real Location...' : '📍 Detect My Live Location (Geoapify)'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', padding: '0.65rem 0.85rem' }}>
                    <MapPin size={16} style={{ color: '#3b82f6', flexShrink: 0 }} />
                    <input
                      type="text"
                      style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
                      value={customerLocation.address || ''}
                      onChange={async (e) => {
                        const val = e.target.value;
                        setCustomerLocation(prev => ({ ...prev, address: val }));
                        if (val.trim().length >= 3) {
                          const hits = await searchAddress(val, { limit: 5 });
                          setAddressSuggestions(hits);
                        } else {
                          setAddressSuggestions([]);
                        }
                      }}
                      placeholder="Search address, landmark, colony, or city via Geoapify..."
                    />
                  </div>

                  {/* Geoapify Address Autocomplete Suggestions Dropdown */}
                  {addressSuggestions.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 600,
                      background: 'rgba(15, 23, 42, 0.98)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(59, 130, 246, 0.4)',
                      borderRadius: '8px',
                      marginTop: '4px',
                      overflow: 'hidden',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.6)'
                    }}>
                      {addressSuggestions.map((sugg) => (
                        <div
                          key={sugg.id}
                          onClick={() => {
                            setCustomerLocation(prev => ({
                              ...prev,
                              lat: parseFloat(sugg.lat.toFixed(5)),
                              lng: parseFloat(sugg.lng.toFixed(5)),
                              address: sugg.label,
                              landmark: sugg.name || prev.landmark
                            }));
                            setAddressSuggestions([]);
                            setToast({
                              title: 'Address Geocoded',
                              body: `Pinned: ${sugg.lat.toFixed(4)}, ${sugg.lng.toFixed(4)}`,
                              type: 'success'
                            });
                          }}
                          style={{
                            padding: '0.65rem 0.85rem',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
                            cursor: 'pointer',
                            fontSize: '0.82rem',
                            color: '#fff',
                            transition: 'background 0.15s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ fontWeight: '600', color: '#93c5fd' }}>{sugg.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{sugg.label}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {customerLocation.lat && customerLocation.lng && (
                    <div style={{ fontSize: '0.72rem', color: '#34d399', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <CheckCircle size={12} /> Geoapify Pinned: {customerLocation.lat.toFixed(4)}, {customerLocation.lng.toFixed(4)}
                    </div>
                  )}
                </div>

                {/* Emergency Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Zap size={15} /> Need worker within 60 minutes?
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      Emergency dispatch surge (+25%) applies to prioritize immediate arrival.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    checked={isEmergency}
                    onChange={(e) => setIsEmergency(e.target.checked)}
                  />
                </div>

                {/* Upfront Price Breakdown Card */}
                {quote && (
                  <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700', marginBottom: '0.75rem' }}>
                      Transparent Upfront Escrow Quote
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.4rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Base Labour Charge ({quote.duration} {quote.pricingType === 'Hourly' ? 'hrs' : 'days'})</span>
                      <strong>₹{quote.baseLabourCharge}</strong>
                    </div>
                    {quote.surgeMultiplier > 1 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#fbbf24', marginBottom: '0.4rem' }}>
                        <span>Surge Multiplier ({quote.surgeMultiplier}×)</span>
                        <span>+₹{quote.surgedLabourCharge - quote.baseLabourCharge}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.75rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Convenience &amp; Escrow Guarantee</span>
                      <strong>₹{quote.convenienceFee}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-glass)' }}>
                      <span style={{ fontWeight: '700', fontSize: '1.05rem', color: '#fff' }}>Total Escrow Deposit</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: '800', color: '#34d399' }}>
                        ₹{quote.totalCustomerAmount}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleBookNow}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <ShieldCheck size={18} /> Lock ₹{quote?.totalCustomerAmount || 0} in Escrow &amp; Confirm Worker
                </button>
              </div>
            </div>

            {/* Right Column: Active Jobs & Live Tracker */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {activeBooking ? (
                /* Live Active Job Card */
                <div className="glass-card" style={{ padding: '1.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: '800', color: '#fff' }}>
                      Live Active Job Tracker
                    </h3>
                    <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontSize: '0.72rem', fontWeight: '700', padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
                      {activeBooking.status || 'In Progress'}
                    </span>
                  </div>

                  {/* OTP Pill */}
                  <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Provide This Start Code to Worker on Arrival
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: '800', color: '#60a5fa', letterSpacing: '0.2em', marginTop: '0.25rem' }}>
                      {activeBooking.startOtp || '8492'}
                    </div>
                  </div>

                  {/* Live ETA Card preview */}
                  {etaMinutes !== null && (
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Worker Arrival ETA</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Clock size={16} /> ~{etaMinutes} Mins ({distanceKm} km away)
                        </div>
                      </div>
                      <span style={{ fontSize: '0.75rem', background: '#064e3b', color: '#6ee7b7', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: '700' }}>
                        {trackingStatus || 'En Route'}
                      </span>
                    </div>
                  )}

                  {/* Primary Button to Switch to Location Tab */}
                  <button
                    onClick={() => setActiveTab('location')}
                    className="btn btn-primary"
                    style={{ width: '100%', marginBottom: '1.25rem', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #059669, #047857)', fontWeight: '700' }}
                  >
                    <MapPin size={16} /> Track Worker Live Location on Map <ArrowRight size={15} />
                  </button>

                  {/* Timer */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <Clock size={16} /> Elapsed Work Duration
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: '700', color: '#34d399' }}>
                      {formatTimer(timerSeconds)}
                    </div>
                  </div>

                  {/* Assigned Worker Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0', borderTop: '1px solid var(--border-glass)' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#059669', display: 'grid', placeItems: 'center', color: 'white', fontWeight: '700' }}>
                      {(activeBooking.labourName || 'W')[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', color: '#fff', fontSize: '0.9rem' }}>
                        {activeBooking.labourName || 'Assigned Professional'} ({activeBooking.serviceName || 'Service Pro'})
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#34d399' }}>★ 4.9 • Verified Background • Escrow Protected</div>
                    </div>
                  </div>
                </div>
              ) : (
                /* No Active Job Card */
                <div className="glass-card" style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.12)', border: '1.5px solid #3b82f6', display: 'grid', placeItems: 'center', margin: '0 auto 1.25rem', fontSize: '1.5rem' }}>
                    📍
                  </div>
                  <h3 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: '800', marginBottom: '0.4rem' }}>
                    Welcome to LabourLink, {user.name || 'Shivam'}!
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto 1.5rem', lineHeight: '1.5' }}>
                    You currently have no active service requests. Select a service on the left to get instant quotes, lock payment safely in Escrow, and dispatch a verified professional to your address.
                  </p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '20px', padding: '0.4rem 1rem', fontSize: '0.8rem', color: '#34d399', fontWeight: '600' }}>
                    <CheckCircle size={15} /> 100% Escrow Protection • Live GPS Telemetry
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 2: LOCATION & REAL-TIME ETA TRACKING (NEW SECTION!)
            ══════════════════════════════════════════════════════════ */}
        {activeTab === 'location' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Browser Location Permission Banner */}
            <LocationPermissionBanner
              role="customer"
              permissionState={gps.permissionState}
              onAllow={gps.startWatching}
              error={gps.error}
            />

            {/* GPS Status Pill */}
            {gps.coords && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '20px', padding: '0.35rem 0.9rem', fontSize: '0.78rem',
                color: '#60a5fa', fontWeight: '700', alignSelf: 'flex-start'
              }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 6px #3b82f6' }}></span>
                Live Customer Pin Active — Accuracy: ±{Math.round(gps.coords.accuracy || 10)}m &nbsp;|&nbsp;
                {gps.coords.lat.toFixed(5)}, {gps.coords.lng.toFixed(5)}
              </div>
            )}

            {activeBooking && labourLocation ? (
              <>
                {/* Top ETA & Live Status Banner */}
                <div className="glass-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(30, 58, 138, 0.35))', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></span>
                        <span style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', color: '#60a5fa', letterSpacing: '0.05em' }}>
                          Real-Time GPS Dispatch Tracking
                        </span>
                      </div>
                      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: '800', color: '#fff' }}>
                        Labour is <span style={{ color: '#34d399' }}>~{etaMinutes || 10} Minutes Away</span>
                      </h2>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {trackingStatus || 'En Route'} • Distance remaining: <strong style={{ color: '#fff' }}>{distanceKm || 1.2} km</strong>
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <button
                        onClick={handleSimulateMovement}
                        className="btn btn-glass"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', padding: '0.6rem 1rem' }}
                        title="Simulate worker riding closer"
                      >
                        <RefreshCw size={14} /> Simulate Moving Closer
                      </button>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&origin=${labourLocation.lat},${labourLocation.lng}&destination=${customerLocation.lat},${customerLocation.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', padding: '0.6rem 1rem' }}
                      >
                        <ExternalLink size={14} /> Open in Google Maps
                      </a>
                    </div>
                  </div>

                  {/* Progress Milestones Bar */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-glass)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#10b981', color: 'white', display: 'grid', placeItems: 'center', fontSize: '0.75rem', fontWeight: '700' }}>✓</div>
                      <span style={{ fontSize: '0.78rem', color: '#fff', fontWeight: '600' }}>Service Booked</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#10b981', color: 'white', display: 'grid', placeItems: 'center', fontSize: '0.75rem', fontWeight: '700' }}>✓</div>
                      <span style={{ fontSize: '0.78rem', color: '#fff', fontWeight: '600' }}>Worker Assigned</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: etaMinutes > 0 ? '#3b82f6' : '#10b981', color: 'white', display: 'grid', placeItems: 'center', fontSize: '0.75rem', fontWeight: '700' }}>
                        {etaMinutes > 0 ? '3' : '✓'}
                      </div>
                      <span style={{ fontSize: '0.78rem', color: etaMinutes > 0 ? '#60a5fa' : '#fff', fontWeight: '700' }}>
                        {etaMinutes > 0 ? 'On The Way (Live)' : 'Arrived on Site'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--border-glass)', color: 'var(--text-muted)', display: 'grid', placeItems: 'center', fontSize: '0.75rem', fontWeight: '700' }}>4</div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Work In Progress</span>
                    </div>
                  </div>
                </div>

                {/* Map & Worker Tracking Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '8fr 4fr', gap: '1.5rem' }}>
                  {/* Interactive Live Map */}
                  <div className="glass-card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', color: '#fff', fontSize: '0.95rem' }}>
                        <Compass size={17} style={{ color: '#34d399' }} /> Live Route &amp; Destination Map
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Powered by Geoapify &amp; Live Telemetry
                      </span>
                    </div>

                    <LiveLocationMap
                      customerLoc={customerLocation}
                      labourLoc={labourLocation}
                      showRoute={true}
                      height="460px"
                    />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-glass)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <MapPin size={14} style={{ color: '#3b82f6' }} />
                        <span>Destination: <strong>{customerLocation.address}</strong></span>
                      </div>
                      <span style={{ color: '#34d399', fontWeight: '600' }}>GPS Coordinates: {customerLocation.lat?.toFixed?.(4)}, {customerLocation.lng?.toFixed?.(4)}</span>
                    </div>
                  </div>

                  {/* Right Side: Assigned Labour Profile & Security Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                      <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '0.75rem' }}>
                        Assigned Service Professional
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #059669, #10b981)', display: 'grid', placeItems: 'center', color: 'white', fontWeight: '800', fontSize: '1.15rem' }}>
                          {(activeBooking.labourName || 'W')[0]}
                        </div>
                        <div>
                          <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: '800' }}>{activeBooking.labourName || 'Assigned Worker'}</h4>
                          <div style={{ color: '#34d399', fontSize: '0.8rem', fontWeight: '600' }}>{activeBooking.serviceName || 'Certified Pro'} • ★ 4.9 Verified</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Dispatched via LabourLink Smart Dispatch</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#34d399' }}>
                          <CheckCircle size={14} /> Police Character Clearance Verified
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#34d399' }}>
                          <ShieldCheck size={14} /> Aadhaar &amp; Skill Competency Certified
                        </div>
                      </div>

                      <a
                        href={`tel:${activeBooking.labourPhone || '+919876500001'}`}
                        className="btn btn-glass"
                        style={{ width: '100%', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.88rem', fontWeight: '700' }}
                      >
                        <Phone size={15} /> Call {activeBooking.labourName || 'Worker'}
                      </a>
                    </div>

                    {/* Start Code OTP Card */}
                    <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                      <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#93c5fd', fontWeight: '700', marginBottom: '0.35rem' }}>
                        Work Start Verification Code
                      </div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                        Share this 4-digit code with the worker only after they physically reach your location:
                      </p>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.2rem', fontWeight: '800', color: '#60a5fa', letterSpacing: '0.25em', textAlign: 'center', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', padding: '0.5rem' }}>
                        {activeBooking.startOtp || '8492'}
                      </div>
                    </div>

                    {/* Gate & Entry Instructions Card */}
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                        <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700' }}>
                          Arrival Notes for Worker
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#60a5fa' }}>Saved</span>
                      </div>
                      <textarea
                        style={{ width: '100%', padding: '0.7rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '0.82rem', resize: 'none', minHeight: '60px', outline: 'none' }}
                        value={gateNotes}
                        onChange={(e) => setGateNotes(e.target.value)}
                        placeholder="e.g. Tower B, Flat 402, Ring bell twice..."
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* No Active Booking: Show Only Customer's Real-Time Location Map */
              <div style={{ display: 'grid', gridTemplateColumns: '8fr 4fr', gap: '1.5rem' }}>
                <div className="glass-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', color: '#fff', fontSize: '0.95rem' }}>
                      <Compass size={17} style={{ color: '#3b82f6' }} /> Your Real-Time Verified Location
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#34d399', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: '700' }}>
                      Geoapify Calibrated
                    </span>
                  </div>

                  <LiveLocationMap
                    customerLoc={customerLocation}
                    labourLoc={null}
                    showRoute={false}
                    height="460px"
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-glass)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={14} style={{ color: '#3b82f6' }} />
                      <span>Address: <strong>{customerLocation.address || 'Real-time location detected'}</strong></span>
                    </div>
                    <span style={{ color: '#60a5fa', fontWeight: '600' }}>
                      GPS: {customerLocation.lat ? `${customerLocation.lat.toFixed(4)}, ${customerLocation.lng.toFixed(4)}` : 'Calibrating...'}
                    </span>
                  </div>
                </div>

                {/* Right Column: Dispatch Status & One-Click Booking CTA */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '0.75rem' }}>
                      Dispatch Radar Status
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
                      <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.15)', border: '1.5px solid #3b82f6', display: 'grid', placeItems: 'center', color: '#60a5fa', fontSize: '1.2rem' }}>
                        🏠
                      </div>
                      <div>
                        <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: '800' }}>No Worker Dispatched</h4>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Standby for booking request</div>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                      Your real-time coordinates have been captured with high precision. When you book a service, nearby certified workers will be matched, and live turn-by-turn road navigation will activate right here.
                    </p>

                    <button
                      onClick={() => setActiveTab('book')}
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '0.9rem' }}
                    >
                      Book a Service Now <ArrowRight size={16} />
                    </button>
                  </div>

                  <div className="glass-card" style={{ padding: '1.25rem' }}>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#34d399', fontWeight: '700', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <ShieldCheck size={16} /> Escrow Protection Guarantee
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                      Funds remain securely protected in Escrow and are only transferred to the assigned worker after your 4-digit start code verification and final inspection.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 3: PAST BOOKINGS & DISPUTE CENTER
            ══════════════════════════════════════════════════════════ */}
        {activeTab === 'history' && (
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: '800', color: '#fff', marginBottom: '0.5rem' }}>
              Your Escrow Bookings History
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              All payments remain in statutory escrow protection until verified completion.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {bookings.map(b => (
                <div
                  key={b.bookingId || b.id}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', flexWrap: 'wrap', gap: '1rem' }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                      <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{b.serviceName || 'Service'}</strong>
                      <span style={{ fontSize: '0.75rem', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', padding: '0.15rem 0.5rem', borderRadius: '12px', fontWeight: '700' }}>
                        {b.bookingId || b.id}
                      </span>
                      <span style={{ fontSize: '0.72rem', background: b.status === 'Completed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: b.status === 'Completed' ? '#34d399' : '#fbbf24', padding: '0.15rem 0.5rem', borderRadius: '12px', fontWeight: '700' }}>
                        {b.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Worker: {b.labourName || 'Assigned Pro'} • {b.customerLocation?.address || 'Bandra West, Mumbai'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', fontSize: '1.15rem', color: '#34d399' }}>₹{b.totalAmount}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Escrow Protected</div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => {
                          if (b.customerLocation) setCustomerLocation(prev => ({ ...prev, ...b.customerLocation }));
                          if (b.labourLocation) setLabourLocation(prev => ({ ...prev, ...b.labourLocation }));
                          setActiveTab('location');
                        }}
                        className="btn btn-glass"
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <MapPin size={13} /> View Location
                      </button>

                      <button
                        onClick={() => setDisputeBookingId(b.bookingId || b.id)}
                        style={{ background: 'none', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', fontSize: '0.75rem', cursor: 'pointer', padding: '0.45rem 0.85rem', borderRadius: '6px' }}
                      >
                        Report Issue
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Dispute Modal */}
      {disputeBookingId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 999, display: 'grid', placeItems: 'center', padding: '1.5rem' }}>
          <div className="glass-card" style={{ maxWidth: '480px', width: '100%', padding: '2rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: '800', color: '#fff', marginBottom: '0.5rem' }}>
              File Ticket on {disputeBookingId}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Escrow payment will be held securely until our operations team verifies your claim.
            </p>
            <form onSubmit={handleFileDispute}>
              <textarea
                style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', color: 'white', minHeight: '100px', outline: 'none', marginBottom: '1.25rem' }}
                placeholder="Explain what went wrong (e.g. worker arrived late, work incomplete)..."
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setDisputeBookingId(null)} className="btn btn-glass" style={{ padding: '0.5rem 1rem' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem', background: '#ef4444' }}>
                  Submit Ticket &amp; Freeze Funds
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Time Location Permission Modal */}
      {showBookingLocationPrompt && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'grid', placeItems: 'center', padding: '1.5rem' }}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: '2rem', textAlign: 'center', background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.98), rgba(30, 58, 138, 0.4))', border: '1px solid rgba(59, 130, 246, 0.4)', borderRadius: '20px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.2)', border: '2px solid #3b82f6', display: 'grid', placeItems: 'center', margin: '0 auto 1.25rem', color: '#60a5fa', boxShadow: '0 0 20px rgba(59, 130, 246, 0.35)' }}>
              <MapPin size={32} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: '800', color: '#fff', marginBottom: '0.6rem' }}>
              Allow Location Access to Book
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
              Your assigned service professional requires your GPS coordinates to navigate to your building and calculate real-time arrival countdowns.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={async () => {
                  try {
                    gps.startWatching();
                    const pos = await gps.getOnce();
                    setCustomerLocation(prev => ({
                      ...prev,
                      lat: parseFloat(pos.lat.toFixed(5)),
                      lng: parseFloat(pos.lng.toFixed(5))
                    }));
                    setShowBookingLocationPrompt(false);
                    executeBooking({
                      lat: parseFloat(pos.lat.toFixed(5)),
                      lng: parseFloat(pos.lng.toFixed(5))
                    });
                  } catch (e) {
                    setToast({ title: 'Location Notice', body: 'Location access was not enabled. Proceeding with your entered address.', type: 'warning' });
                    setShowBookingLocationPrompt(false);
                    executeBooking();
                  }
                }}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Navigation size={16} /> Allow Location &amp; Confirm Booking
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowBookingLocationPrompt(false);
                  executeBooking();
                }}
                className="btn btn-glass"
                style={{ width: '100%', padding: '0.65rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}
              >
                Continue with Saved Address: {customerLocation.address}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
