import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function MarketplacePage() {
    const [resources, setResources] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/resources/categories/')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setCategories(data)
                }
            }
            )
            .catch(err => console.log('Categories error:', err));

        fetchResources('', '');
    }, []);

    const fetchResources = (searchTerm, category) => {
        let url = 'http://127.0.0.1:8000/api/resources/?';
        if (searchTerm) url += `search=${searchTerm}&`;
        if (category) url += `category=${category}`;

        fetch(url)
            .then(res => res.json())
           .then(data => {
                if (Array.isArray(data)) {
                    setResources(data)
                }
                setLoading(false)
            }
            )
            .catch(err => {
                console.log('Resources error:', err);
                setLoading(false);
            });
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearch(value);
        fetchResources(value, selectedCategory);
    };

    const handleCategory = (e) => {
        const value = e.target.value;
        setSelectedCategory(value);
        fetchResources(search, value);
    };

    if (loading) return <p style={{ padding: '24px' }}>Loading resources...</p>;

    return (
        <div style={{ padding: '24px' }}>
            <h2>Marketplace</h2>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <input
                    placeholder="Search resources..."
                    value={search}
                    onChange={handleSearch}
                    style={{ padding: '8px 12px', flex: 1, borderRadius: '6px', border: '1px solid #ccc' }}
                />
                <select
                    value={selectedCategory}
                    onChange={handleCategory}
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc' }}
                >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>

            {resources.length === 0 ? (
                <p>No resources found.</p>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: '20px'
                }}>
                    {resources.map(resource => (
                        <div
                            key={resource.id}
                            onClick={() => navigate(`/resources/${resource.id}`)}
                            style={{
                                border: '1px solid #e5e7eb',
                                borderRadius: '10px',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                transition: 'box-shadow 0.2s',
                                background: 'white',
                            }}
                            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                        >
                            <img
                                src={`http://127.0.0.1:8000${resource.thumbnail}`}
                                alt={resource.title}
                                style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                                onError={e => e.target.style.display = 'none'}
                            />
                            <div style={{ padding: '14px' }}>
                                <h3 style={{ margin: '0 0 4px', fontSize: '16px' }}>{resource.title}</h3>
                                <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 8px' }}>
                                    {resource.category_name}
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 'bold', fontSize: '16px' }}>₹{resource.price}</span>
                                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>by {resource.owner_username}</span>
                                </div>
                                {resource.token_id && (
                                    <span style={{
                                        display: 'inline-block',
                                        marginTop: '8px',
                                        background: '#ede9fe',
                                        color: '#7c3aed',
                                        fontSize: '11px',
                                        padding: '2px 8px',
                                        borderRadius: '20px'
                                    }}>
                                        NFT
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MarketplacePage;