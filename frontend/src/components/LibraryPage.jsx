/* ============================================================
   CHANGES TO FRONTEND — LibraryPage
   - Dark page background and card surfaces
   - Thumbnail image scales on card hover
   - Download button: white with black text, lift on hover
   - Acquired date styled as muted row
   - Empty state updated to dark palette with action button
   ============================================================ */

import { useState, useEffect } from 'react';

function LibraryPage() {
    const [library, setLibrary] = useState([]);
    const [loading, setLoading] = useState(true);

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

    /* CHANGES TO FRONTEND — LibraryPage: dark loading state */
    if (loading) return (
        <div className="page-loading">
            <div className="spinner" />
            <span>Loading library…</span>
        </div>
    );

    return (
        /* CHANGES TO FRONTEND — LibraryPage: dark page wrapper */
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-page)',
            padding: '40px 32px',
            fontFamily: 'var(--font)',
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* CHANGES TO FRONTEND — LibraryPage: page header */}
                <h1 style={{
                    fontSize: '28px', fontWeight: 800,
                    color: 'var(--text-primary)', margin: '0 0 6px',
                    letterSpacing: '-0.02em',
                }}>My Library</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>
                    Resources you have acquired. Download them any time.
                </p>

                {/* CHANGES TO FRONTEND — LibraryPage: empty state */}
                {library.length === 0 ? (
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
                )}
            </div>
        </div>
    );
}

/* CHANGES TO FRONTEND — LibraryPage: card with hover lift and image zoom */
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
            {/* CHANGES TO FRONTEND — LibraryPage: image zoom on hover */}
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
                {/* CHANGES TO FRONTEND — LibraryPage: download button with hover lift */}
                <a
                    id={`download-${item.id}`}
                    href={item.file}
                    download
                    onMouseEnter={e => {
                        e.currentTarget.style.background = '#e4e4e7';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(255,255,255,0.1)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = '#ffffff';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                    style={{
                        display: 'block', textAlign: 'center',
                        padding: '9px', background: '#ffffff',
                        color: '#000000', borderRadius: '8px',
                        textDecoration: 'none', fontSize: '14px',
                        fontWeight: 600, fontFamily: 'var(--font)',
                        transition: 'all 0.15s ease',
                    }}
                >
                    ↓ Download
                </a>
            </div>
        </div>
    );
}

export default LibraryPage;
// how is download working in the library page that is still not very clear to me