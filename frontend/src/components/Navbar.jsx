/* ============================================================
   CHANGES TO FRONTEND — Navbar
   - Replaced flat #1a1a2e bg with true black + bottom border
   - Added hover + active state on every nav button (underline slide)
   - Glowing white effect on logo hover
   - Active route indicator via bottom border
   - NFT pill button gains glow animation on hover
   - Admin link shown ONLY when profile.is_staff === true (red accent)
   - Added transition on all interactive elements
   ============================================================ */

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/* CHANGES TO FRONTEND — Navbar: helper to check active route */
function Navbar({ isLoggedIn, setIsLoggedIn, profile }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredBtn, setHoveredBtn] = useState(null);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    navigate('/login');
  };

  /* CHANGES TO FRONTEND — Navbar: helper to check active route */
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  /* CHANGES TO FRONTEND — Navbar: nav button with hover + active state */
  const NavBtn = ({ path, label, id }) => {
    const active = isActive(path);
    const hovered = hoveredBtn === id;
    return (
      <button
        id={`nav-${id}`}
        onClick={() => navigate(path)}
        onMouseEnter={() => setHoveredBtn(id)}
        onMouseLeave={() => setHoveredBtn(null)}
        style={{
          background: 'transparent',
          color: active ? '#ffffff' : hovered ? '#e4e4e7' : '#a1a1aa',
          border: 'none',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: active ? 600 : 400,
          fontFamily: 'var(--font)',
          padding: '6px 2px',
          position: 'relative',
          transition: 'color 0.15s ease',
          letterSpacing: '0.01em',
        }}
      >
        {label}
        {/* CHANGES TO FRONTEND — Navbar: animated underline for active/hover state */}
        <span style={{
          position: 'absolute',
          bottom: '-2px',
          left: 0,
          width: active ? '100%' : hovered ? '100%' : '0%',
          height: '1.5px',
          background: active ? '#ffffff' : '#52525b',
          borderRadius: '99px',
          transition: 'width 0.2s ease, background 0.2s ease',
        }} />
      </button>
    );
  };

  return (
    /* CHANGES TO FRONTEND — Navbar: true black bg, bottom border replaces old blue */
    <nav style={{
      padding: '0 32px',
      height: '56px',
      background: '#000000',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(12px)',
    }}>
      {/* CHANGES TO FRONTEND — Navbar: logo glows white on hover */}
      <span
        id="nav-logo"
        onClick={() => navigate('/')}
        onMouseEnter={e => {
          e.currentTarget.style.textShadow = '0 0 20px rgba(255,255,255,0.4)';
          e.currentTarget.style.color = '#ffffff';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.textShadow = 'none';
          e.currentTarget.style.color = '#e4e4e7';
        }}
        style={{
          color: '#e4e4e7',
          fontWeight: 700,
          fontSize: '18px',
          cursor: 'pointer',
          letterSpacing: '-0.02em',
          transition: 'color 0.15s ease, text-shadow 0.15s ease',
          userSelect: 'none',
        }}
      >
        DevVault
      </span>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        {/* CHANGES TO FRONTEND — Navbar: Marketplace always visible */}
        <NavBtn path="/marketplace"   label="Marketplace"    id="marketplace" />
        {/* CHANGES TO FRONTEND — Navbar: Resale Market always visible (secondary NFT market) */}
        <NavBtn path="/resale-market" label="⬡ Resale"       id="resale-market" />

        {isLoggedIn ? (
          <>
            <NavBtn path="/profile"   label="Profile"    id="profile" />
            <NavBtn path="/upload"    label="Upload"     id="upload" />
            <NavBtn path="/wishlist"  label="Wishlist"   id="wishlist" />
            <NavBtn path="/library"   label="Library"    id="library" />
            <NavBtn path="/dashboard" label="Dashboard"  id="dashboard" />

            {/* CHANGES TO FRONTEND — Navbar: Admin link — only visible to staff users */}
            {profile?.is_staff && (
              <button
                id="nav-admin"
                onClick={() => navigate('/dashboard/admin')}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
                  e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)';
                  e.currentTarget.style.color = '#f87171';
                  e.currentTarget.style.boxShadow = '0 0 14px rgba(239,68,68,0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
                  e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)';
                  e.currentTarget.style.color = '#fca5a5';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  color: '#fca5a5',
                  border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: '99px',
                  padding: '5px 14px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  fontFamily: 'var(--font)',
                  transition: 'all 0.2s ease',
                  letterSpacing: '0.02em',
                }}
              >
                ⚙ Admin
              </button>
            )}

            {/* CHANGES TO FRONTEND — Navbar: NFT pill button with glow on hover */}
            <button
              id="nav-nft"
              onClick={() => navigate('/nft-dashboard')}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 0 20px rgba(167,139,250,0.5)';
                e.currentTarget.style.background = 'rgba(167,139,250,0.2)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 0 12px rgba(167,139,250,0.3)';
                e.currentTarget.style.background = 'rgba(167,139,250,0.12)';
              }}
              style={{
                background: 'rgba(167,139,250,0.12)',
                color: '#a78bfa',
                border: '1px solid rgba(167,139,250,0.3)',
                borderRadius: '99px',
                padding: '5px 14px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: 'var(--font)',
                boxShadow: '0 0 12px rgba(167,139,250,0.3)',
                transition: 'all 0.2s ease',
                letterSpacing: '0.02em',
              }}
            >
              ⬡ NFT
            </button>

            {/* CHANGES TO FRONTEND — Navbar: Logout button with red hover glow */}
            <button
              id="nav-logout"
              onClick={handleLogout}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.18)';
                e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)';
                e.currentTarget.style.color = '#f87171';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                e.currentTarget.style.color = '#a1a1aa';
              }}
              style={{
                background: 'transparent',
                color: '#a1a1aa',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 'var(--radius-md)',
                padding: '5px 14px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
                fontFamily: 'var(--font)',
                transition: 'all 0.18s ease',
              }}
            >
              Logout
            </button>
          </>
        ) : (
          /* CHANGES TO FRONTEND — Navbar: Login button with white fill on hover */
          <button
            id="nav-login"
            onClick={() => navigate('/login')}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#e4e4e7';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            style={{
              background: '#ffffff',
              color: '#000000',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '7px 18px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: 'var(--font)',
              transition: 'all 0.15s ease',
            }}
          >
            Sign in
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;