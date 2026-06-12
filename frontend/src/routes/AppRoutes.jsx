import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  BellIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PlusIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import api from '../services/api';
import GooglePharmacyMap from '../components/maps/GooglePharmacyMap.jsx';
import { medicineImage, pharmacyImage, resolveMediaUrl } from '../utils/mediaUrl.js';
import { directionsUrl, openMapsUrl } from '../utils/location.js';
import useAuthStore from '../store/authStore';
import useMedicineStore from '../store/medicineStore';
import { API_BASE_URL, availabilityLabels, categories } from '../utils/constants';
import { formatDate, formatDistance, initials } from '../utils/formatters';
import { passwordStrength } from '../utils/validators';
import MedicineCardView from '../components/medicines/MedicineCard.jsx';
import PharmacyCardView from '../components/pharmacies/PharmacyCard.jsx';
import ReportCardView from '../components/reports/ReportCard.jsx';
import StatisticsSection from '../components/home/StatisticsSection.jsx';
import FeaturesSection from '../components/home/FeaturesSection.jsx';
import Testimonials from '../components/home/Testimonials.jsx';
import CTASection from '../components/home/CTASection.jsx';
import DashboardStats from '../components/dashboard/DashboardStats.jsx';
import GoogleLoginButton from '../components/auth/GoogleLoginButton.jsx';
import Footer from '../components/Footer.jsx';
import BrandLogo from '../components/brand/Logo.jsx';
import useGeolocation from '../hooks/useGeolocation.js';
import AdminLoginPage from '../pages/admin/AdminLogin.jsx';
import AdminDashboardPage from '../pages/admin/AdminDashboard.jsx';
import ManageUsersPage from '../pages/admin/ManageUsers.jsx';
import ManageMedicinesPage from '../pages/admin/ManageMedicines.jsx';
import ManagePharmaciesPage from '../pages/admin/ManagePharmacies.jsx';
import ManageReportsPage from '../pages/admin/ManageReports.jsx';

const API_OR_GOOGLE = `${API_BASE_URL}/auth/google`;

const page = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 12 },
  transition: { duration: 0.3, ease: 'easeOut' },
};

function Logo({ compact = false }) {
  return <BrandLogo compact={compact} />;
}

const locationQuery = (location) =>
  location && typeof location.lat === 'number' && typeof location.lng === 'number'
    ? { lat: location.lat, lng: location.lng, sort: 'distance' }
    : { sort: 'distance' };

const coordinateQuery = (location) =>
  location && typeof location.lat === 'number' && typeof location.lng === 'number'
    ? { lat: location.lat, lng: location.lng }
    : {};

const hasCoords = (location) => location && typeof location.lat === 'number' && typeof location.lng === 'number';

const pharmaciesPath = (location, filters = {}) => {
  const activeFilters = Object.entries(filters).filter(([, value]) => value !== '' && value !== false);
  if (hasCoords(location) && activeFilters.length === 0) {
    return `/pharmacies/nearby?${new URLSearchParams({ lat: location.lat, lng: location.lng }).toString()}`;
  }
  const params = new URLSearchParams(
    Object.entries({ ...filters, ...locationQuery(location) }).filter(([, value]) => value !== '' && value !== false)
  );
  return `/pharmacies?${params.toString()}`;
};

const googleErrorMessages = {
  redirect_uri_mismatch: 'Google sign-in is not configured for this website address yet.',
  oauth_configuration: 'Google sign-in is not fully configured yet.',
  not_configured: 'Google sign-in is not available yet.',
  access_denied: 'Google sign-in was cancelled.',
  missing_google_code: 'Google did not return a sign-in code. Please try again.',
  google_auth_failed: 'Google sign-in could not be completed. Please try again.',
};

function LocationBanner({ location, status, error, onRetry }) {
  if (status === 'loading') {
    return (
      <div className="location-banner">
        <MapPinIcon />
        <span>Detecting your location to show nearby pharmacies…</span>
      </div>
    );
  }
  return (
    <div className={`location-banner ${location?.isFallback ? 'fallback' : ''}`}>
      <MapPinIcon />
      <span>
        {location?.isFallback
          ? `Showing pharmacies near your profile city: ${location.label.replace('Profile: ', '')}.`
          : location
            ? 'Showing pharmacies nearest to your current location.'
            : error || 'Allow location access to automatically sort pharmacies near you.'}
      </span>
      <button type="button" className="btn outline small" onClick={onRetry}>
        {location?.isFallback || status === 'denied' ? 'Try again' : 'Refresh location'}
      </button>
    </div>
  );
}

function Button({ children, className = '', as = motion.button, ...props }) {
  const Component = as;
  return (
    <Component whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className={`btn ${className}`} {...props}>
      {children}
    </Component>
  );
}

