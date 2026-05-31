import { useEffect, useState } from 'react';
import MedicineSearch from '../components/medicines/MedicineSearch.jsx';
import MedicineCard from '../components/medicines/MedicineCard.jsx';
import medicineService from '../services/medicineService.js';
import { useAuth } from '../hooks/useAuth.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

const MedicineListPage = () => {
  const { token } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchMedicines = async (term = '') => {
    setLoading(true);
    setError('');
    try {
      const response = await medicineService.search(term, token);
      setMedicines(response.medicines);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  return (
    <div className="page-card">
      <h1>Medicine Search</h1>
      <MedicineSearch onSearch={fetchMedicines} />
      {loading ? <LoadingSpinner /> : null}
      {error && <div className="error-message">{error}</div>}
      <div className="grid" style={{ marginTop: '20px' }}>
        {medicines.map((medicine) => (
          <MedicineCard key={medicine._id} medicine={medicine} />
        ))}
      </div>
    </div>
  );
};

export default MedicineListPage;
