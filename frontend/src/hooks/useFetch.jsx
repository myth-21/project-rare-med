import { useEffect, useState } from 'react';
import api from '../services/api.js';

const useFetch = (path, token) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.request(path, 'GET', null, token);
        setData(response);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (path) {
      load();
    }
  }, [path, token]);

  return { data, loading, error };
};

export default useFetch;
