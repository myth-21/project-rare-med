import { useEffect, useState } from 'react';
import { getReports } from '../services/reportService';
export default function useReports(params) {
  const [reports, setReports] = useState([]);
  useEffect(() => { getReports(params).then(({ data }) => setReports(data.reports || [])).catch(() => setReports([])); }, [JSON.stringify(params)]);
  return reports;
}
