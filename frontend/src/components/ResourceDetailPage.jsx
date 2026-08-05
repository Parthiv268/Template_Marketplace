import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ResourceDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [resource, setResource] = useState(null);
    const [nftStatus, setNftStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mintedToken, setMintedToken] = useState(null); // shown after purchase

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
                if (nftRes.ok) {
                    const nData = await nftRes.json();
                    setNftStatus(nData);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadAll();
    }, [id]);

    if (loading) return <p style={{ padding: '24px' }}>Loading...</p>;
    if (error) return (
        <div style={{ padding: '24px' }}>
            <p style={{ color: 'red' }}>{error}</p>
            <button onClick={() => navigate('/marketplace')}>Back to Marketplace</button>
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
        } catch (err) {
            console.log('Wishlist error:', err);
        }
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
                        // Show the minted NFT token card
                        if (verifyData.nft) {
                            setMintedToken(verifyData.nft);
                        }
                        // Refresh NFT status
                        const nftRes = await fetch(`http://127.0.0.1:8000/api/resources/nft/status/${id}/`);
                        if (nftRes.ok) setNftStatus(await nftRes.json());
                    } else {
                        alert('Payment verification failed. Contact support.');
                    }
                },
                prefill: { name: 'Test User', email: 'test@example.com', contact: '9999999999' },
                theme: { color: '#7c3aed' },
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.log('Payment error:', err);
            alert('Something went wrong. Please try again.');
        }
    }

    return (
        <div style={{ padding: '24px', maxWidth: '860px', margin: '0 auto', fontFamily: '"Inter", sans-serif' }}>
            <button
                onClick={() => navigate('/marketplace')}
                style={{ marginBottom: '20px', background: 'none', border: '1px solid #e5e7eb', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
            >
                ← Back to Marketplace
            </button>

            {resource.thumbnail && (
                <img
                    src={resource.thumbnail}
                    alt={resource.title}
                    style={{ width: '100%', maxHeight: '380px', objectFit: 'cover', borderRadius: '14px', marginBottom: '28px' }}
                />
            )}

            {/* ── Minted Token Success Card ─────────────────────── */}
            {mintedToken && (
                <div style={{
                    background: 'linear-gradient(135deg, #0a0118, #1a0a40)',
                    border: '1px solid rgba(124,58,237,0.5)',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '28px',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        position: 'absolute', top: '-30px', right: '-30px',
                        fontSize: '120px', opacity: 0.06, lineHeight: 1,
                    }}>⬡</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <span style={{
                            background: 'rgba(16,185,129,0.2)', color: '#10b981',
                            fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '99px',
                        }}>✓ NFT Minted!</span>
                    </div>
                    <p style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '20px', margin: '0 0 4px' }}>
                        You own Token #{mintedToken.token_number} of {resource.max_supply}
                    </p>
                    <p style={{ color: '#a78bfa', fontSize: '13px', margin: '0 0 16px' }}>
                        {resource.title} · {resource.royalty_percent}% royalty on resale
                    </p>
                    <p style={{ color: '#64748b', fontSize: '11px', fontFamily: 'monospace', margin: '0 0 16px', wordBreak: 'break-all' }}>
                        Hash: {mintedToken.metadata_hash}
                    </p>
                    <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>
                        This token is stored in your library. Once all {resource.max_supply} tokens are sold,
                        resales will earn the original creator {resource.royalty_percent}% royalty automatically.
                    </p>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                        <button
                            onClick={() => navigate('/library')}
                            style={{
                                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                                color: '#fff', border: 'none', borderRadius: '8px',
                                padding: '8px 20px', cursor: 'pointer', fontWeight: 600, fontSize: '13px',
                            }}
                        >
                            View in Library
                        </button>
                        <button
                            onClick={() => navigate('/nft-dashboard')}
                            style={{
                                background: 'transparent', color: '#a78bfa',
                                border: '1px solid rgba(124,58,237,0.4)', borderRadius: '8px',
                                padding: '8px 20px', cursor: 'pointer', fontWeight: 600, fontSize: '13px',
                            }}
                        >
                            NFT Dashboard →
                        </button>
                    </div>
                </div>
            )}

            {/* ── Title & Price ─────────────────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2 style={{ margin: '0 0 8px', fontSize: '26px', fontWeight: 700 }}>{resource.title}</h2>
                    <p style={{ color: '#6b7280', margin: '0 0 4px', fontSize: '14px' }}>
                        Category: {resource.category_name}
                    </p>
                    <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
                        By: <b style={{ color: '#374151' }}>{resource.owner_username}</b>
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '30px', fontWeight: 800, margin: '0 0 4px', color: '#111' }}>
                        ₹{resource.price}
                    </p>
                    <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>per token</p>
                </div>
            </div>

            <hr style={{ margin: '20px 0', borderColor: '#f3f4f6' }} />

            {/* ── NFT Token Info Panel ──────────────────────────── */}
            {nftStatus && (
                <div style={{
                    background: 'linear-gradient(135deg, #fdf4ff, #ede9fe)',
                    border: '1px solid #c4b5fd',
                    borderRadius: '14px',
                    padding: '20px',
                    marginBottom: '24px',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div>
                            <p style={{ color: '#7c3aed', fontWeight: 700, margin: '0 0 4px', fontSize: '15px' }}>
                                ⬡ NFT Collection
                            </p>
                            <p style={{ color: '#6b7280', margin: 0, fontSize: '13px' }}>
                                {resource.royalty_percent}% royalty on every resale · goes to creator forever
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            <span style={{
                                background: '#ede9fe', color: '#7c3aed', fontWeight: 600,
                                fontSize: '12px', padding: '3px 10px', borderRadius: '99px',
                            }}>
                                {resource.royalty_percent}% Royalty
                            </span>
                            {isSoldOut ? (
                                <span style={{ background: '#fef3c7', color: '#92400e', fontWeight: 700, fontSize: '12px', padding: '3px 10px', borderRadius: '99px' }}>
                                    🔥 Primary Sold Out
                                </span>
                            ) : (
                                <span style={{ background: '#dcfce7', color: '#166534', fontWeight: 600, fontSize: '12px', padding: '3px 10px', borderRadius: '99px' }}>
                                    {nftStatus.tokens_remaining} left
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Supply bar */}
                    <div style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>Supply</span>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#7c3aed' }}>
                                {nftStatus.tokens_minted} / {nftStatus.max_supply} minted
                            </span>
                        </div>
                        <div style={{ background: '#e9d5ff', borderRadius: '99px', height: '8px', overflow: 'hidden' }}>
                            <div style={{
                                width: `${supplyPct}%`, height: '100%',
                                background: isSoldOut
                                    ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                                    : 'linear-gradient(90deg, #7c3aed, #06b6d4)',
                                borderRadius: '99px',
                                transition: 'width 0.8s ease',
                            }} />
                        </div>
                    </div>

                    {/* Next token preview */}
                    {!isSoldOut && (
                        <p style={{ color: '#7c3aed', fontSize: '13px', fontWeight: 500, margin: 0 }}>
                            🎟 You'll receive <b>Token #{nextTokenNumber} of {nftStatus.max_supply}</b>
                        </p>
                    )}

                    {isSoldOut && (
                        <p style={{ color: '#92400e', fontSize: '13px', fontWeight: 500, margin: 0 }}>
                            All primary tokens are minted. Check the secondary market for resale listings.
                        </p>
                    )}
                </div>
            )}

            <h3 style={{ marginBottom: '8px' }}>Description</h3>
            <p style={{ color: '#374151', lineHeight: '1.7', marginBottom: '28px' }}>{resource.description}</p>

            {/* ── Action Buttons ────────────────────────────────── */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                    onClick={handleAcquire}
                    disabled={isSoldOut}
                    style={{
                        flex: 2,
                        padding: '14px',
                        background: isSoldOut ? '#e5e7eb' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                        color: isSoldOut ? '#9ca3af' : 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '16px',
                        fontWeight: 600,
                        cursor: isSoldOut ? 'not-allowed' : 'pointer',
                        boxShadow: isSoldOut ? 'none' : '0 4px 20px rgba(124,58,237,0.35)',
                        transition: 'all 0.2s',
                    }}
                >
                    {isSoldOut ? '🔥 Primary Sold Out' : `Mint Token #${nextTokenNumber} · ₹${resource.price}`}
                </button>
                <button
                    onClick={handleWishlist}
                    style={{
                        flex: 1,
                        padding: '14px',
                        background: 'white',
                        color: '#7c3aed',
                        border: '2px solid #c4b5fd',
                        borderRadius: '10px',
                        fontSize: '16px',
                        fontWeight: 500,
                        cursor: 'pointer',
                    }}
                >
                    ♡ Wishlist
                </button>
            </div>
        </div>
    );
}

export default ResourceDetailPage;