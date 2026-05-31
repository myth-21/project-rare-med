import { useEffect, useState } from 'react';
import { getAlerts } from '../services/alertService';
export default function useAlerts() {
  const [alerts, setAlerts] = useState([]);
  useEffect(() => { getAlerts().then(({ data }) => setAlerts(data.alerts || [])).catch(() => setAlerts([])); }, []);
  return alerts;
}
