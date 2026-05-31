import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: '#111827',
        color: '#94A3B8',
        borderTop: '1px solid #1E293B',
        padding: '64px 24px 32px',
        fontFamily: '"Inter", sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '40px',
          marginBottom: '48px',
        }}
      >
        {/* Column 1: Logo + Description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg viewBox="0 0 48 48" width="42" height="42" aria-label="Rare Med capsule">
              <rect width="48" height="48" rx="14" fill="#1F2937" />
              <rect x="6" y="14" width="36" height="20" rx="10" fill="#16A34A" />
              <rect x="24" y="14" width="18" height="20" rx="10" fill="#15803D" />
            </svg>
            <span
              style={{
                fontFamily: 'Sora, sans-serif',
                fontWeight: '800',
                fontSize: '20px',
                color: '#FFFFFF',
                letterSpacing: '-0.5px',
              }}
            >
              Rare <span style={{ color: '#22C55E' }}>Med</span>
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: '#94A3B8' }}>
            Find life-saving medicines faster with verified pharmacy availability, saved searches, and real-time stock alerts.
          </p>
          {/* Social Icons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            {['facebook', 'twitter', 'linkedin', 'instagram'].map((social) => (
              <a
                key={social}
                href="#"
                aria-label={`Rare Med ${social}`}
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#1E293B',
                  color: '#FFFFFF',
                  transition: 'background-color 0.2s',
                  textDecoration: 'none',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#16A34A';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#1E293B';
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  {social[0].toUpperCase()}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, color: '#FFFFFF', fontSize: '16px', fontWeight: '700', fontFamily: 'Sora, sans-serif' }}>
            Quick Links
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            {[
              ['/', 'Home'],
              ['/medicines', 'Medicines'],
              ['/pharmacies', 'Pharmacies'],
              ['/reports', 'Shortage Reports'],
              ['/alerts', 'Stock Alerts'],
            ].map(([to, label]) => (
              <Link
                key={to}
                to={to}
                style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseOver={(e) => (e.currentTarget.style.color = '#22C55E')}
                onMouseOut={(e) => (e.currentTarget.style.color = '#94A3B8')}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Column 3: Services */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, color: '#FFFFFF', fontSize: '16px', fontWeight: '700', fontFamily: 'Sora, sans-serif' }}>
            Our Services
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            {[
              'Medicine Discovery',
              'Real-Time Availability Maps',
              'Pharmacy Stock Verification',
              'Personalized Watchlists',
              'Email Stock Alerts',
            ].map((service) => (
              <span key={service} style={{ color: '#94A3B8' }}>
                {service}
              </span>
            ))}
          </div>
        </div>

        {/* Column 4: Contact Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, color: '#FFFFFF', fontSize: '16px', fontWeight: '700', fontFamily: 'Sora, sans-serif' }}>
            Contact Us
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', lineHeight: '1.5' }}>
            <p style={{ margin: 0 }}>
              <strong style={{ color: '#FFFFFF' }}>Address:</strong><br />
              Medicine Discovery Desk, Bengaluru, KA
            </p>
            <p style={{ margin: 0 }}>
              <strong style={{ color: '#FFFFFF' }}>Phone:</strong><br />
              +1 (800) 555-RARE (7273)
            </p>
            <p style={{ margin: 0 }}>
              <strong style={{ color: '#FFFFFF' }}>Email:</strong><br />
              <a
                href="mailto:support@raremedicine.com"
                style={{ color: '#22C55E', textDecoration: 'none' }}
              >
                support@raremedicine.com
              </a>
            </p>
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          borderTop: '1px solid #1E293B',
          paddingTop: '24px',
          textAlign: 'center',
          fontSize: '13px',
          color: '#64748B',
        }}
      >
        <p style={{ margin: 0 }}>
          &copy; {new Date().getFullYear()} Rare Med. Find Life-Saving Medicines Faster. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
