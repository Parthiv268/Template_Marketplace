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

  /* CHANGES TO FRONTEND — UploadPage: field label helper with consistent vertical alignment */
  const Label = ({ children, hint }) => (
    <div style={{ marginBottom: '6px' }}>
      <label style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        color: '#f8fafc', fontSize: '13px', fontWeight: 600,
      }}>
        <span>{children}</span>
        {hint && <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 400 }}>{hint}</span>}
      </label>
    </div>
  );

  return (
    /* CHANGES TO FRONTEND — Full-width Upload Page Container */
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      padding: '32px 40px 80px',
      fontFamily: 'var(--font)',
      width: '100%',
    }}>
      <div style={{ maxWidth: '100%', width: '100%' }}>

        {/* CHANGES TO FRONTEND — UploadPage: Header Banner Box with Deep Shadow & Glow */}
        <div className="glass-panel" style={{
          padding: '28px 32px',
          borderRadius: '20px',
          marginBottom: '24px',
          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(15, 17, 26, 0.85) 60%)',
          border: '1px solid rgba(124, 58, 237, 0.35)',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.6), 0 0 25px rgba(124, 58, 237, 0.25)',
          textAlign: 'center',
        }}>
          <span className="badge-neon" style={{ marginBottom: '8px' }}>
            ❖ MINT NEW QUANTUM ASSET
          </span>
          <h1 className="font-heading" style={{
            fontSize: '28px', fontWeight: 800,
            color: '#ffffff', margin: '0 0 6px',
            letterSpacing: '-0.03em',
          }}>
            Upload & <span className="text-gradient-neon">Mint NFT Resource</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
            Upload digital software assets with smart NFT token supply & creator royalties.
          </p>
        </div>

        {/* CHANGES TO FRONTEND — UploadPage: Form Box with Deep Shadow & Aligned Inputs */}
        <div className="glass-panel" style={{
          padding: '32px',
          borderRadius: '24px',
          boxShadow: '0 24px 60px -15px rgba(0, 0, 0, 0.7), 0 0 35px rgba(6, 182, 212, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Title */}
            <div>
              <Label>Asset Title</Label>
              <input
                id="upload-title"
                className="glass-input"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. React Dashboard Template UI Kit"
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label>Description</Label>
              <textarea
                id="upload-description"
                className="glass-input"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Detailed description of features, stack, and usage..."
                required
                rows={3}
                style={{ resize: 'vertical', minHeight: '80px' }}
              />
            </div>

            {/* Category */}
            <div>
              <Label>Category</Label>
              <select
                id="upload-category"
                className="glass-input"
                value={category}
                onChange={e => setCategory(e.target.value)}
                required
                style={{ cursor: 'pointer' }}
              >
                <option value="" style={{ background: '#0f111a', color: '#fff' }}>Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id} style={{ background: '#0f111a', color: '#fff' }}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Price + Supply + Royalty in 3 Aligned Equal Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', alignItems: 'end' }}>
              <div>
                <Label>Price (₹)</Label>
                <input
                  id="upload-price"
                  className="glass-input"
                  type="number"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="299"
                  required
                  min="0"
                />
              </div>
              <div>
                <Label hint="Max mint limit">
                  Max Supply <span style={{ color: '#c084fc', fontSize: '10px' }}>NFT</span>
                </Label>
                <input
                  id="upload-max-supply"
                  className="glass-input"
                  type="number"
                  value={maxSupply}
                  onChange={e => setMaxSupply(e.target.value)}
                  min="1"
                />
              </div>
              <div>
                <Label hint="% on resales">
                  Royalty % <span style={{ color: '#c084fc', fontSize: '10px' }}>NFT</span>
                </Label>
                <input
                  id="upload-royalty"
                  className="glass-input"
                  type="number"
                  value={royaltyPercent}
                  onChange={e => setRoyaltyPercent(e.target.value)}
                  min="0"
                  max="50"
                />
              </div>
            </div>

            {/* CHANGES TO FRONTEND — UploadPage: Aligned Custom File Dropzones */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {/* Thumbnail */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px dashed rgba(255, 255, 255, 0.18)',
                borderRadius: '16px',
                padding: '16px',
                textAlign: 'center',
                transition: 'all 0.2s ease',
              }}>
                <Label>🖼️ Thumbnail Image</Label>
                <input
                  id="upload-thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={e => setThumbnail(e.target.files[0])}
                  required
                  style={{ width: '100%', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}
                />
                {thumbnail && (
                  <p style={{ color: '#38bdf8', fontSize: '11px', marginTop: '6px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    ✓ {thumbnail.name}
                  </p>
                )}
              </div>

              {/* Additional images */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px dashed rgba(255, 255, 255, 0.18)',
                borderRadius: '16px',
                padding: '16px',
                textAlign: 'center',
                transition: 'all 0.2s ease',
              }}>
                <Label hint="Optional">📸 Gallery Images</Label>
                <input
                  id="upload-images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={e => setImages(Array.from(e.target.files))}
                  style={{ width: '100%', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}
                />
                {images.length > 0 && (
                  <p style={{ color: '#c084fc', fontSize: '11px', marginTop: '6px', fontWeight: 600 }}>
                    ✓ {images.length} file(s) selected
                  </p>
                )}
              </div>
            </div>

            {/* Resource file dropzone */}
            <div style={{
              background: 'rgba(124, 58, 237, 0.06)',
              border: '1px dashed rgba(124, 58, 237, 0.3)',
              borderRadius: '16px',
              padding: '18px',
              textAlign: 'center',
            }}>
              <Label hint="ZIP, RAR, PDF, code file">📦 Primary Resource Deliverable File</Label>
              <input
                id="upload-file"
                type="file"
                onChange={e => setFile(e.target.files[0])}
                required
                style={{ width: '100%', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}
              />
              {file && (
                <p style={{ color: '#10b981', fontSize: '12px', marginTop: '6px', fontWeight: 700 }}>
                  ✓ Deliverable: {file.name}
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                padding: '10px 14px',
                color: '#f87171',
                fontSize: '13px',
                fontWeight: 600,
                textAlign: 'center',
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* CHANGES TO FRONTEND — UploadPage: Aligned Full-Width Neon CTA Button */}
            <button
              id="upload-submit"
              type="submit"
              disabled={loading}
              className="btn-glow"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '15px',
                fontWeight: 800,
                justifyContent: 'center',
                marginTop: '4px',
              }}
            >
              {loading ? '⚡ Minting Quantum Asset…' : '🚀 Mint Asset to Marketplace →'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

export default UploadPage;