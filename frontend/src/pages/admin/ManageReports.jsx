import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const reportSummary = (report) =>
  [
    `Medicine: ${report.medicineName || report.medicine?.name || 'N/A'}`,
    `Pharmacy: ${report.pharmacyName || report.pharmacy?.name || 'N/A'}`,
    `Location: ${report.location || 'N/A'}`,
    `Status: ${report.status}`,
    `Notes: ${report.notes || report.description || 'N/A'}`,
  ].join('\n');

export default function ManageReports() {
  const [reports, setReports] = useState([]);

  const loadReports = () => {
    api.get('/admin/reports').then(({ data }) => setReports(data.reports || []));
  };

  useEffect(loadReports, []);

  const deleteReport = async (id) => {
    if (!window.confirm('Delete this report?')) return;
    await api.delete(`/admin/reports/${id}`);
    setReports((current) => current.filter((report) => report._id !== id));
    toast.success('Report deleted');
  };

  return (
    <main className="page">
      <section className="toolbar">
        <div>
          <p className="eyebrow">Rare Med</p>
          <h1>Manage Reports</h1>
          <p>View and delete medicine availability reports submitted by users.</p>
        </div>
      </section>
      <div className="table-card">
        <table>
          <thead>
            <tr><th>Medicine</th><th>Pharmacy</th><th>User</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report._id}>
                <td>{report.medicineName || report.medicine?.name}</td>
                <td>{report.pharmacyName || report.pharmacy?.name}</td>
                <td>{report.submittedBy?.email || report.reportedBy?.email || 'N/A'}</td>
                <td>{report.status}</td>
                <td>
                  <button type="button" onClick={() => window.alert(reportSummary(report))}>View Report</button>
                  <button type="button" onClick={() => deleteReport(report._id)}>Delete Report</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
