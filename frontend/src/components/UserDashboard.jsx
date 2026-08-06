import { useState, useEffect } from 'react';
import { getUserStats } from '../api.js';

function UserDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserStats().then(setStats).catch(err => console.log(err)).finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ padding: '24px' }}>Loading...</p>;

  const cardStyle = { background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px', flex: 1 };

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <h1>My Dashboard</h1>
      <p style={{ color: '#6b7280', marginBottom: '20px' }}>
        For your collection and wishlist, see Library and Wishlist in the nav.
      </p>
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={cardStyle}>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 4px' }}>Items Owned</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{stats?.items_owned ?? 0}</p>
        </div>
        <div style={cardStyle}>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 4px' }}>Total Spent</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>₹{stats?.total_spent ?? 0}</p>
        </div>
        <div style={cardStyle}>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 4px' }}>Wishlist</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{stats?.wishlist_count ?? 0}</p>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;