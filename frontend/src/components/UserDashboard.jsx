/* ============================================================
   CHANGES TO FRONTEND — UserDashboard
   - Dark page and card surfaces
   - Stat cards match the design system (dark surface, white text)
   - Labels in muted uppercase, values in bold white
   ============================================================ */

import { useState, useEffect } from 'react';
import { getUserStats } from '../api.js';

function UserDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserStats()
      .then(setStats)
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  /* CHANGES TO FRONTEND — UserDashboard: dark loading state */
  if (loading) return (
    <div className="page-loading">
      <div className="spinner" />
      <span>Loading…</span>
    </div>
  );

  return (
    /* CHANGES TO FRONTEND — UserDashboard: dark page wrapper */
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-page)',
      padding: '40px 32px',
      fontFamily: 'var(--font)',
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* CHANGES TO FRONTEND — UserDashboard: page header */}
        <h1 style={{
          fontSize: '28px', fontWeight: 800,
          color: 'var(--text-primary)', margin: '0 0 6px',
          letterSpacing: '-0.02em',
        }}>My Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>
          For your collection and wishlist, see Library and Wishlist in the nav.
        </p>

        {/* CHANGES TO FRONTEND — UserDashboard: stat cards on dark */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <StatCard label="Items Owned"   value={stats?.items_owned ?? 0}   />
          <StatCard label="Total Spent"   value={`₹${stats?.total_spent ?? 0}`} color="#f59e0b" />
          <StatCard label="Wishlist"      value={stats?.wishlist_count ?? 0} />
        </div>
      </div>
    </div>
  );
}

/* CHANGES TO FRONTEND — UserDashboard: reusable dark stat card */
function StatCard({ label, value, color }) {
  return (
    <div style={{
      flex: 1, minWidth: '160px',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '14px', padding: '22px 20px',
    }}>
      <p style={{
        color: 'var(--text-muted)', fontSize: '12px',
        fontWeight: 600, textTransform: 'uppercase',
        letterSpacing: '0.5px', margin: '0 0 8px',
      }}>{label}</p>
      <p style={{
        color: color || 'var(--text-primary)',
        fontSize: '28px', fontWeight: 700, margin: 0,
      }}>{value}</p>
    </div>
  );
}

export default UserDashboard;