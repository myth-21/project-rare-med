import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

const HomePage = () => {
  const { user } = useAuth();

  return (
    <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 p-8 text-white shadow-2xl shadow-slate-900/10 sm:p-12">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-10 lg:grid-cols-[1.2fr,0.8fr] lg:items-center">
          <div>
            <span className="inline-flex rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-100">
              Locate critical medicines near you
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
              Find Life-Saving Medicines Faster
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-100/85">
              Search medicines, compare verified pharmacy availability, save watchlists, and get notified when critical medicine becomes available.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              {user ? (
                <>
                  <Link to="/medicines" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-900/10 transition hover:bg-slate-100">
                    Browse medicines
                  </Link>
                  <Link to="/pharmacies" className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20">
                    Nearby pharmacies
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-900/10 transition hover:bg-slate-100">
                    Login
                  </Link>
                  <Link to="/register" className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl shadow-slate-900/10 backdrop-blur-xl sm:p-8">
            <h2 className="text-xl font-semibold text-white">How it works</h2>
            <ul className="mt-6 space-y-4 text-sm leading-6 text-slate-100/90">
              <li>- Search medicines by name and filter by category.</li>
              <li>- View pharmacy availability near your location.</li>
              <li>- Create alerts for critical medicines and receive notifications.</li>
              <li>- Save medicines and track discovery history.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomePage;
