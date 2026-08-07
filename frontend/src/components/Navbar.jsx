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
import { fileReport } from '../api.js';

/* CHANGES TO FRONTEND — Navbar: helper to check active route */
function Navbar({ isLoggedIn, setIsLoggedIn, profile, theme, toggleTheme }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredBtn, setHoveredBtn] = useState(null);

  const [showNavReportModal, setShowNavReportModal] = useState(false);
  const [targetType, setTargetType] = useState('resource');
  const [targetIdentifier, setTargetIdentifier] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    navigate('/login');
  };

  const handleNavReportSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Please enter a complaint reason.');
      return;
    }
    setSubmitting(true);
    try {
      const cleanIdent = targetIdentifier.trim();
      const isNumeric = /^\d+$/.test(cleanIdent);
      const payload = {
        target_type: targetType === 'user' ? 'user' : 'resource',
        resource: (targetType === 'resource' && isNumeric) ? parseInt(cleanIdent) : null,
        reason: cleanIdent
          ? `[Target: ${cleanIdent}] ${reason}`
          : reason,
      };
      await fileReport(payload);
      alert('Complaint submitted successfully. Admin team will review it.');
      setShowNavReportModal(false);
      setReason('');
      setTargetIdentifier('');
    } catch (err) {
      alert(err?.error || err?.detail || 'Failed to submit complaint. Please ensure you are logged in.');
    } finally {
      setSubmitting(false);
    }
  };

  /* CHANGES TO FRONTEND — Navbar: helper to check active route */
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  /* CHANGES TO FRONTEND — Navbar: compact & high-visibility apparent nav button */
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
          background: active ? 'rgba(124, 58, 237, 0.25)' : hovered ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
          color: active ? '#ffffff' : hovered ? '#ffffff' : '#cbd5e1',
          border: active ? '1px solid rgba(124, 58, 237, 0.4)' : '1px solid transparent',
          borderRadius: '8px',
          padding: '4px 10px',
          cursor: 'pointer',
          fontSize: '12.5px',
          fontWeight: active ? 700 : 500,
          fontFamily: 'var(--font)',
          position: 'relative',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          letterSpacing: '0.01em',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
        {active && (
          <span style={{
            position: 'absolute',
            bottom: '1px',
            left: '15%',
            right: '15%',
            height: '2px',
            background: 'linear-gradient(90deg, #7c3aed, #06b6d4)',
            borderRadius: '99px',
            boxShadow: '0 0 8px #06b6d4',
          }} />
        )}
      </button>
    );
  };

  return (
    <>
      {/* CHANGES TO FRONTEND — Navbar: Full-Width Edge-to-Edge Top Header Bar */}
      <nav style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        margin: 0,
        padding: '0 28px',
        height: '52px',
        background: 'rgba(10, 11, 20, 0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(124, 58, 237, 0.35)',
        boxShadow: '0 4px 25px rgba(0, 0, 0, 0.8), 0 0 20px rgba(124, 58, 237, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 1000,
      }}>
        {/* CHANGES TO FRONTEND — Navbar: compact high-visibility logo */}
        <span
          id="nav-logo"
          onClick={() => navigate('/')}
          onMouseEnter={e => {
            e.currentTarget.style.textShadow = '0 0 15px rgba(6, 182, 212, 0.6)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.textShadow = 'none';
          }}
          style={{
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '17px',
            cursor: 'pointer',
            letterSpacing: '-0.03em',
            fontFamily: 'var(--font-heading)',
            transition: 'all 0.2s ease',
            userSelect: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexShrink: 0,
          }}
        >
          <span style={{
            width: '24px', height: '24px', borderRadius: '6px',
            background: 'var(--accent-gradient)', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center', fontSize: '12px',
            boxShadow: '0 0 10px rgba(124, 58, 237, 0.5)',
          }}>❖</span>
          DevVault
        </span>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', overflowX: 'auto', padding: '2px 0' }}>
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

              {/* 🚩 Complain Navbar Button */}
              <button
                id="nav-complain"
                onClick={() => setShowNavReportModal(true)}
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  color: '#f87171',
                  border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: '99px',
                  padding: '5px 12px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                  fontFamily: 'var(--font)',
                  transition: 'all 0.15s ease',
                }}
              >
                🚩 Complain
              </button>

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

      {/* ── Navbar Complaint Modal ─────────────────────────── */}
      {showNavReportModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px',
        }}>
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
            borderRadius: '16px', padding: '28px', maxWidth: '460px', width: '100%',
            boxShadow: 'var(--shadow-lg)',
          }}>
            <h3 style={{ color: 'var(--text-primary)', margin: '0 0 6px', fontSize: '18px', fontWeight: 700 }}>
              🚩 File a Complaint / Report
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 20px' }}>
              Report any marketplace resource, user profile, or general issue directly to the platform admin.
            </p>

            <form onSubmit={handleNavReportSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
                  Target Type
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setTargetType('resource')}
                    style={{
                      padding: '8px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                      background: targetType === 'resource' ? 'rgba(59,130,246,0.2)' : 'var(--bg-elevated)',
                      border: targetType === 'resource' ? '1px solid #3b82f6' : '1px solid var(--border-default)',
                      color: targetType === 'resource' ? '#60a5fa' : 'var(--text-secondary)',
                    }}
                  >📦 Resource</button>
                  <button
                    type="button"
                    onClick={() => setTargetType('user')}
                    style={{
                      padding: '8px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                      background: targetType === 'user' ? 'rgba(59,130,246,0.2)' : 'var(--bg-elevated)',
                      border: targetType === 'user' ? '1px solid #3b82f6' : '1px solid var(--border-default)',
                      color: targetType === 'user' ? '#60a5fa' : 'var(--text-secondary)',
                    }}
                  >👤 User / Creator</button>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  {targetType === 'user' ? 'Username / User ID' : 'Resource Title or ID (Optional)'}
                </label>
                <input
                  type="text"
                  value={targetIdentifier}
                  onChange={e => setTargetIdentifier(e.target.value)}
                  placeholder={targetType === 'user' ? 'e.g. riya' : 'e.g. Resource #2 or React Template'}
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: '8px',
                    background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)', fontSize: '13px', outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Complaint Reason & Details
                </label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Describe your complaint or issue..."
                  rows={4}
                  required
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '8px',
                    background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)', fontSize: '13px', outline: 'none', resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowNavReportModal(false)}
                  style={{
                    padding: '8px 16px', background: 'transparent',
                    color: 'var(--text-secondary)', border: '1px solid var(--border-default)',
                    borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500,
                  }}
                >Cancel</button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '8px 20px', background: '#ef4444', color: '#ffffff',
                    border: 'none', borderRadius: '8px', cursor: submitting ? 'not-allowed' : 'pointer',
                    fontSize: '13px', fontWeight: 700,
                  }}
                >{submitting ? 'Submitting…' : 'Submit Complaint'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;