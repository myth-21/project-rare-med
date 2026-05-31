import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import medicineService from '../services/medicineService.js';
import { useAuth } from '../hooks/useAuth.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

const MedicineDetailPage = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMedicine = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await medicineService.getMedicine(id, token);
        setMedicine(response.medicine);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicine();
  }, [id, token]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">{error}</div>;
  if (!medicine) return <div className="page-card">Medicine not found</div>;

  return (
    <div className="page-card">
      <h1>{medicine.name}</h1>
      <p><strong>Brand:</strong> {medicine.brand || 'Unknown'}</p>
      <p><strong>Dosage:</strong> {medicine.dosage || 'N/A'}</p>
      <p><strong>Category:</strong> {medicine.category || 'N/A'}</p>
      <p>{medicine.description || 'No description available.'}</p>
      {medicine.tags?.length ? (
        <p><strong>Tags:</strong> {medicine.tags.join(', ')}</p>
      ) : null}
    </div>
  );
};

export default MedicineDetailPage;
