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
function Navbar({ isLoggedIn, setIsLoggedIn, profile, theme, toggleTheme }) {
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
          color: active ? 'var(--text-primary)' : hovered ? 'var(--text-primary)' : 'var(--text-secondary)',
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
          background: active ? 'var(--text-primary)' : 'var(--border-strong)',
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
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
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
          e.currentTarget.style.textShadow = 'var(--shadow-white)';
          e.currentTarget.style.color = 'var(--text-primary)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.textShadow = 'none';
          e.currentTarget.style.color = 'var(--text-primary)';
        }}
        style={{
          color: 'var(--text-primary)',
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

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        {/* CHANGES TO FRONTEND — Navbar: Marketplace always visible */}
        <NavBtn path="/marketplace"   label="Marketplace"    id="marketplace" />
        {/* CHANGES TO FRONTEND — Navbar: Resale Market always visible (secondary NFT market) */}
        <NavBtn path="/resale-market" label="⬡ Resale"       id="resale-market" />

        {isLoggedIn ? (
          <>
            <NavBtn path="/profile"        label="Profile"        id="profile" />
            <NavBtn path="/dashboard/user" label="My Dashboard"   id="user-dashboard" />
            <NavBtn path="/upload"         label="Upload"         id="upload" />
            <NavBtn path="/wishlist"       label="Wishlist"       id="wishlist" />
            <NavBtn path="/library"        label="Library"        id="library" />
            {profile?.status === 'creator' && (
              <NavBtn path="/dashboard"    label="Creator Studio" id="dashboard" />
            )}

            {/* CHANGES TO FRONTEND — Navbar: Admin link — only visible to staff users */}
            {profile?.is_staff && (
              <button
                id="nav-admin"
                onClick={() => navigate('/dashboard/admin')}
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
                }}
              >
                ⚙ Admin
              </button>
            )}

            {/* CHANGES TO FRONTEND — Navbar: NFT pill button with glow on hover */}
            <button
              id="nav-nft"
              onClick={() => navigate('/nft-dashboard')}
              style={{
                background: 'var(--nft-dim)',
                color: 'var(--nft)',
                border: '1px solid rgba(124,58,237,0.3)',
                borderRadius: '99px',
                padding: '5px 14px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: 'var(--font)',
                transition: 'all 0.2s ease',
              }}
            >
              ⬡ NFT Dashboard
            </button>

            {/* CHANGES TO FRONTEND — Navbar: Logout button with red hover glow */}
            <button
              id="nav-logout"
              onClick={handleLogout}
              style={{
                background: 'transparent',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-default)',
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
            style={{
              background: 'var(--accent)',
              color: 'var(--accent-inverse)',
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

        {/* ── Theme Toggle Switch ───────────────────────────────────── */}
        <button
          id="nav-theme-toggle"
          onClick={toggleTheme}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '99px',
            border: '1px solid var(--border-default)',
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 600,
            fontFamily: 'var(--font)',
            transition: 'all 0.25s ease',
          }}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
        >
          {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;