import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapPinIcon, PhoneIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import useGeolocation from '../hooks/useGeolocation.js';
import useFetch from '../hooks/useFetch.jsx';
import GooglePharmacyMap from '../components/maps/GooglePharmacyMap.jsx';
import PharmacyCard from '../components/pharmacies/PharmacyCard.jsx';
import { formatDistance } from '../utils/formatters.js';
import { pharmacyImage } from '../utils/mediaUrl.js';

const PharmacyDetails = () => {
  const { id } = useParams();
  const { location } = useGeolocation({ requestOnMount: false });

  const query = useMemo(() => `lat=${location.lat}&lng=${location.lng}`, [location.lat, location.lng]);
  const { data, loading, error } = useFetch(`/pharmacies/${id}?${query}`, { pharmacy: null }, [id, query]);

  const pharmacy = data?.pharmacy || null;
  const meds = pharmacy?.availableMedicines || [];

  const lat = pharmacy?.location?.latitude;
  const lng = pharmacy?.location?.longitude;
  const directionsUrl =
    typeof lat === 'number' && typeof lng === 'number'
      ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pharmacy?.name || '')}`;

  if (loading) return <div className="page-card"><p>Loading pharmacy…</p></div>;

  if (error || !pharmacy?._id) {
    return (
      <div className="page-card">
        <h1>Pharmacy not found</h1>
        {error && <p className="error-message">{error}</p>}
        <Link to="/pharmacies" className="btn">Back to pharmacies</Link>
      </div>
    );
  }

  return (
    <div className="page-card">
      <div className="detail-hero">
        <div className="detail-media">
          <img
            className="detail-image"
            src={pharmacyImage(pharmacy)}
            alt={`${pharmacy.name} storefront`}
            onError={(e) => { e.currentTarget.src = '/pharmacies/fallback.svg'; }}
          />
        </div>

        <div className="detail-content">
          <h1>{pharmacy.name}</h1>
          {pharmacy.distanceKm != null && <p className="distance-line">{formatDistance(pharmacy.distanceKm)}</p>}
          <p><MapPinIcon className="icon-inline" /> {pharmacy.address}, {pharmacy.city}{pharmacy.state ? `, ${pharmacy.state}` : ''}</p>
          <p><PhoneIcon className="icon-inline" /> {pharmacy.phone || 'Phone not listed'}</p>
          <p><Squares2X2Icon className="icon-inline" /> {meds.length} medicines available</p>

          <div className="cta-row">
            <a href={directionsUrl} className="btn" target="_blank" rel="noreferrer">Directions</a>
            <Link to="/reports" className="btn outline">Submit Report</Link>
          </div>
        </div>
      </div>

      <div className="two-col" style={{ marginTop: 16 }}>
        <div className="card">
          <h2>Available medicines</h2>
          {meds.length === 0 ? (
            <p>No medicines linked to this pharmacy yet.</p>
          ) : (
            <div className="med-list">
              {meds.slice(0, 20).map((m) => (
                <div key={m._id} className="med-row">
                  <span className="med-name">{m.name}</span>
                  <span className={`badge ${m.availability}`}>{m.availability}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <GooglePharmacyMap pharmacies={[pharmacy]} userLocation={location} height={360} />
      </div>

      <div style={{ marginTop: 12 }}>
        <Link to="/pharmacies" className="subtle">← Back</Link>
      </div>
    </div>
  );
};

export default PharmacyDetails;

