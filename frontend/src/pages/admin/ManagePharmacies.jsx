import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const blankPharmacy = {
  name: '',
  address: '',
  city: '',
  state: '',
  phone: '',
  email: '',
  latitude: '',
  longitude: '',
};

export default function ManagePharmacies() {
  const [pharmacies, setPharmacies] = useState([]);
  const [form, setForm] = useState(blankPharmacy);
  const [editingId, setEditingId] = useState('');

  const loadPharmacies = () => {
    api.get('/admin/pharmacies').then(({ data }) => setPharmacies(data.pharmacies || []));
  };

  useEffect(loadPharmacies, []);

  const payload = {
    ...form,
    location: {
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
    },
  };

  const savePharmacy = async (event) => {
    event.preventDefault();
    if (editingId) {
      await api.put(`/admin/pharmacies/${editingId}`, payload);
      toast.success('Pharmacy updated');
    } else {
      await api.post('/admin/pharmacies', payload);
      toast.success('Pharmacy added');
    }
    setForm(blankPharmacy);
    setEditingId('');
    loadPharmacies();
  };

  const editPharmacy = (pharmacy) => {
    setEditingId(pharmacy._id);
    setForm({
      name: pharmacy.name || '',
      address: pharmacy.address || '',
      city: pharmacy.city || '',
      state: pharmacy.state || '',
      phone: pharmacy.phone || '',
      email: pharmacy.email || '',
      latitude: pharmacy.location?.latitude ?? pharmacy.latitude ?? '',
      longitude: pharmacy.location?.longitude ?? pharmacy.longitude ?? '',
    });
  };

  const deletePharmacy = async (id) => {
    if (!window.confirm('Delete this pharmacy?')) return;
    await api.delete(`/admin/pharmacies/${id}`);
    setPharmacies((current) => current.filter((pharmacy) => pharmacy._id !== id));
    toast.success('Pharmacy deleted');
  };

  return (
    <main className="page">
      <section className="toolbar">
        <div>
          <p className="eyebrow">Rare Med</p>
          <h1>Manage Pharmacies</h1>
          <p>Add, edit, and delete pharmacy records.</p>
        </div>
      </section>
      <form className="card" onSubmit={savePharmacy}>
        <h2>{editingId ? 'Edit Pharmacy' : 'Add Pharmacy'}</h2>
        <input required placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        <input required placeholder="Address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
        <input required placeholder="City" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} />
        <input placeholder="State" value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })} />
        <input placeholder="Phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
        <input type="email" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        <input required type="number" step="any" placeholder="Latitude" value={form.latitude} onChange={(event) => setForm({ ...form, latitude: event.target.value })} />
        <input required type="number" step="any" placeholder="Longitude" value={form.longitude} onChange={(event) => setForm({ ...form, longitude: event.target.value })} />
        <button className="btn">{editingId ? 'Edit Pharmacy' : 'Add Pharmacy'}</button>
      </form>
      <div className="table-card">
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>City</th><th>Phone</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {pharmacies.map((pharmacy) => (
              <tr key={pharmacy._id}>
                <td>{pharmacy.name}</td>
                <td>{pharmacy.email}</td>
                <td>{pharmacy.city}</td>
                <td>{pharmacy.phone}</td>
                <td>
                  <button type="button" onClick={() => editPharmacy(pharmacy)}>Edit</button>
                  <button type="button" onClick={() => deletePharmacy(pharmacy._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