function Navbar() {
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      setHidden(window.scrollY > last && window.scrollY > 90);
      last = window.scrollY;
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const primaryLinks = [['/', 'Home'], ['/medicines', 'Medicines'], ['/pharmacies', 'Pharmacies'], ['/reports', 'Reports'], ['/alerts', 'Alerts']];
  const userLinks = user?.isAdmin
    ? [['/admin/dashboard', 'Admin Dashboard'], ['/admin/medicines', 'Manage Medicines'], ['/admin/reports', 'Manage Reports']]
    : user
      ? [['/profile', 'Profile']]
      : [['/login', 'Login'], ['/register', 'Register']];
  const links = [...primaryLinks, ...userLinks];
  return (
    <motion.header animate={{ y: hidden ? -90 : 0 }} className="nav" style={{ height: '80px', display: 'flex', alignItems: 'center' }}>
      <Logo />
      <nav className="desktop-nav">
        {links.map(([to, label]) => <NavLink key={to} to={to}>{label}</NavLink>)}
      </nav>
      <div className="nav-actions">
        <Button as={Link} to="/medicines" className="outline"><MagnifyingGlassIcon /> Search Medicines</Button>
        {user ? (
          <>
            {user.profilePicture ? (
              <Link to="/profile" style={{ display: 'block', flexShrink: 0 }}>
                <img
                  src={resolveMediaUrl(user.profilePicture)}
                  alt={user.name}
                  className="avatar-mini"
                  style={{ objectFit: 'cover', borderRadius: '50%', border: '2px solid var(--primary-light)' }}
                />
              </Link>
            ) : (
              <Link className="avatar-mini" to="/profile">{initials(user.name)}</Link>
            )}
            <Button className="ghost" onClick={logout}>Logout</Button>
          </>
        ) : <Button as={Link} to="/login">Get started</Button>}
        <button className="hamburger" onClick={() => setOpen(true)}>Menu</button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div className="drawer" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}>
            <button onClick={() => setOpen(false)} className="drawer-close">Close</button>
            {links.map(([to, label]) => <NavLink key={to} to={to} onClick={() => setOpen(false)}>{label}</NavLink>)}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function ProtectedRoute({ children, admin = false }) {
  const { user, token } = useAuthStore();
  const location = useLocation();
  if (!token) return <Navigate to={`/login?returnUrl=${encodeURIComponent(location.pathname)}`} replace />;
  if (admin && !user?.isAdmin) return <Navigate to="/profile" replace />;
  return children;
}

function AdminProtectedRoute({ children }) {
  const { user, token } = useAuthStore();
  const location = useLocation();
  if (!token || !user?.isAdmin) {
    return <Navigate to={`/admin/login?returnUrl=${encodeURIComponent(location.pathname)}`} replace />;
  }
  return children;
}

function Page({ children, className = '' }) {
  return <motion.main {...page} className={`page ${className}`}>{children}</motion.main>;
}

function CountCard({ label, value, icon: Icon }) {
  const ref = useMemo(() => ({ current: null }), []);
  return (
    <motion.div ref={ref} whileHover={{ y: -6 }} className="stat-card">
      <Icon />
      <strong>{value}</strong>
      <span>{label}</span>
    </motion.div>
  );
}

function Home() {
  const navigate = useNavigate();
  const { token, user } = useAuthStore();
  const [query, setQuery] = useState('');
  const { location, status, error, requestLocation } = useGeolocation({ profileCity: user?.city });
  const [medicines] = useApi('/medicines?sort=name', [], []);
  const pharmacyApiPath = pharmaciesPath(location);
  const [pharmacies] = useApi(pharmacyApiPath, [], [pharmacyApiPath]);
  const [reports] = useApi('/reports', [], [token]);
  const search = () => navigate(token ? `/medicines?search=${encodeURIComponent(query)}` : '/login?returnUrl=/medicines');
  return (
    <Page>
      <LocationBanner location={location} status={status} error={error} onRetry={requestLocation} />
      <section className="hero mesh">
        <motion.div className="pill-float one" animate={{ y: [0, -18, 0] }} transition={{ repeat: Infinity, duration: 4 }} />
        <motion.div className="pill-float two" animate={{ y: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 5 }} />
        <div className="hero-copy">
          <p className="eyebrow">Medicine Availability Made Simple</p>
          <h1>Find Life-Saving Medicines Faster</h1>
          <p>Rare Med helps patients and caregivers search, compare, and locate critical medicines across verified pharmacies with availability alerts.</p>
          <div className="hero-search">
            <MagnifyingGlassIcon />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search Paracetamol, Metformin, Insulin..." />
            <Button onClick={search}>Search Medicines</Button>
          </div>
          <div className="cta-row">
            <Button as={Link} to="/medicines">Search Medicines</Button>
            <Button as={Link} to="/pharmacies" className="outline">Find Pharmacies</Button>
          </div>
        </div>
        <div className="stats-strip"><span>{medicines.length} medicines tracked</span><span>{pharmacies.length} pharmacies mapped</span><span>Live availability reports</span></div>
      </section>
      <StatisticsSection />
      <FeaturesSection />
      <section className="section">
        <Toolbar title="Featured Medicines" subtitle="Critical medicines currently tracked for availability near you." />
        <div className="card-grid">{medicines.slice(0, 6).map((medicine) => <MedicineCardView key={medicine._id} medicine={medicine} />)}</div>
      </section>
      <section className="section">
        <Toolbar
          title="Nearby Pharmacies"
          subtitle="Sorted by distance from you — Apollo, MedPlus, Wellness Forever, Medicover, and more."
        />
        <GooglePharmacyMap pharmacies={pharmacies.slice(0, 8)} userLocation={location} height={360} />
        <div className="card-grid">{pharmacies.slice(0, 6).map((pharmacy) => <PharmacyCardView key={pharmacy._id} pharmacy={pharmacy} />)}</div>
      </section>
      {token && reports.length > 0 && (
        <section className="section">
          <Toolbar title="Availability Reports" subtitle="Recent community shortage and availability updates." />
          <div className="card-grid">{reports.slice(0, 4).map((report) => <ReportCardView key={report._id} report={report} />)}</div>
        </section>
      )}
      <Testimonials />
      <CTASection />
    </Page>
  );
}

function AuthPage({ mode }) {
  const navigate = useNavigate();
  const params = new URLSearchParams(useLocation().search);
  const googleError = params.get('googleError');
  const { login, register, loading } = useAuthStore();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '', terms: false, remember: true });
  const strength = passwordStrength(form.password);
  useEffect(() => {
    if (googleError) toast.error(googleErrorMessages[googleError] || googleErrorMessages.google_auth_failed);
  }, [googleError]);
  const submit = async (e) => {
    e.preventDefault();
    try {
      if (mode === 'register' && !form.terms) return toast.error('Please accept the terms');
      const data = await (mode === 'login' ? login(form) : register({ ...form, phoneNumber: form.phone }));
      if (mode === 'register') {
        toast.success(
          data.message ||
            (data.emailSent
              ? 'Account created successfully. A welcome email has been sent to your email address.'
              : 'Account created successfully.')
        );
      } else {
        toast.success('Welcome back to Rare Med');
      }
      navigate(data.user?.isAdmin ? '/admin' : params.get('returnUrl') || '/profile');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Authentication failed');
    }
  };
  return (
    <Page className="auth-page mesh">
      <form className="auth-card" onSubmit={submit}>
        <Logo />
        <h1>{mode === 'login' ? 'Sign in' : 'Create account'}</h1>
        {mode === 'register' && <FloatingInput label="Full Name" value={form.name} onChange={(name) => setForm({ ...form, name })} />}
        <FloatingInput label="Email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} />
        <div className="password-field">
          <FloatingInput label="Password" type={show ? 'text' : 'password'} value={form.password} onChange={(password) => setForm({ ...form, password })} />
          <button type="button" onClick={() => setShow(!show)}>{show ? <EyeSlashIcon /> : <EyeIcon />}</button>
        </div>
        {mode === 'register' && (
          <>
            <div className={`strength ${strength}`}><span /></div>
            <FloatingInput label="Confirm Password" type="password" value={form.confirmPassword} onChange={(confirmPassword) => setForm({ ...form, confirmPassword })} />
            <FloatingInput label="Phone (optional)" value={form.phone} onChange={(phone) => setForm({ ...form, phone })} />
          </>
        )}
        <label className="check"><input type="checkbox" checked={mode === 'login' ? form.remember : form.terms} onChange={(e) => setForm({ ...form, [mode === 'login' ? 'remember' : 'terms']: e.target.checked })} /> {mode === 'login' ? 'Remember me' : 'I agree to Terms & Conditions'}</label>
        {mode === 'login' && <Link to="/forgot-password" className="subtle">Forgot Password?</Link>}
        <Button disabled={loading} className="wide">{loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}</Button>
        
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', margin: '4px 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
          <span style={{ padding: '0 12px', fontSize: '11px', color: '#4B5563', fontFamily: '"Inter", sans-serif', fontWeight: '800', letterSpacing: '0.05em' }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
        </div>

        <GoogleLoginButton loading={loading} />
        
        <p>{mode === 'login' ? 'New here?' : 'Already registered?'} <Link to={mode === 'login' ? '/register' : '/login'}>{mode === 'login' ? 'Create account' : 'Login'}</Link></p>
      </form>
    </Page>
  );
}

