import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function UploadPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [maxSupply, setMaxSupply] = useState(50);
  const [royaltyPercent, setRoyaltyPercent] = useState(10);
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/resources/categories/')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(err => console.log('Categories error:', err));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!thumbnail || !file) {
      setError('Please select both a thumbnail image and a resource file.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('max_supply', maxSupply);
    formData.append('royalty_percent', royaltyPercent);
    formData.append('category', category);
    formData.append('thumbnail', thumbnail);
    formData.append('file', file);

    try {
      const token = localStorage.getItem('access');
      const res = await fetch('http://127.0.0.1:8000/api/resources/upload/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || 'Upload failed. Please check all fields.');
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate(`/resources/${data.id}`), 1500);

    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ color: 'green' }}>Resource uploaded successfully!</h2>
        <p>Redirecting to your resource...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Upload a Resource</h2>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>
        Share your work with the marketplace. Your status will upgrade to Creator automatically.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. React Dashboard Template"
            required
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe your resource..."
            required
            rows={4}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px', resize: 'vertical' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Category</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px' }}
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Price (₹)</label>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="299"
              required
              min="0"
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Max Supply</label>
            <input
              type="number"
              value={maxSupply}
              onChange={e => setMaxSupply(e.target.value)}
              min="1"
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Royalty %</label>
            <input
              type="number"
              value={royaltyPercent}
              onChange={e => setRoyaltyPercent(e.target.value)}
              min="0"
              max="50"
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Thumbnail Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setThumbnail(e.target.files[0])}
            required
          />
          {thumbnail && <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>Selected: {thumbnail.name}</p>}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Resource File (ZIP, PDF, etc.)</label>
          <input
            type="file"
            onChange={e => setFile(e.target.files[0])}
            required
          />
          {file && <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>Selected: {file.name}</p>}
        </div>

        {error && <p style={{ color: 'red', marginBottom: '16px' }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: loading ? '#9ca3af' : '#1a56db',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: '500'
          }}
        >
          {loading ? 'Uploading...' : 'Upload Resource'}
        </button>
      </form>
    </div>
  );
}

export default UploadPage;