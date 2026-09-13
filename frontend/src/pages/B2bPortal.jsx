import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, Award, FileCheck2, LogOut, Users, CheckSquare, Receipt, FileText, Send } from 'lucide-react';
import { Toast } from '../components/Toast';

export const B2bPortal = () => {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('contracts'); // 'contracts' | 'bulk-request' | 'attendance' | 'payroll'
  const [toast, setToast] = useState(null);

  // Bulk Request form state
  const [tradeCategory, setTradeCategory] = useState('Construction Helpers');
  const [workersCount, setWorkersCount] = useState(15);
  const [shiftType, setShiftType] = useState('Day Shift (8 Hours)');
  const [durationMonths, setDurationMonths] = useState(3);
  const [siteLocation, setSiteLocation] = useState('Metro Line 4 Casting Yard, Thane');

  const [activeContracts, setActiveContracts] = useState([
    { id: 'CTR-2026-44', site: 'Metro Line 4 Casting Yard, Thane', trade: 'Construction Helpers', headcount: 15, sla: '99.8%', status: 'Active' },
    { id: 'CTR-2026-39', site: 'Navi Mumbai Commercial Complex', trade: 'Licensed Electricians', headcount: 5, sla: '100%', status: 'Active' }
  ]);

  const handleBulkSubmit = (e) => {
    e.preventDefault();
    const newContract = {
      id: `CTR-2026-${Math.floor(10 + Math.random() * 90)}`,
      site: siteLocation,
      trade: tradeCategory,
      headcount: workersCount,
      sla: '100% SLA Guarantee',
      status: 'Active'
    };
    setActiveContracts([newContract, ...activeContracts]);
    setActiveTab('contracts');
    setToast({ title: 'Workforce Order Dispatched!', body: `Assigned ${workersCount} verified ${tradeCategory} to ${siteLocation}.`, type: 'success' });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      {/* Toast */}
      {toast && <Toast title={toast.title} body={toast.body} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <header style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-glass)', padding: '0.75rem 2rem', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', display: 'grid', placeItems: 'center', color: 'white' }}>
                <Building2 size={20} />
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>
                Labour<span style={{ color: '#a855f7' }}>Link</span>
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', background: 'rgba(124, 58, 237, 0.15)', color: '#c084fc', border: '1px solid rgba(124, 58, 237, 0.3)', padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
              Enterprise B2B
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', color: '#a5b4fc', fontWeight: '600' }}>
              <Award size={14} />
              <span>Enterprise SLA: <strong>99.8% Attendance</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <FileCheck2 size={14} style={{ color: '#10b981' }} />
              <span>{user.gst || 'GST Verified'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: '30px', padding: '0.35rem 0.9rem 0.35rem 0.5rem' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#7c3aed', color: 'white', fontWeight: '700', display: 'grid', placeItems: 'center', fontSize: '0.85rem' }}>
                {user.companyName?.charAt(0) || user.name?.charAt(0) || 'B'}
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff' }}>{user.companyName || user.name}</div>
                <div style={{ fontSize: '0.72rem', color: '#c084fc' }}>{user.name || 'Authorized Lead'}</div>
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

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setActiveTab('contracts')}
            className={`pill-btn ${activeTab === 'contracts' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <FileText size={14} /> Active Contracts ({activeContracts.length})
          </button>
          <button
            onClick={() => setActiveTab('bulk-request')}
            className={`pill-btn ${activeTab === 'bulk-request' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Users size={14} /> Hire Multiple Workers
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`pill-btn ${activeTab === 'attendance' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <CheckSquare size={14} /> Daily Attendance Timesheet
          </button>
          <button
            onClick={() => setActiveTab('payroll')}
            className={`pill-btn ${activeTab === 'payroll' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Receipt size={14} /> Monthly GST Invoices
          </button>
        </div>

        {/* TAB 1: ACTIVE CONTRACTS */}
        {activeTab === 'contracts' && (
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '800', color: '#fff', marginBottom: '0.35rem' }}>
              Active Workforce Deployments
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              All workers are verified independent contractors under the statutory aggregator model.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activeContracts.map(c => (
                <div key={c.id} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#a855f7', fontWeight: '700' }}>{c.id}</span>
                      <strong style={{ color: '#fff', fontSize: '1rem' }}>{c.trade}</strong>
                      <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontSize: '0.72rem', fontWeight: '700', padding: '0.15rem 0.5rem', borderRadius: '20px' }}>{c.status}</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Site: {c.site}</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Headcount</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: '800', color: '#60a5fa' }}>{c.headcount} Pros</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>SLA Compliance</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: '800', color: '#34d399' }}>{c.sla}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: HIRE MULTIPLE WORKERS (BULK REQUEST) */}
        {activeTab === 'bulk-request' && (
          <div className="glass-card" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: '800', color: '#fff', marginBottom: '0.5rem' }}>
              Bulk Workforce Deployment Request
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Deploy 5 to 100+ vetted pros with guaranteed replacement within 2 hours.
            </p>

            <form onSubmit={handleBulkSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                    Required Skill Trade
                  </label>
                  <select
                    style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                    value={tradeCategory}
                    onChange={(e) => setTradeCategory(e.target.value)}
                  >
                    <option value="Construction Helpers">Construction Helpers (Unskilled)</option>
                    <option value="Certified Electricians">Certified Electricians (Skilled)</option>
                    <option value="Plumbers & Pipefitters">Plumbers &amp; Pipefitters</option>
                    <option value="Warehouse Loaders">Warehouse Loaders / Movers</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                    Number of Workers (Headcount)
                  </label>
                  <input
                    type="number"
                    style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                    value={workersCount}
                    onChange={(e) => setWorkersCount(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max="200"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                    Shift Timing
                  </label>
                  <select
                    style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                    value={shiftType}
                    onChange={(e) => setShiftType(e.target.value)}
                  >
                    <option value="Day Shift (8 Hours)">Day Shift (9:00 AM – 5:00 PM)</option>
                    <option value="Night Shift (8 Hours)">Night Shift (10:00 PM – 6:00 AM)</option>
                    <option value="Rotational 24x7">Rotational 24x7 (3 Shifts)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                    Contract Duration (Months)
                  </label>
                  <input
                    type="number"
                    style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Worksite Address / Project Location
                </label>
                <input
                  type="text"
                  style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                  value={siteLocation}
                  onChange={(e) => setSiteLocation(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', background: '#7c3aed', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Send size={16} /> Deploy {workersCount} Workers to Project Site
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: ATTENDANCE TIMESHEET */}
        {activeTab === 'attendance' && (
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '800', color: '#fff', marginBottom: '0.35rem' }}>
              Today's Live Digital Attendance
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Biometric and GPS geotagged clock-ins for all deployed contract workers.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { name: 'Ramesh Kumar', trade: 'Electrician', checkIn: '08:52 AM', site: 'Metro Casting Yard', status: 'Present' },
                { name: 'Suresh Yadav', trade: 'Plumber', checkIn: '08:45 AM', site: 'Metro Casting Yard', status: 'Present' },
                { name: 'Dilip Verma', trade: 'Painter', checkIn: '09:02 AM', site: 'Commercial Complex', status: 'Present' },
                { name: 'Raju Shinde', trade: 'Loader', checkIn: '08:30 AM', site: 'Commercial Complex', status: 'Present' }
              ].map((w, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <strong style={{ color: '#fff' }}>{w.name}</strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>({w.trade}) • {w.site}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>Clock-in: {w.checkIn}</span>
                    <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontSize: '0.72rem', fontWeight: '700', padding: '0.15rem 0.5rem', borderRadius: '12px' }}>{w.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PAYROLL & GST INVOICES */}
        {activeTab === 'payroll' && (
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '800', color: '#fff', marginBottom: '0.35rem' }}>
              Monthly Consolidated GST Invoices
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              {[
                { inv: 'INV-2026-AUG-81', period: 'August 2026 (24 Workers)', gross: '₹1,85,000', gst: '₹33,300', net: '₹2,18,300', status: 'Paid' },
                { inv: 'INV-2026-JUL-42', period: 'July 2026 (20 Workers)', gross: '₹1,54,000', gst: '₹27,720', net: '₹1,81,720', status: 'Paid' }
              ].map((inv, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <strong style={{ color: '#fff' }}>{inv.inv}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{inv.period} • GST 18% Compliant</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', fontSize: '1.1rem', color: '#34d399' }}>{inv.net}</div>
                    <span style={{ fontSize: '0.72rem', background: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '0.1rem 0.5rem', borderRadius: '10px', fontWeight: '700' }}>{inv.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
