import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '../api.js';

function DashboardPage() {
    const [profile, setProfile] = useState(null);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notCreator, setNotCreator] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        async function loadDashboard() {
            try {
                const profileData = await getProfile();
                setProfile(profileData);

                if (profileData.status !== 'creator') {
                    setNotCreator(true);
                    setLoading(false);
                    return;
                }

                const token = localStorage.getItem('access');
                const res = await fetch('http://127.0.0.1:8000/api/resources/?owner=me', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (Array.isArray(data)) setResources(data);

            } catch (err) {
                console.log('Dashboard error:', err);
            } finally {
                setLoading(false);
            }
        }
        loadDashboard();
    }, []);

    if (loading) return <p style={{ padding: '24px' }}>Loading dashboard...</p>;

    if (notCreator) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <h2>Creator Dashboard</h2>
                <p style={{ color: '#6b7280', marginTop: '16px' }}>
                    You need to upload a resource to become a Creator and unlock this dashboard.
                </p>
                <button
                    onClick={() => navigate('/upload')}
                    style={{ marginTop: '24px', padding: '12px 28px', background: '#1a56db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px' }}
                >
                    Upload Your First Resource
                </button>
            </div>
        );
    }

    const totalRevenuePotential = resources.reduce((sum, r) => sum + parseFloat(r.price), 0);

    return (
        <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
            <h2>Creator Dashboard</h2>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>Welcome back, {profile?.username}.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                <div style={{ padding: '20px', background: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                    <p style={{ color: '#1e40af', fontSize: '13px', margin: '0 0 8px', fontWeight: '500' }}>Total Resources</p>
                    <p style={{ fontSize: '32px', fontWeight: '600', margin: 0, color: '#1e3a8a' }}>{resources.length}</p>
                </div>
                <div style={{ padding: '20px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                    <p style={{ color: '#166534', fontSize: '13px', margin: '0 0 8px', fontWeight: '500' }}>Status</p>
                    <p style={{ fontSize: '20px', fontWeight: '600', margin: 0, color: '#14532d', textTransform: 'capitalize' }}>{profile?.status}</p>
                </div>
                <div style={{ padding: '20px', background: '#fefce8', borderRadius: '10px', border: '1px solid #fef08a' }}>
                    <p style={{ color: '#854d0e', fontSize: '13px', margin: '0 0 8px', fontWeight: '500' }}>Potential Revenue</p>
                    <p style={{ fontSize: '28px', fontWeight: '600', margin: 0, color: '#713f12' }}>₹{totalRevenuePotential.toFixed(2)}</p>
                </div>
                <div
                    onClick={() => navigate('/nft-dashboard')}
                    style={{ padding: '20px', background: 'linear-gradient(135deg, #fdf4ff, #ede9fe)', borderRadius: '10px', border: '1px solid #c4b5fd', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,58,237,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                >
                    <p style={{ color: '#7c3aed', fontSize: '13px', margin: '0 0 8px', fontWeight: '600' }}>⬡ NFT Dashboard</p>
                    <p style={{ fontSize: '14px', fontWeight: '600', margin: 0, color: '#581c87' }}>View Analytics →</p>
                </div>
            </div>

            <h3 style={{ marginBottom: '16px' }}>Your Resources</h3>

            {resources.length === 0 ? (
                <p style={{ color: '#6b7280' }}>You haven't uploaded any resources yet.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {resources.map(resource => (
                        <div
                            key={resource.id}
                            style={{ display: 'flex', gap: '16px', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '10px', alignItems: 'center', background: 'white' }}
                        >
                            <img
                                src={resource.thumbnail}
                                alt={resource.title}
                                style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px' }}
                                onError={e => e.target.style.display = 'none'}
                            />
                            <div style={{ flex: 1 }}>
                                <h4 style={{ margin: '0 0 4px' }}>{resource.title}</h4>
                                <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>{resource.category_name}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontWeight: 'bold', margin: '0 0 4px' }}>₹{resource.price}</p>
                                <span style={{
                                    fontSize: '12px',
                                    padding: '2px 8px',
                                    borderRadius: '20px',
                                    background: resource.status === 'listed' ? '#dcfce7' : '#fee2e2',
                                    color: resource.status === 'listed' ? '#166534' : '#991b1b'
                                }}>
                                    {resource.status}
                                </span>
                            </div>
                            <button
                                onClick={() => navigate(`/resources/${resource.id}`)}
                                style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
                            >
                                View
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default DashboardPage;