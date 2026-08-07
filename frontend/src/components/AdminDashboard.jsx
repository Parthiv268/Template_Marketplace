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
import { useNavigate } from 'react-router-dom';
import { getAdminStats, adminGetAllPayouts, adminUpdatePayout, adminGetAllReports, adminUpdateReport, adminDeleteReport, adminDeleteResource, getMediaUrl } from '../api.js';

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
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [reports, setReports] = useState([]);
  const [allResources, setAllResources] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      const [s, p, r, resFetch] = await Promise.all([
        getAdminStats(),
        adminGetAllPayouts(),
        adminGetAllReports(),
        fetch('http://127.0.0.1:8000/api/resources/').then(res => res.json()).catch(() => []),
      ]);
      setStats(s);
      setPayouts(p);
      setReports(r);
      setAllResources(Array.isArray(resFetch) ? resFetch : []);
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

  async function handleDeleteReport(reportId) {
    if (!window.confirm('Are you sure you want to permanently remove this complaint panel from the dashboard?')) {
      return;
    }
    try {
      await adminDeleteReport(reportId);
      if (selectedReport?.id === reportId) {
        setSelectedReport(null);
      }
      loadAll();
    } catch (err) {
      alert(err?.error || err?.detail || 'Failed to remove complaint panel.');
    }
  }

  async function handleDeleteResource(resourceId, resourceTitle, reportId = null) {
    if (!window.confirm(`Are you sure you want to delete "${resourceTitle || 'this resource'}" from the marketplace? This action cannot be undone.`)) {
      return;
    }
    try {
      await adminDeleteResource(resourceId);
      if (reportId) {
        await adminUpdateReport(reportId, 'reviewed');
      }
      alert(`Resource "${resourceTitle || resourceId}" deleted successfully.`);
      loadAll();
    } catch (err) {
      alert(err?.error || err?.detail || 'Failed to delete resource.');
    }
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

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{
              fontSize: '28px', fontWeight: 800,
              color: 'var(--text-primary)', margin: 0,
              letterSpacing: '-0.02em',
            }}>Admin Control Center</h1>
            <span style={{
              background: 'rgba(239,68,68,0.12)', color: '#fca5a5',
              border: '1px solid rgba(239,68,68,0.25)',
              fontSize: '11px', fontWeight: 700, padding: '3px 10px',
              borderRadius: '99px', letterSpacing: '0.5px',
            }}>⚙ STAFF</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '9px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font)',
              background: activeTab === 'overview' ? '#ffffff' : 'var(--bg-surface)',
              color: activeTab === 'overview' ? '#000000' : 'var(--text-secondary)',
              boxShadow: activeTab === 'overview' ? '0 2px 8px rgba(255,255,255,0.15)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >📊 Overview & Payouts</button>

          <button
            onClick={() => setActiveTab('resources')}
            style={{
              padding: '9px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font)',
              background: activeTab === 'resources' ? '#ef4444' : 'var(--bg-surface)',
              color: activeTab === 'resources' ? '#ffffff' : 'var(--text-secondary)',
              boxShadow: activeTab === 'resources' ? '0 2px 8px rgba(239,68,68,0.3)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >📦 Resource Moderation ({allResources.length})</button>

          <button
            onClick={() => setActiveTab('reports')}
            style={{
              padding: '9px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font)',
              background: activeTab === 'reports' ? '#3b82f6' : 'var(--bg-surface)',
              color: activeTab === 'reports' ? '#ffffff' : 'var(--text-secondary)',
              boxShadow: activeTab === 'reports' ? '0 2px 8px rgba(59,130,246,0.3)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >🚩 Complaint Reports ({reports.filter(r => r.status === 'open').length})</button>
        </div>

        {/* ── OVERVIEW & PAYOUTS TAB ── */}
        {activeTab === 'overview' && (
          <div>
            {/* Stat Card Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '14px', marginBottom: '40px',
        }}>
          <StatCard label="Total Users" value={stats?.total_users ?? 0} sub={`${stats?.total_creators ?? 0} active creators`} />
          <StatCard label="Resources" value={stats?.total_resources ?? 0} sub={`${stats?.total_tokens_minted ?? 0} tokens minted`} />
          <StatCard
            label="Total Transactions"
            value={stats?.total_sales_count ?? 0}
            color="#06b6d4"
            sub={`${stats?.primary_sales_count ?? 0} Primary · ${stats?.secondary_sales_count ?? 0} Resale`}
          />
          <StatCard
            label="Service Revenue (5%)"
            value={`₹${parseFloat(stats?.website_service_charge ?? stats?.total_revenue ?? 0).toFixed(2)}`}
            color="#10b981"
            sub={`Volume: ₹${parseFloat(stats?.total_transaction_volume ?? 0).toLocaleString('en-IN')}`}
          />
          <StatCard
            label="Settled Payouts"
            value={`₹${parseFloat(stats?.total_paid_out || 0).toLocaleString('en-IN')}`}
            color="#f59e0b"
            sub="Auto-disbursed creator withdrawals"
          />
          <StatCard
            label="Open Reports"
            value={stats?.open_reports}
            color={stats?.open_reports > 0 ? '#f87171' : 'var(--text-primary)'}
            alert={stats?.open_reports > 0}
            alertColor="red"
          />
        </div>

        {/* ── Two-column layout for Payout Log + Reports ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>

          {/* ── Payout Audit Log ─────────────────────────────── */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ color: 'var(--text-primary)', fontSize: '17px', fontWeight: 700, margin: 0 }}>
                Payout Audit Log
              </h2>
              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Auto-Approved Settlements</span>
            </div>
            {payouts.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No payouts processed yet.</p>
            ) : (
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px', overflow: 'hidden',
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      {['Creator','Amount','Notes / UPI','Status'].map(h => (
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
                      return (
                        <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '10px 14px', color: 'var(--text-primary)', fontWeight: 500 }}>
                            {p.creator_username}
                          </td>
                          <td style={{ padding: '10px 14px', color: 'var(--text-primary)', fontWeight: 600 }}>
                            ₹{p.amount}
                          </td>
                          <td style={{ padding: '10px 14px', color: 'var(--text-muted)', fontSize: '12px' }}>
                            {p.notes || '—'}
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            <span style={{
                              background: 'rgba(34,197,94,0.12)', color: '#22c55e',
                              padding: '2px 8px', borderRadius: '99px',
                              fontSize: '11px', fontWeight: 600,
                            }}>✓ Auto-Paid</span>
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
                  const targetLabel = r.target_type === 'resource'
                    ? (r.resource_title ? `Resource: ${r.resource_title}` : r.reason?.match(/^\[Target:\s*([^\]]+)\]/)?.[1] ? `Resource: ${r.reason.match(/^\[Target:\s*([^\]]+)\]/)[1]}` : 'Resource: General Issue')
                    : (r.reported_username ? `User: @${r.reported_username}` : r.reason?.match(/^\[Target:\s*([^\]]+)\]/)?.[1] ? `User: @${r.reason.match(/^\[Target:\s*([^\]]+)\]/)[1]}` : 'User: General Issue');

                  return (
                    /* CHANGES TO FRONTEND — AdminDashboard: report card with dark surface */
                    <div key={r.id} style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '10px', padding: '14px 16px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                          {targetLabel}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            background: b.bg, color: b.color,
                            padding: '2px 8px', borderRadius: '99px',
                            fontSize: '11px', fontWeight: 600, flexShrink: 0,
                          }}>{r.status}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteReport(r.id);
                            }}
                            title="Remove complaint panel completely"
                            style={{
                              background: 'rgba(239,68,68,0.12)',
                              color: '#f87171',
                              border: '1px solid rgba(239,68,68,0.3)',
                              borderRadius: '50%',
                              width: '22px', height: '22px',
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', fontSize: '12px', fontWeight: 700,
                              transition: 'all 0.15s ease', padding: 0,
                            }}
                          >✕</button>
                        </div>
                      </div>
                      <p style={{ margin: '0 0 10px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        {r.reason.length > 90 ? `${r.reason.slice(0, 90)}…` : r.reason}
                      </p>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <ActionBtn
                          id={`report-open-${r.id}`}
                          label="📂 Open Complaint"
                          color="blue"
                          onClick={() => setSelectedReport(r)}
                        />
                        {r.status === 'open' && (
                          <>
                            {r.target_type === 'resource' && r.resource && (
                              <ActionBtn
                                id={`report-delete-res-${r.id}`}
                                label="🗑️ Delete Resource"
                                color="red"
                                onClick={() => handleDeleteResource(r.resource, r.resource_title, r.id)}
                              />
                            )}
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
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        </div>
      )}

      {/* ── RESOURCE MODERATION TAB (Dedicated Delete Resource Page) ── */}
      {activeTab === 'resources' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: 700, margin: '0 0 4px' }}>
                📦 Resource Directory & Delete Moderation
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
                View all active marketplace resources and delete any violating asset from the platform.
              </p>
            </div>
            <input
              type="text"
              placeholder="Search title, owner, category..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                padding: '9px 14px', borderRadius: '8px',
                background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
                color: 'var(--text-primary)', fontSize: '13px', outline: 'none', width: '260px',
              }}
            />
          </div>

          {allResources.filter(r =>
            !searchQuery ||
            r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.owner_username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.category_name?.toLowerCase().includes(searchQuery.toLowerCase())
          ).length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0', fontSize: '14px' }}>
              No matching resources found.
            </p>
          ) : (
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px', overflow: 'hidden',
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    {['Resource ID & Title', 'Category', 'Creator / Owner', 'Price & Supply', 'Action'].map(h => (
                      <th key={h} style={{
                        padding: '12px 16px', textAlign: 'left',
                        color: 'var(--text-muted)', fontSize: '11px',
                        fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allResources.filter(r =>
                    !searchQuery ||
                    r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    r.owner_username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    r.category_name?.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {r.thumbnail && (
                            <img src={getMediaUrl(r.thumbnail)} alt="" style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} />
                          )}
                          <div>
                            <a href={`/resources/${r.id}`} target="_blank" rel="noreferrer" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600 }}>
                              {r.title}
                            </a>
                            <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px' }}>ID #{r.id}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{r.category_name || 'General'}</td>
                      <td style={{ padding: '12px 16px', color: '#60a5fa', fontWeight: 500 }}>@{r.owner_username}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontWeight: 600 }}>
                        ₹{parseFloat(r.price).toLocaleString('en-IN')}
                        <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 400 }}>
                          {r.tokens_minted ?? 0} / {r.max_supply} minted
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={() => handleDeleteResource(r.id, r.title)}
                          style={{
                            padding: '7px 14px', background: '#ef4444', color: '#ffffff',
                            border: 'none', borderRadius: '6px', cursor: 'pointer',
                            fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font)',
                            boxShadow: '0 2px 8px rgba(239,68,68,0.3)',
                          }}
                        >🗑️ Delete Resource</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── COMPLAINT REPORTS TAB ── */}
      {activeTab === 'reports' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: 700, margin: '0 0 4px' }}>
                🚩 User Complaint Reports ({reports.length})
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
                Review and resolve user complaints filed against marketplace resources and creators.
              </p>
            </div>
          </div>

          {reports.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0', fontSize: '14px' }}>
              No complaint reports logged yet.
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {reports.map(r => {
                const b = statusBadge(r.status);
                const targetLabel = r.target_type === 'resource'
                  ? (r.resource_title ? `Resource: ${r.resource_title}` : r.reason?.match(/^\[Target:\s*([^\]]+)\]/)?.[1] ? `Resource: ${r.reason.match(/^\[Target:\s*([^\]]+)\]/)[1]}` : 'Resource: General Issue')
                  : (r.reported_username ? `User: @${r.reported_username}` : r.reason?.match(/^\[Target:\s*([^\]]+)\]/)?.[1] ? `User: @${r.reason.match(/^\[Target:\s*([^\]]+)\]/)[1]}` : 'User: General Issue');

                return (
                  <div key={r.id} style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px', padding: '18px',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>REPORT #{r.id}</span>
                          <h4 style={{ margin: '2px 0 0', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                            {targetLabel}
                          </h4>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            background: b.bg, color: b.color,
                            padding: '3px 9px', borderRadius: '99px',
                            fontSize: '11px', fontWeight: 700,
                          }}>{r.status.toUpperCase()}</span>
                          <button
                            onClick={() => handleDeleteReport(r.id)}
                            title="Remove complaint panel completely"
                            style={{
                              background: 'rgba(239,68,68,0.12)', color: '#f87171',
                              border: '1px solid rgba(239,68,68,0.3)', borderRadius: '50%',
                              width: '22px', height: '22px', display: 'inline-flex',
                              alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                              fontSize: '12px', fontWeight: 700, padding: 0,
                            }}
                          >✕</button>
                        </div>
                      </div>
                      <p style={{ margin: '0 0 14px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {r.reason}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                      <ActionBtn
                        id={`report-tab-open-${r.id}`}
                        label="📂 Open Complaint"
                        color="blue"
                        onClick={() => setSelectedReport(r)}
                      />
                      {r.target_type === 'resource' && r.resource && (
                        <ActionBtn
                          id={`report-tab-del-${r.id}`}
                          label="🗑️ Delete Resource"
                          color="red"
                          onClick={() => handleDeleteResource(r.resource, r.resource_title, r.id)}
                        />
                      )}
                      {r.status === 'open' && (
                        <>
                          <ActionBtn
                            id={`report-tab-rev-${r.id}`}
                            label="Mark Reviewed"
                            color="blue"
                            onClick={() => handleReport(r.id, 'reviewed')}
                          />
                          <ActionBtn
                            id={`report-tab-dsm-${r.id}`}
                            label="Dismiss"
                            color="grey"
                            onClick={() => handleReport(r.id, 'dismissed')}
                          />
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      </div>

      {/* ── Full Complaint Details Modal ────────────────────── */}
      {selectedReport && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px',
        }}>
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
            borderRadius: '16px', padding: '28px', maxWidth: '520px', width: '100%',
            boxShadow: 'var(--shadow-lg)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  COMPLAINT REPORT #{selectedReport.id}
                </span>
                <h3 style={{ color: 'var(--text-primary)', margin: '4px 0 0', fontSize: '18px', fontWeight: 700 }}>
                  {selectedReport.target_type === 'resource'
                    ? (selectedReport.resource_title ? `Resource: ${selectedReport.resource_title}` : selectedReport.reason?.match(/^\[Target:\s*([^\]]+)\]/)?.[1] ? `Resource: ${selectedReport.reason.match(/^\[Target:\s*([^\]]+)\]/)[1]}` : 'Resource: General Issue')
                    : (selectedReport.reported_username ? `User: @${selectedReport.reported_username}` : selectedReport.reason?.match(/^\[Target:\s*([^\]]+)\]/)?.[1] ? `User: @${selectedReport.reason.match(/^\[Target:\s*([^\]]+)\]/)[1]}` : 'User: General Issue')}
                </h3>
              </div>
              <span style={{
                background: statusBadge(selectedReport.status).bg,
                color: statusBadge(selectedReport.status).color,
                padding: '4px 12px', borderRadius: '99px',
                fontSize: '12px', fontWeight: 700,
              }}>
                {selectedReport.status.toUpperCase()}
              </span>
            </div>

            <div style={{ background: 'var(--bg-elevated)', borderRadius: '10px', padding: '14px', marginBottom: '16px', border: '1px solid var(--border-subtle)' }}>
              <p style={{ margin: '0 0 6px', color: 'var(--text-muted)', fontSize: '12px' }}>
                Reporter: <b style={{ color: 'var(--text-primary)' }}>{selectedReport.reporter_username || 'Anonymous'}</b> · {new Date(selectedReport.created_at).toLocaleString('en-IN')}
              </p>
              {selectedReport.reported_username && (
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '12px' }}>
                  Reported User: <b style={{ color: '#f87171' }}>@{selectedReport.reported_username}</b>
                </p>
              )}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                Full Complaint Message / Details:
              </label>
              <div style={{
                background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: '10px', padding: '16px', color: 'var(--text-primary)',
                fontSize: '13px', lineHeight: 1.6, whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto',
              }}>
                {selectedReport.reason}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              {selectedReport.target_type === 'resource' && selectedReport.resource && (
                <button
                  onClick={async () => {
                    await handleDeleteResource(selectedReport.resource, selectedReport.resource_title, selectedReport.id);
                    setSelectedReport(null);
                  }}
                  style={{
                    padding: '8px 16px', background: '#ef4444', color: '#ffffff',
                    border: 'none', borderRadius: '8px', cursor: 'pointer',
                    fontSize: '13px', fontWeight: 700,
                  }}
                >🗑️ Delete Resource</button>
              )}
              {selectedReport.status === 'open' && (
                <>
                  <button
                    onClick={async () => {
                      await handleReport(selectedReport.id, 'reviewed');
                      setSelectedReport(null);
                    }}
                    style={{
                      padding: '8px 16px', background: 'rgba(59,130,246,0.15)', color: '#60a5fa',
                      border: '1px solid rgba(59,130,246,0.3)', borderRadius: '8px', cursor: 'pointer',
                      fontSize: '13px', fontWeight: 600,
                    }}
                  >✓ Mark Reviewed</button>
                  <button
                    onClick={async () => {
                      await handleReport(selectedReport.id, 'dismissed');
                      setSelectedReport(null);
                    }}
                    style={{
                      padding: '8px 16px', background: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)',
                      border: '1px solid var(--border-default)', borderRadius: '8px', cursor: 'pointer',
                      fontSize: '13px', fontWeight: 500,
                    }}
                  >Dismiss</button>
                </>
              )}
              <button
                onClick={() => handleDeleteReport(selectedReport.id)}
                style={{
                  padding: '8px 16px', background: 'rgba(239,68,68,0.15)', color: '#f87171',
                  border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', cursor: 'pointer',
                  fontSize: '13px', fontWeight: 600,
                }}
              >🗑️ Remove Panel</button>
              <button
                onClick={() => setSelectedReport(null)}
                style={{
                  padding: '8px 16px', background: 'transparent', color: 'var(--text-muted)',
                  border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500,
                }}
              >Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* CHANGES TO FRONTEND — AdminDashboard: stat card with dark surface + optional alert border */
function StatCard({ label, value, sub, color, alert, alertColor }) {
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
      <p style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px' }}>
        {label}
      </p>
      <p style={{ color: color || 'var(--text-primary)', fontSize: '24px', fontWeight: 700, margin: '0 0 4px' }}>
        {value ?? '—'}
      </p>
      {sub && <p style={{ color: 'var(--text-muted)', fontSize: '11px', margin: 0 }}>{sub}</p>}
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