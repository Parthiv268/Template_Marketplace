/* ============================================================
   CHANGES TO FRONTEND — WishlistPage
   - Dark page and card theme consistent with design system
   - Cards lift + brighten border on hover
   - View button: white primary with lift
   - Remove button: red ghost with red hover glow
   - Price displayed prominently in white
   - Empty state with action button
   ============================================================ */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMediaUrl } from '../api.js';

function WishlistPage() {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => { loadWishlist(); }, []);

    async function loadWishlist() {
        try {
            const token = localStorage.getItem('access');
            const res = await fetch('http://127.0.0.1:8000/api/resources/wishlist/', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (Array.isArray(data)) setWishlist(data);
        } catch (err) {
            console.log('Wishlist error:', err);
        } finally {
            setLoading(false);
        }
    }

    async function removeFromWishlist(resourceId) {
        try {
            const token = localStorage.getItem('access');
            await fetch('http://127.0.0.1:8000/api/resources/wishlist/', {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ resource: resourceId }),
            });
            setWishlist(prev => prev.filter(item => item.resource !== resourceId));
        } catch (err) {
            console.log('Remove error:', err);
        }
    }

    /* CHANGES TO FRONTEND — WishlistPage: dark loading */
    if (loading) return (
        <div className="page-loading">
            <div className="spinner" />
            <span>Loading wishlist…</span>
        </div>
    );

    return (
        /* CHANGES TO FRONTEND — WishlistPage: dark page wrapper */
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-page)',
            padding: '40px 32px',
            fontFamily: 'var(--font)',
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* CHANGES TO FRONTEND — WishlistPage: page header */}
                <h1 style={{
                    fontSize: '28px', fontWeight: 800,
                    color: 'var(--text-primary)', margin: '0 0 6px',
                    letterSpacing: '-0.02em',
                }}>My Wishlist</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>
                    {wishlist.length} saved item{wishlist.length !== 1 ? 's' : ''}
                </p>

                {/* CHANGES TO FRONTEND — WishlistPage: empty state */}
                {wishlist.length === 0 ? (
                    <div className="empty-state">
                        <h3>Your wishlist is empty</h3>
                        <p style={{ marginBottom: '20px' }}>Save resources you want to come back to.</p>
                        <button
                            id="wishlist-browse-btn"
                            onClick={() => navigate('/marketplace')}
                            onMouseEnter={e => { e.currentTarget.style.background = '#e4e4e7'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            style={{
                                padding: '9px 24px', background: '#ffffff', color: '#000000',
                                border: 'none', borderRadius: '8px', cursor: 'pointer',
                                fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font)',
                                transition: 'all 0.15s ease',
                            }}
                        >
                            Browse Marketplace
                        </button>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(268px, 1fr))',
                        gap: '20px',
                    }}>
                        {wishlist.map(item => (
                            <WishlistCard
                                key={item.id}
                                item={item}
                                onView={() => navigate(`/resources/${item.resource}`)}
                                onRemove={() => removeFromWishlist(item.resource)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

/* CHANGES TO FRONTEND — WishlistPage: card with full hover effects */
function WishlistCard({ item, onView, onRemove }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            id={`wishlist-card-${item.id}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: hovered ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                border: `1px solid ${hovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: '14px',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                boxShadow: hovered ? '0 8px 28px rgba(0,0,0,0.5)' : 'none',
                transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
            }}
        >
            <div style={{ height: '150px', overflow: 'hidden' }}>
                {item.thumbnail && (
                    <img
                        src={getMediaUrl(item.thumbnail)}
                        alt={item.resource_title}
                        style={{
                            width: '100%', height: '100%', objectFit: 'cover',
                            transition: 'transform 0.3s ease',
                            transform: hovered ? 'scale(1.05)' : 'scale(1)',
                        }}
                    />
                )}
            </div>
            <div style={{ padding: '16px' }}>
                <h3 style={{ color: 'var(--text-primary)', margin: '0 0 4px', fontSize: '15px', fontWeight: 600 }}>
                    {item.resource_title}
                </h3>
                <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '18px', margin: '0 0 14px' }}>
                    ₹{item.resource_price}
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {/* CHANGES TO FRONTEND — WishlistPage: View button — white primary */}
                    <button
                        id={`wishlist-view-${item.id}`}
                        onClick={onView}
                        onMouseEnter={e => { e.currentTarget.style.background = '#e4e4e7'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        style={{
                            flex: 1, padding: '8px', background: '#ffffff',
                            color: '#000000', border: 'none', borderRadius: '8px',
                            cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                            fontFamily: 'var(--font)', transition: 'all 0.15s ease',
                        }}
                    >View</button>
                    {/* CHANGES TO FRONTEND — WishlistPage: Remove button — red ghost */}
                    <button
                        id={`wishlist-remove-${item.id}`}
                        onClick={onRemove}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--red-dim)'; e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-default)'; }}
                        style={{
                            flex: 1, padding: '8px', background: 'transparent',
                            color: 'var(--text-muted)', border: '1px solid var(--border-default)',
                            borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
                            fontWeight: 500, fontFamily: 'var(--font)', transition: 'all 0.15s ease',
                        }}
                    >Remove</button>
                </div>
            </div>
        </div>
    );
}

export default WishlistPage;
// some doubts on how the things are being removed in the wishlist like when does item get its name.