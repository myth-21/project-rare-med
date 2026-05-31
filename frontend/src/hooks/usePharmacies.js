import { useEffect, useMemo, useState } from 'react';
import { getPharmacies } from '../services/pharmacyService';

export default function usePharmacies(params = {}) {
  const key = useMemo(() => JSON.stringify(params), [params]);
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    getPharmacies(params)
      .then(({ data }) => {
        if (!alive) return;
        setPharmacies(data?.pharmacies || []);
      })
      .catch((e) => {
        if (!alive) return;
        setPharmacies([]);
        setError(e?.message || 'Failed to load pharmacies');
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [key]);

  return { pharmacies, loading, error };
}

