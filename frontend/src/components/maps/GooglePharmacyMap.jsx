import { useCallback, useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { directionsUrl, getPharmacyCoords, openMapsUrl } from '../../utils/location.js';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const INDIA_CENTER = { lat: 20.5937, lng: 78.9629 };

const LocationLinks = ({ pharmacies }) => (
  <div className="map-locations">
    {pharmacies.map((pharmacy) => {
      const position = getPharmacyCoords(pharmacy);
      if (!position) return null;
      const meds = pharmacy.availableMedicines || pharmacy.medicines || [];
      return (
        <div key={pharmacy._id || pharmacy.name} className="direction-link">
          <strong>{pharmacy.name}</strong>
          <span>
            {pharmacy.address}, {pharmacy.city}
          </span>
          {pharmacy.distanceKm != null && <span>{pharmacy.distanceKm.toFixed(1)} km away</span>}
          {meds.length > 0 && <span>{meds.slice(0, 3).map((m) => m.name).join(', ')}</span>}
          <span className="map-link-row">
            <a href={directionsUrl(pharmacy)} target="_blank" rel="noreferrer">
              Get Directions
            </a>
            <a href={openMapsUrl(pharmacy)} target="_blank" rel="noreferrer">
              Open in Maps
            </a>
          </span>
        </div>
      );
    })}
  </div>
);

function LeafletPharmacyMap({ pharmacies, height, userPos }) {
  const points = pharmacies.map(getPharmacyCoords).filter(Boolean);
  const center = userPos || points[0] || INDIA_CENTER;
  const mapKey = `${center.lat}:${center.lng}:${points.length}`;

  return (
    <>
      <MapContainer
        key={mapKey}
        center={[center.lat, center.lng]}
        zoom={points.length === 1 ? 14 : 11}
        style={{ height, width: '100%', borderRadius: '16px' }}
      >
        <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {userPos && (
          <Marker position={[userPos.lat, userPos.lng]}>
            <Popup>You are here</Popup>
          </Marker>
        )}
        {pharmacies.map((pharmacy) => {
          const position = getPharmacyCoords(pharmacy);
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
                {pharmacy.distanceKm != null && (
                  <>
                    <br />
                    {pharmacy.distanceKm.toFixed(1)} km away
                  </>
                )}
                {meds.length > 0 && (
                  <>
                    <br />
                    <em>Available:</em>
                    {meds.slice(0, 6).map((m) => (
                      <div key={m._id || m.name}>{m.name}</div>
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
    if (!apiKey) {
      reject(new Error('Google Maps unavailable'));
      return;
    }
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

function GoogleMapsView({ pharmacies, height, userPos, onUnavailable }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const maps = await loadGoogleMaps(apiKey);
      if (cancelled || !mapRef.current) return;

      const points = pharmacies.map(getPharmacyCoords).filter(Boolean);
      const center = userPos || points[0] || INDIA_CENTER;

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

      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

      const bounds = new maps.LatLngBounds();
      pharmacies.forEach((pharmacy) => {
        const position = getPharmacyCoords(pharmacy);
        if (!position) return;
        bounds.extend(position);
        const marker = new maps.Marker({ position, map: mapInstance.current, title: pharmacy.name });
        const meds = pharmacy.availableMedicines || pharmacy.medicines || [];
        const info = new maps.InfoWindow({
          content: `<div style="max-width:260px;font-family:Inter,sans-serif">
            <strong>${pharmacy.name}</strong><br/>
            ${pharmacy.address || ''}<br/>
            ${pharmacy.city || ''}${pharmacy.state ? `, ${pharmacy.state}` : ''}<br/>
            ${pharmacy.phone ? `Tel: ${pharmacy.phone}<br/>` : ''}
            ${pharmacy.distanceKm != null ? `${pharmacy.distanceKm.toFixed(1)} km away<br/>` : ''}
            ${meds.length ? `<em>Available:</em> ${meds.slice(0, 4).map((m) => m.name).join(', ')}<br/>` : ''}
            <a href="${directionsUrl(pharmacy)}" target="_blank">Get Directions</a> -
            <a href="${openMapsUrl(pharmacy)}" target="_blank">Open in Maps</a>
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

    init().catch(() => onUnavailable?.());
    return () => {
      cancelled = true;
    };
  }, [apiKey, pharmacies, userPos, onUnavailable]);

  return (
    <>
      <div ref={mapRef} style={{ width: '100%', height, borderRadius: '16px', background: '#E2E8F0' }} />
      <LocationLinks pharmacies={pharmacies} />
    </>
  );
}

export default function GooglePharmacyMap({ pharmacies = [], height = 420, userLocation = null }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const validPharmacies = pharmacies.filter((pharmacy) => getPharmacyCoords(pharmacy));
  const [mode, setMode] = useState(apiKey ? 'google' : 'leaflet');
  const [fallbackNotice, setFallbackNotice] = useState('');
  const userPos =
    userLocation && typeof userLocation.lat === 'number' && typeof userLocation.lng === 'number'
      ? { lat: userLocation.lat, lng: userLocation.lng }
      : null;

  useEffect(() => {
    setMode(apiKey ? 'google' : 'leaflet');
    setFallbackNotice('');
  }, [apiKey]);

  const handleGoogleUnavailable = useCallback(() => {
    setFallbackNotice('Showing the fallback map view.');
    setMode('leaflet');
  }, []);

  if (validPharmacies.length === 0) {
    return (
      <div className="map-card google-map-card">
        <p className="map-error">No mapped pharmacy locations are available yet.</p>
      </div>
    );
  }

  return (
    <div className="map-card google-map-card">
      {fallbackNotice && <p className="map-error">{fallbackNotice}</p>}
      {mode === 'google' ? (
        <GoogleMapsView
          pharmacies={validPharmacies}
          height={height}
          userPos={userPos}
          onUnavailable={handleGoogleUnavailable}
        />
      ) : (
        <LeafletPharmacyMap pharmacies={validPharmacies} height={height} userPos={userPos} />
      )}
    </div>
  );
}
