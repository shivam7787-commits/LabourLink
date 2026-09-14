import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Building2, Award, FileCheck2, LogOut, Users, CheckSquare, Receipt,
  FileText, Send, MapPin, Navigation, Compass, ExternalLink, RefreshCw,
  Phone, ShieldCheck, CheckCircle, Clock, ArrowRight
} from 'lucide-react';
import { Toast } from '../components/Toast';
import { LiveLocationMap } from '../components/LiveLocationMap';
import { useGeolocation } from '../hooks/useGeolocation';
import { LocationPermissionBanner } from '../components/LocationPermissionBanner';
import { getRealtimeLocation, searchAddress } from '../services/geoapifyService';

export const B2bPortal = () => {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('contracts'); // 'contracts' | 'location' | 'bulk-request' | 'attendance' | 'payroll'
  const [toast, setToast] = useState(null);

  // Real browser GPS for Site Supervisor check-in
  const gps = useGeolocation();

  // Bulk Request form state
  const [tradeCategory, setTradeCategory] = useState('Construction Helpers');
  const [workersCount, setWorkersCount] = useState(15);
  const [shiftType, setShiftType] = useState('Day Shift (8 Hours)');
  const [durationMonths, setDurationMonths] = useState(3);
  const [siteLocation, setSiteLocation] = useState('Metro Line 4 Casting Yard, Thane');

  const [activeContracts, setActiveContracts] = useState([
    { id: 'CTR-2026-44', site: 'Metro Line 4 Casting Yard, Thane', siteId: 'SITE-MUM-01', trade: 'Construction Helpers', headcount: 15, sla: '99.8%', status: 'Active' },
    { id: 'CTR-2026-39', site: 'Navi Mumbai Commercial Complex', siteId: 'SITE-MUM-02', trade: 'Licensed Electricians', headcount: 5, sla: '100%', status: 'Active' }
  ]);

  // B2B Worksite and Fleet Tracking State
  const [sitesData, setSitesData] = useState([
    {
      siteId: 'SITE-MUM-01',
      siteName: 'Metro Line 4 Casting Yard, Thane',
      address: 'Ghodbunder Road, Near Kasarvadavali, Thane West',
      lat: 19.2612,
      lng: 72.9644,
      geofenceRadiusMeters: 250,
      supervisor: 'Rajesh Kulkarni (+91 98200 11223)',
      totalAssigned: 15,
      presentOnSite: 12,
      inTransit: 3,
      batches: [
        {
          batchId: 'BATCH-A1',
          trade: 'Construction Helpers',
          headcount: 12,
          status: 'On Site (Geofence Verified)',
          lat: 19.2615,
          lng: 72.9641,
          etaMinutes: 0,
          distanceKm: 0,
          driver: 'Direct Turnstile Entry'
        },
        {
          batchId: 'BATCH-A2',
          trade: 'Construction Helpers',
          headcount: 3,
          status: 'In Transit (Shuttle Bus 3)',
          lat: 19.2485,
          lng: 72.9750,
          etaMinutes: 14,
          distanceKm: 2.6,
          driver: 'Mahesh Patil (+91 98331 44556)'
        }
      ]
    },
    {
      siteId: 'SITE-MUM-02',
      siteName: 'Navi Mumbai Commercial Complex',
      address: 'Sector 15, Palm Beach Road, Vashi, Navi Mumbai',
      lat: 19.0760,
      lng: 73.0039,
      geofenceRadiusMeters: 200,
      supervisor: 'Anand Jadhav (+91 98199 88776)',
      totalAssigned: 5,
      presentOnSite: 5,
      inTransit: 0,
      batches: [
        {
          batchId: 'BATCH-B1',
          trade: 'Licensed Electricians',
          headcount: 5,
          status: 'On Site (Substation B)',
          lat: 19.0762,
          lng: 73.0041,
          etaMinutes: 0,
          distanceKm: 0,
          driver: 'Shift Supervisor Verified'
        }
      ]
    }
  ]);

  const [selectedSiteId, setSelectedSiteId] = useState('SITE-MUM-01');
  const [siteSuggestions, setSiteSuggestions] = useState([]);
  const [isLocatingManager, setIsLocatingManager] = useState(false);

  const handleDetectManagerLocation = async () => {
    setIsLocatingManager(true);
    try {
      const loc = await getRealtimeLocation();
      if (loc) {
        setSitesData(prev => prev.map(s => {
          if (s.siteId === selectedSiteId) {
            return {
              ...s,
              lat: parseFloat(loc.lat.toFixed(5)),
              lng: parseFloat(loc.lng.toFixed(5)),
              address: loc.formatted
            };
          }
          return s;
        }));
        setToast({
          title: 'Worksite Calibrated via Geoapify',
          body: `Real-time position: ${loc.formatted} (${loc.source.toUpperCase()})`,
          type: 'success'
        });
      }
    } catch (err) {
      setToast({ title: 'Location Error', body: err.message, type: 'danger' });
    } finally {
      setIsLocatingManager(false);
    }
  };

  useEffect(() => {
    async function loadTracking() {
      try {
        const res = await api.getB2bSitesTracking();
        if (res && res.sites && res.sites.length > 0) {
          setSitesData(res.sites);
        }
      } catch (err) {
        // Fallback data already initialized in state
        console.warn('Using local B2B site tracking cache:', err.message);
      }
    }
    loadTracking();
  }, []);

  const selectedSite = sitesData.find(s => s.siteId === selectedSiteId) || sitesData[0];

  const handleBulkSubmit = (e) => {
    e.preventDefault();
    const newContract = {
      id: `CTR-2026-${Math.floor(10 + Math.random() * 90)}`,
      site: siteLocation,
      siteId: `SITE-${Math.floor(100 + Math.random() * 900)}`,
      trade: tradeCategory,
      headcount: workersCount,
      sla: '100% SLA Guarantee',
      status: 'Active'
    };
    setActiveContracts([newContract, ...activeContracts]);
    setActiveTab('contracts');
    setToast({
      title: 'Workforce Order Dispatched!',
      body: `Assigned ${workersCount} verified ${tradeCategory} to ${siteLocation}.`,
      type: 'success'
    });
  };

  // Simulate shuttle moving closer to worksite
  const handleSimulateShuttle = () => {
    setSitesData(prev => prev.map(site => {
      if (site.siteId !== selectedSiteId) return site;
      const updatedBatches = site.batches.map(batch => {
        if (!batch.status.toLowerCase().includes('transit')) return batch;
        const newEta = Math.max(0, batch.etaMinutes - 3);
        const newDist = Math.max(0, (batch.distanceKm - 0.7).toFixed(1));
        const isArrived = newEta === 0;

        return {
          ...batch,
          etaMinutes: newEta,
          distanceKm: newDist,
          status: isArrived ? 'On Site (Just Arrived)' : 'In Transit (Approaching Site Gate)',
          lat: isArrived ? site.lat : batch.lat + (site.lat - batch.lat) * 0.4,
          lng: isArrived ? site.lng : batch.lng + (site.lng - batch.lng) * 0.4
        };
      });

      const transitCount = updatedBatches.filter(b => b.status.toLowerCase().includes('transit')).reduce((s, b) => s + b.headcount, 0);
      const onSiteCount = site.totalAssigned - transitCount;

      return {
        ...site,
        batches: updatedBatches,
        inTransit: transitCount,
        presentOnSite: onSiteCount
      };
    }));

    setToast({ title: 'Transit Telemetry Synced', body: 'Workforce transit shuttle moved closer to worksite gate.', type: 'info' });
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
              <span>{user.gst || 'GST 27AAACA9012A1ZG'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: '30px', padding: '0.35rem 0.9rem 0.35rem 0.5rem' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#7c3aed', color: 'white', fontWeight: '700', display: 'grid', placeItems: 'center', fontSize: '0.85rem' }}>
                {user.companyName?.charAt(0) || user.name?.charAt(0) || 'B'}
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff' }}>{user.companyName || 'Apex Infrastructure Ltd'}</div>
                <div style={{ fontSize: '0.72rem', color: '#c084fc' }}>{user.name || 'Vikram Singhania (VP Ops)'}</div>
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

        {/* Tab Switcher (Includes new Site Locations & Fleet Tracking) */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('contracts')}
            className={`pill-btn ${activeTab === 'contracts' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 1.15rem' }}
          >
            <FileText size={14} /> Active Contracts ({activeContracts.length})
          </button>
          <button
            onClick={() => setActiveTab('location')}
            className={`pill-btn ${activeTab === 'location' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 1.15rem', position: 'relative' }}
          >
            <MapPin size={14} style={{ color: '#c084fc' }} />
            <span>Site Locations &amp; Fleet Tracking</span>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%', background: '#a855f7',
              boxShadow: '0 0 8px #a855f7'
            }}></span>
          </button>
          <button
            onClick={() => setActiveTab('bulk-request')}
            className={`pill-btn ${activeTab === 'bulk-request' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 1.15rem' }}
          >
            <Users size={14} /> Hire Multiple Workers
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`pill-btn ${activeTab === 'attendance' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 1.15rem' }}
          >
            <CheckSquare size={14} /> Daily Attendance Timesheet
          </button>
          <button
            onClick={() => setActiveTab('payroll')}
            className={`pill-btn ${activeTab === 'payroll' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 1.15rem' }}
          >
            <Receipt size={14} /> Monthly GST Invoices
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════
            TAB 1: ACTIVE CONTRACTS
            ══════════════════════════════════════════════════════════ */}
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Headcount</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: '800', color: '#60a5fa' }}>{c.headcount} Pros</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>SLA Compliance</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: '800', color: '#34d399' }}>{c.sla}</div>
                    </div>
                    <button
                      onClick={() => {
                        if (c.siteId) setSelectedSiteId(c.siteId);
                        setActiveTab('location');
                      }}
                      className="btn btn-glass"
                      style={{ padding: '0.55rem 1rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid rgba(168, 85, 247, 0.4)', color: '#c084fc' }}
                    >
                      <MapPin size={14} /> Track Site &amp; Fleet ➔
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 2: SITE LOCATIONS & FLEET TRACKING (NEW SECTION!)
            ══════════════════════════════════════════════════════════ */}
        {activeTab === 'location' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Browser Location Permission Banner */}
            <LocationPermissionBanner
              role="b2b"
              permissionState={gps.permissionState}
              onAllow={gps.startWatching}
              error={gps.error}
            />

            {/* Live Supervisor GPS Status Pill */}
            {gps.coords && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)',
                borderRadius: '20px', padding: '0.35rem 0.9rem', fontSize: '0.78rem',
                color: '#c084fc', fontWeight: '700', alignSelf: 'flex-start'
              }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#a855f7', boxShadow: '0 0 6px #a855f7' }}></span>
                Live Site Supervisor GPS Active &nbsp;|&nbsp;
                {gps.coords.lat.toFixed(5)}, {gps.coords.lng.toFixed(5)} (±{Math.round(gps.coords.accuracy || 10)}m)
              </div>
            )}

            {/* Worksite Selector & Telemetry Banner */}
            <div className="glass-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.25), rgba(17, 24, 39, 0.95))', border: '1px solid rgba(168, 85, 247, 0.35)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#a855f7', boxShadow: '0 0 10px #a855f7' }}></span>
                    <span style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', color: '#c084fc', letterSpacing: '0.05em' }}>
                      Enterprise Site Geofencing &amp; Workforce Telemetry
                    </span>
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: '800', color: '#fff' }}>
                    {selectedSite.siteName}
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {selectedSite.address} • Supervisor: <strong style={{ color: '#fff' }}>{selectedSite.supervisor}</strong>
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {/* Select other project worksites */}
                  <select
                    style={{ padding: '0.6rem 0.9rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '0.82rem', outline: 'none' }}
                    value={selectedSiteId}
                    onChange={(e) => setSelectedSiteId(e.target.value)}
                  >
                    {sitesData.map(s => (
                      <option key={s.siteId} value={s.siteId}>{s.siteName}</option>
                    ))}
                  </select>

                  <button
                    onClick={handleSimulateShuttle}
                    className="btn btn-glass"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', padding: '0.6rem 1rem' }}
                    title="Simulate transit shuttle progressing to site"
                  >
                    <RefreshCw size={14} /> Update Fleet Telemetry
                  </button>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${selectedSite.lat},${selectedSite.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary"
                    style={{ background: '#7c3aed', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', padding: '0.6rem 1rem' }}
                  >
                    <ExternalLink size={14} /> Worksite GPS
                  </a>
                </div>
              </div>

              {/* Headcount Telemetry Badges */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-glass)' }}>
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Required Headcount</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: '800', color: '#60a5fa', marginTop: '0.15rem' }}>
                    {selectedSite.totalAssigned} Workers
                  </div>
                </div>

                <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#34d399', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CheckCircle size={13} /> Present On Site (Inside Geofence)
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: '800', color: '#34d399', marginTop: '0.15rem' }}>
                    {selectedSite.presentOnSite} Workers
                  </div>
                </div>

                <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#fbbf24', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={13} /> In Transit / En Route to Site
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: '800', color: '#fbbf24', marginTop: '0.15rem' }}>
                    {selectedSite.inTransit} Workers
                  </div>
                </div>
              </div>
            </div>

            {/* Map & Batch Tracking Breakdown Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '8fr 4fr', gap: '1.5rem' }}>

              {/* Worksite & Fleet Map */}
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', color: '#fff', fontSize: '0.95rem' }}>
                    <Compass size={17} style={{ color: '#a855f7' }} /> Worksite Perimeter &amp; Transit Fleet Map
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#c084fc', background: 'rgba(168, 85, 247, 0.15)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                    Geofence: {selectedSite.geofenceRadiusMeters}m Active
                  </span>
                </div>

                {/* Geoapify Worksite Search & Manager Location Toolbar */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.85rem', position: 'relative' }}>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.75rem' }}>
                    <MapPin size={15} style={{ color: '#a855f7', flexShrink: 0 }} />
                    <input
                      type="text"
                      placeholder="Search project worksite address via Geoapify..."
                      style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', fontSize: '0.82rem', outline: 'none' }}
                      onChange={async (e) => {
                        const val = e.target.value;
                        if (val.trim().length >= 3) {
                          const hits = await searchAddress(val, { limit: 4 });
                          setSiteSuggestions(hits);
                        } else {
                          setSiteSuggestions([]);
                        }
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleDetectManagerLocation}
                    disabled={isLocatingManager}
                    className="btn btn-glass"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', padding: '0.5rem 0.85rem', whiteSpace: 'nowrap' }}
                    title="Calibrate worksite using your live device GPS / Geoapify location"
                  >
                    <Navigation size={13} className={isLocatingManager ? 'spin' : ''} />
                    {isLocatingManager ? 'Locating...' : 'Detect Manager Live Location'}
                  </button>

                  {siteSuggestions.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 600,
                      background: 'rgba(15, 23, 42, 0.98)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(168, 85, 247, 0.4)',
                      borderRadius: '8px',
                      marginTop: '4px',
                      overflow: 'hidden',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.6)'
                    }}>
                      {siteSuggestions.map((sugg) => (
                        <div
                          key={sugg.id}
                          onClick={() => {
                            setSitesData(prev => prev.map(s => {
                              if (s.siteId === selectedSiteId) {
                                return {
                                  ...s,
                                  lat: parseFloat(sugg.lat.toFixed(5)),
                                  lng: parseFloat(sugg.lng.toFixed(5)),
                                  address: sugg.label
                                };
                              }
                              return s;
                            }));
                            setSiteSuggestions([]);
                            setToast({
                              title: 'Worksite Re-pinned via Geoapify',
                              body: `${sugg.label} (${sugg.lat.toFixed(4)}, ${sugg.lng.toFixed(4)})`,
                              type: 'success'
                            });
                          }}
                          style={{
                            padding: '0.65rem 0.85rem',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
                            cursor: 'pointer',
                            fontSize: '0.82rem',
                            color: '#fff'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(168, 85, 247, 0.2)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ fontWeight: '600', color: '#c084fc' }}>{sugg.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{sugg.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <LiveLocationMap
                  b2bSite={selectedSite}
                  showRoute={true}
                  height="460px"
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-glass)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={14} style={{ color: '#a855f7' }} />
                    <span>Project Coordinates: <strong>{selectedSite.lat}, {selectedSite.lng}</strong></span>
                  </div>
                  <span style={{ color: '#34d399', fontWeight: '600' }}>Biometric &amp; GPS Geofence Synchronized</span>
                </div>
              </div>

              {/* Right Column: Deployment Batches Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {/* Batch Status Cards */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '0.75rem' }}>
                    Deployment Batches &amp; Transit ETAs
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {selectedSite.batches.map(batch => {
                      const isTransit = batch.status.toLowerCase().includes('transit');
                      return (
                        <div
                          key={batch.batchId}
                          style={{
                            background: 'var(--bg-surface-elevated)',
                            border: `1px solid ${isTransit ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
                            borderRadius: 'var(--radius-md)',
                            padding: '1rem'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: '800', color: '#c084fc' }}>
                              {batch.batchId}
                            </span>
                            <span style={{
                              fontSize: '0.72rem', fontWeight: '700',
                              background: isTransit ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                              color: isTransit ? '#fbbf24' : '#34d399',
                              padding: '0.15rem 0.5rem', borderRadius: '12px'
                            }}>
                              {batch.status}
                            </span>
                          </div>

                          <div style={{ fontWeight: '700', color: '#fff', fontSize: '0.92rem' }}>
                            {batch.headcount} {batch.trade}
                          </div>

                          {isTransit ? (
                            <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Estimated Arrival:</span>
                              <strong style={{ fontFamily: 'var(--font-mono)', color: '#fbbf24', fontSize: '0.9rem' }}>
                                ~{batch.etaMinutes} Mins ({batch.distanceKm} km away)
                              </strong>
                            </div>
                          ) : (
                            <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Clock-In Status:</span>
                              <strong style={{ color: '#34d399', fontSize: '0.82rem' }}>All {batch.headcount} Geotagged Active</strong>
                            </div>
                          )}

                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                            Transport: {batch.driver}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Supervisor Contact Card */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '0.5rem' }}>
                    Site Operations &amp; Safety Control
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#fff', marginBottom: '0.75rem' }}>
                    Supervisor: <strong>{selectedSite.supervisor}</strong>
                  </p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    Geofenced punch-in restricts attendance clock-in within a {selectedSite.geofenceRadiusMeters}m perimeter of project coordinates.
                  </p>
                  <button
                    onClick={() => setActiveTab('attendance')}
                    className="btn btn-glass"
                    style={{ width: '100%', padding: '0.65rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                  >
                    <CheckSquare size={14} /> Open Daily Digital Attendance Timesheet
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 3: HIRE MULTIPLE WORKERS (BULK REQUEST)
            ══════════════════════════════════════════════════════════ */}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.76rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Worksite Address / Project Location
                  </label>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        gps.startWatching();
                        const pos = await gps.getOnce();
                        setSiteLocation(prev => prev.includes('GPS') ? prev : `${prev} (GPS: ${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)})`);
                        setToast({ title: 'Worksite Coordinates Captured', body: `Site GPS tagged at ${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`, type: 'success' });
                      } catch (e) {
                        setToast({ title: 'Location Error', body: e.message || 'Please allow location permission in your browser.', type: 'error' });
                      }
                    }}
                    style={{
                      background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)',
                      borderRadius: '6px', color: '#c084fc', fontSize: '0.72rem', padding: '0.2rem 0.6rem',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: '600'
                    }}
                  >
                    <Navigation size={12} /> Use My Live GPS
                  </button>
                </div>
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

        {/* ══════════════════════════════════════════════════════════
            TAB 4: ATTENDANCE TIMESHEET
            ══════════════════════════════════════════════════════════ */}
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

        {/* ══════════════════════════════════════════════════════════
            TAB 5: PAYROLL & GST INVOICES
            ══════════════════════════════════════════════════════════ */}
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
