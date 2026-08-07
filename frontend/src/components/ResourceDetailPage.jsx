/* ============================================================
   CHANGES TO FRONTEND — ResourceDetailPage
   - Dark page background throughout
   - NFT info panel styled with dark surface (replaces purple gradient)
   - Supply bar uses white fill on dark track
   - Minted token success card updated for dark palette
   - Back button ghost style consistent with design system
   - Acquire button: white primary with lift on hover
   - Wishlist button: ghost style with hover brightening
   - Sold-out state: muted disabled button
   ============================================================ */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMediaUrl } from '../api.js';
import ImageCarousel from './ImageCarousel';

function ResourceDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [resource, setResource] = useState(null);
    const [nftStatus, setNftStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mintedToken, setMintedToken] = useState(null);

    useEffect(() => {
        const loadAll = async () => {
            try {
                const [resourceRes, nftRes] = await Promise.all([
                    fetch(`http://127.0.0.1:8000/api/resources/${id}/`),
                    fetch(`http://127.0.0.1:8000/api/resources/nft/status/${id}/`),
                ]);
                if (!resourceRes.ok) throw new Error('Resource not found');
                const rData = await resourceRes.json();
                setResource(rData);
                if (nftRes.ok) setNftStatus(await nftRes.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadAll();
    }, [id]);

    /* CHANGES TO FRONTEND — ResourceDetailPage: dark loading */
    if (loading) return (
        <div className="page-loading">
            <div className="spinner" />
            <span>Loading resource…</span>
        </div>
    );

    if (error) return (
        <div className="page-loading">
            <p style={{ color: 'var(--red)' }}>{error}</p>
            <button
                onClick={() => navigate('/marketplace')}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                style={{
                    marginTop: '12px', padding: '8px 20px', background: 'transparent',
                    color: 'var(--text-secondary)', border: '1px solid var(--border-default)',
                    borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--font)',
                    transition: 'all 0.15s ease',
                }}
            >Back to Marketplace</button>
        </div>
    );

    const supplyPct = nftStatus
        ? Math.min((nftStatus.tokens_minted / nftStatus.max_supply) * 100, 100)
        : 0;
    const isSoldOut = nftStatus && nftStatus.tokens_minted >= nftStatus.max_supply;
    const nextTokenNumber = nftStatus ? nftStatus.tokens_minted + 1 : 1;

    async function handleWishlist() {
        const token = localStorage.getItem('access');
        if (!token) { alert('Please log in to add to wishlist.'); return; }
        try {
            const res = await fetch('http://127.0.0.1:8000/api/resources/wishlist/', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ resource: resource.id }),
            });
            if (res.ok) alert('Added to wishlist!');
            else if (res.status === 400) alert('Already in your wishlist.');
            else alert('Could not add to wishlist.');
        } catch (err) { console.log('Wishlist error:', err); }
    }

    async function handleAcquire() {
        const token = localStorage.getItem('access');
        if (!token) { alert('Please log in to acquire resources.'); return; }
        try {
            const res = await fetch('http://127.0.0.1:8000/api/payments/create-order/', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ resource_id: resource.id }),
            });
            const orderData = await res.json();
            if (!res.ok) { alert(orderData.error || 'Could not create order.'); return; }

            const options = {
                key: orderData.key,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'DevVault',
                description: orderData.resource_title,
                order_id: orderData.order_id,
                redirect: false,
                handler: async function (response) {
                    const verifyRes = await fetch('http://127.0.0.1:8000/api/payments/verify/', {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            resource_id: resource.id,
                        }),
                    });
                    const verifyData = await verifyRes.json();
                    if (verifyData.success) {
                        if (verifyData.nft) setMintedToken(verifyData.nft);
                        const nftRes = await fetch(`http://127.0.0.1:8000/api/resources/nft/status/${id}/`);
                        if (nftRes.ok) setNftStatus(await nftRes.json());
                    } else {
                        alert('Payment verification failed. Contact support.');
                    }
                },
                prefill: { name: 'Test User', email: 'test@example.com', contact: '9999999999' },
                /* CHANGES TO FRONTEND — ResourceDetailPage: Razorpay theme updated to black */
                theme: { color: '#ffffff' },
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) { console.log('Payment error:', err); alert('Something went wrong.'); }
    }

    const carouselImages = [];
    if (resource?.thumbnail) {
        carouselImages.push({ image: resource.thumbnail });
    }
    if (resource?.images && Array.isArray(resource.images)) {
        resource.images.forEach(imgObj => {
            const url = typeof imgObj === 'string' ? imgObj : imgObj.image;
            if (url) {
                carouselImages.push({ image: url });
            }
        });
    }

    return (
        /* CHANGES TO FRONTEND — ResourceDetailPage: dark page wrapper */
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-page)',
            padding: '32px 24px 60px',
            fontFamily: 'var(--font)',
        }}>
            <div style={{ maxWidth: '860px', margin: '0 auto' }}>

                {/* CHANGES TO FRONTEND — ResourceDetailPage: back button ghost style */}
                <button
                    id="detail-back-btn"
                    onClick={() => navigate('/marketplace')}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    style={{
                        marginBottom: '24px', padding: '7px 14px',
                        background: 'transparent', color: 'var(--text-secondary)',
                        border: '1px solid var(--border-default)', borderRadius: '8px',
                        cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--font)',
                        transition: 'all 0.15s ease',
                    }}
                >← Back to Marketplace</button>

                {/* Image Carousel (auto-slides every 3 seconds) */}
                {carouselImages.length > 0 && (
                    <ImageCarousel images={carouselImages} />
                )}

                {/* ── Minted Token Success Card ──────────────────────── */}
                {mintedToken && (
                    /* CHANGES TO FRONTEND — ResourceDetailPage: minted token card in dark palette */
                    <div style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid rgba(167,139,250,0.3)',
                        borderRadius: '16px', padding: '24px',
                        marginBottom: '28px', position: 'relative', overflow: 'hidden',
                    }}>
                        <div style={{
                            position: 'absolute', top: '-20px', right: '-20px',
                            fontSize: '120px', opacity: 0.04, lineHeight: 1,
                        }}>⬡</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <span style={{
                                background: 'var(--green-dim)', color: 'var(--green)',
                                fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '99px',
                            }}>✓ NFT Minted</span>
                        </div>
                        <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '18px', margin: '0 0 4px' }}>
                            You own Token #{mintedToken.token_number} of {resource.max_supply}
                        </p>
                        <p style={{ color: 'var(--nft)', fontSize: '13px', margin: '0 0 12px' }}>
                            {resource.title} · {resource.royalty_percent}% royalty on resale
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'monospace', margin: '0 0 16px', wordBreak: 'break-all' }}>
                            Hash: {mintedToken.metadata_hash}
                        </p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                id="minted-library-btn"
                                onClick={() => navigate('/library')}
                                onMouseEnter={e => { e.currentTarget.style.background = '#e4e4e7'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; }}
                                style={{
                                    padding: '8px 18px', background: '#ffffff', color: '#000000',
                                    border: 'none', borderRadius: '8px', cursor: 'pointer',
                                    fontWeight: 600, fontSize: '13px', fontFamily: 'var(--font)',
                                    transition: 'all 0.15s ease',
                                }}
                            >View in Library</button>
                            <button
                                id="minted-nft-btn"
                                onClick={() => navigate('/nft-dashboard')}
                                onMouseEnter={e => { e.currentTarget.style.background = 'var(--nft-dim)'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.4)'; e.currentTarget.style.color = 'var(--nft)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                                style={{
                                    padding: '8px 18px', background: 'transparent',
                                    color: 'var(--text-secondary)',
                                    border: '1px solid var(--border-default)',
                                    borderRadius: '8px', cursor: 'pointer',
                                    fontWeight: 600, fontSize: '13px', fontFamily: 'var(--font)',
                                    transition: 'all 0.15s ease',
                                }}
                            >NFT Dashboard →</button>
                        </div>
                    </div>
                )}

                {/* ── Title & Price ─────────────────────────────────── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div>
                        {/* CHANGES TO FRONTEND — ResourceDetailPage: white title on dark */}
                        <h1 style={{ color: 'var(--text-primary)', margin: '0 0 8px', fontSize: '26px', fontWeight: 800, letterSpacing: '-0.02em' }}>
                            {resource.title}
                        </h1>
                        <p style={{ color: 'var(--text-muted)', margin: '0 0 4px', fontSize: '13px' }}>
                            {resource.category_name}
                        </p>
                        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '13px' }}>
                            by <b style={{ color: 'var(--text-primary)' }}>{resource.owner_username}</b>
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ color: 'var(--text-primary)', fontSize: '30px', fontWeight: 800, margin: '0 0 2px' }}>
                            ₹{resource.price}
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: 0 }}>per token</p>
                    </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '0 0 24px' }} />

                {/* ── NFT Token Info Panel ──────────────────────────── */}
                {nftStatus && (
                    /* CHANGES TO FRONTEND — ResourceDetailPage: NFT panel with dark surface */
                    <div style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-default)',
                        borderRadius: '14px', padding: '20px',
                        marginBottom: '24px',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div>
                                <p style={{ color: 'var(--nft)', fontWeight: 700, margin: '0 0 4px', fontSize: '14px' }}>
                                    ⬡ NFT Collection
                                </p>
                                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '12px' }}>
                                    {resource.royalty_percent}% royalty routes to creator on every resale
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                <span style={{
                                    display: 'inline-block', padding: '2px 10px',
                                    background: 'var(--nft-dim)', color: 'var(--nft)',
                                    borderRadius: '99px', fontSize: '11px', fontWeight: 600,
                                }}>
                                    {resource.royalty_percent}% Royalty
                                </span>
                                {resource.is_selling_paused ? (
                                    <span style={{
                                        display: 'inline-block', padding: '2px 10px',
                                        background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444',
                                        border: '1px solid rgba(239, 68, 68, 0.4)',
                                        borderRadius: '99px', fontSize: '11px', fontWeight: 700,
                                    }}>🛑 Selling Paused</span>
                                ) : isSoldOut ? (
                                    <span style={{
                                        display: 'inline-block', padding: '2px 10px',
                                        background: 'var(--amber-dim)', color: 'var(--amber)',
                                        borderRadius: '99px', fontSize: '11px', fontWeight: 700,
                                    }}>🔥 Primary Sold Out</span>
                                ) : (
                                    <span style={{
                                        display: 'inline-block', padding: '2px 10px',
                                        background: 'var(--green-dim)', color: 'var(--green)',
                                        borderRadius: '99px', fontSize: '11px', fontWeight: 600,
                                    }}>{nftStatus.tokens_remaining} left</span>
                                )}
                            </div>
                        </div>

                        {/* Supply bar */}
                        <div style={{ marginBottom: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Supply</span>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                    {nftStatus.tokens_minted} / {nftStatus.max_supply} minted
                                </span>
                            </div>
                            {/* CHANGES TO FRONTEND — ResourceDetailPage: supply bar on dark track */}
                            <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '99px', height: '6px', overflow: 'hidden' }}>
                                <div style={{
                                    width: `${supplyPct}%`, height: '100%',
                                    background: isSoldOut
                                        ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                                        : 'rgba(255,255,255,0.6)',
                                    borderRadius: '99px', transition: 'width 0.6s ease',
                                }} />
                            </div>
                        </div>

                        {resource.is_selling_paused ? (
                            <p style={{ color: '#ef4444', fontSize: '13px', fontWeight: 600, margin: 0 }}>
                                🛑 Selling has been temporarily paused by the creator.
                            </p>
                        ) : !isSoldOut ? (
                            <p style={{ color: 'var(--nft)', fontSize: '13px', fontWeight: 500, margin: 0 }}>
                                🎟 You'll receive <b>Token #{nextTokenNumber} of {nftStatus.max_supply}</b>
                            </p>
                        ) : (
                            <p style={{ color: 'var(--amber)', fontSize: '13px', fontWeight: 500, margin: 0 }}>
                                All primary tokens are minted. Check the secondary market for resale listings.
                            </p>
                        )}
                    </div>
                )}

                {/* Description */}
                <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, margin: '0 0 10px', fontSize: '17px' }}>Description</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '32px', fontSize: '14px' }}>
                    {resource.description}
                </p>

                {/* ── Action Buttons ────────────────────────────────── */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {/* CHANGES TO FRONTEND — ResourceDetailPage: Acquire = white primary / disabled on sold-out or paused */}
                    <button
                        id="detail-acquire-btn"
                        onClick={handleAcquire}
                        disabled={isSoldOut || resource.is_selling_paused}
                        onMouseEnter={e => { if (!isSoldOut && !resource.is_selling_paused) { e.currentTarget.style.background = '#e4e4e7'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,255,255,0.12)'; } }}
                        onMouseLeave={e => { e.currentTarget.style.background = (isSoldOut || resource.is_selling_paused) ? 'var(--bg-elevated)' : '#ffffff'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                        style={{
                            flex: 2, padding: '14px',
                            background: (isSoldOut || resource.is_selling_paused) ? 'var(--bg-elevated)' : '#ffffff',
                            color: (isSoldOut || resource.is_selling_paused) ? 'var(--text-muted)' : '#000000',
                            border: 'none', borderRadius: '10px',
                            fontSize: '15px', fontWeight: 700, cursor: (isSoldOut || resource.is_selling_paused) ? 'not-allowed' : 'pointer',
                            fontFamily: 'var(--font)', transition: 'all 0.2s ease',
                        }}
                    >
                        {resource.is_selling_paused ? '🛑 Selling Paused by Creator' : isSoldOut ? '🔥 Primary Sold Out' : `Mint Token #${nextTokenNumber} · ₹${resource.price}`}
                    </button>

                    {/* CHANGES TO FRONTEND — ResourceDetailPage: Wishlist = ghost style */}
                    <button
                        id="detail-wishlist-btn"
                        onClick={handleWishlist}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                        style={{
                            flex: 1, padding: '14px',
                            background: 'transparent',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-default)',
                            borderRadius: '10px', fontSize: '15px',
                            fontWeight: 500, cursor: 'pointer',
                            fontFamily: 'var(--font)', transition: 'all 0.15s ease',
                        }}
                    >♡ Wishlist</button>
                </div>
            </div>
        </div>
    );
}

export default ResourceDetailPage;