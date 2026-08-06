/* ============================================================
   CHANGES TO FRONTEND — UploadPage
   - Dark page background and form card
   - All inputs/selects/textarea styled with dark palette
   - Labels in grey, helper text in muted
   - Submit button: white primary with lift on hover
   - Error and success messages adapted to dark palette
   - NFT fields (Max Supply, Royalty %) get special badge treatment
   - File inputs retain browser default but styled description text
   ============================================================ */

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
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/resources/categories/')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setCategories(data); })
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
    images.forEach(img => formData.append('images', img));

    try {
      const token = localStorage.getItem('access');
      const res = await fetch('http://127.0.0.1:8000/api/resources/upload/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || 'Upload failed. Please check all fields.'); return; }
      setSuccess(true);
      setTimeout(() => navigate(`/resources/${data.id}`), 1500);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  /* CHANGES TO FRONTEND — UploadPage: dark success screen */
  if (success) return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-page)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font)', gap: '12px',
    }}>
      <div style={{ fontSize: '48px' }}>✓</div>
      <h2 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '22px' }}>
        Resource uploaded successfully!
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Redirecting to your resource…</p>
    </div>
  );

  /* CHANGES TO FRONTEND — UploadPage: field label helper */
  const Label = ({ children, hint }) => (
    <div style={{ marginBottom: '8px' }}>
      <label style={{
        display: 'block', color: 'var(--text-secondary)',
        fontSize: '13px', fontWeight: 500,
      }}>{children}</label>
      {hint && <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>{hint}</p>}
    </div>
  );

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
    borderRadius: '8px', color: 'var(--text-primary)',
    fontFamily: 'var(--font)', fontSize: '14px', outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  };

  return (
    /* CHANGES TO FRONTEND — UploadPage: dark page wrapper */
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-page)',
      padding: '48px 24px',
      fontFamily: 'var(--font)',
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>

        {/* CHANGES TO FRONTEND — UploadPage: page header */}
        <h1 style={{
          fontSize: '28px', fontWeight: 800,
          color: 'var(--text-primary)', margin: '0 0 6px',
          letterSpacing: '-0.02em',
        }}>Upload a Resource</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>
          Share your work with the marketplace. Your status will upgrade to Creator automatically.
        </p>

        {/* CHANGES TO FRONTEND — UploadPage: form card */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '28px',
        }}>
          <form onSubmit={handleSubmit}>

            {/* Title */}
            <div style={{ marginBottom: '18px' }}>
              <Label>Title</Label>
              <input id="upload-title" className="input" type="text" value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. React Dashboard Template" required />
            </div>

            {/* Description */}
            <div style={{ marginBottom: '18px' }}>
              <Label>Description</Label>
              <textarea id="upload-description" className="input"
                value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Describe your resource..." required rows={4}
                style={{ resize: 'vertical' }} />
            </div>

            {/* Category */}
            <div style={{ marginBottom: '18px' }}>
              <Label>Category</Label>
              <select
                id="upload-category"
                value={category}
                onChange={e => setCategory(e.target.value)}
                required
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="" style={{ background: '#1a1a1a' }}>Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id} style={{ background: '#1a1a1a' }}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Price + Supply + Royalty */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '18px' }}>
              <div>
                <Label>Price (₹)</Label>
                <input id="upload-price" className="input" type="number" value={price}
                  onChange={e => setPrice(e.target.value)} placeholder="299" required min="0" />
              </div>
              <div>
                {/* CHANGES TO FRONTEND — UploadPage: NFT max supply field with badge */}
                <Label hint="Max tokens that can be minted">
                  Max Supply <span style={{ color: 'var(--nft)', fontSize: '10px', marginLeft: '4px' }}>NFT</span>
                </Label>
                <input id="upload-max-supply" className="input" type="number" value={maxSupply}
                  onChange={e => setMaxSupply(e.target.value)} min="1" />
              </div>
              <div>
                {/* CHANGES TO FRONTEND — UploadPage: NFT royalty field with badge */}
                <Label hint="% earned on every resale">
                  Royalty % <span style={{ color: 'var(--nft)', fontSize: '10px', marginLeft: '4px' }}>NFT</span>
                </Label>
                <input id="upload-royalty" className="input" type="number" value={royaltyPercent}
                  onChange={e => setRoyaltyPercent(e.target.value)} min="0" max="50" />
              </div>
            </div>

            {/* Thumbnail */}
            <div style={{ marginBottom: '18px' }}>
              <Label>Thumbnail Image</Label>
              <input
                id="upload-thumbnail"
                type="file" accept="image/*"
                onChange={e => setThumbnail(e.target.files[0])} required
                style={{ color: 'var(--text-secondary)', fontSize: '13px' }}
              />
              {thumbnail && <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>Selected: {thumbnail.name}</p>}
            </div>

            {/* Additional images */}
            <div style={{ marginBottom: '18px' }}>
              <Label hint="Optional carousel images">Additional Images</Label>
              <input
                id="upload-images"
                type="file" accept="image/*" multiple
                onChange={e => setImages(Array.from(e.target.files))}
                style={{ color: 'var(--text-secondary)', fontSize: '13px' }}
              />
              {images.length > 0 && <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>{images.length} image(s) selected</p>}
            </div>

            {/* Resource file */}
            <div style={{ marginBottom: '24px' }}>
              <Label>Resource File (ZIP, PDF, etc.)</Label>
              <input
                id="upload-file"
                type="file"
                onChange={e => setFile(e.target.files[0])} required
                style={{ color: 'var(--text-secondary)', fontSize: '13px' }}
              />
              {file && <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>Selected: {file.name}</p>}
            </div>

            {/* CHANGES TO FRONTEND — UploadPage: error message in red */}
            {error && (
              <p style={{ color: 'var(--red)', fontSize: '13px', marginBottom: '16px' }}>{error}</p>
            )}

            {/* CHANGES TO FRONTEND — UploadPage: submit button \u2014 white primary with hover lift */}
            <button
              id="upload-submit"
              type="submit"
              disabled={loading}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#e4e4e7'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={e => { e.currentTarget.style.background = loading ? '#3f3f46' : '#ffffff'; e.currentTarget.style.transform = 'translateY(0)'; }}
              style={{
                width: '100%', padding: '12px',
                background: loading ? '#3f3f46' : '#ffffff',
                color: loading ? '#71717a' : '#000000',
                border: 'none', borderRadius: '10px',
                fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 700, fontFamily: 'var(--font)',
                transition: 'all 0.15s ease',
              }}
            >
              {loading ? 'Uploading…' : 'Upload Resource'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UploadPage;