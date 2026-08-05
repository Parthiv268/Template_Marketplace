import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function WishlistPage() {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadWishlist();
    }, []);

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
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ resource: resourceId }),
            });
            setWishlist(prev => prev.filter(item => item.resource !== resourceId));
        } catch (err) {
            console.log('Remove error:', err);
        }
    }

    if (loading) return <p style={{ padding: '24px' }}>Loading wishlist...</p>;

    return (
        <div style={{ padding: '24px' }}>
            <h2>My Wishlist</h2>

            {wishlist.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <p style={{ color: '#6b7280', fontSize: '16px' }}>Your wishlist is empty.</p>
                    <button
                        onClick={() => navigate('/marketplace')}
                        style={{ marginTop: '16px', padding: '10px 24px', background: '#1a56db', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
                        Browse Marketplace
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px', marginTop: '16px' }}>
                    {wishlist.map(item => (
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
                                <p style={{ fontWeight: 'bold', margin: '0 0 12px' }}>₹{item.resource_price}</p>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => navigate(`/resources/${item.resource}`)}
                                        style={{ flex: 1, padding: '8px', background: '#1a56db', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
                                    >
                                        View
                                    </button>
                                    <button
                                        onClick={() => removeFromWishlist(item.resource)}
                                        style={{ flex: 1, padding: '8px', background: 'white', color: '#dc2626', border: '1px solid #dc2626', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default WishlistPage;
// some doubts on how the things are being removed in the wishlist like when does item get its name.