import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : 'N/A');

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState({
    stats: { totalUsers: 0, totalMedicines: 0, totalPharmacies: 0, totalReports: 0 },
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/dashboard')
      .then(({ data }) => setDashboard(data))
      .finally(() => setLoading(false));
  }, []);

  const stats = dashboard.stats || {};

  return (
    <main className="page">
      <section className="toolbar">
        <div>
          <p className="eyebrow">Rare Med</p>
          <h1>Admin Dashboard</h1>
          <p>Operational overview for users, medicines, pharmacies, and reports.</p>
        </div>
        <Link className="btn outline" to="/admin/reports">Review Reports</Link>
      </section>

      <section className="grid-4">
        <article className="stat-card"><strong>{stats.totalUsers}</strong><span>Total Users</span></article>
        <article className="stat-card"><strong>{stats.totalMedicines}</strong><span>Total Medicines</span></article>
        <article className="stat-card"><strong>{stats.totalPharmacies}</strong><span>Total Pharmacies</span></article>
        <article className="stat-card"><strong>{stats.totalReports}</strong><span>Total Reports</span></article>
      </section>

      <article className="card">
        <h2>Recent Activity</h2>
        {loading && <p>Loading activity...</p>}
        {!loading && dashboard.recentActivity?.length === 0 && <p>No recent activity yet.</p>}
        {(dashboard.recentActivity || []).map((activity, index) => (
          <p key={`${activity.type}-${index}`}>
            <strong>{activity.type}</strong> - {activity.message} <span className="subtle">{formatDate(activity.createdAt)}</span>
          </p>
        ))}
      </article>
    </main>
  );
}