function FloatingInput({ label, value, onChange, type = 'text' }) {
  return <label className="floating"><input required={label !== 'Phone (optional)'} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder=" " /><span>{label}</span></label>;
}

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('Reset link request sent');
    } catch {
      toast.error('Could not send reset link');
    }
  };
  return <Page className="auth-page mesh"><form className="auth-card" onSubmit={submit}><Logo /><h1>Reset password</h1><FloatingInput label="Email" type="email" value={email} onChange={setEmail} /><Button className="wide">Send reset link</Button></form></Page>;
}

function ResetPassword() {
  const navigate = useNavigate();
  const token = new URLSearchParams(useLocation().search).get('token') || '';
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [show, setShow] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/reset-password', { token, ...form });
      toast.success('Password reset successful');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not reset password');
    }
  };
  return (
    <Page className="auth-page mesh">
      <form className="auth-card" onSubmit={submit}>
        <Logo />
        <h1>Create new password</h1>
        <div className="password-field">
          <FloatingInput label="New Password" type={show ? 'text' : 'password'} value={form.password} onChange={(password) => setForm({ ...form, password })} />
          <button type="button" onClick={() => setShow(!show)}>{show ? <EyeSlashIcon /> : <EyeIcon />}</button>
        </div>
        <FloatingInput label="Confirm Password" type="password" value={form.confirmPassword} onChange={(confirmPassword) => setForm({ ...form, confirmPassword })} />
        <Button className="wide">Reset Password</Button>
      </form>
    </Page>
  );
}

function parseApiBody(body, fallback) {
  if (!body || typeof body !== 'object') return fallback;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body.medicines)) return body.medicines;
  if (Array.isArray(body.pharmacies)) return body.pharmacies;
  if (Array.isArray(body.reports)) return body.reports;
  if (Array.isArray(body.alerts)) return body.alerts;
  if (Array.isArray(body.users)) return body.users;
  if (body.medicine !== undefined || body.pharmacy !== undefined) return body;
  return fallback;
}

function useApi(path, fallback, deps = []) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    api
      .get(path)
      .then(({ data: body }) => {
        if (!alive) return;
        setData(parseApiBody(body, fallback));
      })
      .catch((err) => {
        const msg = err.response?.data?.message || err.message || 'Request failed';
        console.error(`[API] GET ${path}:`, msg);
        if (alive) {
          setData(fallback);
          setError(msg);
        }
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, deps);
  return [data, setData, loading, error];
}

function EmptyNotice({ message, error }) {
  return (
    <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
      {error && <p style={{ color: '#DC2626', marginBottom: '8px' }}>We could not load this data right now.</p>}
      <p style={{ color: '#64748B' }}>{message}</p>
    </div>
  );
}

function Status({ value }) {
  return <span className={`badge ${value}`}>{availabilityLabels[value] || value}</span>;
}

