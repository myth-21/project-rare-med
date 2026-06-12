import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : 'N/A');

export default function ManageUsers() {
  const [users, setUsers] = useState([]);

  const loadUsers = () => {
    api.get('/admin/users').then(({ data }) => setUsers(data.users || []));
  };

  useEffect(loadUsers, []);

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await api.delete(`/admin/users/${id}`);
    setUsers((current) => current.filter((user) => user._id !== id));
    toast.success('User deleted');
  };

  return (
    <main className="page">
      <section className="toolbar">
        <div>
          <p className="eyebrow">Rare Med</p>
          <h1>Manage Users</h1>
          <p>View registered users and remove accounts when required.</p>
        </div>
      </section>
      <div className="table-card">
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Registration Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{formatDate(user.createdAt)}</td>
                <td>
                  <button type="button" onClick={() => window.alert(`${user.name}\n${user.email}`)}>View</button>
                  <button type="button" onClick={() => deleteUser(user._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
