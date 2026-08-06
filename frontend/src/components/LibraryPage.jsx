/* ============================================================
   CHANGES TO FRONTEND — LibraryPage
   - Dark page background and card surfaces (unchanged)
   - Thumbnail image scales on card hover (unchanged)
   - Download button: white with black text, lift on hover (unchanged)
   - NEW: Two tabs — "Acquired Resources" and "My NFT Tokens"
   - NFT tab shows all tokens the user owns with:
       * "List for Resale" → opens a price-input modal
       * "Cancel Listing"  → de-lists the token from secondary market
       * Listed badge + resale price shown when already listed
   ============================================================ */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listTokenForResale, cancelResaleListing, getMyNFTTokens } from '../api.js';

function LibraryPage() {
    const [library, setLibrary] = useState([]);
    const [myTokens, setMyTokens] = useState([]);
    const [tab, setTab] = useState('resources');    // 'resources' | 'nfts'
    const [loading, setLoading] = useState(true);
    const [tokenLoading, setTokenLoading] = useState(false);

    /* List-for-resale modal state */
    const [listTarget, setListTarget] = useState(null);
    const [listPrice, setListPrice] = useState('');
    const [listError, setListError] = useState('');
    const [listBusy, setListBusy] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        async function loadLibrary() {
            try {
                const token = localStorage.getItem('access');
                const res = await fetch('http://127.0.0.1:8000/api/resources/library/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (Array.isArray(data)) setLibrary(data);
            } catch (err) {
                console.log('Library error:', err);
            } finally {
                setLoading(false);
            }
        }
        loadLibrary();
    }, []);

    /* Load NFT tokens when switching to the NFT tab */
    useEffect(() => {
        if (tab !== 'nfts' || myTokens.length > 0) return;
        setTokenLoading(true);
        getMyNFTTokens()
            .then(data => setMyTokens(Array.isArray(data) ? data : []))
            .catch(err => console.log('Token load error:', err))
            .finally(() => setTokenLoading(false));
    }, [tab]);

    /* Handle listing a token for resale */
    async function handleListForResale() {
        const price = parseFloat(listPrice);
        if (!price || price <= 0) { setListError('Enter a valid price greater than 0.'); return; }
        setListBusy(true);
        setListError('');
        try {
            await listTokenForResale(listTarget.id, price);
            // Refresh tokens list
            const fresh = await getMyNFTTokens();
            setMyTokens(Array.isArray(fresh) ? fresh : []);
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
            const fresh = await getMyNFTTokens();
            setMyTokens(Array.isArray(fresh) ? fresh : []);
        } catch (err) {
            console.log('Cancel listing error:', err);
            alert(err?.error || 'Could not cancel listing.');
        }
    }

    /* Tab button style helper */
    const tabStyle = (active) => ({
        padding: '8px 20px',
        background: active ? '#ffffff' : 'transparent',
        color: active ? '#000000' : 'var(--text-muted)',
        border: active ? 'none' : '1px solid var(--border-default)',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: active ? 700 : 500,
        fontSize: '13px',
        fontFamily: 'var(--font)',
        transition: 'all 0.15s ease',
    });

    if (loading) return (
        <div className="page-loading">
            <div className="spinner" />
            <span>Loading library…</span>
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
                <h1 style={{
                    fontSize: '28px', fontWeight: 800,
                    color: 'var(--text-primary)', margin: '0 0 6px',
                    letterSpacing: '-0.02em',
                }}>My Library</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                    Your acquired resources and NFT token collection.
                </p>

                {/* CHANGES TO FRONTEND — LibraryPage: tab switcher */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
                    <button
                        id="tab-resources"
                        style={tabStyle(tab === 'resources')}
                        onClick={() => setTab('resources')}
                        onMouseEnter={e => { if (tab !== 'resources') { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; } }}
                        onMouseLeave={e => { if (tab !== 'resources') { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-default)'; } }}
                    >
                        Acquired Resources {library.length > 0 && `(${library.length})`}
                    </button>
                    <button
                        id="tab-nfts"
                        style={tabStyle(tab === 'nfts')}
                        onClick={() => setTab('nfts')}
                        onMouseEnter={e => { if (tab !== 'nfts') { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; } }}
                        onMouseLeave={e => { if (tab !== 'nfts') { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-default)'; } }}
                    >
                        ⬡ My NFT Tokens {myTokens.length > 0 && `(${myTokens.length})`}
                    </button>
                </div>

                {/* ── Resources tab ── */}
                {tab === 'resources' && (
                    library.length === 0 ? (
                        <div className="empty-state">
                            <h3>Your library is empty</h3>
                            <p>Acquire resources from the marketplace to see them here.</p>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '20px',
                        }}>
                            {library.map(item => <LibraryCard key={item.id} item={item} />)}
                        </div>
                    )
                )}

                {/* ── NFT Tokens tab ── */}
                {tab === 'nfts' && (
                    tokenLoading ? (
                        <div className="page-loading" style={{ minHeight: '200px' }}>
                            <div className="spinner" />
                            <span>Loading tokens…</span>
                        </div>
                    ) : myTokens.length === 0 ? (
                        <div className="empty-state">
                            <div style={{ fontSize: '36px', marginBottom: '12px' }}>⬡</div>
                            <h3>No NFT tokens yet</h3>
                            <p>Buy a resource from the marketplace to mint your first token.</p>
                            <button
                                onClick={() => navigate('/marketplace')}
                                onMouseEnter={e => { e.currentTarget.style.background = '#e4e4e7'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                style={{
                                    marginTop: '16px', padding: '10px 24px',
                                    background: '#ffffff', color: '#000000',
                                    border: 'none', borderRadius: '10px',
                                    cursor: 'pointer', fontWeight: 700,
                                    fontSize: '14px', fontFamily: 'var(--font)',
                                    transition: 'all 0.15s ease',
                                }}
                            >Browse Marketplace</button>
                        </div>
                    ) : (
                        /* CHANGES TO FRONTEND — LibraryPage: NFT token grid */
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '20px',
                        }}>
                            {myTokens.map(token => (
                                <NFTTokenCard
                                    key={token.id}
                                    token={token}
                                    onList={() => { setListTarget(token); setListPrice(''); setListError(''); }}
                                    onCancel={() => handleCancelListing(token)}
                                    onViewResource={() => navigate(`/resources/${token.resource}`)}
                                />
                            ))}
                        </div>
                    )
                )}
            </div>

            {/* CHANGES TO FRONTEND — LibraryPage: List for Resale modal */}
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
                            {listTarget.resource_title} &nbsp;·&nbsp; Token #{listTarget.token_number}
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '0 0 20px', lineHeight: 1.5 }}>
                            {listTarget.royalty_percent}% of the sale price will go to the original creator as royalty.
                        </p>

                        {/* Price input */}
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
                                    <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Creator gets ({listTarget.royalty_percent}%)</span>
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
                                    fontFamily: 'var(--font)',
                                    transition: 'all 0.15s ease',
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

/* Existing acquired-resource card — unchanged logic, dark theme */
function LibraryCard({ item }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            id={`library-card-${item.id}`}
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
            <div style={{ height: '160px', overflow: 'hidden' }}>
                <img
                    src={item.thumbnail}
                    alt={item.resource_title}
                    style={{
                        width: '100%', height: '100%', objectFit: 'cover',
                        transition: 'transform 0.3s ease',
                        transform: hovered ? 'scale(1.05)' : 'scale(1)',
                    }}
                    onError={e => e.target.style.display = 'none'}
                />
            </div>
            <div style={{ padding: '16px' }}>
                <h3 style={{ color: 'var(--text-primary)', margin: '0 0 6px', fontSize: '15px', fontWeight: 600 }}>
                    {item.resource_title}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '0 0 14px' }}>
                    Acquired {new Date(item.acquired_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <a
                    id={`download-${item.id}`}
                    href={item.file}
                    download
                    onMouseEnter={e => { e.currentTarget.style.background = '#e4e4e7'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(255,255,255,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                    style={{
                        display: 'block', textAlign: 'center',
                        padding: '9px', background: '#ffffff',
                        color: '#000000', borderRadius: '8px',
                        textDecoration: 'none', fontSize: '14px',
                        fontWeight: 600, fontFamily: 'var(--font)',
                        transition: 'all 0.15s ease',
                    }}
                >↓ Download</a>
            </div>
        </div>
    );
}

/* CHANGES TO FRONTEND — LibraryPage: NEW NFT token card with list/cancel actions */
function NFTTokenCard({ token, onList, onCancel, onViewResource }) {
    const [hovered, setHovered] = useState(false);
    const [cancelBusy, setCancelBusy] = useState(false);

    async function handleCancel() {
        setCancelBusy(true);
        await onCancel();
        setCancelBusy(false);
    }

    return (
        <div
            id={`nft-token-card-${token.id}`}
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
            <div style={{ position: 'relative', height: '140px', overflow: 'hidden', background: '#1a1a1a' }}>
                <img
                    src={`http://127.0.0.1:8000${token.resource_thumbnail}`}
                    alt={token.resource_title}
                    style={{
                        width: '100%', height: '100%', objectFit: 'cover',
                        transition: 'transform 0.3s ease',
                        transform: hovered ? 'scale(1.05)' : 'scale(1)',
                    }}
                    onError={e => e.target.style.display = 'none'}
                />
                {/* Token badge */}
                <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                    <span style={{
                        background: 'rgba(0,0,0,0.7)', color: '#a78bfa',
                        backdropFilter: 'blur(4px)', fontSize: '11px',
                        fontWeight: 700, padding: '2px 9px', borderRadius: '99px',
                        border: '1px solid rgba(167,139,250,0.3)',
                    }}>⬡ #{token.token_number}</span>
                </div>
                {/* Listed for resale badge */}
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
                <p
                    onClick={onViewResource}
                    style={{
                        color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600,
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                        margin: '0 0 3px', cursor: 'pointer',
                    }}
                >{token.resource_title}</p>
                <h3 style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600, margin: '0 0 4px' }}>
                    Token #{token.token_number} of {token.max_supply}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '0 0 14px' }}>
                    {token.royalty_percent}% royalty on resale
                </p>

                {/* Action buttons */}
                {token.is_listed_for_resale ? (
                    /* Token is already listed — show Cancel button */
                    <button
                        id={`cancel-listing-${token.id}`}
                        onClick={handleCancel}
                        disabled={cancelBusy}
                        onMouseEnter={e => { if (!cancelBusy) { e.currentTarget.style.background = 'rgba(239,68,68,0.22)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'; e.currentTarget.style.color = '#f87171'; } }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; e.currentTarget.style.color = '#fca5a5'; }}
                        style={{
                            width: '100%', padding: '9px',
                            background: 'rgba(239,68,68,0.08)', color: '#fca5a5',
                            border: '1px solid rgba(239,68,68,0.2)',
                            borderRadius: '8px', cursor: cancelBusy ? 'not-allowed' : 'pointer',
                            fontWeight: 600, fontSize: '13px',
                            fontFamily: 'var(--font)', transition: 'all 0.15s ease',
                        }}
                    >
                        {cancelBusy ? 'Cancelling…' : '✕ Cancel Listing'}
                    </button>
                ) : (
                    /* Token is not listed — show List for Resale button */
                    <button
                        id={`list-resale-${token.id}`}
                        onClick={onList}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(167,139,250,0.2)'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.45)'; e.currentTarget.style.boxShadow = '0 0 14px rgba(167,139,250,0.25)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(167,139,250,0.08)'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.25)'; e.currentTarget.style.boxShadow = 'none'; }}
                        style={{
                            width: '100%', padding: '9px',
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
// how is download working in the library page that is still not very clear to me