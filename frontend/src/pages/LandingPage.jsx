import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HardHat, Shield, Home, Hammer, Building2, ArrowRight, LogIn } from 'lucide-react';

export const LandingPage = () => {
  const { user, getPortalPathForRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role) {
      navigate(getPortalPathForRole(user.role), { replace: true });
    }
  }, [user, navigate, getPortalPathForRole]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-glass)', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #2563eb, #8b5cf6)', borderRadius: '10px', display: 'grid', placeItems: 'center', color: 'white' }}>
              <HardHat size={20} />
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: '800', color: '#fff' }}>
              Labour<span style={{ color: '#3b82f6' }}>Link</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/auth" className="btn btn-primary" style={{ padding: '0.5rem 1.1rem', fontSize: '0.88rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <LogIn size={15} /> Sign In / Register
            </Link>
            <Link to="/admin-login" className="btn btn-glass" style={{ padding: '0.5rem 1rem', fontSize: '0.88rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Shield size={15} /> Admin Panel
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '4rem 1.5rem 2.5rem', maxWidth: '840px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', fontWeight: '800', lineHeight: '1.15', letterSpacing: '-0.02em', color: '#fff' }}>
          Two-Sided Labour Marketplace with <span style={{ background: 'linear-gradient(135deg, #60a5fa, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Isolated Dedicated Portals</span>
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginTop: '1rem', lineHeight: '1.6' }}>
          Built with React.js &amp; Express (Node.js). Customers, Workers, and Businesses access their own secure, role-specific panels with safe escrow payments and full regulatory compliance.
        </p>
      </section>

      {/* 3 Dedicated Portal Cards */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', maxWidth: '1180px', margin: '0 auto 3rem', padding: '0 1.5rem', width: '100%' }}>
        {/* Customer */}
        <div className="glass-card" style={{ padding: '2.25rem 1.75rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ width: '54px', height: '54px', borderRadius: '14px', background: 'rgba(37, 99, 235, 0.15)', color: '#60a5fa', display: 'grid', placeItems: 'center', marginBottom: '1.25rem' }}>
            <Home size={28} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: '800', color: '#fff', marginBottom: '0.5rem' }}>Customer Portal</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.55', marginBottom: '1.5rem', flex: 1 }}>
            Instant on-demand booking for electricians, plumbers, painters, and helpers. Upfront transparent pricing, live GPS tracking, and 100% safe escrow payment protection.
          </p>
          <Link to="/customer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: '#2563eb', color: 'white', fontWeight: '700', textDecoration: 'none' }}>
            Open Customer Portal <ArrowRight size={16} />
          </Link>
        </div>

        {/* Worker */}
        <div className="glass-card" style={{ padding: '2.25rem 1.75rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ width: '54px', height: '54px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'grid', placeItems: 'center', marginBottom: '1.25rem' }}>
            <Hammer size={28} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: '800', color: '#fff', marginBottom: '0.5rem' }}>Worker Hub (Labour)</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.55', marginBottom: '1.5rem', flex: 1 }}>
            Sequential live dispatch radar, OTP job verification cockpit, 7-stage digital onboarding with police verification, and instant UPI escrow wallet payouts.
          </p>
          <Link to="/labour" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: '#059669', color: 'white', fontWeight: '700', textDecoration: 'none' }}>
            Open Worker Hub <ArrowRight size={16} />
          </Link>
        </div>

        {/* B2B */}
        <div className="glass-card" style={{ padding: '2.25rem 1.75rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ width: '54px', height: '54px', borderRadius: '14px', background: 'rgba(139, 92, 246, 0.15)', color: '#c084fc', display: 'grid', placeItems: 'center', marginBottom: '1.25rem' }}>
            <Building2 size={28} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: '800', color: '#fff', marginBottom: '0.5rem' }}>B2B Enterprise Portal</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.55', marginBottom: '1.5rem', flex: 1 }}>
            Bulk workforce deployment, monthly contract management, guaranteed SLA fulfillment, real-time timesheets &amp; attendance, and consolidated GST billing.
          </p>
          <Link to="/b2b" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: '#7c3aed', color: 'white', fontWeight: '700', textDecoration: 'none' }}>
            Open Enterprise Portal <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Admin Strip */}
      <section style={{ maxWidth: '1180px', margin: '0 auto 4rem', padding: '0 1.5rem', width: '100%' }}>
        <div style={{ background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.25)', borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: '700', color: '#fff' }}>
              🛡️ Super Admin Command Desk
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Inspect all registered users, approve worker KYC, resolve disputes, and monitor the live Escrow Pool.
            </div>
          </div>
          <Link to="/admin-login" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', padding: '0.65rem 1.25rem', fontSize: '0.9rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Open Admin Panel &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
};