function Medicines() {
  const location = useLocation();
  const initial = new URLSearchParams(location.search).get('search') || '';
  const [filters, setFilters] = useState({ search: initial, category: '', availability: '', sort: 'name' });
  const [suggestions, setSuggestions] = useState([]);
  const { user } = useAuthStore();
  const { location: userLocation, status, error: locationError, requestLocation } = useGeolocation({ profileCity: user?.city });
  const query = new URLSearchParams(
    Object.entries({ ...filters, ...coordinateQuery(userLocation) }).filter(([, v]) => v)
  ).toString();
  const [medicines, , loading, error] = useApi(`/medicines?${query}`, [], [query]);
  const { addSearch } = useMedicineStore();
  const recordSearch = (term) => {
    addSearch(term);
    if (term.trim().length > 1) api.post('/auth/search-history', { term }).catch(() => {});
    if (term.trim().length > 1) {
      api.get(`/medicines/suggestions?search=${encodeURIComponent(term)}`)
        .then(({ data }) => setSuggestions(data.suggestions || []))
        .catch(() => setSuggestions([]));
    } else {
      setSuggestions([]);
    }
  };
  return (
    <Page>
      <Toolbar title="Medicines" subtitle="Search and filter verified rare medicine inventory." />
      <LocationBanner location={userLocation} status={status} error={locationError} onRetry={requestLocation} />
      <div className="listing">
        <aside className="filters">
          <input list="medicine-suggestions" placeholder="Search medicine, generic, manufacturer" value={filters.search} onChange={(e) => { setFilters({ ...filters, search: e.target.value }); recordSearch(e.target.value); }} />
          <datalist id="medicine-suggestions">
            {suggestions.map((suggestion) => (
              <option key={suggestion._id} value={suggestion.label}>{suggestion.genericName} - {suggestion.manufacturer}</option>
            ))}
          </datalist>
          <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}><option value="">All categories</option>{categories.map((c) => <option key={c}>{c}</option>)}</select>
          <select value={filters.availability} onChange={(e) => setFilters({ ...filters, availability: e.target.value })}><option value="">Any availability</option><option value="available">Available</option><option value="limited">Limited</option><option value="out_of_stock">Out of Stock</option></select>
          <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}><option value="name">Name</option><option value="-createdAt">Newest</option></select>
        </aside>
        <div className="card-grid">
          {loading && <p>Loading medicines...</p>}
          {!loading && error && <EmptyNotice error={error} message="Medicine data is temporarily unavailable." />}
          {!loading && !error && medicines.length === 0 && (
            <EmptyNotice message="No medicines are available yet." />
          )}
          {medicines.map((medicine) => <MedicineCardView key={medicine._id} medicine={medicine} />)}
        </div>
      </div>
    </Page>
  );
}

function MedicineDetails() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { location } = useGeolocation({ profileCity: user?.city });
  const geoQuery = new URLSearchParams(coordinateQuery(location)).toString();
  const [body, , loading, error] = useApi(`/medicines/${id}?${geoQuery}`, { medicine: null, related: [] }, [id, geoQuery]);
  const medicine = body.medicine || body;
  const related = body.related || [];
  if (loading) return <Page><p>Loading medicine...</p></Page>;
  if (error || !medicine?._id) {
    return (
      <Page>
        {error && <p style={{ color: '#DC2626' }}>{error}</p>}
        <p>Medicine not found.</p>
        <Button as={Link} to="/medicines">Back to medicines</Button>
      </Page>
    );
  }
  const setAlert = async () => {
    try {
      await api.post('/alerts', { medicine: medicine._id, medicineName: medicine.name });
      toast.success('Alert created');
    } catch {
      toast.error('Login session needed for alerts');
    }
  };
  const pharmacies = medicine.pharmacies || [];
  return (
    <Page>
      <section className="detail-hero">
        <img className="detail-image" src={medicineImage(medicine)} alt={medicine.name} onError={(e) => { e.currentTarget.src = '/medicines/fallback.png'; }} />
        <div><span className="category">{medicine.category}</span><h1>{medicine.name}</h1><p>{medicine.genericName} by {medicine.manufacturer}</p><Status value={medicine.availability} /></div>
        <Button onClick={setAlert}><BellIcon /> Set Alert</Button>
      </section>
      <div className="tabs"><span>Overview</span><span>Pharmacies</span><span>Reports</span><span>Alternatives</span></div>
      <section className="two-col">
        <article className="card"><h2>Overview</h2><p>{medicine.description}</p><p><strong>Availability:</strong> {availabilityLabels[medicine.availability] || medicine.availability}</p></article>
        <article className="card">
          <h2>Available At</h2>
          {pharmacies.length === 0 && <p>No verified stockists currently listed.</p>}
          {pharmacies.map((p) => (
            <div className="stock-row" key={p._id || p.name}>
              <strong>{p.name}</strong>
              <span>{p.address}, {p.city}, {p.state}</span>
              {p.distanceKm != null && <span>{formatDistance(p.distanceKm)}</span>}
              <span>{p.phone || 'Phone unavailable'} - {p.isVerified ? 'Verified pharmacy' : 'Community reported'}</span>
              <span className="map-link-row">
                <a href={directionsUrl(p)} target="_blank" rel="noreferrer">Get Directions</a>
                <a href={openMapsUrl(p)} target="_blank" rel="noreferrer">Open in Maps</a>
              </span>
            </div>
          ))}
        </article>
      </section>
      {pharmacies.length > 0 && <GooglePharmacyMap pharmacies={pharmacies} userLocation={location} />}
      <h2>Related Medicines</h2><div className="horizontal">{related.map((item) => <MedicineCardView key={item._id} medicine={item} />)}</div>
    </Page>
  );
}

