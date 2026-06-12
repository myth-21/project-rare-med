import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';

const Header = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 text-lg font-semibold tracking-tight text-gray-900">
          <img src="/brand/favicon.svg" alt="" className="h-10 w-10" />
          <span>
            Rare Med
            <span className="block text-xs font-bold uppercase tracking-wide text-gray-500">Medicine Locator</span>
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-700">
          <Link className="transition hover:text-green-700" to="/">
            Home
          </Link>
          {user && (
            <>
              <Link className="transition hover:text-green-700" to="/medicines">
                Medicines
              </Link>
              <Link className="transition hover:text-green-700" to="/pharmacies">
                Pharmacies
              </Link>
              <Link className="transition hover:text-green-700" to="/reports">
                Reports
              </Link>
              <Link className="transition hover:text-green-700" to="/alerts">
                Alerts
              </Link>
            </>
          )}
          {!user ? (
            <>
              <Link className="rounded-full border border-slate-200 bg-slate-100 px-4 py-2 transition hover:border-green-500 hover:bg-green-50" to="/login">
                Login
              </Link>
              <Link className="rounded-full bg-green-600 px-4 py-2 text-white transition hover:bg-green-700" to="/register">
                Register
              </Link>
            </>
          ) : (
            <button
              type="button"
              onClick={signOut}
              className="rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm text-slate-700 transition hover:border-green-500 hover:bg-green-50"
            >
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
