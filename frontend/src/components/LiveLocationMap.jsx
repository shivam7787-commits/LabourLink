import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * Reusable High-Fidelity Dark Theme Leaflet Map for LabourLink
 * 
 * Props:
 * - customerLoc: { lat, lng, address, name, landmark }
 * - labourLoc: { lat, lng, address, name, trade }
 * - b2bSite: { lat, lng, siteName, address, geofenceRadiusMeters, batches }
 * - showRoute: boolean (default true)
 * - height: string (default '440px')
 */
export const LiveLocationMap = ({
  customerLoc,
  labourLoc,
  b2bSite,
  showRoute = true,
  height = '440px'
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy any existing map instance to avoid React strict mode / re-render duplicates
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Default coordinates: Mumbai
    const defaultCenter = [19.0760, 72.8777];
    const initialCenter = customerLoc?.lat && customerLoc?.lng
      ? [customerLoc.lat, customerLoc.lng]
      : b2bSite?.lat && b2bSite?.lng
        ? [b2bSite.lat, b2bSite.lng]
        : defaultCenter;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 14,
      zoomControl: true,
      attributionControl: false
    });

    mapInstanceRef.current = map;

    // Dark Matter tile layer for high-contrast dark mode
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    const boundsGroup = [];

    // 1. CUSTOMER HOME PIN
    if (customerLoc?.lat && customerLoc?.lng) {
      const custIcon = L.divIcon({
        className: 'custom-map-marker customer-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
            <div style="
              width: 38px; height: 38px; border-radius: 50%;
              background: linear-gradient(135deg, #2563eb, #1d4ed8);
              border: 2.5px solid #60a5fa;
              display: flex; align-items: center; justify-content: center;
              box-shadow: 0 0 16px rgba(37, 99, 235, 0.6);
              color: white; font-size: 16px;
            ">
              🏠
            </div>
            <div style="
              margin-top: 4px; background: rgba(15, 23, 42, 0.9);
              border: 1px solid rgba(59, 130, 246, 0.4);
              border-radius: 4px; padding: 2px 6px;
              color: #93c5fd; font-size: 10px; font-weight: 700;
              white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.5);
            ">
              ${customerLoc.name || 'Customer'}
            </div>
          </div>
        `,
        iconSize: [40, 56],
        iconAnchor: [20, 38]
      });

      const custMarker = L.marker([customerLoc.lat, customerLoc.lng], { icon: custIcon }).addTo(map);
      custMarker.bindPopup(`
        <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; line-height: 1.4;">
          <strong style="color: #1d4ed8; font-size: 13px;">📍 Customer Destination</strong><br/>
          <strong>${customerLoc.name || 'Customer Location'}</strong><br/>
          <span style="color: #475569;">${customerLoc.address || 'Address on file'}</span>
          ${customerLoc.landmark ? `<br/><em style="color: #64748b;">Landmark: ${customerLoc.landmark}</em>` : ''}
        </div>
      `);

      boundsGroup.push([customerLoc.lat, customerLoc.lng]);
    }

    // 2. LABOUR WORKER PIN WITH PULSING RADAR
    if (labourLoc?.lat && labourLoc?.lng) {
      const labourIcon = L.divIcon({
        className: 'custom-map-marker labour-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
            <div style="
              position: absolute; top: -6px; left: -6px; width: 50px; height: 50px;
              border-radius: 50%; background: rgba(16, 185, 129, 0.25);
              animation: pulse-ring 1.8s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
            "></div>
            <div style="
              width: 38px; height: 38px; border-radius: 50%;
              background: linear-gradient(135deg, #059669, #10b981);
              border: 2.5px solid #34d399;
              display: flex; align-items: center; justify-content: center;
              box-shadow: 0 0 18px rgba(16, 185, 129, 0.7);
              color: white; font-size: 17px; z-index: 2;
            ">
              🛵
            </div>
            <div style="
              margin-top: 4px; background: rgba(15, 23, 42, 0.9);
              border: 1px solid rgba(16, 185, 129, 0.4);
              border-radius: 4px; padding: 2px 6px;
              color: #6ee7b7; font-size: 10px; font-weight: 700;
              white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.5); z-index: 2;
            ">
              ${labourLoc.name || 'Worker'} • En Route
            </div>
          </div>
        `,
        iconSize: [40, 56],
        iconAnchor: [20, 38]
      });

      const workerMarker = L.marker([labourLoc.lat, labourLoc.lng], { icon: labourIcon }).addTo(map);
      workerMarker.bindPopup(`
        <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; line-height: 1.4;">
          <strong style="color: #047857; font-size: 13px;">⚡ Worker Live Location</strong><br/>
          <strong>${labourLoc.name || 'Assigned Professional'}</strong><br/>
          <span style="color: #059669; font-weight: 600;">${labourLoc.trade || 'Verified Pro'}</span><br/>
          <span style="color: #475569;">Near ${labourLoc.address || 'In transit'}</span>
        </div>
      `);

      boundsGroup.push([labourLoc.lat, labourLoc.lng]);
    }

    // 3. ROUTE POLYLINE (LABOUR -> CUSTOMER)
    if (showRoute && customerLoc?.lat && labourLoc?.lat) {
      const midLat = (customerLoc.lat + labourLoc.lat) / 2 + 0.0012;
      const midLng = (customerLoc.lng + labourLoc.lng) / 2 - 0.0015;

      const pathCoords = [
        [labourLoc.lat, labourLoc.lng],
        [midLat, midLng],
        [customerLoc.lat, customerLoc.lng]
      ];

      L.polyline(pathCoords, {
        color: '#10b981',
        weight: 6,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      L.polyline(pathCoords, {
        color: '#34d399',
        weight: 3.5,
        opacity: 0.95,
        dashArray: '8, 8',
        lineCap: 'round'
      }).addTo(map);
    }

    // 4. B2B SITE & BATCH MARKERS
    if (b2bSite?.lat && b2bSite?.lng) {
      const siteIcon = L.divIcon({
        className: 'custom-map-marker site-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
            <div style="
              width: 42px; height: 42px; border-radius: 12px;
              background: linear-gradient(135deg, #7c3aed, #6d28d9);
              border: 2.5px solid #a855f7;
              display: flex; align-items: center; justify-content: center;
              box-shadow: 0 0 20px rgba(124, 58, 237, 0.7);
              color: white; font-size: 19px;
            ">
              🏗️
            </div>
            <div style="
              margin-top: 4px; background: rgba(15, 23, 42, 0.9);
              border: 1px solid rgba(168, 85, 247, 0.5);
              border-radius: 4px; padding: 2px 6px;
              color: #c084fc; font-size: 10px; font-weight: 700;
              white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.5);
            ">
              ${b2bSite.siteName || 'Project Worksite'}
            </div>
          </div>
        `,
        iconSize: [44, 60],
        iconAnchor: [22, 42]
      });

      const siteMarker = L.marker([b2bSite.lat, b2bSite.lng], { icon: siteIcon }).addTo(map);
      siteMarker.bindPopup(`
        <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; line-height: 1.4;">
          <strong style="color: #7c3aed; font-size: 13px;">🏢 Worksite Boundary</strong><br/>
          <strong>${b2bSite.siteName}</strong><br/>
          <span style="color: #475569;">${b2bSite.address}</span><br/>
          <span style="color: #059669; font-weight: 600;">Geofence: ${b2bSite.geofenceRadiusMeters || 200}m radius</span>
        </div>
      `);

      boundsGroup.push([b2bSite.lat, b2bSite.lng]);

      L.circle([b2bSite.lat, b2bSite.lng], {
        radius: b2bSite.geofenceRadiusMeters || 250,
        color: '#a855f7',
        fillColor: '#7c3aed',
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '5, 5'
      }).addTo(map);

      if (Array.isArray(b2bSite.batches)) {
        b2bSite.batches.forEach((batch) => {
          if (!batch.lat || !batch.lng) return;

          const isTransit = batch.status?.toLowerCase().includes('transit');
          const batchIcon = L.divIcon({
            className: 'custom-map-marker batch-marker',
            html: `
              <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
                <div style="
                  width: 32px; height: 32px; border-radius: 50%;
                  background: ${isTransit ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #059669, #10b981)'};
                  border: 2px solid ${isTransit ? '#fbbf24' : '#34d399'};
                  display: flex; align-items: center; justify-content: center;
                  box-shadow: 0 0 12px ${isTransit ? 'rgba(245, 158, 11, 0.6)' : 'rgba(16, 185, 129, 0.6)'};
                  color: white; font-size: 14px; font-weight: 800;
                ">
                  ${isTransit ? '🚌' : '👷'}
                </div>
                <div style="
                  margin-top: 3px; background: rgba(15, 23, 42, 0.9);
                  border: 1px solid rgba(255, 255, 255, 0.15);
                  border-radius: 4px; padding: 1px 5px;
                  color: #fff; font-size: 9px; font-weight: 700; white-space: nowrap;
                ">
                  ${batch.headcount} ${batch.trade}
                </div>
              </div>
            `,
            iconSize: [34, 48],
            iconAnchor: [17, 32]
          });

          const m = L.marker([batch.lat, batch.lng], { icon: batchIcon }).addTo(map);
          m.bindPopup(`
            <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; line-height: 1.4;">
              <strong style="color: ${isTransit ? '#d97706' : '#047857'}; font-size: 13px;">${batch.batchId}</strong><br/>
              <strong>${batch.headcount} ${batch.trade}</strong><br/>
              <span>Status: <strong>${batch.status}</strong></span><br/>
              ${batch.etaMinutes ? `<span style="color: #2563eb; font-weight: 700;">ETA: ${batch.etaMinutes} mins (${batch.distanceKm} km)</span><br/>` : ''}
              <span style="color: #64748b; font-size: 11px;">Transport: ${batch.driver || 'Coordinated'}</span>
            </div>
          `);

          boundsGroup.push([batch.lat, batch.lng]);

          if (isTransit) {
            L.polyline([[batch.lat, batch.lng], [b2bSite.lat, b2bSite.lng]], {
              color: '#fbbf24',
              weight: 2.5,
              opacity: 0.85,
              dashArray: '6, 6'
            }).addTo(map);
          }
        });
      }
    }

    if (boundsGroup.length > 1) {
      map.fitBounds(boundsGroup, { padding: [45, 45], maxZoom: 15 });
    } else if (boundsGroup.length === 1) {
      map.setView(boundsGroup[0], 14);
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [
    customerLoc?.lat,
    customerLoc?.lng,
    labourLoc?.lat,
    labourLoc?.lng,
    b2bSite?.lat,
    b2bSite?.lng,
    showRoute
  ]);

  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    if (customerLoc?.lat && labourLoc?.lat) {
      mapInstanceRef.current.fitBounds([
        [customerLoc.lat, customerLoc.lng],
        [labourLoc.lat, labourLoc.lng]
      ], { padding: [40, 40] });
    } else if (customerLoc?.lat) {
      mapInstanceRef.current.setView([customerLoc.lat, customerLoc.lng], 15);
    } else if (b2bSite?.lat) {
      mapInstanceRef.current.setView([b2bSite.lat, b2bSite.lng], 14);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-glass)', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', background: '#0a0e17' }} />

      <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 500, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <button
          type="button"
          onClick={handleRecenter}
          title="Recenter & Fit View"
          style={{
            background: 'rgba(17, 23, 38, 0.85)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#fff',
            borderRadius: '8px',
            padding: '6px 10px',
            fontSize: '0.75rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
          }}
        >
          <span>🎯</span> Fit View
        </button>
      </div>

      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '12px',
        zIndex: 500,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '0.7rem',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span> Live Worker
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></span> Destination
        </span>
      </div>

      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.6); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .leaflet-popup-content-wrapper {
          background: #ffffff !important;
          border-radius: 8px !important;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5) !important;
        }
        .leaflet-popup-tip {
          background: #ffffff !important;
        }
      `}</style>
    </div>
  );
};