function Pharmacies() {
  const [filters, setFilters] = useState({ search: '', city: '', rare: false });
  const { user } = useAuthStore();
  const { location, status, error, requestLocation } = useGeolocation({ profileCity: user?.city });
  const apiPath = pharmaciesPath(location, filters);
  const [pharmacies, , loading, apiError] = useApi(apiPath, [], [apiPath]);
  return (
    <Page>
      <Toolbar title="Pharmacies" subtitle="Find verified pharmacies with medicine coverage and real map locations." />
      <LocationBanner location={location} status={status} error={error} onRetry={requestLocation} />
      <div className="filters inline"><input placeholder="Search pharmacy" onChange={(e) => setFilters({ ...filters, search: e.target.value })} /><input placeholder="City" onChange={(e) => setFilters({ ...filters, city: e.target.value })} /><label className="check"><input type="checkbox" onChange={(e) => setFilters({ ...filters, rare: e.target.checked })} /> Has medicines in stock</label></div>
      <div className="two-col map-layout">
        <div className="card-grid">
          {loading && <p>Loading pharmacies...</p>}
          {!loading && apiError && <EmptyNotice error={apiError} message="Pharmacy data is temporarily unavailable." />}
          {!loading && !apiError && pharmacies.length === 0 && (
            <EmptyNotice message="No pharmacies are available yet." />
          )}
          {pharmacies.map((p) => <PharmacyCardView key={p._id} pharmacy={p} />)}
        </div>
        <GooglePharmacyMap pharmacies={pharmacies} userLocation={location} />
      </div>
    </Page>
  );
}

function PharmacyDetails() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { location } = useGeolocation({ profileCity: user?.city });
  const geoQuery = new URLSearchParams(coordinateQuery(location)).toString();
  const [body, , loading, error] = useApi(`/pharmacies/${id}?${geoQuery}`, { pharmacy: null }, [id, geoQuery]);
  const pharmacy = body.pharmacy || body;
  const medicines = pharmacy?.availableMedicines || [];
  if (loading) return <Page><p>Loading pharmacy...</p></Page>;
  if (error || !pharmacy?._id) {
    return (
      <Page>
        {error && <p style={{ color: '#DC2626' }}>{error}</p>}
        <p>Pharmacy not found.</p>
        <Button as={Link} to="/pharmacies">Back to pharmacies</Button>
      </Page>
    );
  }

  const logoSrc = pharmacy.logo ? resolveMediaUrl(pharmacy.logo) : '';

  return (
    <Page>
      <section className="detail-hero">
        <div className="pharmacy-detail-media">
          <img className="detail-image" src={pharmacyImage(pharmacy)} alt={`${pharmacy.name} storefront`} onError={(e) => { e.currentTarget.src = pharmacyImage({ name: pharmacy.name }); }} />
          {logoSrc && (
            <img className="pharmacy-detail-logo" src={logoSrc} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          )}
        </div>
        <div>
          <h1>{pharmacy.name}</h1>
          {pharmacy.distanceKm != null && <p className="distance-line">{formatDistance(pharmacy.distanceKm)}</p>}
          <p>{pharmacy.address}, {pharmacy.city}{pharmacy.state ? `, ${pharmacy.state}` : ''}</p>
          <p>{pharmacy.openHours} · {pharmacy.phone || 'Phone not listed'}</p>
        </div>
        <div className="cta-row">
          <a href={directionsUrl(pharmacy)} className="btn" target="_blank" rel="noreferrer">Get Directions</a>
          <a href={openMapsUrl(pharmacy)} className="btn outline" target="_blank" rel="noreferrer">Open in Maps</a>
          <Button as={Link} to="/reports" className="outline">Submit Report</Button>
        </div>
      </section>
      <div className="two-col">
        <article className="card">
          <h2>Available medicines</h2>
          {medicines.length === 0 && <p>No medicines linked to this pharmacy yet.</p>}
          {medicines.map((m) => (
            <p key={m._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ color: '#16A34A', fontWeight: 700 }}>✓</span>
              <span>{m.name}{m.genericName ? ` (${m.genericName})` : ''}</span>
              <Status value={m.availability} />
            </p>
          ))}
        </article>
        <GooglePharmacyMap pharmacies={[pharmacy]} userLocation={location} />
      </div>
    </Page>
  );
}

function Reports() {
  const [status, setStatus] = useState('');
  const [modal, setModal] = useState(false);
  const [reports, setReports, , loading, error] = useApi(`/reports${status ? `?status=${status}` : ''}`, [], [status]);
  const submit = async (payload) => {
    try {
      const { data } = await api.post('/reports', payload);
      setReports([data.report, ...reports]);
      toast.success('Report submitted');
      setModal(false);
    } catch {
      toast.error('Could not submit report');
    }
  };
  return (
    <Page>
      <Toolbar title="Shortage Reports" subtitle="Community availability reports from MongoDB." action={<Button onClick={() => setModal(true)}><PlusIcon /> Submit New Report</Button>} />
      <div className="tabs">{['', 'pending', 'verified', 'resolved'].map((s) => <button key={s} onClick={() => setStatus(s)}>{s || 'All'}</button>)}</div>
      <div className="card-grid">
        {loading && <p>Loading reports...</p>}
        {error && <EmptyNotice error={error} message="Sign in to view and submit reports." />}
        {!loading && !error && reports.length === 0 && <EmptyNotice message="No reports yet. Submit the first availability report." />}
        {reports.map((r) => <ReportCardView key={r._id} report={r} />)}
      </div>
      {modal && <ReportModal onClose={() => setModal(false)} onSubmit={submit} />}
    </Page>
  );
}

function ReportModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ medicineName: '', pharmacyName: '', location: '', notes: '', availabilityStatus: 'available', severity: 'medium' });
  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.form className="modal" initial={{ scale: 0.9 }} animate={{ scale: 1 }} onSubmit={(e) => { e.preventDefault(); onSubmit({ ...form, description: form.notes }); }}>
        <h2>Submit Availability Report</h2>
        <input required placeholder="Medicine name" value={form.medicineName} onChange={(e) => setForm({ ...form, medicineName: e.target.value })} />
        <input placeholder="Pharmacy name" value={form.pharmacyName} onChange={(e) => setForm({ ...form, pharmacyName: e.target.value })} />
        <input required placeholder="City or pharmacy location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <select value={form.availabilityStatus} onChange={(e) => setForm({ ...form, availabilityStatus: e.target.value })}>
          <option value="available">Available</option>
          <option value="limited">Limited stock</option>
          <option value="out_of_stock">Out of stock</option>
        </select>
        <textarea placeholder="Notes about stock, price, batch, or pharmacist confirmation" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}><option value="medium">medium</option><option value="low">low</option><option value="high">high</option></select>
        <div className="cta-row"><Button>Submit Report</Button><button type="button" onClick={onClose}>Cancel</button></div>
      </motion.form>
    </motion.div>
  );
}

function Alerts() {
  const [alerts, setAlerts] = useApi('/alerts', [], []);
  const toggle = async (alert) => {
    const next = { ...alert, enabled: !alert.enabled };
    setAlerts(alerts.map((a) => a._id === alert._id ? next : a));
    try { await api.put(`/alerts/${alert._id}`, { enabled: next.enabled }); } catch { toast.error('Could not update alert'); }
  };
  return <Page><Toolbar title="Alerts" subtitle="Manage notification preferences and triggered availability history." /><div className="card-grid">{alerts.map((a) => <article className="card" key={a._id}><h3>{a.medicineName}</h3><span className={`badge ${a.status}`}>{a.status}</span><p>Created {formatDate(a.createdAt)}</p><label className="switch"><input type="checkbox" checked={a.enabled} onChange={() => toggle(a)} /><span /></label><h4>History</h4>{(a.history || []).map((h, i) => <p key={i}>{h.message}</p>)}</article>)}</div></Page>;
}

function Dashboard() {
  const { user, updateProfile, setSession } = useAuthStore();
  const { saved, recentSearches } = useMedicineStore();
  const savedCount = user?.savedMedicines?.length || saved.length;
  const searchCount = user?.searchHistory?.length || recentSearches.length;
  const [form, setForm] = useState({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    city: user?.city || '',
    state: user?.state || '',
    notificationPreferences: user?.notificationPreferences || { email: true, inApp: true },
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setForm({
      name: user?.name || '',
      phoneNumber: user?.phoneNumber || '',
      city: user?.city || '',
      state: user?.state || '',
      notificationPreferences: user?.notificationPreferences || { email: true, inApp: true },
    });
  }, [user]);

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(form);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setUploading(true);
    try {
      const { data } = await api.post('/auth/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSession({ token: localStorage.getItem('raremed_token'), user: data.user });
      toast.success('Avatar updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Avatar upload failed');
    } finally {
      setUploading(false);
    }
  };

  const profileFields = (
    <article className="card">
      <h2>Account Profile</h2>
      <form onSubmit={saveProfile} style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '10px' }}>
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => document.getElementById('avatar-input').click()}>
            {user?.profilePicture ? (
              <img
                src={resolveMediaUrl(user.profilePicture)}
                alt={user.name}
                style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-light)' }}
              />
            ) : (
              <div className="avatar big">{initials(user?.name)}</div>
            )}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                background: 'var(--primary)',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                fontSize: '11px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              UP
            </div>
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--secondary)' }}>
              {uploading ? 'Uploading avatar...' : 'Click picture to upload custom avatar'}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '12px' }}>Supported formats: PNG, JPG (Max 5MB)</p>
            {user?.profilePicture && (
              <button
                type="button"
                className="ghost"
                style={{ marginTop: '8px', fontSize: '12px' }}
                onClick={async () => {
                  try {
                    const { data } = await api.delete('/auth/avatar');
                    setSession({ token: localStorage.getItem('raremed_token'), user: data.user });
                    toast.success('Profile photo removed');
                  } catch {
                    toast.error('Could not remove photo');
                  }
                }}
              >
                Remove photo
              </button>
            )}
          </div>
          <input
            id="avatar-input"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
            disabled={uploading}
          />
        </div>

        <label className="floating">
          <input required value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder=" " />
          <span>Full Name</span>
        </label>

        <label className="floating">
          <input disabled value={user?.email || ''} style={{ background: '#F1F5F9', cursor: 'not-allowed' }} placeholder=" " />
          <span>Email (Non-editable)</span>
        </label>

        <label className="floating">
          <input value={form.phoneNumber || ''} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} placeholder=" " />
          <span>Phone Number</span>
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <label className="floating">
            <input value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder=" " />
            <span>City</span>
          </label>
          <label className="floating">
            <input value={form.state || ''} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder=" " />
            <span>State</span>
          </label>
        </div>

        <label className="check">
          <input
            type="checkbox"
            checked={form.notificationPreferences?.email ?? true}
            onChange={(e) =>
              setForm({
                ...form,
                notificationPreferences: { ...(form.notificationPreferences || {}), email: e.target.checked },
              })
            }
          />
          Email notifications when saved medicines are in stock
        </label>

        <Button disabled={uploading}>Save Profile Changes</Button>
      </form>
    </article>
  );

  return (
    <Page>
      <Toolbar title={`Welcome, ${user?.name || 'Rare Med user'}`} subtitle="Your medicine discovery hub for saved medicines, availability alerts, and nearby pharmacies." />
      <DashboardStats savedCount={savedCount} searchCount={searchCount} />
      <div className="two-col">
        <article className="card">
          <h2>Quick Actions</h2>
          <div className="quick">
            <Button as={Link} to="/medicines">Search Medicine</Button>
            <Button as={Link} to="/reports">Report Shortage</Button>
            <Button as={Link} to="/alerts">Set Alert</Button>
            <Button as={Link} to="/pharmacies">Find Pharmacy</Button>
          </div>
        </article>
        <article className="card">
          <h2>Profile Summary</h2>
          <p>{user?.email}</p>
          <p>{user?.phoneNumber || 'Add phone in profile'}</p>
          <p>{user?.city || 'Add city in profile'} {user?.state || ''}</p>
          <p>{user?.isAdmin ? 'Admin access' : 'Standard account'}</p>
        </article>
      </div>
      <article className="card"><h2>Search History</h2>{(user?.searchHistory?.length ? user.searchHistory.map((x) => x.term) : recentSearches).slice(0, 8).map((x) => <p key={x}>{x}</p>)}</article>
      {profileFields}
    </Page>
  );
}

