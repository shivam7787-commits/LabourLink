import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HardHat, Shield, Check, Zap } from 'lucide-react';

export const AuthPage = () => {
  const { login, register, demoLogin } = useAuth();
  const navigate = useNavigate();

  const [currentRole, setCurrentRole] = useState('customer');
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');

  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCity, setRegCity] = useState('Mumbai');
  const [regPass, setRegPass] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regTrade, setRegTrade] = useState('Electrician');
  const [regExp, setRegExp] = useState('3');
  const [regCompany, setRegCompany] = useState('');
  const [regGst, setRegGst] = useState('');

  const handleRoleSelect = (role) => {
    setCurrentRole(role);
    setError('');
  };

  const handleDemoLogin = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      const res = await demoLogin(currentRole);
      navigate(res.redirectPath, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const res = await login(currentRole, loginId, loginPass);
      navigate(res.redirectPath, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const payload = {
        name: regName,
        phone: regPhone,
        city: regCity,
        password: regPass,
        address: regAddress,
        category: regTrade,
        experience: regExp,
        companyName: regCompany,
        gst: regGst
      };

      const res = await register(currentRole, payload);
      navigate(res.redirectPath, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-glass)' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: '10px', display: 'grid', placeItems: 'center', color: 'white' }}>
            <HardHat size={20} />
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: '800', color: '#fff' }}>
            Labour<span style={{ color: '#3b82f6' }}>Link</span>
          </div>
        </Link>
        <Link to="/admin-login" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(139, 92, 246, 0.12)', border: '1px solid rgba(139, 92, 246, 0.3)', color: '#c084fc', borderRadius: '8px', padding: '0.45rem 0.85rem', fontSize: '0.82rem', fontWeight: '600', textDecoration: 'none' }}>
          <Shield size={14} /> Admin Panel
        </Link>
      </header>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '2.5rem 1rem 1.25rem' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: '800', color: '#fff' }}>
          Select Your <span style={{ background: 'linear-gradient(135deg, #60a5fa, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dedicated Portal</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
          Choose your account role to enter your specialized workspace.
        </p>
      </div>

      {/* Role Selector Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', maxWidth: '720px', margin: '0 auto 1.75rem', padding: '0 1rem', width: '100%' }}>
        {/* Customer */}
        <div
          onClick={() => handleRoleSelect('customer')}
          style={{
            background: 'var(--bg-surface)',
            border: `2px solid ${currentRole === 'customer' ? '#3b82f6' : 'var(--border-glass)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem 1rem',
            textAlign: 'center',
            cursor: 'pointer',
            position: 'relative',
            boxShadow: currentRole === 'customer' ? '0 0 20px rgba(59, 130, 246, 0.25)' : 'none'
          }}
        >
          {currentRole === 'customer' && (
            <div style={{ position: 'absolute', top: '8px', right: '8px', width: '20px', height: '20px', background: '#3b82f6', borderRadius: '50%', display: 'grid', placeItems: 'center', color: 'white' }}>
              <Check size={12} />
            </div>
          )}
          <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>🏠</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: '700', fontSize: '1rem', color: '#fff' }}>Customer</div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Book workers for home &amp; office</div>
        </div>

        {/* Worker */}
        <div
          onClick={() => handleRoleSelect('labour')}
          style={{
            background: 'var(--bg-surface)',
            border: `2px solid ${currentRole === 'labour' ? '#10b981' : 'var(--border-glass)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem 1rem',
            textAlign: 'center',
            cursor: 'pointer',
            position: 'relative',
            boxShadow: currentRole === 'labour' ? '0 0 20px rgba(16, 185, 129, 0.25)' : 'none'
          }}
        >
          {currentRole === 'labour' && (
            <div style={{ position: 'absolute', top: '8px', right: '8px', width: '20px', height: '20px', background: '#10b981', borderRadius: '50%', display: 'grid', placeItems: 'center', color: 'white' }}>
              <Check size={12} />
            </div>
          )}
          <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>👷</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: '700', fontSize: '1rem', color: '#fff' }}>Worker (Labour)</div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Accept jobs &amp; get daily payouts</div>
        </div>

        {/* B2B */}
        <div
          onClick={() => handleRoleSelect('b2b')}
          style={{
            background: 'var(--bg-surface)',
            border: `2px solid ${currentRole === 'b2b' ? '#8b5cf6' : 'var(--border-glass)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem 1rem',
            textAlign: 'center',
            cursor: 'pointer',
            position: 'relative',
            boxShadow: currentRole === 'b2b' ? '0 0 20px rgba(139, 92, 246, 0.25)' : 'none'
          }}
        >
          {currentRole === 'b2b' && (
            <div style={{ position: 'absolute', top: '8px', right: '8px', width: '20px', height: '20px', background: '#8b5cf6', borderRadius: '50%', display: 'grid', placeItems: 'center', color: 'white' }}>
              <Check size={12} />
            </div>
          )}
          <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>🏢</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: '700', fontSize: '1rem', color: '#fff' }}>B2B Enterprise</div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Hire bulk workforce &amp; contracts</div>
        </div>
      </div>

      {/* Auth Form Card */}
      <div style={{ maxWidth: '480px', margin: '0 auto 3rem', padding: '0 1rem', width: '100%' }}>
        <div className="glass-card" style={{ padding: '2rem' }}>
          {/* Switcher */}
          <div style={{ display: 'flex', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', padding: '4px', marginBottom: '1.5rem', border: '1px solid var(--border-glass)' }}>
            <button
              onClick={() => setActiveTab('login')}
              style={{
                flex: 1,
                padding: '0.6rem',
                border: 'none',
                background: activeTab === 'login' ? '#3b82f6' : 'transparent',
                color: activeTab === 'login' ? 'white' : 'var(--text-muted)',
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                borderRadius: '8px',
                transition: 'all 0.2s'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('register')}
              style={{
                flex: 1,
                padding: '0.6rem',
                border: 'none',
                background: activeTab === 'register' ? '#3b82f6' : 'transparent',
                color: activeTab === 'register' ? 'white' : 'var(--text-muted)',
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                borderRadius: '8px',
                transition: 'all 0.2s'
              }}
            >
              Create Account
            </button>
          </div>

          {/* 1-Click Fast Demo Helper */}
          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.82rem', color: '#a7f3d0' }}>
              ⚡ <strong>1-Click Fast Demo:</strong> Test with a pre-configured <strong style={{ textTransform: 'capitalize' }}>{currentRole}</strong> account.
            </div>
            <button
              onClick={handleDemoLogin}
              disabled={isSubmitting}
              style={{ background: '#10b981', border: 'none', color: 'white', borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.8rem', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              1-Click Enter
            </button>
          </div>

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.35)', borderRadius: 'var(--radius-md)', padding: '0.65rem 0.9rem', color: '#fca5a5', fontSize: '0.82rem', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          {/* Login Form */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Phone Number or Email
                </label>
                <input
                  type="text"
                  className="input-base"
                  style={{ width: '100%', padding: '0.7rem 0.9rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                  placeholder="e.g. 9876543210"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Password
                </label>
                <input
                  type="password"
                  style={{ width: '100%', padding: '0.7rem 0.9rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                  placeholder="Enter your password"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontWeight: '700', fontSize: '1rem' }}
              >
                Sign In to {currentRole === 'labour' ? 'Worker Hub' : currentRole === 'b2b' ? 'B2B Portal' : 'Customer Portal'}
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Full Name / Authorized Contact
                </label>
                <input
                  type="text"
                  style={{ width: '100%', padding: '0.7rem 0.9rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                  placeholder="e.g. Priya Sharma"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    style={{ width: '100%', padding: '0.7rem 0.9rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                    placeholder="10-digit number"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                    City
                  </label>
                  <input
                    type="text"
                    style={{ width: '100%', padding: '0.7rem 0.9rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                    placeholder="Mumbai / Pune"
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Role specifics */}
              {currentRole === 'customer' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                    Home / Service Address
                  </label>
                  <input
                    type="text"
                    style={{ width: '100%', padding: '0.7rem 0.9rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                    placeholder="Flat 402, Sea Breeze, Mumbai"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                  />
                </div>
              )}

              {currentRole === 'labour' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                      Skill Category
                    </label>
                    <select
                      style={{ width: '100%', padding: '0.7rem 0.9rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                      value={regTrade}
                      onChange={(e) => setRegTrade(e.target.value)}
                    >
                      <option value="Electrician">Electrician</option>
                      <option value="Plumber">Plumber</option>
                      <option value="Painter">Painter</option>
                      <option value="Carpenter">Carpenter</option>
                      <option value="Loader">Loader / Mover</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      style={{ width: '100%', padding: '0.7rem 0.9rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                      value={regExp}
                      onChange={(e) => setRegExp(e.target.value)}
                      min="0"
                    />
                  </div>
                </div>
              )}

              {currentRole === 'b2b' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                      Company Name
                    </label>
                    <input
                      type="text"
                      style={{ width: '100%', padding: '0.7rem 0.9rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                      placeholder="e.g. Apex Infra Ltd"
                      value={regCompany}
                      onChange={(e) => setRegCompany(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                      GSTIN Number
                    </label>
                    <input
                      type="text"
                      style={{ width: '100%', padding: '0.7rem 0.9rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                      placeholder="15-digit GSTIN"
                      value={regGst}
                      onChange={(e) => setRegGst(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Create Account Password
                </label>
                <input
                  type="password"
                  style={{ width: '100%', padding: '0.7rem 0.9rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                  placeholder="Min. 6 characters"
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                  minLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontWeight: '700', fontSize: '1rem' }}
              >
                Register as {currentRole === 'labour' ? 'Worker' : currentRole === 'b2b' ? 'B2B Client' : 'Customer'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
