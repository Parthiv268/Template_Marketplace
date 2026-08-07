/* ============================================================
   CHANGES TO FRONTEND — ResaleMarketplacePage (NEW FILE)
   - Dark page and card grid matching main marketplace style
   - Each card shows: token number, resource name, seller, price,
     royalty %, and a Buy button
   - Buy button opens a confirmation modal showing the royalty split
   - After purchase: success banner with what you earned / paid
   - Empty state for when no tokens are listed
   ============================================================ */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResaleListings, buyResaleToken, getMediaUrl } from '../api.js';

function ResaleMarketplacePage() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [buyTarget, setBuyTarget] = useState(null);
    const [buying, setBuying] = useState(false);
    const [successMsg, setSuccessMsg] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

    useEffect(() => { loadListings(); }, []);

    async function loadListings() {
        try {
            const data = await getResaleListings();
            setListings(Array.isArray(data) ? data : []);
        } catch (err) {
            console.log('Resale listings error:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleBuy() {
        if (!buyTarget) return;
        const authToken = localStorage.getItem('access');
        if (!authToken) { navigate('/login'); return; }
        setBuying(true);
        setErrorMsg('');
        try {
            const result = await buyResaleToken(buyTarget.id);
            setSuccessMsg(result);
            setBuyTarget(null);
            loadListings();
        } catch (err) {
            setErrorMsg(err?.error || 'Purchase failed. Please try again.');
        } finally {
            setBuying(false);
        }
    }

    if (loading) return (
        <div className="page-loading">
            <div className="spinner" />
            <span>Loading resale market…</span>
        </div>
    );

    const royaltyAmount = buyTarget
        ? ((parseFloat(buyTarget.resale_price) * buyTarget.royalty_percent) / 100).toFixed(2)
        : 0;
    const sellerAmount = buyTarget
        ? (parseFloat(buyTarget.resale_price) - parseFloat(royaltyAmount)).toFixed(2)
        : 0;

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-page)',
            padding: '40px 32px',
            fontFamily: 'var(--font)',
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* Header */}
                <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                        <h1 style={{
                            fontSize: '28px', fontWeight: 800,
                            color: 'var(--text-primary)', margin: 0,
                            letterSpacing: '-0.02em',
                        }}>Secondary Market</h1>
                        <span style={{
                            background: 'var(--nft-dim)', color: 'var(--nft)',
                            border: '1px solid rgba(167,139,250,0.3)',
                            fontSize: '11px', fontWeight: 700,
                            padding: '3px 10px', borderRadius: '99px',
                        }}>⬡ NFT Resale</span>
                        <span style={{
                            background: 'var(--bg-elevated)', color: 'var(--text-muted)',
                            fontSize: '12px', padding: '3px 10px', borderRadius: '99px',
                            border: '1px solid var(--border-subtle)',
                        }}>{listings.length} listed</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
                        Buy tokens from other holders. The original creator automatically earns their royalty on every sale.
                    </p>
                </div>

                {/* Success banner */}
                {successMsg && (
                    <div style={{
                        background: 'rgba(34,197,94,0.08)',
                        border: '1px solid rgba(34,197,94,0.25)',
                        borderRadius: '12px', padding: '16px 20px',
                        marginBottom: '28px', display: 'flex',
                        justifyContent: 'space-between', alignItems: 'center',
                        gap: '16px',
                    }}>
                        <div>
                            <p style={{ color: 'var(--green)', fontWeight: 700, margin: '0 0 4px', fontSize: '14px' }}>
                                ✓ {successMsg.message}
                            </p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: 0 }}>
                                Royalty paid to creator: ₹{successMsg.royalty_paid_to_creator} &nbsp;·&nbsp; Seller received: ₹{successMsg.seller_received}
                            </p>
                        </div>
                        <button
                            onClick={() => { setSuccessMsg(null); navigate('/library'); }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#e4e4e7'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; }}
                            style={{
                                padding: '7px 16px', background: '#ffffff', color: '#000000',
                                border: 'none', borderRadius: '8px', cursor: 'pointer',
                                fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font)',
                                transition: 'all 0.15s ease', flexShrink: 0,
                            }}
                        >View in Library</button>
                    </div>
                )}

                {/* Empty state */}
                {listings.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '80px 40px',
                        border: '1px dashed var(--border-default)',
                        borderRadius: '16px',
                    }}>
                        <div style={{ fontSize: '40px', marginBottom: '12px' }}>⬡</div>
                        <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, margin: '0 0 8px' }}>
                            No tokens listed for resale
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 24px' }}>
                            When token holders list their NFTs for resale, they will appear here.
                        </p>
                        <button
                            onClick={() => navigate('/marketplace')}
                            onMouseEnter={e => { e.currentTarget.style.background = '#e4e4e7'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            style={{
                                padding: '10px 24px', background: '#ffffff', color: '#000000',
                                border: 'none', borderRadius: '10px', cursor: 'pointer',
                                fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font)',
                                transition: 'all 0.15s ease',
                            }}
                        >Browse Primary Marketplace</button>
                    </div>
                ) : (
                    /* Card grid */
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '20px',
                    }}>
                        {listings.map(token => (
                            <ResaleCard
                                key={token.id}
                                token={token}
                                onBuy={() => setBuyTarget(token)}
                                onViewResource={() => navigate(`/resources/${token.resource}`)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Buy confirmation modal */}
            {buyTarget && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '24px',
                }}>
                    <div style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-default)',
                        borderRadius: '20px', padding: '32px',
                        width: '100%', maxWidth: '420px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <span style={{
                                background: 'var(--nft-dim)', color: 'var(--nft)',
                                fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px',
                            }}>⬡ Secondary Sale</span>
                        </div>

                        <h2 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '20px', margin: '0 0 4px' }}>
                            Confirm Purchase
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 24px' }}>
                            {buyTarget.resource_title} &nbsp;·&nbsp; Token #{buyTarget.token_number} of {buyTarget.max_supply}
                        </p>

                        {/* Price breakdown */}
                        <div style={{
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '12px', padding: '16px',
                            marginBottom: '20px',
                        }}>
                            <PriceRow label="You pay" value={`₹${buyTarget.resale_price}`} bold />
                            <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '10px 0' }} />
                            <PriceRow
                                label={`Royalty to original creator (${buyTarget.royalty_percent}%)`}
                                value={`₹${royaltyAmount}`}
                                color="var(--nft)"
                            />
                            <PriceRow
                                label="Seller receives"
                                value={`₹${sellerAmount}`}
                                color="var(--text-secondary)"
                            />
                        </div>

                        <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '20px', lineHeight: 1.6 }}>
                            The royalty is automatically routed to the original creator. This is instant and cannot be undone.
                        </p>

                        {errorMsg && (
                            <p style={{ color: 'var(--red)', fontSize: '13px', marginBottom: '14px' }}>{errorMsg}</p>
                        )}

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                id="confirm-buy-btn"
                                onClick={handleBuy}
                                disabled={buying}
                                onMouseEnter={e => { if (!buying) e.currentTarget.style.background = '#e4e4e7'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = buying ? '#3f3f46' : '#ffffff'; }}
                                style={{
                                    flex: 2, padding: '12px',
                                    background: buying ? '#3f3f46' : '#ffffff',
                                    color: buying ? '#71717a' : '#000000',
                                    border: 'none', borderRadius: '10px',
                                    cursor: buying ? 'not-allowed' : 'pointer',
                                    fontWeight: 700, fontSize: '14px',
                                    fontFamily: 'var(--font)',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                {buying ? 'Processing…' : `Buy for ₹${buyTarget.resale_price}`}
                            </button>
                            <button
                                id="cancel-buy-btn"
                                onClick={() => { setBuyTarget(null); setErrorMsg(''); }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                                style={{
                                    flex: 1, padding: '12px',
                                    background: 'transparent', color: 'var(--text-secondary)',
                                    border: '1px solid var(--border-default)',
                                    borderRadius: '10px', cursor: 'pointer',
                                    fontWeight: 500, fontSize: '14px',
                                    fontFamily: 'var(--font)',
                                    transition: 'all 0.15s ease',
                                }}
                            >Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* Price row helper */
function PriceRow({ label, value, bold, color }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{label}</span>
            <span style={{
                color: color || (bold ? 'var(--text-primary)' : 'var(--text-secondary)'),
                fontWeight: bold ? 700 : 500, fontSize: '13px',
            }}>{value}</span>
        </div>
    );
}

/* Individual resale listing card */
function ResaleCard({ token, onBuy, onViewResource }) {
    const [hovered, setHovered] = useState(false);
    const creatorEarns = ((parseFloat(token.resale_price) * token.royalty_percent) / 100).toFixed(0);

    return (
        <div
            id={`resale-card-${token.id}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: hovered ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                border: `1px solid ${hovered ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: '14px', overflow: 'hidden',
                transition: 'all 0.2s ease',
                boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.5)' : '0 1px 4px rgba(0,0,0,0.3)',
                transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
            }}
        >
            {/* Thumbnail with badges */}
            <div style={{ position: 'relative', height: '150px', overflow: 'hidden', background: '#1a1a1a' }}>
                {token.resource_thumbnail && (
                    <img
                        src={getMediaUrl(token.resource_thumbnail)}
                        alt={token.resource_title}
                        style={{
                            width: '100%', height: '100%', objectFit: 'cover',
                            transition: 'transform 0.35s ease',
                            transform: hovered ? 'scale(1.05)' : 'scale(1)',
                        }}
                    />
                )}
                {/* Token number badge */}
                <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                    <span style={{
                        background: 'rgba(0,0,0,0.7)', color: '#a78bfa',
                        backdropFilter: 'blur(4px)', fontSize: '11px',
                        fontWeight: 700, padding: '2px 9px', borderRadius: '99px',
                        border: '1px solid rgba(167,139,250,0.3)',
                    }}>⬡ #{token.token_number}</span>
                </div>
                {/* Royalty badge */}
                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    <span style={{
                        background: 'rgba(0,0,0,0.7)', color: '#f59e0b',
                        backdropFilter: 'blur(4px)', fontSize: '11px',
                        fontWeight: 700, padding: '2px 9px', borderRadius: '99px',
                    }}>{token.royalty_percent}% royalty</span>
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '14px 16px' }}>
                <p
                    onClick={onViewResource}
                    style={{
                        color: 'var(--text-muted)', fontSize: '11px',
                        fontWeight: 600, textTransform: 'uppercase',
                        letterSpacing: '0.5px', margin: '0 0 3px', cursor: 'pointer',
                    }}
                >{token.resource_title}</p>
                <h3 style={{ color: 'var(--text-primary)', fontSize: '15px', fontWeight: 600, margin: '0 0 4px' }}>
                    Token #{token.token_number} of {token.max_supply}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '0 0 14px' }}>
                    Seller: <span style={{ color: 'var(--text-secondary)' }}>{token.owner_username}</span>
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '20px' }}>
                        ₹{token.resale_price}
                    </span>
                    <span style={{ color: 'var(--nft)', fontSize: '12px' }}>
                        Creator gets ₹{creatorEarns}
                    </span>
                </div>

                {/* Buy button */}
                <button
                    id={`buy-resale-${token.id}`}
                    onClick={onBuy}
                    onMouseEnter={e => { e.currentTarget.style.background = '#e4e4e7'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    style={{
                        width: '100%', padding: '10px',
                        background: '#ffffff', color: '#000000',
                        border: 'none', borderRadius: '8px',
                        cursor: 'pointer', fontWeight: 700,
                        fontSize: '14px', fontFamily: 'var(--font)',
                        transition: 'all 0.15s ease',
                    }}
                >Buy Token</button>
            </div>
        </div>
    );
}

export default ResaleMarketplacePage;
