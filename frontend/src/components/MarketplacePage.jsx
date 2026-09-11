/* ============================================================
   CHANGES TO FRONTEND — MarketplacePage
   - Full black & white theme: #0a0a0a page bg, #111 cards
   - Search input and category select styled dark with CSS vars
   - Resource cards: dark surface, white text, glow + lift on hover
   - Thumbnail scales on hover for depth
   - NFT supply bar overlaid on each card
   - Supply badge (remaining / sold out) on image overlay
   - Category label in muted uppercase above title
   ============================================================ */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMediaUrl } from '../api.js';

/* Performance: debounce hook — delays calling fn until user stops typing */
function useDebounce(value, delay) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}

function MarketplacePage() {
    const [resources, setResources] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    /* Performance: only call the API after user pauses typing for 300ms */
    const debouncedSearch = useDebounce(search, 300);

    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/resources/categories/')
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setCategories(data); })
            .catch(err => console.log('Categories error:', err));
        fetchResources('', '');
    }, []);

    /* Performance: re-fetch only when debounced value or category changes */
    useEffect(() => {
        fetchResources(debouncedSearch, selectedCategory);
    }, [debouncedSearch, selectedCategory]);

    const fetchResources = (searchTerm, category) => {
        let url = 'http://127.0.0.1:8000/api/resources/?';
        if (searchTerm) url += `search=${searchTerm}&`;
        if (category)   url += `category=${category}`;
        fetch(url)
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setResources(data); setLoading(false); })
            .catch(err => { console.log('Resources error:', err); setLoading(false); });
    };

    const handleSearch   = (e) => { setSearch(e.target.value); };
    const handleCategory = (e) => { setSelectedCategory(e.target.value); };

    /* CHANGES TO FRONTEND — MarketplacePage: dark loading state */
    if (loading) return (
        <div className="page-loading">
            <div className="spinner" />
            <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font)' }}>Scanning quantum registry…</span>
        </div>
    );

    return (
        /* CHANGES TO FRONTEND — MarketplacePage: Futuristic Glassmorphic Container */
        <div style={{
            minHeight: '100vh',
            padding: '32px 24px 80px',
            fontFamily: 'var(--font)',
        }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

                {/* CHANGES TO FRONTEND — MarketplacePage: Cinematic Hero Banner */}
                <div className="glass-panel" style={{
                    padding: '48px 40px',
                    borderRadius: '24px',
                    marginBottom: '36px',
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, rgba(15, 17, 26, 0.85) 0%, rgba(25, 28, 44, 0.6) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                }}>
                    <div style={{
                        position: 'absolute', top: '-50%', right: '-10%',
                        width: '400px', height: '400px', borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(124, 58, 237, 0.25) 0%, transparent 70%)',
                        pointerEvents: 'none', filter: 'blur(60px)',
                    }} />

                    <span className="badge-neon" style={{ marginBottom: '16px' }}>
                        ❖ QUANTUM ASSETS & NFT REGISTRY
                    </span>
                    
                    <h1 className="font-heading" style={{
                        fontSize: '38px', fontWeight: 800,
                        color: '#ffffff', margin: '0 0 12px',
                        letterSpacing: '-0.03em', lineHeight: 1.2,
                    }}>
                        Discover Next-Gen <span className="text-gradient-neon">Digital Assets</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '640px', marginBottom: '32px' }}>
                        Acquire verified software templates, code collections, and digital NFTs backed by immutable ownership proof.
                    </p>

                    {/* CHANGES TO FRONTEND — MarketplacePage: Glassmorphism Search & Filter Bar */}
                    <div style={{
                        display: 'flex', gap: '12px', flexWrap: 'wrap',
                        background: 'rgba(8, 8, 12, 0.6)',
                        padding: '8px', borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                        maxWidth: '720px',
                    }}>
                        <input
                            id="marketplace-search"
                            className="glass-input"
                            placeholder="🔍 Search templates, code, creators…"
                            value={search}
                            onChange={handleSearch}
                            style={{ flex: 1, minWidth: '220px', border: 'none', background: 'transparent' }}
                        />
                        <select
                            id="marketplace-category"
                            value={selectedCategory}
                            onChange={handleCategory}
                            style={{
                                padding: '10px 18px',
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                borderRadius: '10px',
                                color: '#ffffff',
                                fontFamily: 'var(--font)',
                                fontSize: '13px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                outline: 'none',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <option value="" style={{ background: '#0f111a', color: '#fff' }}>All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id} style={{ background: '#0f111a', color: '#fff' }}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* CHANGES TO FRONTEND — MarketplacePage: Category Quick Filter Pills */}
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '28px' }}>
                    <button
                        onClick={() => setSelectedCategory('')}
                        style={{
                            padding: '7px 18px', borderRadius: '99px', border: 'none', cursor: 'pointer',
                            fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font)',
                            background: !selectedCategory ? 'var(--accent-gradient)' : 'rgba(255, 255, 255, 0.06)',
                            color: !selectedCategory ? '#ffffff' : 'var(--text-secondary)',
                            boxShadow: !selectedCategory ? '0 0 15px rgba(124, 58, 237, 0.4)' : 'none',
                            transition: 'all 0.2s ease', whiteSpace: 'nowrap',
                        }}
                    >All Assets ({resources.length})</button>
                    {categories.map(cat => {
                        const active = String(selectedCategory) === String(cat.id);
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(active ? '' : String(cat.id))}
                                style={{
                                    padding: '7px 18px', borderRadius: '99px', border: 'none', cursor: 'pointer',
                                    fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font)',
                                    background: active ? 'var(--accent-gradient)' : 'rgba(255, 255, 255, 0.06)',
                                    color: active ? '#ffffff' : 'var(--text-secondary)',
                                    boxShadow: active ? '0 0 15px rgba(124, 58, 237, 0.4)' : 'none',
                                    transition: 'all 0.2s ease', whiteSpace: 'nowrap',
                                }}
                            >{cat.name}</button>
                        );
                    })}
                </div>

                {resources.length === 0 ? (
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '80px 24px', borderRadius: '20px' }}>
                        <h3 className="font-heading" style={{ fontSize: '20px', color: '#fff', marginBottom: '8px' }}>No Quantum Assets Found</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Try adjusting your search query or category filter.</p>
                    </div>
                ) : (
                    /* CHANGES TO FRONTEND — MarketplacePage: Glassmorphism Card Grid */
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                        gap: '24px',
                    }}>
                        {resources.map(resource => (
                            <ResourceCard
                                key={resource.id}
                                resource={resource}
                                onClick={() => navigate(`/resources/${resource.id}`)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

/* CHANGES TO FRONTEND — MarketplacePage: Futuristic Glass Resource Card */
function ResourceCard({ resource, onClick }) {
    const [hovered, setHovered] = useState(false);
    const minted = resource.tokens_minted ?? 0;
    const maxSupply = resource.max_supply ?? 50;
    const supplyPct = maxSupply > 0 ? Math.min((minted / maxSupply) * 100, 100) : 0;
    const soldOut = minted >= maxSupply;

    return (
        <div
            id={`resource-card-${resource.id}`}
            className="glass-card"
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{ cursor: 'pointer' }}
        >
            {/* CHANGES TO FRONTEND — MarketplacePage: thumbnail with smooth scale & supply badge overlay */}
            <div className="img-hover-zoom" style={{ position: 'relative', height: '180px', background: '#0b0c14' }}>
                {resource.thumbnail && (
                    <img
                        src={getMediaUrl(resource.thumbnail)}
                        alt={resource.title}
                    />
                )}
                {/* Supply badge overlay */}
                <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 2 }}>
                    {resource.is_selling_paused ? (
                        <span style={{
                            padding: '3px 10px', background: 'rgba(239, 68, 68, 0.9)', color: '#fff',
                            borderRadius: '99px', fontSize: '11px', fontWeight: 700, backdropFilter: 'blur(6px)',
                        }}>🛑 Paused</span>
                    ) : soldOut ? (
                        <span style={{
                            padding: '3px 10px', background: 'rgba(245, 158, 11, 0.9)', color: '#000',
                            borderRadius: '99px', fontSize: '11px', fontWeight: 800, backdropFilter: 'blur(6px)',
                        }}>🔥 Sold Out</span>
                    ) : (
                        <span style={{
                            padding: '3px 10px', background: 'rgba(10, 11, 18, 0.75)', color: '#38bdf8',
                            border: '1px solid rgba(56, 189, 248, 0.3)',
                            borderRadius: '99px', fontSize: '11px', fontWeight: 700, backdropFilter: 'blur(6px)',
                        }}>
                            {maxSupply - minted} / {maxSupply} left
                        </span>
                    )}
                </div>

                <div style={{
                    position: 'absolute', bottom: '10px', right: '12px', zIndex: 2,
                    background: 'rgba(10, 11, 18, 0.8)', padding: '3px 10px', borderRadius: '99px',
                    fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', backdropFilter: 'blur(4px)',
                }}>
                    NFT Verified
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '20px' }}>
                <p style={{
                    color: '#a855f7', fontSize: '11px',
                    fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px',
                    marginBottom: '6px',
                }}>{resource.category_name || 'Asset'}</p>

                <h3 className="font-heading" style={{
                    color: '#ffffff', fontSize: '16px',
                    fontWeight: 700, margin: '0 0 12px', lineHeight: 1.35,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{resource.title}</h3>

                {/* CHANGES TO FRONTEND — MarketplacePage: Neon gradient supply bar */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '99px', height: '4px',
                    marginBottom: '16px', overflow: 'hidden',
                }}>
                    <div style={{
                        width: `${supplyPct}%`, height: '100%',
                        background: soldOut
                            ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                            : 'linear-gradient(90deg, #7c3aed, #06b6d4)',
                        borderRadius: '99px',
                        transition: 'width 0.5s ease',
                        boxShadow: '0 0 8px #06b6d4',
                    }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block' }}>PRICE</span>
                        <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '18px' }}>₹{parseFloat(resource.price).toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block' }}>CREATOR</span>
                        <span style={{ fontSize: '13px', color: '#60a5fa', fontWeight: 600 }}>@{resource.owner_username}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MarketplacePage;