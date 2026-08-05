import { useState, useEffect } from 'react';
import { useParams, useNavigate, redirect } from 'react-router-dom';

function ResourceDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [resource, setResource] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch(`http://127.0.0.1:8000/api/resources/${id}/`)
            .then(res => {
                if (!res.ok) throw new Error('Resource not found');
                return res.json();
            })
            .then(data => {
                setResource(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <p style={{ padding: '24px' }}>Loading...</p>;
    if (error) return (
        <div style={{ padding: '24px' }}>
            <p style={{ color: 'red' }}>{error}</p>
            <button onClick={() => navigate('/marketplace')}>Back to Marketplace</button>
        </div>
    );
    async function handleWishlist() {
        const token = localStorage.getItem('access');
        if (!token) {
            alert('Please log in to add to wishlist.');
            return;
        }

        try {
            const res = await fetch('http://127.0.0.1:8000/api/resources/wishlist/', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ resource: resource.id }),
            });

            const data = await res.json();

            if (res.ok) {
                alert('Added to wishlist!');
            } else if (res.status === 400) {
                alert('Already in your wishlist.');
            } else {
                alert('Could not add to wishlist.');
            }
        } catch (err) {
            console.log('Wishlist error:', err);
            alert('Something went wrong.');
        }
    }
    async function handleAcquire() {
        const token = localStorage.getItem('access');
        if (!token) {
            alert('Please log in to acquire resources.');
            return;
        }

        try {
            const res = await fetch('http://127.0.0.1:8000/api/payments/create-order/', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ resource_id: resource.id }),
            });

            const orderData = await res.json();

            if (!res.ok) {
                alert(orderData.error || 'Could not create order.');
                return;
            }

            const options = {
                key: orderData.key,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'DevVault',
                description: orderData.resource_title,
                order_id: orderData.order_id,
                redirect: false,
                handler: async function (response) {
                    console.log(response)
                    console.log('Resource ID being sent:', resource.id);
                    const verifyRes = await fetch('http://127.0.0.1:8000/api/payments/verify/', {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            resource_id: resource.id,
                        }),

                    });

                    const verifyData = await verifyRes.json();
                    if (verifyData.success) {
                        alert('Payment successful! Resource added to your library.');
                        navigate('/library');
                    } else {
                        alert('Payment verification failed. Contact support.');
                    }
                },
                prefill: {
                    name: 'Test User',
                    email: 'test@example.com',
                    contact: '9999999999', // 10-digit Indian number forces UPI to display
                },
                theme: { color: '#1a56db' },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            console.log('Payment error:', err);
            alert('Something went wrong. Please try again.');
        }
    }

    return (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <button
                onClick={() => navigate('/marketplace')}
                style={{ marginBottom: '16px', background: 'none', border: '1px solid #ccc', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer' }}
            >
                ← Back to Marketplace
            </button>

            {resource.thumbnail && (
                <img
                    // src={`http://127.0.0.1:8000/media/${resource.thumbnail}`}
                    src={resource.thumbnail}
                    alt={resource.title}
                    style={{ width: '100%', maxHeight: '350px', objectFit: 'cover', borderRadius: '10px', marginBottom: '24px' }}
                />
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2 style={{ margin: '0 0 8px' }}>{resource.title}</h2>
                    <p style={{ color: '#6b7280', margin: '0 0 4px' }}>
                        Category: {resource.category_name}
                    </p>
                    <p style={{ color: '#6b7280', margin: '0' }}>
                        By: {resource.owner_username}
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 4px' }}>
                        ₹{resource.price}
                    </p>
                    <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0' }}>
                        {resource.max_supply} licences available
                    </p>
                </div>
            </div>

            <hr style={{ margin: '20px 0', borderColor: '#e5e7eb' }} />

            <h3>Description</h3>
            <p style={{ color: '#374151', lineHeight: '1.6' }}>{resource.description}</p>

            {resource.token_id && (
                <div style={{
                    margin: '20px 0',
                    padding: '14px',
                    background: '#ede9fe',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span style={{ color: '#7c3aed', fontWeight: '500' }}>
                        NFT Token #{resource.token_id}
                    </span>

                    href={`https://sepolia.etherscan.io/token/${resource.token_id}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#7c3aed', fontSize: '13px' }}
                    <a>
                        View on Etherscan →
                    </a>
                </div>
            )
            }
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                    onClick={handleAcquire}
                    style={{
                        marginTop: '24px',
                        width: '100%',
                        padding: '14px',
                        background: '#1a56db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '500',
                        cursor: 'pointer'
                    }}
                >
                    Acquire for ₹{resource.price}
                </button>
                <button
                    onClick={handleWishlist}
                    style={{
                        flex: 1,
                        padding: '14px',
                        background: 'white',
                        color: '#1a56db',
                        border: '2px solid #1a56db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '500',
                        cursor: 'pointer'
                    }}
                >
                    ♡ Wishlist
                </button>
            </div>
        </div>
    );
}

export default ResourceDetailPage;