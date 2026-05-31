import { useEffect, useState } from 'react';
import notificationService from '../services/notificationService.js';
import medicineService from '../services/medicineService.js';
import { useAuth } from '../hooks/useAuth.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

const AlertPage = () => {
  const { token } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [form, setForm] = useState({ medicineId: '', threshold: 1 });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadAlerts = async () => {
    try {
      const response = await notificationService.getAlerts(token);
      setAlerts(response.alerts);
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
        await loadAlerts();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      await notificationService.createAlert(form, token);
      setMessage('Alert created successfully');
      setForm({ medicineId: '', threshold: 1 });
      await loadAlerts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteAlert(id, token);
      await loadAlerts();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-10">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-900/5 sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Medicine alerts</h1>
            <p className="mt-2 text-sm text-slate-600">
              Create and monitor alerts for your most critical medications.
            </p>
          </div>
          <div className="text-sm text-slate-500">Manage your alerts with confidence.</div>
        </div>

        {loading && <LoadingSpinner />}
        {error && <div className="mt-6 rounded-3xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
        {message && <div className="mt-6 rounded-3xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}

        <form onSubmit={handleSubmit} className="mt-8 grid gap-6 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Medicine</span>
            <select
              name="medicineId"
              id="medicineId"
              value={form.medicineId}
              onChange={handleChange}
              required
              className="mt-3 block w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
            >
              <option value="">Select medicine</option>
              {medicines.map((medicine) => (
                <option key={medicine._id} value={medicine._id}>
                  {medicine.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Threshold quantity</span>
            <input
              id="threshold"
              name="threshold"
              type="number"
              min="1"
              value={form.threshold}
              onChange={handleChange}
              required
              className="mt-3 block w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </label>
          <button
            type="submit"
            className="rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            Create alert
          </button>
        </form>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/5">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Active alerts</h2>
            <p className="mt-2 text-sm text-slate-600">Review your current notifications and remove alerts that are no longer needed.</p>
          </div>
        </div>

        <div className="grid gap-6">
          {alerts.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center text-sm text-slate-500">
              No active alerts.
            </div>
          ) : (
            alerts.map((alert) => (
              <div key={alert._id} className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{alert.medicine.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">Threshold: {alert.threshold}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(alert._id)}
                    className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
                  >
                    Delete alert
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default AlertPage;
