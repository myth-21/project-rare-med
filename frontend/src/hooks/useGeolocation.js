import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'raremed_user_location';

const CITY_COORDINATES = {
  hyderabad: { lat: 17.4126, lng: 78.4482 },
  mumbai: { lat: 19.0596, lng: 72.8295 },
  pune: { lat: 18.5204, lng: 73.8567 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  delhi: { lat: 28.6139, lng: 77.2090 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
};

const getFallbackCityCoords = (city) => {
  if (!city) return null;
  const key = city.trim().toLowerCase();
  return CITY_COORDINATES[key] || null;
};

const readStored = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export default function useGeolocation({ requestOnMount = true, profileCity = '' } = {}) {
  const [location, setLocation] = useState(() => readStored());
  const [status, setStatus] = useState(() => (readStored() ? 'ready' : 'idle'));
  const [error, setError] = useState('');

  const applyPosition = useCallback((pos, label = '', isFallback = false) => {
    const next = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      label: label || 'Your location',
      isFallback,
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
      const fallbackCoords = getFallbackCityCoords(profileCity);
      if (fallbackCoords) {
        applyPosition(
          { coords: { latitude: fallbackCoords.lat, longitude: fallbackCoords.lng, accuracy: 5000 } },
          `Profile: ${profileCity}`,
          true
        );
        return;
      }
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

        const fallbackCoords = getFallbackCityCoords(profileCity);
        if (fallbackCoords) {
          applyPosition(
            { coords: { latitude: fallbackCoords.lat, longitude: fallbackCoords.lng, accuracy: 5000 } },
            `Profile: ${profileCity}`,
            true
          );
          return;
        }

        setStatus(err.code === 1 ? 'denied' : 'error');
        setError(
          err.code === 1
            ? 'Allow location access to sort nearby pharmacies by distance.'
            : 'Could not detect your location. Showing verified pharmacies.'
        );
        setLocation(null);
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 }
    );
  }, [applyPosition, profileCity]);

  useEffect(() => {
    const stored = readStored();
    const storedMatchesProfile =
      stored &&
      (!stored.isFallback ||
        (profileCity && stored.label?.toLowerCase().includes(profileCity.toLowerCase())));

    if (requestOnMount && (!stored || !storedMatchesProfile)) {
      requestLocation();
    } else if (stored) {
      setLocation(stored);
      setStatus('ready');
    }
  }, [requestOnMount, requestLocation, profileCity]);

  return {
    location,
    status,
    error,
    requestLocation,
    isFallback: location?.isFallback || false,
    cityLabel: location?.label || location?.city || 'Nearby',
  };
}
