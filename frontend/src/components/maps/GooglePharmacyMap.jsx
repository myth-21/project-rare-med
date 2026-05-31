import { useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const coords = (pharmacy) => {
  const lat = pharmacy?.location?.latitude ?? pharmacy?.latitude ?? pharmacy?.coordinates?.lat;
  const lng = pharmacy?.location?.longitude ?? pharmacy?.longitude ?? pharmacy?.coordinates?.lng;
  if (typeof lat === 'number' && typeof lng === 'number') return { lat, lng };
  return null;
};

function useUserLocation() {
  const [position, setPosition] = useState(null);
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  }, []);
  return position;
}

const LocationLinks = ({ pharmacies }) => (
  <div className="map-locations">
    {pharmacies.map((p) => {
      const position = coords(p);
      if (!position) return null;
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${position.lat},${position.lng}`;
      const dirUrl = `https://www.google.com/maps/dir/?api=1&destination=${position.lat},${position.lng}`;
      return (
        <div key={p._id || p.name} className="direction-link" style={{ display: 'grid', gap: '6px' }}>
          <strong>{p.name}</strong>
          <span>{p.address}, {p.city}</span>
          <span style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a href={dirUrl} target="_blank" rel="noreferrer">Directions</a>
            <a href={mapsUrl} target="_blank" rel="noreferrer">Open in Google Maps</a>
          </span>
        </div>
      );
    })}
  </div>
);

function LeafletPharmacyMap({ pharmacies, height, userPos: userPosProp }) {
  const detected = useUserLocation();
  const userPos = userPosProp || detected;
  const points = pharmacies.map(coords).filter(Boolean);
  const center = userPos || points[0] || { lat: 20.5937, lng: 78.9629 };

  return (
    <>
      <MapContainer center={[center.lat, center.lng]} zoom={points.length === 1 ? 14 : 11} style={{ height, width: '100%', borderRadius: '16px' }}>
        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {userPos && (
          <Marker position={[userPos.lat, userPos.lng]}>
            <Popup>You are here</Popup>
          </Marker>
        )}
        {pharmacies.map((pharmacy) => {
          const position = coords(pharmacy);
          if (!position) return null;
          const meds = pharmacy.availableMedicines || pharmacy.medicines || [];
          return (
            <Marker key={pharmacy._id || pharmacy.name} position={[position.lat, position.lng]}>
              <Popup>
                <strong>{pharmacy.name}</strong>
                <br />
                {pharmacy.address}, {pharmacy.city}
                <br />
                {pharmacy.phone || ''}
                {meds.length > 0 && (
                  <>
                    <br />
                    <em>Available:</em>
                    {meds.slice(0, 6).map((m) => (
                      <div key={m._id || m.name}>✓ {m.name}</div>
                    ))}
                  </>
                )}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      <LocationLinks pharmacies={pharmacies} />
    </>
  );
}

const loadGoogleMaps = (apiKey) =>
  new Promise((resolve, reject) => {
    if (window.google?.maps) {
      resolve(window.google.maps);
      return;
    }
    const existing = document.querySelector('script[data-google-maps]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google.maps));
      existing.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMaps = 'true';
    script.onload = () => resolve(window.google.maps);
    script.onerror = reject;
    document.head.appendChild(script);
  });

function GoogleMapsView({ pharmacies, height, userPos: userPosProp }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const detected = useUserLocation();
  const userPos = userPosProp || detected;
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const maps = await loadGoogleMaps(apiKey);
      if (cancelled || !mapRef.current) return;

      const points = pharmacies.map(coords).filter(Boolean);
      const center = userPos || points[0] || { lat: 20.5937, lng: 78.9627 };

      if (!mapInstance.current) {
        mapInstance.current = new maps.Map(mapRef.current, {
          center,
          zoom: points.length === 1 ? 14 : 11,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });
      } else {
        mapInstance.current.setCenter(center);
      }

      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];

      const bounds = new maps.LatLngBounds();
      pharmacies.forEach((pharmacy) => {
        const position = coords(pharmacy);
        if (!position) return;
        bounds.extend(position);
        const marker = new maps.Marker({ position, map: mapInstance.current, title: pharmacy.name });
        const dirUrl = `https://www.google.com/maps/dir/?api=1&destination=${position.lat},${position.lng}`;
        const openUrl = `https://www.google.com/maps/search/?api=1&query=${position.lat},${position.lng}`;
        const info = new maps.InfoWindow({
          content: `<div style="max-width:240px;font-family:Inter,sans-serif">
            <strong>${pharmacy.name}</strong><br/>
            ${pharmacy.address || ''}<br/>
            ${pharmacy.city || ''}${pharmacy.state ? `, ${pharmacy.state}` : ''}<br/>
            ${pharmacy.phone ? `Tel: ${pharmacy.phone}<br/>` : ''}
            <a href="${dirUrl}" target="_blank">Directions</a> ·
            <a href="${openUrl}" target="_blank">Open in Google Maps</a>
          </div>`,
        });
        marker.addListener('click', () => info.open({ anchor: marker, map: mapInstance.current }));
        markersRef.current.push(marker);
      });

      if (points.length > 1) mapInstance.current.fitBounds(bounds, 48);

      if (userMarkerRef.current) userMarkerRef.current.setMap(null);
      if (userPos) {
        userMarkerRef.current = new maps.Marker({
          position: userPos,
          map: mapInstance.current,
          title: 'You are here',
          icon: {
            path: maps.SymbolPath.CIRCLE,
            scale: 9,
            fillColor: '#2563EB',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#fff',
          },
        });
      }
    };

    init().catch((err) => console.error('[GooglePharmacyMap]', err));
    return () => {
      cancelled = true;
    };
  }, [apiKey, pharmacies, userPos]);

  return (
    <>
      <div ref={mapRef} style={{ width: '100%', height, borderRadius: '16px', background: '#E2E8F0' }} />
      <LocationLinks pharmacies={pharmacies} />
    </>
  );
}

export default function GooglePharmacyMap({ pharmacies = [], height = 420, userLocation = null }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const validPharmacies = pharmacies.filter((p) => coords(p));
  const [mode, setMode] = useState(apiKey ? 'google' : 'leaflet');
  const userPos =
    userLocation && typeof userLocation.lat === 'number' && typeof userLocation.lng === 'number' && !userLocation.isFallback
      ? { lat: userLocation.lat, lng: userLocation.lng }
      : null;

  useEffect(() => {
    setMode(apiKey ? 'google' : 'leaflet');
  }, [apiKey]);

  if (validPharmacies.length === 0) {
    return (
      <div className="map-card google-map-card">
        <p className="map-error">No pharmacy coordinates in database. Run the backend seed.</p>
      </div>
    );
  }

  return (
    <div className="map-card google-map-card">
      {!apiKey && (
        <p className="map-error">
          VITE_GOOGLE_MAPS_API_KEY not set — showing OpenStreetMap. Add your key to frontend/.env for Google Maps.
        </p>
      )}
      {mode === 'google' ? (
        <GoogleMapsView pharmacies={validPharmacies} height={height} userPos={userPos} />
      ) : (
        <LeafletPharmacyMap pharmacies={validPharmacies} height={height} userPos={userPos} />
      )}
    </div>
  );
}
