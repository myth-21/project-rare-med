import { useEffect, useState } from 'react';
import pharmacyService from '../services/pharmacyService.js';
import { useAuth } from '../hooks/useAuth.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import PharmacyCard from '../components/pharmacies/PharmacyCard.jsx';

const PharmacyListPage = () => {
  const { token } = useAuth();
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNearby = async (lat, lng) => {
      try {
        const response = await pharmacyService.findNearby({ lat, lng }, token);
        setPharmacies(response.pharmacies);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => fetchNearby(position.coords.latitude, position.coords.longitude),
        () => fetchNearby(0, 0)
      );
    } else {
      fetchNearby(0, 0);
    }
  }, [token]);

  return (
    <div className="page-card">
      <h1>Nearby Pharmacies</h1>
      {loading ? <LoadingSpinner /> : null}
      {error && <div className="error-message">{error}</div>}
      <div className="grid" style={{ marginTop: '20px' }}>
        {pharmacies.map((pharmacy) => (
          <PharmacyCard key={pharmacy._id} pharmacy={pharmacy} />
        ))}
      </div>
    </div>
  );
};

export default PharmacyListPage;
