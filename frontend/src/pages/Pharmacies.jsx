// Real pharmacy locator page (nearby by geo + distance sorting)
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPinIcon } from '@heroicons/react/24/outline';
import useGeolocation from '../hooks/useGeolocation.js';
import useApi from '../hooks/useFetch.jsx';
import PharmacyCard from '../components/pharmacies/PharmacyCard.jsx';
import GooglePharmacyMap from '../components/maps/GooglePharmacyMap.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

const Pharmacies = () => {
  const { location, status, error, requestLocation } = useGeolocation();
  const [filters, setFilters] = useState({ search: '', city: '', rare: false });

  const queryParams = new URLSearchParams();
  if (filters.search) queryParams.set('search', filters.search);
  if (filters.city) queryParams.set('city', filters.city);
  if (filters.rare) queryParams.set('rare', 'true');
  queryParams.set('lat', String(location.lat));
  queryParams.set('lng', String(location.lng));
  queryParams.set('sort', 'distance');

  const query = queryParams.toString();

  const { data, loading, error: apiError } = useApi(`/pharmacies?${query}`, { pharmacies: [] }, [query]);
  const pharmacies = data?.pharmacies || [];

  return (
    <div className="page-card">
      <div className="page-header">
        <h1>Nearby Pharmacies</h1>
        <p>
          Sorted by distance. {location.isFallback ? 'Using Hyderabad fallback.' : 'Using your current location.'}
        </p>
      </div>

      {(status === 'loading' || status === 'idle') && (
        <div className="location-banner">
          <MapPinIcon />
          <span>Detecting your location…</span>
        </div>
      )}

      {error && (
        <div className="location-banner fallback">
          <MapPinIcon />
          <span>{error}</span>
          <button type="button" className="btn outline small" onClick={requestLocation}>
            Try again
          </button>
        </div>
      )}

      <div className="filters inline" style={{ marginTop: 16 }}>
        <input
          placeholder="Search pharmacy"
          value={filters.search}
          onChange={(e) => setFilters((s) => ({ ...s, search: e.target.value }))}
        />
        <input
          placeholder="City"
          value={filters.city}
          onChange={(e) => setFilters((s) => ({ ...s, city: e.target.value }))}
        />
        <label className="check">
          <input
            type="checkbox"
            checked={filters.rare}
            onChange={(e) => setFilters((s) => ({ ...s, rare: e.target.checked }))}
          />
          Has medicines in stock
        </label>
      </div>

      <div className="two-col" style={{ marginTop: 16 }}>
        <div className="card-grid" style={{ alignSelf: 'start' }}>
          {loading ? (
            <LoadingSpinner />
          ) : apiError ? (
            <div className="error-message">{apiError}</div>
          ) : pharmacies.length === 0 ? (
            <div className="error-message">
              No pharmacies found in the database. Run backend seed and refresh.
            </div>
          ) : (
            pharmacies.map((p) => <PharmacyCard key={p._id} pharmacy={p} />)
          )}
        </div>

        <GooglePharmacyMap pharmacies={pharmacies} userLocation={location} height={360} />
      </div>

      <div style={{ marginTop: 12, textAlign: 'center' }}>
        <Link to="/medicines" className="subtle">Search medicines instead</Link>
      </div>
    </div>
  );
};

export default Pharmacies;

