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

    if (loading) return <p style={{ padding: '24px' }}>Loading library...</p>;

    return (
        <div style={{ padding: '24px' }}>
            <h2>My Library</h2>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>Resources you have acquired and can download.</p>

            {library.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <p style={{ color: '#6b7280' }}>You haven't acquired any resources yet.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {library.map(item => (
                        <div
                            key={item.id}
                            style={{ border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden', background: 'white' }}
                        >
                            <img
                                src={item.thumbnail}
                                alt={item.resource_title}
                                style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                                onError={e => e.target.style.display = 'none'}
                            />
                            <div style={{ padding: '14px' }}>
                                <h3 style={{ margin: '0 0 4px', fontSize: '15px' }}>{item.resource_title}</h3>
                                <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 12px' }}>
                                    Acquired: {new Date(item.acquired_at).toLocaleDateString()}
                                </p>
                                <a
                                    href={item.file}
                                    download
                                    style={{
                                        display: 'block',
                                        textAlign: 'center',
                                        padding: '10px',
                                        background: '#059669',
                                        color: 'white',
                                        borderRadius: '6px',
                                        textDecoration: 'none',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }}
                                >
                                    Download File
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default LibraryPage;
// how is download working in the library page that is still not very clear to me