import { useEffect, useState } from 'react';
import { ClipboardDocumentListIcon, MapPinIcon, ShieldCheckIcon, SparklesIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';

const StatisticsSection = () => {
  const [counts, setCounts] = useState({ medicines: 0, pharmacies: 0, cities: 0 });

  useEffect(() => {
    Promise.all([api.get('/medicines'), api.get('/pharmacies')])
      .then(([medRes, pharmRes]) => {
        const medicines = medRes.data.medicines || [];
        const pharmacies = pharmRes.data.pharmacies || [];
        const cities = new Set(pharmacies.map((p) => p.city).filter(Boolean)).size;
        setCounts({ medicines: medicines.length, pharmacies: pharmacies.length, cities });
      })
      .catch(() => {});
  }, []);

  const stats = [
    [String(counts.medicines), 'Medicines in catalog', SparklesIcon],
    [String(counts.pharmacies), 'Pharmacies on map', ShieldCheckIcon],
    [String(counts.cities), 'Cities covered', MapPinIcon],
    ['Live', 'Community reports', ClipboardDocumentListIcon],
  ];

  return (
    <section className="section grid-4">
      {stats.map(([value, label, Icon]) => (
        <article className="stat-card" key={label}>
          <Icon />
          <strong>{value}</strong>
          <span>{label}</span>
        </article>
      ))}
    </section>
  );
};

export default StatisticsSection;
