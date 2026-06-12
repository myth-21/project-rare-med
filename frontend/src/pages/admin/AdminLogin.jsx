import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { adminLogin, loading } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });

  const submit = async (event) => {
    event.preventDefault();
    try {
      await adminLogin(form);
      toast.success('Admin login successful');
      navigate('/admin/dashboard', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Admin login failed');
    }
  };

  return (
    <main className="page auth-page mesh">
      <form className="auth-card" onSubmit={submit}>
        <Link to="/" className="subtle">Rare Med</Link>
        <h1>Admin Login</h1>
        <label className="floating">
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            placeholder=" "
          />
          <span>Email</span>
        </label>
        <label className="floating">
          <input
            required
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            placeholder=" "
          />
          <span>Password</span>
        </label>
        <button className="btn wide" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </main>
  );
}
