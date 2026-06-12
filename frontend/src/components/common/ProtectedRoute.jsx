import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';

const ProtectedRoute = ({ children, admin = false }) => {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="mx-auto max-w-xl py-12">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-2xl shadow-slate-900/5">
          <p className="text-sm text-slate-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to={`/login?returnUrl=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (admin && !user?.isAdmin) {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

export default ProtectedRoute;
