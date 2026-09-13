/**
 * useGeolocation — Custom React hook for real browser GPS tracking
 *
 * Returns:
 *  - coords: { lat, lng, accuracy, heading, speed } | null
 *  - error: string | null
 *  - permissionState: 'unknown' | 'prompt' | 'granted' | 'denied'
 *  - isWatching: boolean
 *  - requestPermission: () => void   — triggers the browser permission dialog
 *  - stopWatching: () => void
 *  - getOnce: () => Promise<coords>  — one-shot position fetch
 */
import { useState, useEffect, useRef, useCallback } from 'react';

const GEO_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 5000
};

export const useGeolocation = ({ autoStart = false } = {}) => {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);
  const [permissionState, setPermissionState] = useState('unknown');
  const [isWatching, setIsWatching] = useState(false);
  const watchIdRef = useRef(null);

  // Check permission status without triggering the dialog
  useEffect(() => {
    if (!navigator.geolocation) {
      setPermissionState('denied');
      setError('Geolocation is not supported by your browser.');
      return;
    }

    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermissionState(result.state); // 'granted' | 'denied' | 'prompt'
        result.onchange = () => setPermissionState(result.state);
      }).catch(() => {
        setPermissionState('prompt');
      });
    } else {
      setPermissionState('prompt');
    }
  }, []);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    if (watchIdRef.current !== null) return; // already watching

    setError(null);
    setIsWatching(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setPermissionState('granted');
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading,
          speed: position.coords.speed
        });
        setError(null);
      },
      (err) => {
        setIsWatching(false);
        watchIdRef.current = null;
        if (err.code === 1) {
          setPermissionState('denied');
          setError('Location access denied. Please allow location in your browser settings.');
        } else if (err.code === 2) {
          setError('Unable to determine location. Check your device GPS.');
        } else {
          setError('Location request timed out. Please try again.');
        }
      },
      GEO_OPTIONS
    );
  }, []);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsWatching(false);
  }, []);

  // One-shot position fetch (for customer home pin)
  const getOnce = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPermissionState('granted');
          const c = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            heading: position.coords.heading,
            speed: position.coords.speed
          };
          setCoords(c);
          setError(null);
          resolve(c);
        },
        (err) => {
          if (err.code === 1) {
            setPermissionState('denied');
            setError('Location access denied.');
          } else {
            setError('Could not get location.');
          }
          reject(err);
        },
        GEO_OPTIONS
      );
    });
  }, []);

  // Auto-start if permission already granted
  useEffect(() => {
    if (autoStart && permissionState === 'granted') {
      startWatching();
    }
  }, [autoStart, permissionState, startWatching]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    coords,
    error,
    permissionState,
    isWatching,
    requestPermission: startWatching,
    startWatching,
    stopWatching,
    getOnce
  };
};
