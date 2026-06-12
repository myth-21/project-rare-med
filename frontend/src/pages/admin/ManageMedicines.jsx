import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const blankMedicine = { name: '', genericName: '', category: '', manufacturer: '', availability: 'limited', image: '', description: '' };

export default function ManageMedicines() {
  const [medicines, setMedicines] = useState([]);
  const [form, setForm] = useState(blankMedicine);
  const [editingId, setEditingId] = useState('');

  const loadMedicines = () => {
    api.get('/admin/medicines').then(({ data }) => setMedicines(data.medicines || []));
  };

  useEffect(loadMedicines, []);

  const saveMedicine = async (event) => {
    event.preventDefault();
    if (editingId) {
      await api.put(`/admin/medicines/${editingId}`, form);
      toast.success('Medicine updated');
    } else {
      await api.post('/admin/medicines', form);
      toast.success('Medicine added');
    }
    setForm(blankMedicine);
    setEditingId('');
    loadMedicines();
  };

  const editMedicine = (medicine) => {
    setEditingId(medicine._id);
    setForm({
      name: medicine.name || '',
      genericName: medicine.genericName || '',
      category: medicine.category || '',
      manufacturer: medicine.manufacturer || '',
      availability: medicine.availability || 'limited',
      image: medicine.image || '',
      description: medicine.description || '',
    });
  };

  const deleteMedicine = async (id) => {
    if (!window.confirm('Delete this medicine?')) return;
    await api.delete(`/admin/medicines/${id}`);
    setMedicines((current) => current.filter((medicine) => medicine._id !== id));
    toast.success('Medicine deleted');
  };

  return (
    <main className="page">
      <section className="toolbar">
        <div>
          <p className="eyebrow">Rare Med</p>
          <h1>Manage Medicines</h1>
          <p>Add, edit, and delete medicine records.</p>
        </div>
      </section>
      <form className="card" onSubmit={saveMedicine}>
        <h2>{editingId ? 'Edit Medicine' : 'Add Medicine'}</h2>
        <input required placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        <input required placeholder="Generic name" value={form.genericName} onChange={(event) => setForm({ ...form, genericName: event.target.value })} />
        <input required placeholder="Category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} />
        <input placeholder="Manufacturer" value={form.manufacturer} onChange={(event) => setForm({ ...form, manufacturer: event.target.value })} />
        <select value={form.availability} onChange={(event) => setForm({ ...form, availability: event.target.value })}>
          <option value="available">Available</option>
          <option value="limited">Limited</option>
          <option value="out_of_stock">Out of stock</option>
        </select>
        <input placeholder="Image URL (Unsplash or custom URL)" value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} />
        <textarea placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        <button className="btn">{editingId ? 'Edit Medicine' : 'Add Medicine'}</button>
      </form>
      <div className="table-card">
        <table>
          <thead>
            <tr><th>Name</th><th>Generic</th><th>Category</th><th>Availability</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {medicines.map((medicine) => (
              <tr key={medicine._id}>
                <td>{medicine.name}</td>
                <td>{medicine.genericName}</td>
                <td>{medicine.category}</td>
                <td>{medicine.availability}</td>
                <td>
                  <button type="button" onClick={() => editMedicine(medicine)}>Edit</button>
                  <button type="button" onClick={() => deleteMedicine(medicine._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
