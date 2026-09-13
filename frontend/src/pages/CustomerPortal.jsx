import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Home, ShieldCheck, LogOut, Clock, UserCheck, AlertTriangle, Zap, CheckCircle } from 'lucide-react';
import { Toast } from '../components/Toast';

export const CustomerPortal = () => {
  const { user, logout } = useAuth();

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

  // Fetch services and customer bookings on mount
  useEffect(() => {
    async function loadData() {
      try {
        const srvList = await api.getServices();
        setServices(srvList);
        if (srvList.length > 0) setSelectedService(srvList[0]);

        const bkList = await api.getBookings();
        setBookings(bkList);
      } catch (err) {
        console.error('Error loading initial data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Recalculate quote whenever parameters change
  useEffect(() => {
    if (!selectedService) return;
    async function fetchQuote() {
      try {
        const res = await api.getQuote({
          serviceId: selectedService.id,
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

  const handleBookNow = async () => {
    try {
      const res = await api.createBooking({
        customerId: user.id,
        customerName: user.name,
        serviceId: selectedService.id,
        duration,
        pricingType,
        isEmergency
      });
      setBookings([res.booking, ...bookings]);
      setToast({ title: 'Booking Confirmed!', body: `₹${res.quote.totalCustomerAmount} securely held in Escrow. Worker assigned!`, type: 'success' });
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
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem', width: '100%', flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '1.5rem' }}>

          {/* Left Column: Booking Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Service Selection Card */}
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
                    key={srv.id}
                    onClick={() => setSelectedService(srv)}
                    style={{
                      background: selectedService?.id === srv.id ? 'rgba(37, 99, 235, 0.15)' : 'var(--bg-surface-elevated)',
                      border: `1.5px solid ${selectedService?.id === srv.id ? '#3b82f6' : 'var(--border-glass)'}`,
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

          {/* Right Column: Active Jobs & Live Cockpit */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Live Active Job Card */}
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: '800', color: '#fff' }}>
                  Live Active Job Tracker
                </h3>
                <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontSize: '0.72rem', fontWeight: '700', padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
                  In Progress
                </span>
              </div>

              {/* OTP Pill */}
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'center', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Provide This Start Code to Worker on Arrival
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: '800', color: '#60a5fa', letterSpacing: '0.2em', marginTop: '0.25rem' }}>
                  8492
                </div>
              </div>

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
                  R
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', color: '#fff', fontSize: '0.9rem' }}>Ramesh Kumar (Certified Electrician)</div>
                  <div style={{ fontSize: '0.75rem', color: '#34d399' }}>★ 4.9 • 142 Jobs Completed • Police Verified</div>
                </div>
              </div>
            </div>

            {/* Past Bookings & Dispute Center */}
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: '800', color: '#fff', marginBottom: '1rem' }}>
                Booking History
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {bookings.map(b => (
                  <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#fff' }}>{b.serviceName || 'Service'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.id} • {b.status}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#34d399' }}>₹{b.totalAmount}</div>
                      <button
                        onClick={() => setDisputeBookingId(b.id)}
                        style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '0.72rem', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                      >
                        Report Issue
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
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
    </div>
  );
};
