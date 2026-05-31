import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import authService from '../services/authService.js';
import useAuth from '../hooks/useAuth.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

const GoogleOAuthSuccess = () => {
  const { signIn } = useAuth();
  const [message, setMessage] = useState('Completing Google sign in...');
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (!token) {
      setError('Google authentication failed. Please try again.');
      setMessage('');
      return;
    }

    const bootstrapGoogleUser = async () => {
      try {
        const profile = await authService.getProfile(token);
        signIn({ user: profile.user, token });
        navigate('/');
      } catch (err) {
        setError(err.message || 'Unable to complete Google sign in.');
        setMessage('');
      }
    };

    bootstrapGoogleUser();
  }, [location.search, navigate, signIn]);

  return (
    <div className="mx-auto max-w-xl rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-2xl shadow-slate-900/5">
      {!error ? (
        <>
          <LoadingSpinner />
          <p className="mt-6 text-lg font-medium text-slate-900">{message}</p>
          <p className="mt-2 text-sm text-slate-600">You will be redirected once authentication is complete.</p>
        </>
      ) : (
        <div>
          <p className="text-lg font-semibold text-rose-700">{error}</p>
          <p className="mt-2 text-sm text-slate-600">Please use the login page again to retry.</p>
        </div>
      )}
    </div>
  );
};

export default GoogleOAuthSuccess;
