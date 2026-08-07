import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadialBarChart, RadialBar, PieChart, Pie, Cell,
} from 'recharts';
 import { toggleResourceSale } from '../api.js';


const API = 'http://127.0.0.1:8000';

const COLORS = {
  primary: '#7c3aed',
  secondary: '#06b6d4',
  accent: '#f59e0b',
  success: '#10b981',
  danger: '#ef4444',
  text: '#e2e8f0',
  muted: '#94a3b8',
  card: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.08)',
};

const CHART_COLORS = ['#7c3aed', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n) {
  const num = parseFloat(n || 0);
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num.toFixed(2)}`;
}

function shortDate(d) {
  const date = new Date(d);
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      backdropFilter: 'blur(8px)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-20px', right: '-20px',
        fontSize: '80px', opacity: 0.06, lineHeight: 1,
      }}>{icon}</div>
      <p style={{ color: COLORS.muted, fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>{label}</p>
      <p style={{ color: color || COLORS.text, fontSize: '28px', fontWeight: 700, margin: 0 }}>{value}</p>
      {sub && <p style={{ color: COLORS.muted, fontSize: '12px', margin: 0 }}>{sub}</p>}
    </div>
  );
}

function SupplyBar({ resourceId, minted, max, title, royalty, primaryRevenue, royaltyRevenue, price, isSellingPaused, onToggleSale, isToggling }) {
  const pct = max > 0 ? Math.min((minted / max) * 100, 100) : 0;
  const isSoldOut = minted >= max;
  return (
    <div style={{
      background: COLORS.card,
      border: `1px solid ${COLORS.border}`,
      borderRadius: '12px',
      padding: '16px 20px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div>
          <p style={{ color: COLORS.text, fontWeight: 600, margin: '0 0 2px', fontSize: '14px' }}>{title}</p>
          <p style={{ color: COLORS.muted, fontSize: '12px', margin: 0 }}>
            {minted} / {max} minted · {royalty}% royalty · ₹{parseFloat(price).toFixed(0)} floor
          </p>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', gap: '8px', alignItems: 'center' }}>
          {onToggleSale && (
            <button
              disabled={isToggling}
              onClick={(e) => onToggleSale(e, resourceId)}
              style={{
                padding: '4px 12px',
                borderRadius: '20px',
                border: 'none',
                cursor: isToggling ? 'not-allowed' : 'pointer',
                fontSize: '11px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.2s ease',
                background: isSellingPaused ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                color: isSellingPaused ? '#ef4444' : '#10b981',
              }}
            >
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: isSellingPaused ? '#ef4444' : '#10b981'
              }} />
              {isToggling ? 'Updating…' : isSellingPaused ? 'Paused' : 'Active'}
            </button>
          )}
          {isSoldOut ? (
            <span style={{ background: '#fbbf24', color: '#000', fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '20px' }}>SOLD OUT</span>
          ) : (
            <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', fontSize: '11px', fontWeight: 600, padding: '2px 10px', borderRadius: '20px' }}>{max - minted} left</span>
          )}
        </div>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '99px', height: '6px', overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: isSoldOut
            ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
            : 'linear-gradient(90deg, #7c3aed, #06b6d4)',
          transition: 'width 0.8s ease',
          borderRadius: '99px',
        }} />
      </div>
      <div style={{ display: 'flex', gap: '24px', marginTop: '10px' }}>
        <span style={{ fontSize: '12px', color: COLORS.muted }}>Primary: <b style={{ color: '#10b981' }}>₹{parseFloat(primaryRevenue || 0).toFixed(0)}</b></span>
        <span style={{ fontSize: '12px', color: COLORS.muted }}>Royalties: <b style={{ color: '#7c3aed' }}>₹{parseFloat(royaltyRevenue || 0).toFixed(0)}</b></span>
      </div>
    </div>
  );
}

function SaleFeed({ sales }) {
  if (!sales || sales.length === 0) return (
    <p style={{ color: COLORS.muted, fontSize: '14px', textAlign: 'center', padding: '24px' }}>
      No sales yet. Once your tokens start selling, every transaction appears here.
    </p>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {sales.map(sale => (
        <div key={sale.id} style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '12px 16px',
          background: COLORS.card,
          border: `1px solid ${COLORS.border}`,
          borderRadius: '10px',
          fontSize: '13px',
        }}>
          <span style={{
            width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
            background: sale.sale_type === 'primary' ? '#10b981' : '#7c3aed',
          }} />
          <div style={{ flex: 1 }}>
            <span style={{ color: COLORS.text, fontWeight: 500 }}>
              Token #{sale.token_number} · {sale.resource_title}
            </span>
            <span style={{ color: COLORS.muted, marginLeft: '8px' }}>
              bought by <b style={{ color: COLORS.text }}>{sale.buyer_username}</b>
            </span>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p style={{ color: '#10b981', fontWeight: 600, margin: 0 }}>{fmt(sale.sale_price)}</p>
            {sale.sale_type === 'secondary' && (
              <p style={{ color: '#7c3aed', fontSize: '11px', margin: 0 }}>+{fmt(sale.royalty_amount)} royalty</p>
            )}
            <p style={{
              fontSize: '11px', color: COLORS.muted, margin: 0,
              background: sale.sale_type === 'primary' ? 'rgba(16,185,129,0.1)' : 'rgba(124,58,237,0.1)',
              color: sale.sale_type === 'primary' ? '#10b981' : '#a78bfa',
              padding: '1px 6px', borderRadius: '6px', marginTop: '2px',
            }}>
              {sale.sale_type === 'primary' ? 'Primary' : 'Resale'}
            </p>
          </div>
          <p style={{ color: COLORS.muted, fontSize: '11px', flexShrink: 0, margin: 0 }}>
            {shortDate(sale.sold_at)}
          </p>
        </div>
      ))}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1e1b4b', border: '1px solid rgba(124,58,237,0.4)',
      borderRadius: '10px', padding: '12px 16px', fontSize: '13px',
    }}>
      <p style={{ color: COLORS.muted, marginBottom: '6px' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, margin: '2px 0' }}>
          {p.name}: <b>₹{parseFloat(p.value || 0).toFixed(2)}</b>
        </p>
      ))}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

function NFTDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [togglingId, setTogglingId] = useState(null);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access');
      const res = await fetch(`${API}/api/resources/nft/dashboard/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load dashboard');
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggleSale = async (e, resourceId) => {
    e.stopPropagation();
    setTogglingId(resourceId);
    try {
      const res = await toggleResourceSale(resourceId);
      setData(prev => ({
        ...prev,
        resources_breakdown: prev.resources_breakdown.map(r =>
          r.resource_id === resourceId
            ? { ...r, is_selling_paused: res.is_selling_paused }
            : r
        )
      }));
    } catch (err) {
      alert(err.error || err.detail || 'Failed to toggle sale status');
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) return (
    <div style={styles.loadingWrap}>
      <div style={styles.spinner} />
      <p style={{ color: COLORS.muted, marginTop: '16px' }}>Loading your NFT analytics…</p>
    </div>
  );

  if (error) return (
    <div style={styles.loadingWrap}>
      <p style={{ color: COLORS.danger }}>{error}</p>
      <button onClick={load} style={styles.refreshBtn}>Retry</button>
    </div>
  );

  const {
    total_tokens_minted, total_primary_earnings, total_royalty_earned,
    total_combined_earnings, total_resources,
    resources_breakdown, sales_over_time, recent_sales, my_tokens,
  } = data;

  // Pie data: primary vs royalty earnings
  const earningsPie = [
    { name: 'Primary Sales', value: parseFloat(total_primary_earnings || 0) },
    { name: 'Royalties Earned', value: parseFloat(total_royalty_earned || 0) },
  ];

  const tabs = ['overview', 'analytics', 'collections', 'sales feed'];

  const total_potential_primary = resources_breakdown?.reduce(
    (sum, r) => sum + (parseFloat(r.price || 0) * (parseInt(r.max_supply) || 0)),
    0
  ) || 0;

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.headerBadge}>⬡ NFT Creator Dashboard</div>
          <h1 style={styles.title}>Token Analytics</h1>
          <p style={styles.subtitle}>Track every mint, resale, and royalty across your collections.</p>
        </div>
        <button onClick={() => navigate('/upload')} style={styles.uploadBtn}>
          + New Collection
        </button>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...styles.tab,
              ...(activeTab === tab ? styles.tabActive : {}),
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ────────────────────────────── */}
      {activeTab === 'overview' && (
        <div style={styles.section}>
          {/* Stat Cards */}
          <div style={styles.statsGrid}>
            <StatCard label="Tokens Minted" value={total_tokens_minted} icon="🪙"
              sub="across all collections" color="#06b6d4" />
            <StatCard label="Primary Earnings" value={fmt(total_primary_earnings)} icon="💎"
              sub={`Potential: ₹${fmt(total_potential_primary)}`} color="#10b981" />
            <StatCard label="Royalties Earned" value={fmt(total_royalty_earned)} icon="♾️"
              sub="from secondary resales" color="#7c3aed" />
            <StatCard label="Total Earnings" value={fmt(total_combined_earnings)} icon="🚀"
              sub={`${total_resources} active collection${total_resources !== 1 ? 's' : ''}`}
              color="#f59e0b" />
          </div>

          {/* Supply bars */}
          {resources_breakdown.length > 0 && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Collection Supply</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {resources_breakdown.map(r => (
                  <SupplyBar key={r.resource_id}
                    resourceId={r.resource_id}
                    title={r.title} minted={r.tokens_minted} max={r.max_supply}
                    royalty={r.royalty_percent} primaryRevenue={r.primary_revenue}
                    royaltyRevenue={r.royalty_revenue} price={r.price}
                    isSellingPaused={r.is_selling_paused}
                    onToggleSale={handleToggleSale}
                    isToggling={togglingId === r.resource_id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Earnings split pie + recent sales */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Earnings Breakdown</h3>
              {(parseFloat(total_combined_earnings) > 0) ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={earningsPie} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                      dataKey="value" paddingAngle={4} label={({ name, percent }) =>
                        `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {earningsPie.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={v => [`₹${parseFloat(v).toFixed(2)}`, '']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ color: COLORS.muted, fontSize: '13px', textAlign: 'center', paddingTop: '60px' }}>
                  No earnings yet — share your collections to get your first mint!
                </p>
              )}
            </div>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Recent Sales</h3>
              <SaleFeed sales={recent_sales?.slice(0, 5)} />
            </div>
          </div>
        </div>
      )}

      {/* ── ANALYTICS TAB ───────────────────────────── */}
      {activeTab === 'analytics' && (
        <div style={styles.section}>
          {/* Area chart: cumulative earnings */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Cumulative Earnings Over Time</h3>
            <p style={{ color: COLORS.muted, fontSize: '12px', marginBottom: '16px', marginTop: '-8px' }}>
              Shows running total of primary sales + royalties earned (last 90 days)
            </p>
            {sales_over_time.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={sales_over_time} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                  <defs>
                    <linearGradient id="gradPrimary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradRoyalty" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="date" tick={{ fill: COLORS.muted, fontSize: 11 }}
                    tickFormatter={shortDate} />
                  <YAxis tick={{ fill: COLORS.muted, fontSize: 11 }}
                    tickFormatter={v => `₹${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: COLORS.muted, fontSize: '13px' }} />
                  <Area type="monotone" dataKey="cumulative_primary" name="Primary Earnings"
                    stroke="#10b981" fill="url(#gradPrimary)" strokeWidth={2} />
                  <Area type="monotone" dataKey="cumulative_royalty" name="Royalties"
                    stroke="#7c3aed" fill="url(#gradRoyalty)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: COLORS.muted, textAlign: 'center', padding: '80px 0' }}>
                No sales data yet in the last 90 days.
              </p>
            )}
          </div>

          {/* Stacked bar: daily primary vs secondary sales count */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Daily Sales Activity</h3>
            <p style={{ color: COLORS.muted, fontSize: '12px', marginBottom: '16px', marginTop: '-8px' }}>
              Green = first-time mints · Purple = resales (royalty-earning)
            </p>
            {sales_over_time.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={sales_over_time} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="date" tick={{ fill: COLORS.muted, fontSize: 11 }}
                    tickFormatter={shortDate} />
                  <YAxis tick={{ fill: COLORS.muted, fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: COLORS.muted, fontSize: '13px' }} />
                  <Bar dataKey="primary_count" name="Primary Mints" fill="#10b981" radius={[3, 3, 0, 0]} stackId="a" />
                  <Bar dataKey="secondary_count" name="Resales" fill="#7c3aed" radius={[3, 3, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: COLORS.muted, textAlign: 'center', padding: '60px 0' }}>No activity yet.</p>
            )}
          </div>

          {/* Per-resource horizontal bar: royalty revenue */}
          {resources_breakdown.length > 0 && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Royalty Earned by Collection</h3>
              <p style={{ color: COLORS.muted, fontSize: '12px', marginBottom: '16px', marginTop: '-8px' }}>
                Only appears when your tokens are resold on the secondary market
              </p>
              <ResponsiveContainer width="100%" height={resources_breakdown.length * 55 + 40}>
                <BarChart
                  layout="vertical"
                  data={resources_breakdown.map(r => ({
                    name: r.title.length > 25 ? r.title.slice(0, 22) + '…' : r.title,
                    Royalty: parseFloat(r.royalty_revenue || 0),
                    Primary: parseFloat(r.primary_revenue || 0),
                  }))}
                  margin={{ top: 5, right: 30, bottom: 5, left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis type="number" tick={{ fill: COLORS.muted, fontSize: 11 }} tickFormatter={v => `₹${v}`} />
                  <YAxis type="category" dataKey="name" tick={{ fill: COLORS.text, fontSize: 12 }} width={130} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: COLORS.muted, fontSize: '13px' }} />
                  <Bar dataKey="Primary" fill="#10b981" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="Royalty" fill="#7c3aed" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* ── COLLECTIONS TAB ─────────────────────────── */}
      {activeTab === 'collections' && (
        <div style={styles.section}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Your Collections</h3>
            {resources_breakdown.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <p style={{ color: COLORS.muted }}>No collections yet.</p>
                <button onClick={() => navigate('/upload')} style={{ ...styles.uploadBtn, marginTop: '16px' }}>
                  Upload First Resource
                </button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {['Collection', 'Floor Price', 'Max Supply', 'Minted', 'Remaining', 'Royalty %', 'Primary Rev', 'Royalty Rev', 'Sales Status'].map(h => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resources_breakdown.map((r, i) => (
                      <tr key={r.resource_id} style={i % 2 === 0 ? styles.trEven : styles.trOdd}
                        onClick={() => navigate(`/resources/${r.resource_id}`)}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? styles.trEven.background : styles.trOdd.background}
                      >
                        <td style={styles.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {r.thumbnail && <img src={r.thumbnail} alt="" style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} />}
                            <span style={{ color: COLORS.text, fontWeight: 500 }}>{r.title}</span>
                          </div>
                        </td>
                        <td style={styles.td}>₹{parseFloat(r.price).toFixed(0)}</td>
                        <td style={styles.td}>{r.max_supply}</td>
                        <td style={styles.td}>
                          <span style={{ color: '#06b6d4', fontWeight: 600 }}>{r.tokens_minted}</span>
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            color: r.tokens_remaining === 0 ? '#fbbf24' : '#10b981',
                            fontWeight: 600,
                          }}>
                            {r.tokens_remaining === 0 ? '🔥 Sold Out' : r.tokens_remaining}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={{ color: '#7c3aed', fontWeight: 600 }}>{r.royalty_percent}%</span>
                        </td>
                        <td style={{ ...styles.td, color: '#10b981', fontWeight: 600 }}>
                          ₹{parseFloat(r.primary_revenue).toFixed(0)}
                        </td>
                        <td style={{ ...styles.td, color: '#a78bfa', fontWeight: 600 }}>
                          ₹{parseFloat(r.royalty_revenue).toFixed(0)}
                        </td>
                        <td style={styles.td} onClick={e => e.stopPropagation()}>
                          <button
                            disabled={togglingId === r.resource_id}
                            onClick={e => handleToggleSale(e, r.resource_id)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: '20px',
                              border: 'none',
                              cursor: togglingId === r.resource_id ? 'not-allowed' : 'pointer',
                              fontSize: '12px',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.2s ease',
                              background: r.is_selling_paused
                                ? 'rgba(239, 68, 68, 0.15)'
                                : 'rgba(16, 185, 129, 0.15)',
                              color: r.is_selling_paused ? '#ef4444' : '#10b981',
                            }}
                          >
                            <span style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: r.is_selling_paused ? '#ef4444' : '#10b981'
                            }} />
                            {togglingId === r.resource_id ? 'Updating…' : r.is_selling_paused ? 'Paused' : 'Active'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* My owned tokens */}
          {my_tokens && my_tokens.length > 0 && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Tokens You Own</h3>
              <p style={{ color: COLORS.muted, fontSize: '13px', marginBottom: '16px', marginTop: '-4px' }}>
                NFT tokens in your wallet — you can list these for resale.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                {my_tokens.map(t => (
                  <TokenCard key={t.id} token={t} onRefresh={load} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SALES FEED TAB ──────────────────────────── */}
      {activeTab === 'sales feed' && (
        <div style={styles.section}>
          <div style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ ...styles.cardTitle, margin: 0 }}>All Sales</h3>
              <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '3px 10px', borderRadius: '99px' }}>
                  ● Primary
                </span>
                <span style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa', padding: '3px 10px', borderRadius: '99px' }}>
                  ● Resale
                </span>
              </div>
            </div>
            <SaleFeed sales={recent_sales} />
          </div>
        </div>
      )}
    </div>
  );
}

function TokenCard({ token, onRefresh }) {
  const [listing, setListing] = useState(false);
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const listForResale = async () => {
    if (!price || isNaN(price) || parseFloat(price) <= 0) {
      setMsg('Enter a valid price');
      return;
    }
    setLoading(true);
    setMsg('');
    try {
      const tok = localStorage.getItem('access');
      const res = await fetch(`${API}/api/resources/nft/list-resale/${token.id}/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ resale_price: price }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg('Listed! ✓');
        setListing(false);
        onRefresh();
      } else {
        setMsg(data.error || 'Failed');
      }
    } catch {
      setMsg('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'rgba(124,58,237,0.08)',
      border: '1px solid rgba(124,58,237,0.25)',
      borderRadius: '12px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    }}>
      {token.resource_thumbnail && (
        <img src={token.resource_thumbnail} alt=""
          style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
      )}
      <p style={{ color: COLORS.text, fontWeight: 600, margin: 0, fontSize: '13px' }}>
        {token.resource_title}
      </p>
      <p style={{ color: '#a78bfa', fontWeight: 700, fontSize: '18px', margin: 0 }}>
        #{token.token_number} <span style={{ color: COLORS.muted, fontSize: '11px', fontWeight: 400 }}>of {token.max_supply}</span>
      </p>
      <p style={{ color: COLORS.muted, fontSize: '11px', margin: 0 }}>
        {token.royalty_percent}% royalty · minted {new Date(token.minted_at).toLocaleDateString('en-IN')}
      </p>
      {token.is_listed_for_resale ? (
        <span style={{ background: '#fbbf24', color: '#000', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '99px', textAlign: 'center' }}>
          Listed @ ₹{token.resale_price}
        </span>
      ) : (
        <>
          {!listing ? (
            <button onClick={() => setListing(true)} style={{
              background: 'transparent', border: '1px solid rgba(124,58,237,0.4)',
              color: '#a78bfa', borderRadius: '8px', padding: '6px', cursor: 'pointer',
              fontSize: '12px', fontWeight: 600,
            }}>
              List for Resale
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <input
                type="number" placeholder="Resale price ₹" value={price}
                onChange={e => setPrice(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  color: COLORS.text, borderRadius: '6px', padding: '6px 10px', fontSize: '12px',
                }}
              />
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={listForResale} disabled={loading} style={{
                  flex: 1, background: '#7c3aed', color: '#fff', border: 'none',
                  borderRadius: '6px', padding: '6px', cursor: 'pointer', fontSize: '12px',
                }}>
                  {loading ? '…' : 'Confirm'}
                </button>
                <button onClick={() => { setListing(false); setMsg(''); }} style={{
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                  color: COLORS.muted, borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '12px',
                }}>
                  ✕
                </button>
              </div>
              {msg && <p style={{ color: msg.includes('✓') ? '#10b981' : COLORS.danger, fontSize: '11px', margin: 0 }}>{msg}</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0118 0%, #0d0d1f 40%, #0a0118 100%)',
    padding: '32px 24px 60px',
    fontFamily: '"Inter", -apple-system, sans-serif',
    color: COLORS.text,
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
  },
  headerBadge: {
    display: 'inline-block',
    background: 'rgba(124,58,237,0.2)',
    border: '1px solid rgba(124,58,237,0.4)',
    color: '#a78bfa',
    fontSize: '12px',
    fontWeight: 600,
    padding: '4px 14px',
    borderRadius: '99px',
    marginBottom: '10px',
    letterSpacing: '0.5px',
  },
  title: {
    fontSize: '36px',
    fontWeight: 800,
    margin: '0 0 6px',
    background: 'linear-gradient(135deg, #fff 0%, #a78bfa 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: { color: COLORS.muted, margin: 0, fontSize: '14px' },
  uploadBtn: {
    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '10px 20px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px',
    boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  tabs: {
    display: 'flex',
    gap: '4px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    marginBottom: '28px',
  },
  tab: {
    background: 'transparent',
    border: 'none',
    color: COLORS.muted,
    padding: '10px 18px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    borderBottom: '2px solid transparent',
    marginBottom: '-1px',
    transition: 'all 0.2s',
  },
  tabActive: {
    color: '#a78bfa',
    borderBottomColor: '#7c3aed',
  },
  section: { display: 'flex', flexDirection: 'column', gap: '20px' },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  },
  card: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px',
    padding: '24px',
    backdropFilter: 'blur(8px)',
  },
  cardTitle: {
    color: COLORS.text,
    fontWeight: 700,
    fontSize: '16px',
    margin: '0 0 20px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  },
  th: {
    color: COLORS.muted,
    fontWeight: 600,
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '10px 12px',
    textAlign: 'left',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
  },
  td: {
    color: COLORS.muted,
    padding: '12px 12px',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    cursor: 'pointer',
  },
  trEven: { background: 'transparent' },
  trOdd: { background: 'rgba(255,255,255,0.02)' },
  loadingWrap: {
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0a0118, #0d0d1f)',
    fontFamily: '"Inter", sans-serif',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(124,58,237,0.2)',
    borderTop: '3px solid #7c3aed',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  refreshBtn: {
    marginTop: '12px',
    background: '#7c3aed',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 20px',
    cursor: 'pointer',
    fontSize: '14px',
  },
};

export default NFTDashboardPage;
