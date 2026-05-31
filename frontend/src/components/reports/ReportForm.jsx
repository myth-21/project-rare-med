import { useState } from 'react';

const ReportForm = ({ medicines, pharmacies, onSubmit }) => {
  const [form, setForm] = useState({ medicineId: '', pharmacyId: '', quantity: 1, notes: '' });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="page-card">
      <div className="form-group">
        <label htmlFor="medicineId">Medicine</label>
        <select name="medicineId" id="medicineId" value={form.medicineId} onChange={handleChange} required>
          <option value="">Select a medicine</option>
          {medicines.map((medicine) => (
            <option key={medicine._id} value={medicine._id}>
              {medicine.name} • {medicine.brand}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="pharmacyId">Pharmacy</label>
        <select name="pharmacyId" id="pharmacyId" value={form.pharmacyId} onChange={handleChange} required>
          <option value="">Select a pharmacy</option>
          {pharmacies.map((pharmacy) => (
            <option key={pharmacy._id} value={pharmacy._id}>
              {pharmacy.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="quantity">Quantity</label>
        <input
          id="quantity"
          name="quantity"
          type="number"
          min="1"
          value={form.quantity}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="notes">Notes</label>
        <textarea id="notes" name="notes" rows="4" value={form.notes} onChange={handleChange} />
      </div>
      <button type="submit">Submit report</button>
    </form>
  );
};

export default ReportForm;
