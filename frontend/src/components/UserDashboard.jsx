import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserStats, getMediaUrl } from '../api.js';

function UserDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getUserStats()
      .then(setStats)
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page-loading">
      <div className="spinner" />
      <span>Loading spending analytics…</span>
    </div>
  );

  const purchases = stats?.purchases || [];

  return (
    /* CHANGES TO FRONTEND — UserDashboard: Futuristic Glass Container */
    <div style={{
      minHeight: '100vh',
      padding: '32px 24px 80px',
      fontFamily: 'var(--font)',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        <div className="glass-panel" style={{
          padding: '36px 32px',
          borderRadius: '24px',
          marginBottom: '32px',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(15, 17, 26, 0.85) 60%)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}>
          <div>
            <span className="badge-cyan" style={{ marginBottom: '8px' }}>
              📊 FINANCIAL ANALYTICS & ACCOUNTING
            </span>
            <h1 className="font-heading" style={{
              fontSize: '32px', fontWeight: 800,
              color: '#ffffff', margin: '0 0 6px',
              letterSpacing: '-0.03em',
            }}>
              User Dashboard & <span className="text-gradient-neon">Expenditure Log</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: 0 }}>
              Track your total software expenditure, primary mints, secondary market resales, and verified refunds.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => navigate('/nft-dashboard')}
              className="btn-glow"
            >NFT Dashboard →</button>
            <button
              onClick={() => navigate('/library')}
              className="btn-glass"
            >View My Vault →</button>
          </div>
        </div>

        {/* Spending Stat Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px', marginBottom: '36px',
        }}>
          <StatCard label="Total Spent" value={`₹${parseFloat(stats?.total_spent || 0).toLocaleString('en-IN')}`} color="#f59e0b" sub="Across all acquisitions" />
          <StatCard label="Money Refunded" value={`₹${parseFloat(stats?.total_refunded || 0).toLocaleString('en-IN')}`} color="#10b981" sub="Platform admin deletion refunds" />
          <StatCard label="Primary Spend" value={`₹${parseFloat(stats?.primary_spent || 0).toLocaleString('en-IN')}`} color="#3b82f6" sub="Direct creator mints" />
          <StatCard label="Resale Spend" value={`₹${parseFloat(stats?.secondary_spent || 0).toLocaleString('en-IN')}`} color="#7c3aed" sub="Secondary market resales" />
          <StatCard label="Tokens Owned" value={stats?.items_owned ?? 0} color="#06b6d4" sub="Active library tokens" />
        </div>

        {/* Spending & Purchase History Log */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px', padding: '24px', marginBottom: '32px',
        }}>
          <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '18px', margin: '0 0 16px' }}>
            Acquisition & Spending History
          </h3>

          {purchases.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 12px' }}>No purchases logged yet.</p>
              <button
                onClick={() => navigate('/marketplace')}
                style={{
                  padding: '9px 20px', background: '#ffffff', color: '#000000',
                  border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '13px',
                }}
              >Browse Marketplace</button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                    {['Resource', 'Token', 'Type', 'Seller', 'Price Paid', 'Date'].map(h => (
                      <th key={h} style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {purchases.map(p => (
                    <tr
                      key={p.id}
                      onClick={() => navigate(`/resources/${p.resource_id}`)}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {p.resource_thumbnail && (
                            <img src={getMediaUrl(p.resource_thumbnail)} alt="" style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} />
                          )}
                          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{p.resource_title}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px', color: '#a78bfa', fontWeight: 600 }}>
                        Token #{p.token_number}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 600,
                          background: p.sale_type === 'primary' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(124, 58, 237, 0.15)',
                          color: p.sale_type === 'primary' ? '#10b981' : '#a78bfa',
                        }}>
                          {p.sale_type === 'primary' ? 'Primary Mint' : 'Resale Purchase'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{p.seller}</td>
                      <td style={{ padding: '12px', color: '#f59e0b', fontWeight: 700 }}>₹{parseFloat(p.sale_price).toFixed(0)}</td>
                      <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{p.sold_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Money Refunded Log ────────────────────────────── */}
        {stats?.refunds?.length > 0 && (
          <div style={{
            background: 'rgba(16,185,129,0.04)',
            border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: '16px', padding: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ fontSize: '20px' }}>💸</span>
              <div>
                <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '18px', margin: 0 }}>
                  Money Refunded Log
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
                  Refunds issued for deleted or removed marketplace resources.
                </p>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(16,185,129,0.2)', textAlign: 'left' }}>
                    {['Resource Name', 'Refund Reason', 'Refunded Amount', 'Date Issued', 'Status'].map(h => (
                      <th key={h} style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.refunds.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid rgba(16,185,129,0.1)' }}>
                      <td style={{ padding: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {r.resource_title}
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                        {r.reason}
                      </td>
                      <td style={{ padding: '12px', color: '#10b981', fontWeight: 700, fontSize: '14px' }}>
                        + ₹{parseFloat(r.amount).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                        {new Date(r.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          background: 'rgba(16,185,129,0.15)', color: '#10b981',
                          padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 700,
                        }}>
                          ✓ REFUNDED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color, sub }) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '14px', padding: '20px',
    }}>
      <p style={{
        color: 'var(--text-muted)', fontSize: '11px',
        fontWeight: 600, textTransform: 'uppercase',
        letterSpacing: '0.5px', margin: '0 0 6px',
      }}>{label}</p>
      <p style={{
        color: color || 'var(--text-primary)',
        fontSize: '24px', fontWeight: 700, margin: '0 0 4px',
      }}>{value}</p>
      {sub && <p style={{ color: 'var(--text-muted)', fontSize: '11px', margin: 0 }}>{sub}</p>}
    </div>
  );
}

export default UserDashboard;