function Profile() {
  const { user, updateProfile, setSession } = useAuthStore();
  const [form, setForm] = useState(user || {});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setForm(user || {});
  }, [user]);

  const save = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(form);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('avatar', file);
    
    setUploading(true);
    try {
      const { data } = await api.post('/auth/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSession({ token: localStorage.getItem('raremed_token'), user: data.user });
      toast.success('Avatar updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Avatar upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Page>
      <Toolbar title="User Profile" subtitle="Update your identity, location, and saved medicine preferences." />
      <div className="two-col" style={{ alignItems: 'start' }}>
        <form className="card profile" onSubmit={save} style={{ display: 'grid', gap: '1.25rem', width: '100%' }}>
          <h2>Personal Details</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '10px' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => document.getElementById('avatar-input').click()}>
              {user?.profilePicture ? (
                <img
                  src={resolveMediaUrl(user.profilePicture)}
                  alt={user.name}
                  style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-light)' }}
                />
              ) : (
                <div className="avatar big">{initials(user?.name)}</div>
              )}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  background: 'var(--primary)',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#fff',
                  fontSize: '11px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                UP
              </div>
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--secondary)' }}>
                {uploading ? 'Uploading avatar...' : 'Click picture to upload custom avatar'}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '12px' }}>Supported formats: PNG, JPG (Max 5MB)</p>
              {user?.profilePicture && (
                <button
                  type="button"
                  className="ghost"
                  style={{ marginTop: '8px', fontSize: '12px' }}
                  onClick={async () => {
                    try {
                      const { data } = await api.delete('/auth/avatar');
                      setSession({ token: localStorage.getItem('raremed_token'), user: data.user });
                      toast.success('Profile photo removed');
                    } catch {
                      toast.error('Could not remove photo');
                    }
                  }}
                >
                  Remove photo
                </button>
              )}
            </div>
            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
              disabled={uploading}
            />
          </div>

          <label className="floating">
            <input required value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder=" " />
            <span>Full Name</span>
          </label>
          
          <label className="floating">
            <input disabled value={form.email || ''} style={{ background: '#F1F5F9', cursor: 'not-allowed' }} placeholder=" " />
            <span>Email (Non-editable)</span>
          </label>

          <label className="floating">
            <input value={form.phoneNumber || ''} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} placeholder=" " />
            <span>Phone Number</span>
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <label className="floating">
              <input value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder=" " />
              <span>City</span>
            </label>
            <label className="floating">
              <input value={form.state || ''} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder=" " />
              <span>State</span>
            </label>
          </div>

          <label className="check">
            <input
              type="checkbox"
              checked={form.notificationPreferences?.email ?? true}
              onChange={(e) =>
                setForm({
                  ...form,
                  notificationPreferences: { ...(form.notificationPreferences || {}), email: e.target.checked },
                })
              }
            />
            Email notifications when saved medicines are in stock
          </label>

          <Button disabled={uploading}>Save Profile Changes</Button>
        </form>

        <div style={{ display: 'grid', gap: '1.25rem', width: '100%' }}>
          <article className="card">
            <h2>Saved Medicines</h2>
            {(!user?.savedMedicines || user.savedMedicines.length === 0) ? (
              <p style={{ color: 'var(--muted)', margin: '10px 0 0' }}>No medicines saved yet. Browse medicines to save them.</p>
            ) : (
              <div style={{ display: 'grid', gap: '12px', marginTop: '12px' }}>
                {user.savedMedicines.map((med) => {
                  const m = typeof med === 'object' ? med : { _id: med, name: 'Saved Treatment', category: 'Therapy' };
                  return (
                    <div
                      key={m._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px',
                        borderRadius: '12px',
                        border: '1px solid var(--border)',
                        background: '#FAFAFA',
                      }}
                    >
                      <div>
                        <strong style={{ display: 'block', color: 'var(--secondary)' }}>{m.name}</strong>
                        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{m.category}</span>
                      </div>
                      <Link to={`/medicines/${m._id}`} style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary)' }}>
                        View Details &rarr;
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </article>
        </div>
      </div>
    </Page>
  );
}

function AdminLayout() {
  const links = [['/admin', 'Dashboard'], ['/admin/users', 'Users'], ['/admin/medicines', 'Medicines'], ['/admin/pharmacies', 'Pharmacies'], ['/admin/reports', 'Reports'], ['/admin/analytics', 'Analytics']];
  return <div className="admin-shell"><aside className="admin-side"><Logo />{links.map(([to, label]) => <NavLink key={to} end={to === '/admin'} to={to}>{label}</NavLink>)}</aside><Routes><Route index element={<AdminDashboard />} /><Route path="users" element={<AdminTable type="users" />} /><Route path="medicines" element={<AdminTable type="medicines" />} /><Route path="pharmacies" element={<AdminTable type="pharmacies" />} /><Route path="reports" element={<AdminTable type="reports" />} /><Route path="analytics" element={<AdminAnalytics />} /></Routes></div>;
}

function AdminDashboard() {
  const [stats] = useApi('/admin/stats', { totalUsers: 0, totalMedicines: 0, pendingReports: 0, activePharmacies: 0, userGrowth: [], reportsByCategory: [] }, []);
  return <Page><Toolbar title="Admin Dashboard" subtitle="Operational overview for Rare Med." /><section className="grid-4"><CountCard label="Total Users" value={stats.totalUsers} icon={UserCircleIcon} /><CountCard label="Total Medicines" value={stats.totalMedicines} icon={SparklesIcon} /><CountCard label="Pending Reports" value={stats.pendingReports} icon={ExclamationTriangleIcon} /><CountCard label="Active Pharmacies" value={stats.activePharmacies} icon={ShieldCheckIcon} /></section><div className="two-col"><ChartCard title="Registrations" data={stats.userGrowth || []} kind="line" /><ChartCard title="Reports by Severity" data={(stats.reportsByCategory || []).map((x) => ({ name: x._id, value: x.count }))} /></div></Page>;
}

function ChartCard({ title, data, kind = 'bar' }) {
  return <article className="card chart"><h2>{title}</h2><ResponsiveContainer width="100%" height={260}>{kind === 'line' ? <LineChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="_id" /><YAxis /><Tooltip /><Line dataKey="users" stroke="#16A34A" strokeWidth={3} /></LineChart> : <BarChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="#16A34A" /></BarChart>}</ResponsiveContainer></article>;
}

function AdminTable({ type }) {
  const fallback = { users: [], medicines: [], pharmacies: [], reports: [] }[type];
  const [rows] = useApi(`/admin/${type}`, fallback, [type]);
  return <Page><Toolbar title={`Admin ${type}`} subtitle="Searchable management table with inline actions." action={type === 'medicines' && <Button><PlusIcon /> Add New Medicine</Button>} /><div className="table-card"><table><thead><tr>{Object.keys(rows[0] || { name: '', status: '', actions: '' }).slice(0, 5).map((k) => <th key={k}>{k}</th>)}<th>Actions</th></tr></thead><tbody>{rows.map((row) => <tr key={row._id}>{Object.keys(row).slice(0, 5).map((k) => <td key={k}>{typeof row[k] === 'object' ? JSON.stringify(row[k]).slice(0, 40) : String(row[k])}</td>)}<td><button>View</button><button>Update</button><button>Delete</button></td></tr>)}</tbody></table></div></Page>;
}

function AdminAnalytics() {
  const [data] = useApi('/admin/analytics', { reportsOverTime: [], topMedicines: [], cityCoverage: [], userGrowth: [] }, []);
  return <Page><Toolbar title="Analytics" subtitle="Reports, medicine demand, pharmacy coverage, and user growth." /><div className="two-col"><ChartCard title="Reports over time" data={data.reportsOverTime.map((x) => ({ ...x, name: x._id, value: x.reports }))} /><ChartCard title="Top reported medicines" data={data.topMedicines.map((x) => ({ name: x._id, value: x.reports }))} /><ChartCard title="Pharmacy coverage by city" data={data.cityCoverage.map((x) => ({ name: x._id, value: x.pharmacies }))} /><ChartCard title="User growth" kind="line" data={data.userGrowth} /></div></Page>;
}

function Toolbar({ title, subtitle, action }) {
  return <section className="toolbar"><div><p className="eyebrow">Rare Med</p><h1>{title}</h1><p>{subtitle}</p></div>{action}</section>;
}

function GoogleOAuthSuccess() {
  const navigate = useNavigate();
  const { setSession, refreshProfile } = useAuthStore();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const mode = params.get('mode');
    if (token) {
      // Set the token first (this will be added to authorization headers by axios interceptor)
      setSession({ token, user: null });
      
      // Fetch the actual user profile from backend database
      refreshProfile()
        .then(() => {
          toast.success(mode === 'signup' ? 'Google account created successfully' : 'Google sign-in complete');
          navigate('/profile');
        })
        .catch((error) => {
          console.error('Failed to load user profile after Google sign-in:', error);
          toast.error('Could not complete sign-in process');
          navigate('/login');
        });
    } else {
      navigate('/login');
    }
  }, []);
  return <Page>Completing Google sign-in...</Page>;
}

