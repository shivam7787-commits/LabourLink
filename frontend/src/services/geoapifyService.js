/**
 * Geoapify Service for LabourLink
 * 
 * Provides:
 * - Real-time location detection (Browser GPS with automatic Geoapify IP Geolocation fallback)
 * - Reverse Geocoding (Lat/Lng -> Formatted Street Address, City, Landmark)
 * - Forward Geocoding & Address Search (Text -> Lat/Lng coordinates)
 * - Turn-by-Turn Road Routing & Polyline Geometry (Origin -> Destination)
 * - Custom Geoapify Dark Matter Tile Layers
 */

export const GEOAPIFY_API_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEOAPIFY_API_KEY) ||
  '9ca62eb1bf024be9beddf40bd4653b99';

const BASE_URL = 'https://api.geoapify.com/v1';

/**
 * Fetch approximate real-time location via Geoapify IP Geolocation.
 * Works seamlessly on laptops, desktop browsers, or when GPS permission is denied.
 */
export async function getIpLocation() {
  try {
    const res = await fetch(`${BASE_URL}/ipinfo?apiKey=${GEOAPIFY_API_KEY}`);
    if (!res.ok) throw new Error(`Geoapify IP API responded with status ${res.status}`);
    const data = await res.json();

    const lat = data.location?.latitude || 19.0760;
    const lng = data.location?.longitude || 72.8777;
    const city = data.city?.name || 'Mumbai';
    const state = data.state?.name || 'Maharashtra';
    const country = data.country?.name || 'India';

    return {
      lat,
      lng,
      city,
      state,
      country,
      postcode: data.postcode || '',
      ip: data.ip || '',
      formatted: `${city}, ${state}, ${country}`,
      source: 'ip'
    };
  } catch (err) {
    console.warn('[Geoapify] IP Geolocation error:', err);
    // Fallback coordinates (Mumbai central)
    return {
      lat: 19.0760,
      lng: 72.8777,
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      postcode: '400001',
      formatted: 'Mumbai, Maharashtra, India',
      source: 'fallback'
    };
  }
}

/**
 * Reverse geocode latitude and longitude into human-readable address.
 */
export async function reverseGeocode(lat, lng) {
  if (!lat || !lng) return null;
  try {
    const res = await fetch(`${BASE_URL}/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${GEOAPIFY_API_KEY}`);
    if (!res.ok) throw new Error(`Geoapify Reverse Geocode failed with status ${res.status}`);
    const data = await res.json();

    if (data.features && data.features.length > 0) {
      const p = data.features[0].properties;
      return {
        formatted: p.formatted || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        address_line1: p.address_line1 || p.name || '',
        address_line2: p.address_line2 || '',
        city: p.city || p.county || '',
        state: p.state || '',
        postcode: p.postcode || '',
        country: p.country || '',
        street: p.street || '',
        suburb: p.suburb || p.district || '',
        landmark: p.name !== p.city ? p.name : ''
      };
    }
  } catch (err) {
    console.warn('[Geoapify] Reverse geocode error:', err);
  }
  return {
    formatted: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    city: '',
    state: '',
    postcode: ''
  };
}

/**
 * Search/Autocomplete addresses via Geoapify Forward Geocoding.
 */
export async function searchAddress(query, { limit = 5, country = 'in' } = {}) {
  if (!query || query.trim().length < 2) return [];
  try {
    const countryFilter = country ? `&filter=countrycode:${country}` : '';
    const res = await fetch(
      `${BASE_URL}/geocode/search?text=${encodeURIComponent(query)}&limit=${limit}${countryFilter}&apiKey=${GEOAPIFY_API_KEY}`
    );
    if (!res.ok) throw new Error(`Geoapify Search failed with status ${res.status}`);
    const data = await res.json();

    if (data.features && Array.isArray(data.features)) {
      return data.features.map(f => {
        const p = f.properties;
        return {
          id: p.place_id || `${p.lat}-${p.lon}`,
          label: p.formatted,
          name: p.name || p.street || p.city,
          addressLine1: p.address_line1,
          addressLine2: p.address_line2,
          city: p.city,
          state: p.state,
          postcode: p.postcode,
          country: p.country,
          lat: p.lat,
          lng: p.lon
        };
      });
    }
    return [];
  } catch (err) {
    console.warn('[Geoapify] Search address error:', err);
    return [];
  }
}

