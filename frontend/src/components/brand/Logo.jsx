import { Link } from 'react-router-dom';

export function CapsuleIcon({ size = 40, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-hidden
    >
      <rect width="48" height="48" rx="14" fill="#F8FAFC" />
      <rect x="6" y="14" width="36" height="20" rx="10" fill="#16A34A" />
      <rect x="24" y="14" width="18" height="20" rx="10" fill="#15803D" />
      <rect x="10" y="20" width="10" height="8" rx="4" fill="#FFFFFF" opacity="0.35" />
    </svg>
  );
}

export default function Logo({ compact = false, to = '/' }) {
  return (
    <Link to={to} className="brand-lockup" aria-label="Rare Med home">
      <CapsuleIcon size={compact ? 36 : 44} className="brand-mark" />
      {!compact && (
        <span className="brand-copy">
          <span className="brand-name">Rare Med</span>
          <span className="brand-tagline">Medicine Locator</span>
        </span>
      )}
    </Link>
  );
}
