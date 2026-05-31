import { Link } from 'react-router-dom';
import { pharmacyImage, resolveMediaUrl } from '../../utils/mediaUrl.js';
import { formatDistance } from '../../utils/formatters.js';

const PharmacyCard = ({ pharmacy }) => {
  const meds = pharmacy.availableMedicines || pharmacy.medicines || [];
  const logoSrc = pharmacy.logo ? resolveMediaUrl(pharmacy.logo) : pharmacyImage(pharmacy);

  return (
    <article className="card pharmacy-card">
      <div className="pharmacy-card-media">
        <img
          className="pharmacy-card-photo"
          src={pharmacyImage(pharmacy)}
          alt={`${pharmacy.name} storefront`}
          onError={(e) => {
            e.currentTarget.src = '/pharmacies/fallback.svg';
          }}
        />
        <img
          className="pharmacy-card-logo"
          src={logoSrc}
          alt=""
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
      <div className="pharmacy-card-head">
        <h3>{pharmacy.name}</h3>
        {pharmacy.distanceKm != null && (
          <span className="distance-badge">{formatDistance(pharmacy.distanceKm)}</span>
        )}
      </div>
      <p className="pharmacy-address">
        {pharmacy.address}, {pharmacy.city}
        {pharmacy.state ? `, ${pharmacy.state}` : ''}
      </p>
      <p className="pharmacy-meta">{pharmacy.phone || 'Contact on details page'}</p>
      <p className="pharmacy-meta">{meds.length} medicines available</p>
      {meds.length > 0 && (
        <p className="pharmacy-meds-preview">
          {meds.slice(0, 4).map((m) => m.name).join(' · ')}
          {meds.length > 4 ? ' …' : ''}
        </p>
      )}
      <span className={`badge ${pharmacy.isVerified ? 'available' : 'limited'}`}>
        {pharmacy.isVerified ? 'Verified' : 'Pending'}
      </span>
      <Link className="btn" to={`/pharmacies/${pharmacy._id}`}>
        View Pharmacy
      </Link>
    </article>
  );
};

export default PharmacyCard;
