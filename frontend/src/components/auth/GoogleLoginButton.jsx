import { motion } from 'framer-motion';

const GoogleLoginButton = ({ onClick, loading = false }) => {
  const API_OR_GOOGLE = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`;

  return (
    <motion.a
      href={loading ? '#' : API_OR_GOOGLE}
      onClick={onClick}
      whileHover={{ scale: 1.015, translateY: -1 }}
      whileTap={{ scale: 0.985 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        width: '100%',
        minHeight: '48px',
        background: '#FFFFFF',
        color: '#475569',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        fontFamily: '"Inter", sans-serif',
        fontSize: '15px',
        fontWeight: '700',
        cursor: loading ? 'not-allowed' : 'pointer',
        textDecoration: 'none',
        boxShadow: '0 2px 4px rgba(158, 170, 180, 0.05)',
        transition: 'border-color 0.2s, background-color 0.2s, box-shadow 0.2s',
        padding: '10px 16px',
        boxSizing: 'border-box',
      }}
      onMouseOver={(e) => {
        if (!loading) {
          e.currentTarget.style.borderColor = '#CBD5E1';
          e.currentTarget.style.backgroundColor = '#FAFAFA';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(148, 163, 184, 0.08)';
        }
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = '#E2E8F0';
        e.currentTarget.style.backgroundColor = '#FFFFFF';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(158, 170, 180, 0.05)';
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        style={{ display: 'block', flexShrink: 0 }}
      >
        <path
          fill="#4285F4"
          d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7l2.78 2.16c1.63-1.5 2.57-3.71 2.57-6.49z"
        />
        <path
          fill="#34A853"
          d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.78-2.16c-.77.52-1.76.83-3.18.83-2.44 0-4.51-1.65-5.25-3.87H.9l-2.78 2.15C2.6 15.68 5.6 18 9 18z"
        />
        <path
          fill="#FBBC05"
          d="M3.75 10.62A5.4 5.4 0 0 1 3.4 9c0-.56.1-1.1.27-1.62V4.85H.9A8.99 8.99 0 0 0 0 9c0 1.48.36 2.89.99 4.15l2.76-2.53z"
        />
        <path
          fill="#EA4335"
          d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.8 11.43 0 9 0 5.6 0 2.6 2.32.9 5.25l2.85 2.22c.74-2.22 2.81-3.89 5.25-3.89z"
        />
      </svg>
      <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
    </motion.a>
  );
};

export default GoogleLoginButton;
