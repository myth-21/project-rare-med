import { formatDate } from '../../utils/formatters.js';

const ReportCard = ({ report }) => (
  <article className="card">
    <h3>{report.medicineName || report.medicine?.name}</h3>
    {report.pharmacyName && <p>Pharmacy: {report.pharmacyName}{report.pharmacy?.name ? ` (${report.pharmacy.name})` : ''}</p>}
    <p>{report.location} · {formatDate(report.submittedAt || report.createdAt)}</p>
    <span className={`badge ${report.status}`}>{report.status}</span>
    {report.availabilityStatus && <span className={`badge ${report.availabilityStatus}`}>{report.availabilityStatus.replaceAll('_', ' ')}</span>}
    <p>{report.notes || report.description}</p>
    {report.reportedBy?.name && <p>Submitted by {report.reportedBy.name}</p>}
    <strong>{report.upvotes?.length || 0} upvotes</strong>
  </article>
);

export default ReportCard;
