import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Shield,
  LayoutDashboard,
  Users,
  Hammer,
  Building2,
  ClipboardList,
  AlertTriangle,
  Wallet,
  Sliders,
  LogOut,
  ExternalLink,
  Search,
  CheckCircle,
  Lock,
  HardHat
} from 'lucide-react';
import { Toast } from '../components/Toast';

export const AdminDashboard = () => {
  const { logout } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [customers, setCustomers] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [b2bList, setB2bList] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [escrowLedger, setEscrowLedger] = useState({ totalEscrowPool: 14500, transactions: [] });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Filters & Modal
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrade, setSelectedTrade] = useState('all');
  const [selectedUserModal, setSelectedUserModal] = useState(null);

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    try {
      const [allUsers, allBookings, allDisputes, ledger] = await Promise.all([
        api.getUsers(),
        api.getBookings(),
        api.getDisputes(),
        api.getEscrowLedger()
      ]);

      setCustomers(allUsers.filter(u => u.role === 'customer'));
      setWorkers(allUsers.filter(u => u.role === 'labour'));
      setB2bList(allUsers.filter(u => u.role === 'b2b'));
      setBookings(allBookings);
      setDisputes(allDisputes);
      setEscrowLedger(ledger);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveWorker = async (workerId) => {
    try {
      await api.updateUser(workerId, { status: 'active', onboardingStage: 7 });
      setToast({ title: 'KYC Approved!', body: 'Worker activated for sequential live dispatch.', type: 'success' });
      loadAllAdminData();
    } catch (err) {
      setToast({ title: 'Error', body: err.message, type: 'danger' });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;
    try {
      await api.deleteUser(userId);
      setToast({ title: 'Account Deleted', body: 'User removed from platform.', type: 'info' });
      loadAllAdminData();
    } catch (err) {
      setToast({ title: 'Error', body: err.message, type: 'danger' });
    }
  };

  const handleResolveDispute = async (disputeId, outcome) => {
    try {
      await api.resolveDispute(disputeId, outcome);
      setToast({ title: 'Dispute Resolved', body: `Executed settlement outcome: [${outcome.toUpperCase()}]. Escrow pool updated.`, type: 'success' });
      loadAllAdminData();
    } catch (err) {
      setToast({ title: 'Error', body: err.message, type: 'danger' });
    }
  };

  const filteredWorkers = workers.filter(w => {
    const matchesTrade = selectedTrade === 'all' || (w.category || '').toLowerCase() === selectedTrade.toLowerCase();
    const matchesSearch = (w.name + (w.phone || '') + (w.city || '')).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTrade && matchesSearch;
  });

  const filteredCustomers = customers.filter(c =>
    (c.name + (c.phone || '') + (c.city || '')).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredB2b = b2bList.filter(b =>
    ((b.companyName || b.name) + (b.phone || '') + (b.city || '')).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-main)' }}>
      {/* Toast */}
      {toast && <Toast title={toast.title} body={toast.body} type={toast.type} onClose={() => setToast(null)} />}

      {/* Left Sidebar */}
      <aside style={{ width: '260px', flexShrink: 0, background: '#0f172a', borderRight: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0 }}>
        {/* Brand */}
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'grid', placeItems: 'center', color: 'white' }}>
            <Shield size={20} />
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>
            Labour<span style={{ color: '#3b82f6' }}>Link</span>
          </div>
          <span style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', background: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd', padding: '0.15rem 0.5rem', borderRadius: '12px', marginLeft: 'auto', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            Admin
          </span>
        </div>

        {/* Nav Items */}
        <nav style={{ padding: '1rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 0.75rem 0.35rem' }}>
            Overview
          </div>
          <button
            onClick={() => setActiveTab('dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem', borderRadius: '10px', color: activeTab === 'dashboard' ? '#60a5fa' : '#94a3b8', background: activeTab === 'dashboard' ? 'rgba(59, 130, 246, 0.15)' : 'transparent', border: 'none', fontFamily: 'inherit', fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer', textAlign: 'left', width: '100%' }}
          >
            <LayoutDashboard size={18} /> <span>Executive Dashboard</span>
          </button>

          <div style={{ fontSize: '0.68rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 0.75rem 0.35rem', marginTop: '0.5rem' }}>
            Marketplace Users
          </div>
          <button
            onClick={() => setActiveTab('customers')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem', borderRadius: '10px', color: activeTab === 'customers' ? '#60a5fa' : '#94a3b8', background: activeTab === 'customers' ? 'rgba(59, 130, 246, 0.15)' : 'transparent', border: 'none', fontFamily: 'inherit', fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer', textAlign: 'left', width: '100%' }}
          >
            <Users size={18} /> <span>Customers (Demand)</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.72rem', fontWeight: '700', padding: '0.15rem 0.5rem', borderRadius: '12px', background: '#1f293d', color: '#94a3b8' }}>
              {customers.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('labour')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem', borderRadius: '10px', color: activeTab === 'labour' ? '#60a5fa' : '#94a3b8', background: activeTab === 'labour' ? 'rgba(59, 130, 246, 0.15)' : 'transparent', border: 'none', fontFamily: 'inherit', fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer', textAlign: 'left', width: '100%' }}
          >
            <Hammer size={18} /> <span>Workers (Labour)</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.72rem', fontWeight: '700', padding: '0.15rem 0.5rem', borderRadius: '12px', background: '#1f293d', color: '#94a3b8' }}>
              {workers.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('b2b')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem', borderRadius: '10px', color: activeTab === 'b2b' ? '#60a5fa' : '#94a3b8', background: activeTab === 'b2b' ? 'rgba(59, 130, 246, 0.15)' : 'transparent', border: 'none', fontFamily: 'inherit', fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer', textAlign: 'left', width: '100%' }}
          >
            <Building2 size={18} /> <span>B2B Enterprises</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.72rem', fontWeight: '700', padding: '0.15rem 0.5rem', borderRadius: '12px', background: '#1f293d', color: '#94a3b8' }}>
              {b2bList.length}
            </span>
          </button>

          <div style={{ fontSize: '0.68rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 0.75rem 0.35rem', marginTop: '0.5rem' }}>
            Operations &amp; Escrow
          </div>
          <button
            onClick={() => setActiveTab('bookings')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem', borderRadius: '10px', color: activeTab === 'bookings' ? '#60a5fa' : '#94a3b8', background: activeTab === 'bookings' ? 'rgba(59, 130, 246, 0.15)' : 'transparent', border: 'none', fontFamily: 'inherit', fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer', textAlign: 'left', width: '100%' }}
          >
            <ClipboardList size={18} /> <span>Bookings &amp; Jobs</span>
          </button>
          <button
            onClick={() => setActiveTab('disputes')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem', borderRadius: '10px', color: activeTab === 'disputes' ? '#60a5fa' : '#94a3b8', background: activeTab === 'disputes' ? 'rgba(59, 130, 246, 0.15)' : 'transparent', border: 'none', fontFamily: 'inherit', fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer', textAlign: 'left', width: '100%' }}
          >
            <AlertTriangle size={18} /> <span>Dispute Workbench</span>
            {disputes.length > 0 && (
              <span style={{ marginLeft: 'auto', fontSize: '0.72rem', fontWeight: '700', padding: '0.15rem 0.5rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}>
                {disputes.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('escrow')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem', borderRadius: '10px', color: activeTab === 'escrow' ? '#60a5fa' : '#94a3b8', background: activeTab === 'escrow' ? 'rgba(59, 130, 246, 0.15)' : 'transparent', border: 'none', fontFamily: 'inherit', fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer', textAlign: 'left', width: '100%' }}
          >
            <Wallet size={18} /> <span>Escrow &amp; Payouts</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem', borderRadius: '10px', color: activeTab === 'settings' ? '#60a5fa' : '#94a3b8', background: activeTab === 'settings' ? 'rgba(59, 130, 246, 0.15)' : 'transparent', border: 'none', fontFamily: 'inherit', fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer', textAlign: 'left', width: '100%' }}
          >
            <Sliders size={18} /> <span>Platform Rules</span>
          </button>
        </nav>

        {/* Footer */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', color: 'white', fontWeight: '700', display: 'grid', placeItems: 'center', fontSize: '0.9rem' }}>
              A
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff' }}>Super Administrator</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Platform Operations</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
        {/* Topbar */}
        <header style={{ height: '64px', background: '#111827', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '700', color: '#fff' }}>
              {activeTab === 'dashboard' ? 'Executive Dashboard' : activeTab === 'customers' ? 'Customer Demand Management' : activeTab === 'labour' ? 'Worker Supply Management' : activeTab === 'b2b' ? 'B2B Enterprise Accounts' : activeTab === 'bookings' ? 'Bookings & Jobs' : activeTab === 'disputes' ? 'SLA Dispute Workbench' : activeTab === 'escrow' ? 'Escrow & Finance' : 'Platform Rules'}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', color: '#34d399', fontSize: '0.75rem', fontWeight: '600', padding: '0.25rem 0.65rem', borderRadius: '20px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }}></span>
              <span>Express API &amp; Escrow Vault Secure</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={() => window.open('/customer', '_blank')} className="btn btn-glass" style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ExternalLink size={14} /> Customer Portal
            </button>
            <button onClick={() => window.open('/labour', '_blank')} className="btn btn-glass" style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ExternalLink size={14} /> Worker Hub
            </button>
            <button onClick={() => window.open('/b2b', '_blank')} className="btn btn-glass" style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ExternalLink size={14} /> B2B Portal
            </button>
            <button onClick={logout} className="btn btn-glass" style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f87171' }}>
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main style={{ padding: '2rem 2.5rem', flex: 1, maxWidth: '1600px', width: '100%', margin: '0 auto' }}>

          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div>
              {/* 4 KPI Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
                <div className="glass-card" style={{ padding: '1.35rem 1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Escrow Pool Vault</span>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', color: '#34d399', display: 'grid', placeItems: 'center' }}><Lock size={18} /></div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: '800', color: '#fff' }}>₹{escrowLedger.totalEscrowPool?.toLocaleString()}</div>
                  <div style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: '700', marginTop: '0.5rem' }}>100% Upfront Holding Protected</div>
                </div>

                <div className="glass-card" style={{ padding: '1.35rem 1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Labour Supply</span>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa', display: 'grid', placeItems: 'center' }}><HardHat size={18} /></div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: '800', color: '#fff' }}>{workers.length}</div>
                  <div style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: '700', marginTop: '0.5rem' }}>
                    {workers.filter(w => w.status === 'pending').length} Pending Approval
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '1.35rem 1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Registered Customers</span>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.12)', color: '#c084fc', display: 'grid', placeItems: 'center' }}><Users size={18} /></div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: '800', color: '#fff' }}>{customers.length}</div>
                  <div style={{ fontSize: '0.78rem', color: '#c084fc', fontWeight: '700', marginTop: '0.5rem' }}>Verified Demand in Mumbai &amp; Pune</div>
                </div>

                <div className="glass-card" style={{ padding: '1.35rem 1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>B2B Enterprises</span>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24', display: 'grid', placeItems: 'center' }}><Building2 size={18} /></div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: '800', color: '#fff' }}>{b2bList.length}</div>
                  <div style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: '700', marginTop: '0.5rem' }}>Corporate Contracts Active</div>
                </div>
              </div>

              {/* Split: Recent Users + Quick Verification Queue */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div className="glass-card" style={{ padding: '1.75rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '800', color: '#fff', marginBottom: '1.25rem' }}>
                    Recent Registrations Across All Portals
                  </h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                        <th style={{ padding: '0.75rem' }}>Name</th>
                        <th style={{ padding: '0.75rem' }}>Role</th>
                        <th style={{ padding: '0.75rem' }}>Phone</th>
                        <th style={{ padding: '0.75rem' }}>City</th>
                        <th style={{ padding: '0.75rem' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...customers, ...workers, ...b2bList].slice(0, 5).map(u => (
                        <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', fontSize: '0.88rem' }}>
                          <td style={{ padding: '0.75rem', fontWeight: '600', color: '#fff' }}>{u.name}</td>
                          <td style={{ padding: '0.75rem' }}><span className="badge badge-blue">{u.role}</span></td>
                          <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)' }}>{u.phone}</td>
                          <td style={{ padding: '0.75rem' }}>{u.city}</td>
                          <td style={{ padding: '0.75rem' }}><span className={`badge ${u.status === 'active' ? 'badge-green' : 'badge-amber'}`}>{u.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Quick KYC Queue */}
                <div className="glass-card" style={{ padding: '1.75rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: '800', color: '#fff', marginBottom: '1rem' }}>
                    Worker KYC Review Queue
                  </h3>
                  {workers.filter(w => w.status === 'pending').length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>All worker KYC verified. Queue is empty!</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {workers.filter(w => w.status === 'pending').map(w => (
                        <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)' }}>
                          <div>
                            <strong style={{ color: '#fff' }}>{w.name}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{w.category} • {w.city}</div>
                          </div>
                          <button
                            onClick={() => handleApproveWorker(w.id)}
                            className="btn btn-primary"
                            style={{ background: '#10b981', padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                          >
                            Approve KYC
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: CUSTOMERS */}
          {activeTab === 'customers' && (
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>
                  Customers ({filteredCustomers.length})
                </h2>
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ padding: '0.5rem 0.85rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                />
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.75rem' }}>Customer Name</th>
                    <th style={{ padding: '0.75rem' }}>Phone</th>
                    <th style={{ padding: '0.75rem' }}>City</th>
                    <th style={{ padding: '0.75rem' }}>Total Bookings</th>
                    <th style={{ padding: '0.75rem' }}>Tier</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                    <th style={{ padding: '0.75rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', fontSize: '0.88rem' }}>
                      <td style={{ padding: '0.75rem', fontWeight: '600', color: '#fff' }}>{c.name}</td>
                      <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)' }}>{c.phone}</td>
                      <td style={{ padding: '0.75rem' }}>{c.city}</td>
                      <td style={{ padding: '0.75rem' }}><strong>{c.totalBookings || 0}</strong></td>
                      <td style={{ padding: '0.75rem' }}><span className="badge badge-blue">{c.tier || 'Bronze'}</span></td>
                      <td style={{ padding: '0.75rem' }}><span className="badge badge-green">{c.status}</span></td>
                      <td style={{ padding: '0.75rem' }}>
                        <button onClick={() => setSelectedUserModal(c)} className="btn btn-glass" style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem', marginRight: '0.4rem' }}>View</button>
                        <button onClick={() => handleDeleteUser(c.id)} className="btn btn-glass" style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem', color: '#f87171' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: WORKERS (LABOUR) */}
          {activeTab === 'labour' && (
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>
                  Workers (Labour Supply) ({filteredWorkers.length})
                </h2>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <select
                    value={selectedTrade}
                    onChange={(e) => setSelectedTrade(e.target.value)}
                    style={{ padding: '0.5rem 0.85rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                  >
                    <option value="all">All Trades</option>
                    <option value="Electrician">Electrician</option>
                    <option value="Plumber">Plumber</option>
                    <option value="Painter">Painter</option>
                    <option value="Carpenter">Carpenter</option>
                    <option value="Loader">Loader</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Search workers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ padding: '0.5rem 0.85rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                  />
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.75rem' }}>Worker Name</th>
                    <th style={{ padding: '0.75rem' }}>Trade</th>
                    <th style={{ padding: '0.75rem' }}>Phone</th>
                    <th style={{ padding: '0.75rem' }}>City</th>
                    <th style={{ padding: '0.75rem' }}>Rating</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                    <th style={{ padding: '0.75rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkers.map(w => (
                    <tr key={w.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', fontSize: '0.88rem' }}>
                      <td style={{ padding: '0.75rem', fontWeight: '600', color: '#fff' }}>{w.name}</td>
                      <td style={{ padding: '0.75rem', color: '#60a5fa', fontWeight: '600' }}>{w.category}</td>
                      <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)' }}>{w.phone}</td>
                      <td style={{ padding: '0.75rem' }}>{w.city}</td>
                      <td style={{ padding: '0.75rem', color: '#fbbf24', fontWeight: '700' }}>★ {w.rating || '5.0'}</td>
                      <td style={{ padding: '0.75rem' }}><span className={`badge ${w.status === 'active' ? 'badge-green' : 'badge-amber'}`}>{w.status}</span></td>
                      <td style={{ padding: '0.75rem' }}>
                        <button onClick={() => setSelectedUserModal(w)} className="btn btn-glass" style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem', marginRight: '0.4rem' }}>View</button>
                        {w.status === 'pending' && (
                          <button onClick={() => handleApproveWorker(w.id)} className="btn btn-primary" style={{ background: '#10b981', padding: '0.25rem 0.6rem', fontSize: '0.78rem', marginRight: '0.4rem' }}>Approve</button>
                        )}
                        <button onClick={() => handleDeleteUser(w.id)} className="btn btn-glass" style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem', color: '#f87171' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: B2B ENTERPRISES */}
          {activeTab === 'b2b' && (
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '800', color: '#fff', marginBottom: '1.25rem' }}>
                B2B Enterprise Accounts ({filteredB2b.length})
              </h2>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.75rem' }}>Company</th>
                    <th style={{ padding: '0.75rem' }}>Contact Person</th>
                    <th style={{ padding: '0.75rem' }}>Phone</th>
                    <th style={{ padding: '0.75rem' }}>GSTIN</th>
                    <th style={{ padding: '0.75rem' }}>Active Workforce</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredB2b.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', fontSize: '0.88rem' }}>
                      <td style={{ padding: '0.75rem', fontWeight: '700', color: '#fff' }}>{b.companyName || b.name}</td>
                      <td style={{ padding: '0.75rem' }}>{b.contactPerson || b.name}</td>
                      <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)' }}>{b.phone}</td>
                      <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)', color: '#a855f7' }}>{b.gst || 'Pending'}</td>
                      <td style={{ padding: '0.75rem', fontWeight: '700', color: '#60a5fa' }}>{b.activeHeadcount || 12} Workers</td>
                      <td style={{ padding: '0.75rem' }}><span className="badge badge-green">{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: DISPUTES WORKBENCH */}
          {activeTab === 'disputes' && (
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '800', color: '#fff', marginBottom: '1.25rem' }}>
                SLA Dispute Resolution Workbench
              </h2>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.75rem' }}>Ticket ID</th>
                    <th style={{ padding: '0.75rem' }}>Booking Ref</th>
                    <th style={{ padding: '0.75rem' }}>Raised By</th>
                    <th style={{ padding: '0.75rem' }}>Reason</th>
                    <th style={{ padding: '0.75rem' }}>Escrow Held</th>
                    <th style={{ padding: '0.75rem' }}>Resolution Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {disputes.map(d => (
                    <tr key={d.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', fontSize: '0.88rem' }}>
                      <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)', color: '#f87171', fontWeight: '700' }}>{d.id}</td>
                      <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)' }}>{d.bookingId}</td>
                      <td style={{ padding: '0.75rem', fontWeight: '600', color: '#fff' }}>{d.raisedBy}</td>
                      <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{d.reason}</td>
                      <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#fbbf24' }}>₹{d.escrowHeld}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button onClick={() => handleResolveDispute(d.id, 'refund')} className="btn btn-primary" style={{ background: '#10b981', padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>
                            Refund Customer
                          </button>
                          <button onClick={() => handleResolveDispute(d.id, 'payout')} className="btn btn-glass" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', color: '#60a5fa' }}>
                            Pay Worker
                          </button>
                          <button onClick={() => handleResolveDispute(d.id, 'split')} className="btn btn-glass" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>
                            50/50 Split
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: ESCROW & FINANCE */}
          {activeTab === 'escrow' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Escrow Pool Vault</div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: '800', color: '#34d399', marginTop: '0.25rem' }}>₹{escrowLedger.totalEscrowPool?.toLocaleString()}</div>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Commissions Earned</div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: '800', color: '#60a5fa', marginTop: '0.25rem' }}>₹{escrowLedger.totalCommissions?.toLocaleString() || '₹2,900'}</div>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Worker Payouts Disbursed</div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: '800', color: '#c084fc', marginTop: '0.25rem' }}>₹{escrowLedger.totalDisbursed?.toLocaleString() || '₹11,600'}</div>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.75rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '800', color: '#fff', marginBottom: '1rem' }}>
                  Escrow Transaction Ledger
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '0.75rem' }}>Transaction ID</th>
                      <th style={{ padding: '0.75rem' }}>Booking Ref</th>
                      <th style={{ padding: '0.75rem' }}>Total Paid</th>
                      <th style={{ padding: '0.75rem' }}>Platform Cut</th>
                      <th style={{ padding: '0.75rem' }}>Worker Payout</th>
                      <th style={{ padding: '0.75rem' }}>State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {escrowLedger.transactions?.map(t => (
                      <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', fontSize: '0.88rem' }}>
                        <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)' }}>{t.id}</td>
                        <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)', color: '#60a5fa' }}>{t.bookingId}</td>
                        <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>₹{t.total}</td>
                        <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>₹{t.commission}</td>
                        <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)', color: '#34d399', fontWeight: '700' }}>₹{t.payout}</td>
                        <td style={{ padding: '0.75rem' }}><span className="badge badge-green">{t.state}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: SETTINGS & RULES */}
          {activeTab === 'settings' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="glass-card" style={{ padding: '1.75rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: '700', color: '#fff', marginBottom: '1rem' }}>
                  Statutory Commission Slabs
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Unskilled Labour (Helper/Loader)</span>
                    <strong style={{ color: '#34d399' }}>20% Deducted</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Semi-Skilled (Painter/Gardener)</span>
                    <strong style={{ color: '#fbbf24' }}>22% Deducted</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Skilled Pro (Electrician/Plumber)</span>
                    <strong style={{ color: '#60a5fa' }}>25% Deducted</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Emergency Surge Multiplier</span>
                    <strong style={{ color: '#f87171' }}>1.25× Active</strong>
                  </div>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.75rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: '700', color: '#fff', marginBottom: '1rem' }}>
                  Fair Turn &amp; Anti-Monopoly Cap
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                  Matching engine automatically penalizes workers with &gt;5 jobs today (-20% score) to guarantee equitable job sharing across the labour pool.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontWeight: '700', fontSize: '0.85rem' }}>
                  <CheckCircle size={16} /> Anti-Monopoly Matching Rule: ACTIVE
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* User Details Modal */}
      {selectedUserModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 999, display: 'grid', placeItems: 'center', padding: '1.5rem' }}>
          <div className="glass-card" style={{ maxWidth: '520px', width: '100%', padding: '2rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '800', color: '#fff', marginBottom: '1.25rem' }}>
              User Dossier: {selectedUserModal.name}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Role Category</div>
                <div style={{ fontWeight: '700', color: '#fff', marginTop: '0.2rem' }}>{selectedUserModal.role}</div>
              </div>
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mobile Phone</div>
                <div style={{ fontWeight: '700', color: '#fff', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>{selectedUserModal.phone}</div>
              </div>
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>City Zone</div>
                <div style={{ fontWeight: '700', color: '#fff', marginTop: '0.2rem' }}>{selectedUserModal.city || 'Mumbai'}</div>
              </div>
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</div>
                <div style={{ fontWeight: '700', color: '#34d399', marginTop: '0.2rem' }}>{selectedUserModal.status}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <button onClick={() => setSelectedUserModal(null)} className="btn btn-primary" style={{ padding: '0.5rem 1.2rem' }}>
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
