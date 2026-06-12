import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import { medicineImage } from '../../utils/mediaUrl.js';
import { formatDistance } from '../../utils/formatters.js';

const MedicineCard = ({ medicine }) => {
  const { user, setSession } = useAuthStore();
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const nearestPharmacy = (medicine.pharmacies || []).find((pharmacy) => pharmacy.distanceKm != null);

  useEffect(() => {
    if (user?.savedMedicines) {
      const savedIds = user.savedMedicines.map(id => typeof id === 'object' ? id._id : id);
      setIsSaved(savedIds.includes(medicine._id));
    }
  }, [user, medicine._id]);

  const handleSaveToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to save medicines');
      return;
    }
    setSaving(true);
    try {
      if (isSaved) {
        const { data } = await api.delete(`/auth/saved-medicines/${medicine._id}`);
        setSession({ token: localStorage.getItem('raremed_token'), user: data.user });
        setIsSaved(false);
        toast.success('Removed from saved list');
      } else {
        const { data } = await api.post(`/auth/saved-medicines/${medicine._id}`);
        setSession({ token: localStorage.getItem('raremed_token'), user: data.user });
        setIsSaved(true);
        toast.success('Medicine saved successfully');
      }
    } catch (error) {
      toast.error('Failed to update saved medicine');
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="card medicine-card" style={{ position: 'relative', overflow: 'hidden' }}>
      {user && (
        <button
          onClick={handleSaveToggle}
          disabled={saving}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            zIndex: 10,
          }}
        >
          {isSaved ? (
            <HeartSolid style={{ width: '20px', height: '20px', color: '#EF4444' }} />
          ) : (
            <HeartOutline style={{ width: '20px', height: '20px', color: '#64748B' }} />
          )}
        </button>
      )}

      {/* Image container */}
      <div style={{ width: '100%', height: '140px', overflow: 'hidden', borderRadius: '12px', marginBottom: '12px', backgroundColor: '#F8FAFC', display: 'grid', placeItems: 'center' }}>
        <img
          src={medicineImage(medicine)}
          alt={medicine.name}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          onError={(e) => {
            e.currentTarget.src = '/medicines/fallback.png';
          }}
        />
      </div>

      <h3>{medicine.name}</h3>
      <p style={{ fontSize: '14px', margin: '4px 0' }}>{medicine.genericName || 'Rare medicine'}</p>
      <p style={{ fontSize: '13px', margin: 0 }}>{medicine.manufacturer || 'Verified manufacturer'}</p>
      <span className="category">{medicine.category || 'Specialty'}</span>
      <span className={`badge ${medicine.availability || 'limited'}`} style={{ marginTop: '8px' }}>
        {(medicine.availability || 'limited').replaceAll('_', ' ')}
      </span>
      <span style={{ fontSize: '13px', color: '#64748B', display: 'block', marginTop: '8px' }}>
        {medicine.pharmacies?.length || 0} verified stockists
      </span>
      {nearestPharmacy && (
        <span style={{ fontSize: '13px', color: '#166534', display: 'block', marginTop: '4px', fontWeight: 700 }}>
          Nearest: {nearestPharmacy.name} ({formatDistance(nearestPharmacy.distanceKm)})
        </span>
      )}
      <Link className="btn" to={`/medicines/${medicine._id}`} style={{ marginTop: '12px' }}>View Details</Link>
    </article>
  );
};

export default MedicineCard;
