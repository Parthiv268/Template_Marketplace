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
        /* CHANGES TO FRONTEND — WishlistPage: Futuristic Container */
        <div style={{
            minHeight: '100vh',
            padding: '32px 24px 80px',
            fontFamily: 'var(--font)',
        }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

                {/* CHANGES TO FRONTEND — WishlistPage: page header */}
                <div className="glass-panel" style={{
                    padding: '36px 32px',
                    borderRadius: '24px',
                    marginBottom: '36px',
                    background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.12) 0%, rgba(15, 17, 26, 0.85) 60%)',
                    border: '1px solid rgba(236, 72, 153, 0.3)',
                }}>
                    <span className="badge-neon" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6', borderColor: 'rgba(236, 72, 153, 0.3)', marginBottom: '8px' }}>
                        ♥ SAVED QUANTUM ASSETS
                    </span>
                    <h1 className="font-heading" style={{
                        fontSize: '32px', fontWeight: 800,
                        color: '#ffffff', margin: '0 0 6px',
                        letterSpacing: '-0.03em',
                    }}>
                        My <span className="text-gradient-neon">Wishlist Vault</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
                        {wishlist.length} saved asset{wishlist.length !== 1 ? 's' : ''} bookmarked for quick acquisition.
                    </p>
                </div>

                {/* CHANGES TO FRONTEND — WishlistPage: empty state */}
                {wishlist.length === 0 ? (
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '80px 40px', borderRadius: '24px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>♥</div>
                        <h3 className="font-heading" style={{ fontSize: '22px', color: '#fff', marginBottom: '8px' }}>Your Wishlist Vault is Empty</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '28px' }}>Bookmark templates, code assets, and NFTs from the marketplace to keep track of them here.</p>
                        <button
                            id="wishlist-browse-btn"
                            onClick={() => navigate('/marketplace')}
                            className="btn-glow"
                        >
                            Explore Marketplace →
                        </button>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                        gap: '24px',
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