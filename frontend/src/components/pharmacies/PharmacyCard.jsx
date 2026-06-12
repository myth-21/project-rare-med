import { Link } from 'react-router-dom';
import { pharmacyImage, resolveMediaUrl } from '../../utils/mediaUrl.js';
import { formatDistance } from '../../utils/formatters.js';
import { directionsUrl, openMapsUrl } from '../../utils/location.js';

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
            e.currentTarget.src = pharmacyImage({ name: pharmacy.name });
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
        <div className="pharmacy-meds-preview">
          {meds.slice(0, 4).map((medicine) => (
            <span key={medicine._id || medicine.name}>{medicine.name}</span>
          ))}
        </div>
      )}
      <span className={`badge ${pharmacy.isVerified ? 'available' : 'limited'}`}>
        {pharmacy.isVerified ? 'Verified' : 'Pending'}
      </span>
      <div className="pharmacy-card-actions">
        <Link className="btn" to={`/pharmacies/${pharmacy._id}`}>
          View Details
        </Link>
        <a className="btn outline" href={directionsUrl(pharmacy)} target="_blank" rel="noreferrer">
          Get Directions
        </a>
        <a className="map-text-link" href={openMapsUrl(pharmacy)} target="_blank" rel="noreferrer">
          Open in Maps
        </a>
      </div>
    </article>
  );
};

export default PharmacyCard;
