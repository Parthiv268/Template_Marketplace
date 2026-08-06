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
            <span>Loading resources…</span>
        </div>
    );

    return (
        /* CHANGES TO FRONTEND — MarketplacePage: dark page wrapper */
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-page)',
            padding: '40px 32px',
            fontFamily: 'var(--font)',
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* CHANGES TO FRONTEND — MarketplacePage: page header */}
                <h1 style={{
                    fontSize: '30px', fontWeight: 800,
                    color: 'var(--text-primary)', margin: '0 0 6px',
                    letterSpacing: '-0.02em',
                }}>Marketplace</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>
                    Browse and acquire developer assets from creators worldwide.
                </p>

                {/* CHANGES TO FRONTEND — MarketplacePage: dark search + filter bar */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                    <input
                        id="marketplace-search"
                        className="input"
                        placeholder="Search resources…"
                        value={search}
                        onChange={handleSearch}
                        style={{ flex: 1 }}
                    />
                    <select
                        id="marketplace-category"
                        value={selectedCategory}
                        onChange={handleCategory}
                        style={{
                            padding: '10px 14px',
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border-default)',
                            borderRadius: 'var(--radius-md)',
                            color: selectedCategory ? 'var(--text-primary)' : 'var(--text-muted)',
                            fontFamily: 'var(--font)',
                            fontSize: '14px',
                            cursor: 'pointer',
                            outline: 'none',
                            transition: 'border-color 0.15s',
                        }}
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                {resources.length === 0 ? (
                    <div className="empty-state">
                        <h3>No resources found</h3>
                        <p>Try adjusting your search or category filter.</p>
                    </div>
                ) : (
                    /* CHANGES TO FRONTEND — MarketplacePage: card grid */
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '20px',
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

/* CHANGES TO FRONTEND — MarketplacePage: card with full hover effects */
function ResourceCard({ resource, onClick }) {
    const [hovered, setHovered] = useState(false);
    const minted = resource.tokens_minted ?? 0;
    const maxSupply = resource.max_supply ?? 50;
    const supplyPct = maxSupply > 0 ? Math.min((minted / maxSupply) * 100, 100) : 0;
    const soldOut = minted >= maxSupply;

    return (
        <div
            id={`resource-card-${resource.id}`}
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: hovered ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                border: `1px solid ${hovered ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: '14px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.5)' : '0 1px 4px rgba(0,0,0,0.3)',
                transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
            }}
        >
            {/* CHANGES TO FRONTEND — MarketplacePage: thumbnail with zoom and badge overlay */}
            <div style={{ position: 'relative', height: '160px', overflow: 'hidden', background: '#1a1a1a' }}>
                <img
                    src={`http://127.0.0.1:8000${resource.thumbnail}`}
                    alt={resource.title}
                    style={{
                        width: '100%', height: '100%', objectFit: 'cover',
                        transition: 'transform 0.35s ease',
                        transform: hovered ? 'scale(1.06)' : 'scale(1)',
                    }}
                    onError={e => e.target.style.display = 'none'}
                />
                {/* Supply badge overlay */}
                <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                    {soldOut ? (
                        <span style={{
                            display: 'inline-block', padding: '2px 10px',
                            background: 'rgba(245,158,11,0.9)', color: '#000',
                            borderRadius: '99px', fontSize: '11px', fontWeight: 700,
                        }}>🔥 Sold Out</span>
                    ) : (
                        <span style={{
                            display: 'inline-block', padding: '2px 10px',
                            background: 'rgba(0,0,0,0.65)', color: '#fff',
                            borderRadius: '99px', fontSize: '11px', fontWeight: 600,
                            backdropFilter: 'blur(4px)',
                        }}>
                            {maxSupply - minted} left
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '16px' }}>
                {/* CHANGES TO FRONTEND — MarketplacePage: category label */}
                <p style={{
                    color: 'var(--text-muted)', fontSize: '11px',
                    fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px',
                    marginBottom: '4px',
                }}>{resource.category_name}</p>

                <h3 style={{
                    color: 'var(--text-primary)', fontSize: '15px',
                    fontWeight: 600, margin: '0 0 10px', lineHeight: 1.3,
                }}>{resource.title}</h3>

                {/* CHANGES TO FRONTEND — MarketplacePage: supply bar */}
                <div style={{
                    background: 'rgba(255,255,255,0.07)',
                    borderRadius: '99px', height: '3px',
                    marginBottom: '12px', overflow: 'hidden',
                }}>
                    <div style={{
                        width: `${supplyPct}%`, height: '100%',
                        background: soldOut
                            ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                            : 'rgba(255,255,255,0.45)',
                        borderRadius: '99px',
                        transition: 'width 0.5s ease',
                    }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '17px' }}>₹{resource.price}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>by {resource.owner_username}</span>
                </div>
            </div>
        </div>
    );
}

export default MarketplacePage;