import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Hammer, Wallet, LogOut, Radio, CheckCircle, Clock, ShieldCheck, Award } from 'lucide-react';
import { Toast } from '../components/Toast';

export const LabourPortal = () => {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('radar'); // 'radar' | 'onboarding' | 'wallet'
  const [isOnline, setIsOnline] = useState(true);
  const [radarSeconds, setRadarSeconds] = useState(30);
  const [incomingJob, setIncomingJob] = useState({
    id: 'REQ-9921',
    customer: 'Sunita Rao',
    address: 'Bandra West, Hill Road, Mumbai',
    distanceKm: 1.4,
    service: 'Certified Electrician',
    scope: 'Fix tripped circuit breaker & living room switchboard',
    duration: '2 Hours',
    estimatedPayout: 937.5
  });

  const [jobOtpInput, setJobOtpInput] = useState('');
  const [jobStatus, setJobStatus] = useState('Matched'); // 'Matched' | 'In Progress' | 'Completed'
  const [walletBalance, setWalletBalance] = useState(user.walletBalance || 3250);
  const [toast, setToast] = useState(null);

  // Radar Countdown Timer
  useEffect(() => {
    if (!incomingJob || radarSeconds <= 0) return;
    const timer = setInterval(() => {
      setRadarSeconds(s => s - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [incomingJob, radarSeconds]);

  const handleAcceptJob = () => {
    setToast({ title: 'Job Accepted!', body: `Navigating to ${incomingJob.address}. Ask customer for Start OTP.`, type: 'success' });
    setIncomingJob(null);
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
      await api.requestPayout(user.id, walletBalance);
      setWalletBalance(0);
      setToast({ title: 'Payout Transferred!', body: 'Amount sent to your registered Bank / UPI account.', type: 'success' });
    } catch (err) {
      setToast({ title: 'Payout Error', body: err.message, type: 'danger' });
    }
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

        {/* Worker Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setActiveTab('radar')}
            className={`pill-btn ${activeTab === 'radar' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Radio size={14} /> Available Job Radar
          </button>
          <button
            onClick={() => setActiveTab('onboarding')}
            className={`pill-btn ${activeTab === 'onboarding' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <CheckCircle size={14} /> 7-Step Onboarding Status
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className={`pill-btn ${activeTab === 'wallet' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Wallet size={14} /> Escrow Earnings &amp; Payouts
          </button>
        </div>

        {/* TAB 1: RADAR & COCKPIT */}
        {activeTab === 'radar' && (
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
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{incomingJob.distanceKm} km away</span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', marginBottom: '0.25rem' }}>{incomingJob.customer}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{incomingJob.address}</p>

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
                    <button onClick={handleAcceptJob} className="btn btn-primary" style={{ background: '#059669', padding: '0.75rem', fontWeight: '700' }}>
                      Accept Job &amp; Navigate
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                  <Radio size={36} style={{ color: '#10b981', opacity: 0.6, marginBottom: '0.75rem' }} />
                  <p style={{ color: '#fff', fontWeight: '600' }}>Listening for nearby dispatches...</p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Stay within service radius to maintain 100% distance score.</p>
                </div>
              )}
            </div>

            {/* Active Job Cockpit */}
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: '800', color: '#fff', marginBottom: '1rem' }}>
                Active Job Cockpit
              </h3>

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
        )}

        {/* TAB 2: 7-STEP ONBOARDING */}
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

        {/* TAB 3: ESCROW EARNINGS & WALLET */}
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
