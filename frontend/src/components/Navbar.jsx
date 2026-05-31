import { Link, NavLink } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';
import { initials } from '../utils/formatters.js';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const primaryLinks = [['/', 'Home'], ['/medicines', 'Medicines'], ['/pharmacies', 'Pharmacies'], ['/reports', 'Reports'], ['/alerts', 'Alerts']];
  const accountLinks = user?.isAdmin
    ? [['/admin', 'Admin Dashboard'], ['/admin/medicines', 'Manage Medicines'], ['/admin/reports', 'Manage Reports']]
    : user
      ? [['/dashboard', 'Dashboard'], ['/profile', 'Profile']]
      : [['/login', 'Login'], ['/register', 'Register']];

  return (
    <header className="nav">
      <Link to="/" className="brand-lockup">
        <img src="/brand/favicon.svg" alt="" className="brand-mark" />
        <span className="brand-copy">
          <span className="brand-name">Rare Med</span>
          <span className="brand-tagline">Medicine Locator</span>
        </span>
      </Link>
      <nav className="desktop-nav">
        {[...primaryLinks, ...accountLinks].map(([to, label]) => (
          <NavLink key={to} to={to}>{label}</NavLink>
        ))}
      </nav>
      <div className="nav-actions">
        <Link className="btn outline" to="/medicines">Search Medicines</Link>
        {user && <Link className="avatar-mini" to="/profile">{initials(user.name)}</Link>}
        {user && <button className="btn ghost" onClick={logout}>Logout</button>}
      </div>
    </header>
  );
};

export default Navbar;
