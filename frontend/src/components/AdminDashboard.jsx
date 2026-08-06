import { useState, useEffect } from 'react';
import { getAdminStats, adminGetAllPayouts, adminUpdatePayout, adminGetAllReports, adminUpdateReport } from '../api.js';

function statusBadge(status) {
  const map = {
    requested: { bg: '#fef3c7', color: '#92400e' },
    processing: { bg: '#dbeafe', color: '#1e40af' },
    paid: { bg: '#dcfce7', color: '#15803d' },
    rejected: { bg: '#fee2e2', color: '#b91c1c' },
    open: { bg: '#fee2e2', color: '#b91c1c' },
    reviewed: { bg: '#dbeafe', color: '#1e40af' },
    dismissed: { bg: '#f3f4f6', color: '#6b7280' },
  };
  return map[status] || { bg: '#f3f4f6', color: '#374151' };
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

  if (loading) return <p style={{ padding: '24px' }}>Loading admin dashboard...</p>;

  const statGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '32px' };
  const statCard = { background: '#f9fafb', borderRadius: '10px', padding: '16px' };
  const table = { width: '100%', borderCollapse: 'collapse', fontSize: '13px' };
  const th = { textAlign: 'left', padding: '8px 4px', color: '#6b7280', borderBottom: '2px solid #e5e7eb' };
  const td = { padding: '8px 4px', borderBottom: '1px solid #f0f0f0' };

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Admin Dashboard</h1>

      <div style={statGrid}>
        <div style={statCard}><p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 4px' }}>Total Users</p><p style={{ fontSize: '22px', fontWeight: 600, margin: 0 }}>{stats?.total_users}</p></div>
        <div style={statCard}><p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 4px' }}>Creators</p><p style={{ fontSize: '22px', fontWeight: 600, margin: 0 }}>{stats?.total_creators}</p></div>
        <div style={statCard}><p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 4px' }}>Resources</p><p style={{ fontSize: '22px', fontWeight: 600, margin: 0 }}>{stats?.total_resources}</p></div>
        <div style={statCard}><p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 4px' }}>Revenue</p><p style={{ fontSize: '22px', fontWeight: 600, margin: 0 }}>₹{stats?.total_revenue}</p></div>
        <div style={statCard}><p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 4px' }}>Tokens Minted</p><p style={{ fontSize: '22px', fontWeight: 600, margin: 0 }}>{stats?.total_tokens_minted}</p></div>
        <div style={{ ...statCard, background: stats?.pending_payouts > 0 ? '#fef3c7' : '#f9fafb' }}><p style={{ fontSize: '13px', color: '#92400e', margin: '0 0 4px' }}>Pending Payouts</p><p style={{ fontSize: '22px', fontWeight: 600, margin: 0, color: '#92400e' }}>{stats?.pending_payouts}</p></div>
        <div style={{ ...statCard, background: stats?.open_reports > 0 ? '#fee2e2' : '#f9fafb' }}><p style={{ fontSize: '13px', color: '#b91c1c', margin: '0 0 4px' }}>Open Reports</p><p style={{ fontSize: '22px', fontWeight: 600, margin: 0, color: '#b91c1c' }}>{stats?.open_reports}</p></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div>
          <h2 style={{ fontSize: '18px' }}>Payout Requests</h2>
          <table style={table}>
            <thead><tr><th style={th}>Creator</th><th style={th}>Amount</th><th style={th}>Status</th><th style={th}></th></tr></thead>
            <tbody>
              {payouts.map(p => {
                const b = statusBadge(p.status);
                return (
                  <tr key={p.id}>
                    <td style={td}>{p.creator_username}</td>
                    <td style={td}>₹{p.amount}</td>
                    <td style={td}><span style={{ background: b.bg, color: b.color, padding: '2px 8px', borderRadius: '6px', fontSize: '12px' }}>{p.status}</span></td>
                    <td style={td}>
                      {p.status === 'requested' && (
                        <>
                          <button onClick={() => handlePayout(p.id, 'paid')} style={{ marginRight: '4px', fontSize: '12px', background: '#dcfce7', color: '#15803d', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>Mark Paid</button>
                          <button onClick={() => handlePayout(p.id, 'rejected')} style={{ fontSize: '12px', background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>Reject</button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div>
          <h2 style={{ fontSize: '18px' }}>Reports</h2>
          {reports.map(r => {
            const b = statusBadge(r.status);
            return (
              <div key={r.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px 14px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ margin: '0 0 4px', fontWeight: 500, fontSize: '13px' }}>
                    {r.target_type === 'resource' ? `Resource: ${r.resource_title}` : `User: ${r.reported_username}`}
                  </p>
                  <span style={{ background: b.bg, color: b.color, padding: '2px 8px', borderRadius: '6px', fontSize: '12px' }}>{r.status}</span>
                </div>
                <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#6b7280' }}>{r.reason}</p>
                {r.status === 'open' && (
                  <>
                    <button onClick={() => handleReport(r.id, 'reviewed')} style={{ marginRight: '4px', fontSize: '12px', background: '#dbeafe', color: '#1e40af', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>Mark Reviewed</button>
                    <button onClick={() => handleReport(r.id, 'dismissed')} style={{ fontSize: '12px', background: '#f3f4f6', color: '#6b7280', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>Dismiss</button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;