export default function AppRoutes() {
  const location = useLocation();
  const { token, refreshProfile } = useAuthStore();
  useEffect(() => {
    if (token) refreshProfile().catch(() => {});
  }, [token, refreshProfile]);
  return (
    <>
      <Toaster toastOptions={{ className: 'toast', success: { style: { background: '#16A34A', color: '#fff' } }, error: { style: { background: '#EF4444', color: '#fff' } } }} />
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/google-success" element={<GoogleOAuthSuccess />} />
          <Route path="/dashboard" element={<Navigate to="/profile" replace />} />
          <Route path="/medicines" element={<ProtectedRoute><Medicines /></ProtectedRoute>} />
          <Route path="/medicines/:id" element={<ProtectedRoute><MedicineDetails /></ProtectedRoute>} />
          <Route path="/pharmacies" element={<ProtectedRoute><Pharmacies /></ProtectedRoute>} />
          <Route path="/pharmacies/:id" element={<ProtectedRoute><PharmacyDetails /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboardPage /></AdminProtectedRoute>} />
          <Route path="/admin/users" element={<AdminProtectedRoute><ManageUsersPage /></AdminProtectedRoute>} />
          <Route path="/admin/medicines" element={<AdminProtectedRoute><ManageMedicinesPage /></AdminProtectedRoute>} />
          <Route path="/admin/pharmacies" element={<AdminProtectedRoute><ManagePharmaciesPage /></AdminProtectedRoute>} />
          <Route path="/admin/reports" element={<AdminProtectedRoute><ManageReportsPage /></AdminProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
      <Footer />
    </>
  );
}

