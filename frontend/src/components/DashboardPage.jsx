/* ============================================================
   CHANGES TO FRONTEND — DashboardPage
   - Dark background and stat cards updated to black/white palette
   - Stat cards use dark surfaces with white text values
   - NFT card is now clickable and glows on hover
   - Resource rows use dark surface, white titles
   - Status badge colours adapted (green/red on dark)
   - View button uses ghost style consistent with design system
   - Empty state updated to dark theme
   ============================================================ */

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

    /* CHANGES TO FRONTEND — DashboardPage: dark loading state */
    if (loading) return (
        <div className="page-loading">
            <div className="spinner" />
            <span>Loading dashboard…</span>
        </div>
    );

    /* CHANGES TO FRONTEND — DashboardPage: not-creator dark state */
    if (notCreator) {
        return (
            <div style={{
                minHeight: '100vh', background: 'var(--bg-page)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font)', textAlign: 'center', padding: '40px',
            }}>
                <div style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '20px', padding: '48px 40px',
                    maxWidth: '420px', width: '100%',
                }}>
                    <div style={{ fontSize: '40px', marginBottom: '16px' }}>📊</div>
                    <h2 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '22px', margin: '0 0 12px' }}>
                        Creator Dashboard
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, margin: '0 0 28px' }}>
                        Upload your first resource to become a Creator and unlock analytics, NFT tracking, and revenue insights.
                    </p>
                    <button
                        id="dashboard-upload-btn"
                        onClick={() => navigate('/upload')}
                        onMouseEnter={e => { e.currentTarget.style.background = '#e4e4e7'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        style={{
                            padding: '11px 28px', background: '#ffffff', color: '#000000',
                            border: 'none', borderRadius: '10px', cursor: 'pointer',
                            fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font)',
                            transition: 'all 0.15s ease',
                        }}
                    >
                        Upload Your First Resource
                    </button>
                </div>
            </div>
        );
    }

    const totalRevenuePotential = resources.reduce((sum, r) => sum + parseFloat(r.price), 0);

    /* CHANGES TO FRONTEND — DashboardPage: stat card component */
    const StatCard = ({ label, value, color, onClick, hint }) => {
        const [hov, setHov] = useState(false);
        return (
            <div
                onMouseEnter={() => setHov(true)}
                onMouseLeave={() => setHov(false)}
                onClick={onClick}
                style={{
                    padding: '22px 20px',
                    background: hov ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                    border: `1px solid ${hov ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: '14px',
                    cursor: onClick ? 'pointer' : 'default',
                    transition: 'all 0.2s ease',
                    boxShadow: hov ? '0 4px 20px rgba(0,0,0,0.4)' : 'none',
                    transform: hov && onClick ? 'translateY(-2px)' : 'translateY(0)',
                }}
            >
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', margin: '0 0 8px' }}>{label}</p>
                <p style={{ color: color || 'var(--text-primary)', fontSize: '26px', fontWeight: 700, margin: 0 }}>{value}</p>
                {hint && <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '6px 0 0' }}>{hint}</p>}
            </div>
        );
    };

    return (
        /* CHANGES TO FRONTEND — DashboardPage: dark page wrapper */
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-page)',
            padding: '40px 32px',
            fontFamily: 'var(--font)',
        }}>
            <div style={{ maxWidth: '960px', margin: '0 auto' }}>

                {/* CHANGES TO FRONTEND — DashboardPage: header */}
                <h1 style={{
                    fontSize: '28px', fontWeight: 800,
                    color: 'var(--text-primary)', margin: '0 0 4px',
                    letterSpacing: '-0.02em',
                }}>Creator Dashboard</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>
                    Welcome back, <b style={{ color: 'var(--text-primary)' }}>{profile?.username}</b>
                </p>

                {/* CHANGES TO FRONTEND — DashboardPage: stat cards grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px', marginBottom: '36px',
                }}>
                    <StatCard label="Total Resources" value={resources.length} color="#ffffff" />
                    <StatCard label="Status" value={profile?.status} color="var(--green)" />
                    <StatCard label="Potential Revenue" value={`₹${totalRevenuePotential.toFixed(0)}`} color="#f59e0b" />
                    {/* CHANGES TO FRONTEND — DashboardPage: NFT card now links to NFT dashboard */}
                    <StatCard
                        label="⬡ NFT Dashboard"
                        value="View Analytics →"
                        color="var(--nft)"
                        onClick={() => navigate('/nft-dashboard')}
                        hint="Tokens, royalties, charts"
                    />
                </div>

                {/* CHANGES TO FRONTEND — DashboardPage: resource list section */}
                <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '18px', margin: 0 }}>
                        Your Resources
                    </h2>
                    <button
                        id="dashboard-upload-new"
                        onClick={() => navigate('/upload')}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                        style={{
                            padding: '7px 16px', background: 'transparent',
                            color: 'var(--text-secondary)', border: '1px solid var(--border-default)',
                            borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
                            fontWeight: 500, fontFamily: 'var(--font)', transition: 'all 0.15s ease',
                        }}
                    >+ Upload New</button>
                </div>

                {resources.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No resources uploaded yet.</p>
                ) : (
                    /* CHANGES TO FRONTEND — DashboardPage: resource rows */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {resources.map(resource => (
                            <ResourceRow
                                key={resource.id}
                                resource={resource}
                                onView={() => navigate(`/resources/${resource.id}`)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

/* CHANGES TO FRONTEND — DashboardPage: resource row with hover state */
function ResourceRow({ resource, onView }) {
    const [hov, setHov] = useState(false);
    return (
        <div
            id={`dashboard-resource-${resource.id}`}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                display: 'flex', gap: '16px', padding: '16px 20px',
                background: hov ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                border: `1px solid ${hov ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: '12px', alignItems: 'center',
                transition: 'all 0.2s ease',
            }}
        >
            <img
                src={resource.thumbnail}
                alt={resource.title}
                style={{ width: '72px', height: '54px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
                onError={e => e.target.style.display = 'none'}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ color: 'var(--text-primary)', margin: '0 0 3px', fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {resource.title}
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: 0 }}>{resource.category_name}</p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ color: 'var(--text-primary)', fontWeight: 700, margin: '0 0 4px', fontSize: '15px' }}>₹{resource.price}</p>
                {/* CHANGES TO FRONTEND — DashboardPage: listed/removed badge on dark */}
                <span style={{
                    fontSize: '11px', padding: '2px 8px', borderRadius: '99px',
                    background: resource.status === 'listed' ? 'var(--green-dim)' : 'var(--red-dim)',
                    color: resource.status === 'listed' ? 'var(--green)' : 'var(--red)',
                    fontWeight: 600,
                }}>
                    {resource.status}
                </span>
            </div>
            {/* CHANGES TO FRONTEND — DashboardPage: View button ghost style */}
            <button
                id={`dashboard-view-${resource.id}`}
                onClick={onView}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                style={{
                    padding: '7px 16px', background: 'transparent',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-secondary)',
                    borderRadius: '8px', cursor: 'pointer',
                    fontSize: '13px', fontWeight: 500, fontFamily: 'var(--font)',
                    flexShrink: 0, transition: 'all 0.15s ease',
                }}
            >
                View
            </button>
        </div>
    );
}

export default DashboardPage;