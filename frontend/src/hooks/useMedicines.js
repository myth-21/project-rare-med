import { useEffect, useState } from 'react';
import { getMedicines } from '../services/medicineService';
export default function useMedicines(params) {
  const [medicines, setMedicines] = useState([]);
  useEffect(() => { getMedicines(params).then(({ data }) => setMedicines(data.medicines || [])).catch(() => setMedicines([])); }, [JSON.stringify(params)]);
  return medicines;
}
