/* ============================================================
   CHANGES TO FRONTEND — AdminDashboard
   - Dark page and card surfaces using CSS design tokens
   - Stat cards: dark background, white numbers, alert badges on dark
   - Pending payouts card glows amber; open reports glows red
   - Payout table: dark rows, borders, white text
   - Status badges adapted for dark backgrounds
   - Action buttons (Mark Paid / Reject / Reviewed / Dismiss) updated
     to green-dim/red-dim ghost style on dark
   - Reports cards: dark surface with border, hover lift
   ============================================================ */

import { useState, useEffect } from 'react';
import { getAdminStats, adminGetAllPayouts, adminUpdatePayout, adminGetAllReports, adminUpdateReport } from '../api.js';

/* CHANGES TO FRONTEND — AdminDashboard: status badge colours adapted for dark bg */
function statusBadge(status) {
  const map = {
    requested:  { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b' },
    processing: { bg: 'rgba(59,130,246,0.15)',   color: '#60a5fa' },
    paid:       { bg: 'rgba(34,197,94,0.15)',    color: '#22c55e' },
    rejected:   { bg: 'rgba(239,68,68,0.15)',    color: '#f87171' },
    open:       { bg: 'rgba(239,68,68,0.15)',    color: '#f87171' },
    reviewed:   { bg: 'rgba(59,130,246,0.15)',   color: '#60a5fa' },
    dismissed:  { bg: 'rgba(255,255,255,0.07)',  color: '#71717a' },
  };
  return map[status] || { bg: 'rgba(255,255,255,0.07)', color: '#a1a1aa' };
}

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      const [s, p, r] = await Promise.all([getAdminStats(), adminGetAllPayouts(), adminGetAllReports()]);
      setStats(s); setPayouts(p); setReports(r);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  async function handlePayout(id, statusValue) {
    await adminUpdatePayout(id, statusValue);
    loadAll();
  }

  async function handleReport(id, statusValue) {
    await adminUpdateReport(id, statusValue);
    loadAll();
  }

  /* CHANGES TO FRONTEND — AdminDashboard: dark loading state */
  if (loading) return (
    <div className="page-loading">
      <div className="spinner" />
      <span>Loading admin dashboard…</span>
    </div>
  );

  return (
    /* CHANGES TO FRONTEND — AdminDashboard: dark page wrapper */
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-page)',
      padding: '40px 32px',
      fontFamily: 'var(--font)',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* CHANGES TO FRONTEND — AdminDashboard: page header with red admin badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '28px', fontWeight: 800,
            color: 'var(--text-primary)', margin: 0,
            letterSpacing: '-0.02em',
          }}>Admin Dashboard</h1>
          <span style={{
            background: 'rgba(239,68,68,0.12)', color: '#fca5a5',
            border: '1px solid rgba(239,68,68,0.25)',
            fontSize: '11px', fontWeight: 700, padding: '3px 10px',
            borderRadius: '99px', letterSpacing: '0.5px',
          }}>⚙ STAFF</span>
        </div>

        {/* CHANGES TO FRONTEND — AdminDashboard: stat card grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '14px', marginBottom: '40px',
        }}>
          <StatCard label="Total Users"     value={stats?.total_users}         />
          <StatCard label="Creators"        value={stats?.total_creators}      />
          <StatCard label="Resources"       value={stats?.total_resources}     />
          <StatCard label="Revenue"         value={`₹${stats?.total_revenue}`} color="#f59e0b" />
          <StatCard label="Tokens Minted"   value={stats?.total_tokens_minted} color="var(--nft)" />
          {/* CHANGES TO FRONTEND — AdminDashboard: alert cards for pending items */}
          <StatCard
            label="Pending Payouts"
            value={stats?.pending_payouts}
            color={stats?.pending_payouts > 0 ? '#f59e0b' : 'var(--text-primary)'}
            alert={stats?.pending_payouts > 0}
            alertColor="amber"
          />
          <StatCard
            label="Open Reports"
            value={stats?.open_reports}
            color={stats?.open_reports > 0 ? '#f87171' : 'var(--text-primary)'}
            alert={stats?.open_reports > 0}
            alertColor="red"
          />
        </div>

        {/* CHANGES TO FRONTEND — AdminDashboard: two-column layout for payouts + reports */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>

          {/* ── Payouts ─────────────────────────────────────── */}
          <div>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '17px', fontWeight: 700, margin: '0 0 16px' }}>
              Payout Requests
            </h2>
            {payouts.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No payout requests.</p>
            ) : (
              /* CHANGES TO FRONTEND — AdminDashboard: payout table on dark */
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px', overflow: 'hidden',
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      {['Creator','Amount','Status',''].map(h => (
                        <th key={h} style={{
                          textAlign: 'left', padding: '10px 14px',
                          color: 'var(--text-muted)', fontSize: '11px',
                          fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map(p => {
                      const b = statusBadge(p.status);
                      return (
                        <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '10px 14px', color: 'var(--text-primary)', fontWeight: 500 }}>
                            {p.creator_username}
                          </td>
                          <td style={{ padding: '10px 14px', color: 'var(--text-primary)', fontWeight: 600 }}>
                            ₹{p.amount}
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            <span style={{
                              background: b.bg, color: b.color,
                              padding: '2px 8px', borderRadius: '99px',
                              fontSize: '11px', fontWeight: 600,
                            }}>{p.status}</span>
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            {p.status === 'requested' && (
                              <div style={{ display: 'flex', gap: '6px' }}>
                                {/* CHANGES TO FRONTEND — AdminDashboard: green ghost action button */}
                                <ActionBtn
                                  id={`payout-paid-${p.id}`}
                                  label="Mark Paid"
                                  color="green"
                                  onClick={() => handlePayout(p.id, 'paid')}
                                />
                                <ActionBtn
                                  id={`payout-reject-${p.id}`}
                                  label="Reject"
                                  color="red"
                                  onClick={() => handlePayout(p.id, 'rejected')}
                                />
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Reports ─────────────────────────────────────── */}
          <div>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '17px', fontWeight: 700, margin: '0 0 16px' }}>
              Reports
            </h2>
            {reports.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No reports.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {reports.map(r => {
                  const b = statusBadge(r.status);
                  return (
                    /* CHANGES TO FRONTEND — AdminDashboard: report card with dark surface */
                    <div key={r.id} style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '10px', padding: '14px 16px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                          {r.target_type === 'resource' ? `Resource: ${r.resource_title}` : `User: ${r.reported_username}`}
                        </p>
                        <span style={{
                          background: b.bg, color: b.color,
                          padding: '2px 8px', borderRadius: '99px',
                          fontSize: '11px', fontWeight: 600, flexShrink: 0, marginLeft: '8px',
                        }}>{r.status}</span>
                      </div>
                      <p style={{ margin: '0 0 10px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        {r.reason}
                      </p>
                      {r.status === 'open' && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <ActionBtn
                            id={`report-reviewed-${r.id}`}
                            label="Mark Reviewed"
                            color="blue"
                            onClick={() => handleReport(r.id, 'reviewed')}
                          />
                          <ActionBtn
                            id={`report-dismiss-${r.id}`}
                            label="Dismiss"
                            color="grey"
                            onClick={() => handleReport(r.id, 'dismissed')}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* CHANGES TO FRONTEND — AdminDashboard: stat card with dark surface + optional alert border */
function StatCard({ label, value, color, alert, alertColor }) {
  const borderColor = alert
    ? alertColor === 'amber' ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'
    : 'var(--border-subtle)';
  const bgColor = alert
    ? alertColor === 'amber' ? 'rgba(245,158,11,0.06)' : 'rgba(239,68,68,0.06)'
    : 'var(--bg-surface)';

  return (
    <div style={{
      background: bgColor,
      border: `1px solid ${borderColor}`,
      borderRadius: '12px', padding: '18px 16px',
    }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px' }}>
        {label}
      </p>
      <p style={{ color: color || 'var(--text-primary)', fontSize: '24px', fontWeight: 700, margin: 0 }}>
        {value ?? '—'}
      </p>
    </div>
  );
}

/* CHANGES TO FRONTEND — AdminDashboard: ghost action button with colour variants */
function ActionBtn({ id, label, color, onClick }) {
  const colours = {
    green: { bg: 'rgba(34,197,94,0.12)',   text: '#22c55e', hover: 'rgba(34,197,94,0.22)' },
    red:   { bg: 'rgba(239,68,68,0.12)',   text: '#f87171', hover: 'rgba(239,68,68,0.22)' },
    blue:  { bg: 'rgba(59,130,246,0.12)',  text: '#60a5fa', hover: 'rgba(59,130,246,0.22)' },
    grey:  { bg: 'rgba(255,255,255,0.06)', text: '#71717a', hover: 'rgba(255,255,255,0.1)' },
  };
  const c = colours[color] || colours.grey;
  return (
    <button
      id={id}
      onClick={onClick}
      onMouseEnter={e => e.currentTarget.style.background = c.hover}
      onMouseLeave={e => e.currentTarget.style.background = c.bg}
      style={{
        background: c.bg, color: c.text, border: 'none',
        padding: '4px 10px', borderRadius: '6px',
        fontSize: '12px', fontWeight: 600, cursor: 'pointer',
        fontFamily: 'var(--font)', transition: 'background 0.15s ease',
      }}
    >
      {label}
    </button>
  );
}

export default AdminDashboard;