/**
 * Turn-by-Turn Road Routing between two coordinates.
 * Returns exact road distance, driving duration, and Leaflet-compatible [lat, lng][] polyline coordinates.
 */
export async function getRoute(origin, destination, mode = 'drive') {
  if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) {
    return null;
  }

  try {
    const res = await fetch(
      `${BASE_URL}/routing?waypoints=${origin.lat},${origin.lng}|${destination.lat},${destination.lng}&mode=${mode}&apiKey=${GEOAPIFY_API_KEY}`
    );
    if (!res.ok) throw new Error(`Geoapify Routing failed with status ${res.status}`);
    const data = await res.json();

    if (data.features && data.features.length > 0) {
      const feat = data.features[0];
      const props = feat.properties || {};
      const distanceMeters = props.distance || 0;
      const durationSeconds = props.time || 0;

      // GeoJSON coordinates are [lon, lat]. Convert to Leaflet [lat, lon]:
      let pathCoords = [];
      if (feat.geometry && Array.isArray(feat.geometry.coordinates)) {
        // MultiLineString or LineString
        const rawCoords = Array.isArray(feat.geometry.coordinates[0][0])
          ? feat.geometry.coordinates.flat()
          : feat.geometry.coordinates;
        pathCoords = rawCoords.map(coord => [coord[1], coord[0]]);
      }

      return {
        distanceKm: parseFloat((distanceMeters / 1000).toFixed(1)),
        etaMinutes: Math.max(1, Math.round(durationSeconds / 60)),
        distanceMeters,
        durationSeconds,
        coordinates: pathCoords
      };
    }
  } catch (err) {
    console.warn('[Geoapify] Routing error, falling back to direct calculation:', err);
  }

  // Fallback direct distance calculation (Haversine)
  const dKm = calculateDirectDistance(origin.lat, origin.lng, destination.lat, destination.lng);
  return {
    distanceKm: parseFloat(dKm.toFixed(1)),
    etaMinutes: Math.max(1, Math.round(dKm * 3)), // Approx 20 km/h in city
    coordinates: [
      [origin.lat, origin.lng],
      [destination.lat, destination.lng]
    ]
  };
}

/**
 * High-level helper to fetch current user location.
 * Tries device GPS first; if denied or unavailable, smoothly falls back to Geoapify IP Geolocation.
 * Then enriches the result with Geoapify reverse geocoding.
 */
export async function getRealtimeLocation() {
  // 1. Try browser GPS
  const gpsPromise = new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    const timer = setTimeout(() => resolve(null), 6000); // 6s timeout for GPS
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer);
        resolve({
          lat: parseFloat(pos.coords.latitude.toFixed(5)),
          lng: parseFloat(pos.coords.longitude.toFixed(5)),
          accuracy: pos.coords.accuracy,
          source: 'gps'
        });
      },
      () => {
        clearTimeout(timer);
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 10000 }
    );
  });

  const gpsResult = await gpsPromise;
  let targetLat, targetLng, accuracy, source;

  if (gpsResult) {
    targetLat = gpsResult.lat;
    targetLng = gpsResult.lng;
    accuracy = gpsResult.accuracy;
    source = 'gps';
  } else {
    // 2. Fallback to Geoapify IP Geolocation
    const ipResult = await getIpLocation();
    targetLat = ipResult.lat;
    targetLng = ipResult.lng;
    accuracy = 1000;
    source = 'ip';
  }

  // 3. Enrich with reverse geocoding for clean street address
  const rev = await reverseGeocode(targetLat, targetLng);

  return {
    lat: targetLat,
    lng: targetLng,
    accuracy,
    source,
    formatted: rev?.formatted || `${targetLat}, ${targetLng}`,
    addressLine1: rev?.address_line1 || '',
    addressLine2: rev?.address_line2 || '',
    city: rev?.city || '',
    state: rev?.state || '',
    postcode: rev?.postcode || '',
    landmark: rev?.landmark || ''
  };
}

/**
 * Get the Leaflet Tile Layer URL for Geoapify Dark Matter.
 */
export function getGeoapifyTileUrl(style = 'dark-matter-dark-grey') {
  return `https://maps.geoapify.com/v1/tile/${style}/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`;
}

/**
 * Haversine formula fallback
 */
function calculateDirectDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
