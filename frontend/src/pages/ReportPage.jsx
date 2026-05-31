import { useEffect, useState } from 'react';
import reportService from '../services/reportService.js';
import medicineService from '../services/medicineService.js';
import pharmacyService from '../services/pharmacyService.js';
import { useAuth } from '../hooks/useAuth.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ReportForm from '../components/reports/ReportForm.jsx';

const ReportPage = () => {
  const { token } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [reports, setReports] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReports = async () => {
    try {
      const response = await reportService.getUserReports(token);
      setReports(response.reports);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const medicineRes = await medicineService.search('', token);
        setMedicines(medicineRes.medicines);
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const nearby = await pharmacyService.findNearby(
                { lat: position.coords.latitude, lng: position.coords.longitude },
                token
              );
              setPharmacies(nearby.pharmacies);
            },
            async () => {
              const fallback = await pharmacyService.findNearby({ lat: 0, lng: 0 }, token);
              setPharmacies(fallback.pharmacies);
            }
          );
        } else {
          const fallback = await pharmacyService.findNearby({ lat: 0, lng: 0 }, token);
          setPharmacies(fallback.pharmacies);
        }
        await loadReports();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token]);

  const handleSubmit = async (payload) => {
    try {
      await reportService.createReport(payload, token);
      setMessage('Report submitted successfully');
      loadReports();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-card">
      <h1>Availability Reports</h1>
      {loading && <LoadingSpinner />}
      {error && <div className="error-message">{error}</div>}
      <ReportForm medicines={medicines} pharmacies={pharmacies} onSubmit={handleSubmit} />
      {message && <div style={{ marginTop: '16px', color: '#16a34a' }}>{message}</div>}
      <div style={{ marginTop: '32px' }}>
        <h2>My submitted reports</h2>
        {reports.length === 0 && <p>No reports submitted yet.</p>}
        {reports.map((report) => (
          <div className="card" key={report._id}>
            <h3 className="card-title">{report.medicine.name}</h3>
            <p>{report.pharmacy.name}</p>
            <p>Quantity: {report.quantity}</p>
            <p>Status: {report.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportPage;
