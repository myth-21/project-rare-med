import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'raremed_user_location';
const DEFAULT_CENTER = { lat: 17.385, lng: 78.4867, label: 'Hyderabad', isFallback: true };

const readStored = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export default function useGeolocation({ requestOnMount = true } = {}) {
  const [location, setLocation] = useState(() => readStored());
  const [status, setStatus] = useState(() => (readStored() ? 'ready' : 'idle'));
  const [error, setError] = useState('');

  const applyPosition = useCallback((pos, label = '') => {
    const next = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      label: label || 'Your location',
      isFallback: false,
      updatedAt: Date.now(),
    };
    setLocation(next);
    setStatus('ready');
    setError('');
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser.');
      setStatus('denied');
      return;
    }
    setStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => applyPosition(pos),
      (err) => {
        const stored = readStored();
        if (stored && !stored.isFallback) {
          setLocation(stored);
          setStatus('ready');
          return;
        }
        setStatus(err.code === 1 ? 'denied' : 'error');
        setError(
          err.code === 1
            ? 'Location permission denied. Showing pharmacies in Hyderabad.'
            : 'Could not detect location. Showing pharmacies in Hyderabad.'
        );
        setLocation(DEFAULT_CENTER);
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CENTER));
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 }
    );
  }, [applyPosition]);

  useEffect(() => {
    if (requestOnMount && !readStored()) requestLocation();
    else if (readStored()) {
      setLocation(readStored());
      setStatus('ready');
    }
  }, [requestOnMount, requestLocation]);

  const effectiveLocation = location || DEFAULT_CENTER;

  return {
    location: effectiveLocation,
    status,
    error,
    requestLocation,
    isFallback: effectiveLocation.isFallback,
    cityLabel: effectiveLocation.label || effectiveLocation.city || 'Nearby',
  };
}
