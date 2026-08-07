/* ============================================================
   CHANGES TO FRONTEND — LibraryPage (MERGE: unified collection)
   - Acquisition + NFTToken tabs removed
   - Single "My Collection" view: one card per token you own
   - Each card: thumbnail, title, token # of max, date minted, amount paid
   - Download button uses resource_file from NFTTokenSerializer
   - ⬡ List for Resale / ✕ Cancel Listing buttons
   - Selling a token = card disappears (ownership transferred to buyer)
   ============================================================ */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyNFTTokens, listTokenForResale, cancelResaleListing, getMediaUrl } from '../api.js';

function LibraryPage() {
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);

    /* List-for-resale modal state */
    const [listTarget, setListTarget] = useState(null);
    const [listPrice, setListPrice] = useState('');
    const [listError, setListError] = useState('');
    const [listBusy, setListBusy] = useState(false);

    const navigate = useNavigate();

    useEffect(() => { loadTokens(); }, []);

    async function loadTokens() {
        setLoading(true);
        try {
            const data = await getMyNFTTokens();
            setTokens(Array.isArray(data) ? data : []);
        } catch (err) {
            console.log('Library load error:', err);
        } finally {
            setLoading(false);
        }
    }

    /* Handle listing a token for resale */
    async function handleListForResale() {
        const price = parseFloat(listPrice);
        if (!price || price <= 0) { setListError('Enter a valid price greater than 0.'); return; }
        setListBusy(true);
        setListError('');
        try {
            await listTokenForResale(listTarget.id, price);
            await loadTokens();
            setListTarget(null);
            setListPrice('');
        } catch (err) {
            setListError(err?.error || 'Could not list token. Try again.');
        } finally {
            setListBusy(false);
        }
    }

    /* Handle cancelling a resale listing */
    async function handleCancelListing(token) {
        try {
            await cancelResaleListing(token.id);
            await loadTokens();
        } catch (err) {
            alert(err?.error || 'Could not cancel listing.');
        }
    }

    if (loading) return (
        <div className="page-loading">
            <div className="spinner" />
            <span>Loading your collection…</span>
        </div>
    );

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-page)',
            padding: '40px 32px',
            fontFamily: 'var(--font)',
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* Page header */}
                <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                        <h1 style={{
                            fontSize: '28px', fontWeight: 800,
                            color: 'var(--text-primary)', margin: 0,
                            letterSpacing: '-0.02em',
                        }}>My Collection</h1>
                        <span style={{
                            background: 'var(--bg-elevated)', color: 'var(--text-muted)',
                            fontSize: '12px', padding: '3px 10px', borderRadius: '99px',
                            border: '1px solid var(--border-subtle)',
                        }}>{tokens.length} token{tokens.length !== 1 ? 's' : ''}</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
                        Tokens you currently hold. Owning a token gives you download access.
                        Selling a token transfers both ownership and access to the buyer.
                    </p>
                </div>

                {/* Empty state */}
                {tokens.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '80px 40px',
                        border: '1px dashed var(--border-default)',
                        borderRadius: '16px',
                    }}>
                        <div style={{ fontSize: '40px', marginBottom: '12px' }}>⬡</div>
                        <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, margin: '0 0 8px' }}>
                            No tokens yet
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 24px' }}>
                            Buy a resource from the marketplace to mint your first token.
                        </p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
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
                            >Browse Marketplace</button>
                            <button
                                onClick={() => navigate('/resale-market')}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(167,139,250,0.2)'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.4)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(167,139,250,0.08)'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.25)'; }}
                                style={{
                                    padding: '10px 24px',
                                    background: 'rgba(167,139,250,0.08)', color: '#a78bfa',
                                    border: '1px solid rgba(167,139,250,0.25)',
                                    borderRadius: '10px', cursor: 'pointer',
                                    fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font)',
                                    transition: 'all 0.15s ease',
                                }}
                            >⬡ Browse Resale Market</button>
                        </div>
                    </div>
                ) : (
                    /* Token grid */
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '20px',
                    }}>
                        {tokens.map(token => (
                            <TokenCard
                                key={token.id}
                                token={token}
                                onList={() => { setListTarget(token); setListPrice(''); setListError(''); }}
                                onCancel={() => handleCancelListing(token)}
                                onViewResource={() => navigate(`/resources/${token.resource}`)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* List for Resale modal */}
            {listTarget && (
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
                        width: '100%', maxWidth: '380px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                    }}>
                        <span style={{
                            display: 'inline-block', marginBottom: '16px',
                            background: 'var(--nft-dim)', color: 'var(--nft)',
                            fontSize: '11px', fontWeight: 700,
                            padding: '2px 8px', borderRadius: '99px',
                        }}>⬡ List for Resale</span>

                        <h2 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '20px', margin: '0 0 4px' }}>
                            Set Your Price
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 8px' }}>
                            {listTarget.resource_title} &nbsp;·&nbsp; Token #{listTarget.token_number} of {listTarget.max_supply}
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '0 0 20px', lineHeight: 1.5 }}>
                            {listTarget.royalty_percent}% of the sale price will go to the original creator as royalty.
                            Once someone buys this token, you will lose download access.
                        </p>

                        <label style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
                            Resale Price (₹)
                        </label>
                        <input
                            id="resale-price-input"
                            type="number"
                            min="1"
                            placeholder="e.g. 800"
                            value={listPrice}
                            onChange={e => { setListPrice(e.target.value); setListError(''); }}
                            className="input"
                            style={{ marginBottom: '8px' }}
                        />

                        {/* Live royalty preview */}
                        {listPrice && parseFloat(listPrice) > 0 && (
                            <div style={{
                                background: 'var(--bg-elevated)', borderRadius: '8px',
                                padding: '10px 14px', marginBottom: '16px',
                                border: '1px solid var(--border-subtle)',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                                        Creator gets ({listTarget.royalty_percent}%)
                                    </span>
                                    <span style={{ color: 'var(--nft)', fontSize: '12px', fontWeight: 600 }}>
                                        ₹{((parseFloat(listPrice) * listTarget.royalty_percent) / 100).toFixed(2)}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>You receive</span>
                                    <span style={{ color: 'var(--green)', fontSize: '12px', fontWeight: 600 }}>
                                        ₹{(parseFloat(listPrice) - (parseFloat(listPrice) * listTarget.royalty_percent) / 100).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {listError && (
                            <p style={{ color: 'var(--red)', fontSize: '13px', marginBottom: '14px' }}>{listError}</p>
                        )}

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                id="confirm-list-btn"
                                onClick={handleListForResale}
                                disabled={listBusy}
                                onMouseEnter={e => { if (!listBusy) e.currentTarget.style.background = '#e4e4e7'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = listBusy ? '#3f3f46' : '#ffffff'; }}
                                style={{
                                    flex: 2, padding: '12px',
                                    background: listBusy ? '#3f3f46' : '#ffffff',
                                    color: listBusy ? '#71717a' : '#000000',
                                    border: 'none', borderRadius: '10px',
                                    cursor: listBusy ? 'not-allowed' : 'pointer',
                                    fontWeight: 700, fontSize: '14px',
                                    fontFamily: 'var(--font)', transition: 'all 0.15s ease',
                                }}
                            >{listBusy ? 'Listing…' : 'List for Resale'}</button>
                            <button
                                id="cancel-list-btn"
                                onClick={() => { setListTarget(null); setListError(''); }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                                style={{
                                    flex: 1, padding: '12px',
                                    background: 'transparent', color: 'var(--text-secondary)',
                                    border: '1px solid var(--border-default)',
                                    borderRadius: '10px', cursor: 'pointer',
                                    fontWeight: 500, fontSize: '14px',
                                    fontFamily: 'var(--font)', transition: 'all 0.15s ease',
                                }}
                            >Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* Individual token card — download + list/cancel actions */
function TokenCard({ token, onList, onCancel, onViewResource }) {
    const [hovered, setHovered] = useState(false);
    const [cancelBusy, setCancelBusy] = useState(false);

    async function handleCancel() {
        setCancelBusy(true);
        await onCancel();
        setCancelBusy(false);
    }

    return (
        <div
            id={`token-card-${token.id}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: hovered ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                border: `1px solid ${hovered ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: '14px', overflow: 'hidden',
                transition: 'all 0.2s ease',
                boxShadow: hovered ? '0 8px 28px rgba(0,0,0,0.5)' : 'none',
                transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
            }}
        >
            {/* Thumbnail */}
            <div style={{ position: 'relative', height: '150px', overflow: 'hidden', background: '#1a1a1a' }}>
                {token.resource_thumbnail && (
                    <img
                        src={getMediaUrl(token.resource_thumbnail)}
                        alt={token.resource_title}
                        style={{
                            width: '100%', height: '100%', objectFit: 'cover',
                            transition: 'transform 0.3s ease',
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
                {/* Listed badge */}
                {token.is_listed_for_resale && (
                    <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                        <span style={{
                            background: 'rgba(34,197,94,0.85)', color: '#000',
                            fontSize: '10px', fontWeight: 700,
                            padding: '2px 8px', borderRadius: '99px',
                        }}>Listed ₹{token.resale_price}</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div style={{ padding: '14px 16px' }}>
                {/* Resource name — clickable */}
                <p
                    onClick={onViewResource}
                    style={{
                        color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600,
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                        margin: '0 0 3px', cursor: 'pointer',
                    }}
                >{token.resource_title}</p>

                <h3 style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600, margin: '0 0 6px' }}>
                    Token #{token.token_number} of {token.max_supply}
                </h3>

                {/* Meta row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                        Minted {new Date(token.minted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600 }}>
                        Paid ₹{token.paid_amount}
                    </span>
                </div>

                {/* Download button */}
                <a
                    id={`download-${token.id}`}
                    href={`http://127.0.0.1:8000${token.resource_file}`}
                    download
                    onMouseEnter={e => { e.currentTarget.style.background = '#e4e4e7'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(255,255,255,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                    style={{
                        display: 'block', textAlign: 'center',
                        padding: '9px', background: '#ffffff',
                        color: '#000000', borderRadius: '8px',
                        textDecoration: 'none', fontSize: '14px',
                        fontWeight: 600, fontFamily: 'var(--font)',
                        transition: 'all 0.15s ease', marginBottom: '8px',
                    }}
                >↓ Download</a>

                {/* List / Cancel button */}
                {token.is_listed_for_resale ? (
                    <button
                        id={`cancel-listing-${token.id}`}
                        onClick={handleCancel}
                        disabled={cancelBusy}
                        onMouseEnter={e => { if (!cancelBusy) { e.currentTarget.style.background = 'rgba(239,68,68,0.22)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'; e.currentTarget.style.color = '#f87171'; } }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; e.currentTarget.style.color = '#fca5a5'; }}
                        style={{
                            width: '100%', padding: '8px',
                            background: 'rgba(239,68,68,0.08)', color: '#fca5a5',
                            border: '1px solid rgba(239,68,68,0.2)',
                            borderRadius: '8px', cursor: cancelBusy ? 'not-allowed' : 'pointer',
                            fontWeight: 600, fontSize: '13px',
                            fontFamily: 'var(--font)', transition: 'all 0.15s ease',
                        }}
                    >{cancelBusy ? 'Cancelling…' : '✕ Cancel Listing'}</button>
                ) : (
                    <button
                        id={`list-resale-${token.id}`}
                        onClick={onList}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(167,139,250,0.2)'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.45)'; e.currentTarget.style.boxShadow = '0 0 14px rgba(167,139,250,0.25)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(167,139,250,0.08)'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.25)'; e.currentTarget.style.boxShadow = 'none'; }}
                        style={{
                            width: '100%', padding: '8px',
                            background: 'rgba(167,139,250,0.08)', color: '#a78bfa',
                            border: '1px solid rgba(167,139,250,0.25)',
                            borderRadius: '8px', cursor: 'pointer',
                            fontWeight: 600, fontSize: '13px',
                            fontFamily: 'var(--font)', transition: 'all 0.15s ease',
                        }}
                    >⬡ List for Resale</button>
                )}
            </div>
        </div>
    );
}

export default LibraryPage;