/* CHANGES TO FRONTEND — Full-width ProfilePage with aligned glass edit form & buttons */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, decodeToken, updateProfile, getUserStats } from "../api.js";

function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const [data, statsData] = await Promise.all([
          getProfile(),
          getUserStats().catch(() => null),
        ]);
        setProfile(data);
        setStats(statsData);
        setBio(data.bio || "");
      } catch (error) {
        console.log("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  async function handleUpdate(e) {
    e.preventDefault();
    setUpdating(true);
    setUpdateError("");
    setUpdateSuccess("");
    const formData = new FormData();
    formData.append("bio", bio);
    if (profilePicture) formData.append("profile_picture", profilePicture);
    try {
      const updated = await updateProfile(formData);
      setProfile(updated);
      setIsEditing(false);
      setUpdateSuccess("Profile updated successfully.");
      setProfilePicture(null);
      setPreviewUrl(null);
    } catch (error) {
      setUpdateError("Failed to update profile. Please try again.");
    } finally {
      setUpdating(false);
    }
  }

  /* CHANGES TO FRONTEND — ProfilePage: loading state */
  if (loading) return (
    <div className="page-loading">
      <div className="spinner" />
      <span>Loading user profile…</span>
    </div>
  );

  if (!profile) return (
    <div className="page-loading">
      <p style={{ color: 'var(--text-secondary)' }}>Could not load profile. Please log in again.</p>
    </div>
  );

  return (
    /* CHANGES TO FRONTEND — Full-Width Profile Container */
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      padding: '32px 40px 80px',
      fontFamily: 'var(--font)',
      width: '100%',
    }}>
      <div style={{ maxWidth: '100%', width: '100%' }}>

        {/* CHANGES TO FRONTEND — Glass Panel Header (Stretched Full Width) */}
        <div className="glass-panel" style={{
          padding: '36px 40px',
          borderRadius: '24px',
          marginBottom: '28px',
          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(15, 17, 26, 0.85) 60%)',
          border: '1px solid rgba(124, 58, 237, 0.35)',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.6), 0 0 25px rgba(124, 58, 237, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <img
              src={previewUrl || profile.profile_picture || "https://placehold.co/100x100/111/fff?text=?"}
              alt="Profile"
              width="96"
              height="96"
              style={{
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid rgba(124, 58, 237, 0.6)',
                boxShadow: '0 0 25px rgba(124, 58, 237, 0.5)',
              }}
            />
            <div>
              <span className="badge-neon" style={{ marginBottom: '8px' }}>
                👤 VERIFIED USER IDENTITY & WALLET
              </span>
              <h1 className="font-heading" style={{ color: '#ffffff', fontWeight: 800, fontSize: '32px', margin: '0 0 6px', letterSpacing: '-0.03em' }}>
                {profile.username}
              </h1>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{
                  background: profile.status === 'creator' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                  color: profile.status === 'creator' ? '#34d399' : '#94a3b8',
                  fontSize: '12px', fontWeight: 700, padding: '4px 14px',
                  borderRadius: '99px', textTransform: 'capitalize', border: '1px solid rgba(255, 255, 255, 0.1)',
                }}>
                  {profile.status === 'creator' ? '⚡ Verified Creator Status' : 'Standard User'}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  {profile.email}
                </span>
              </div>
            </div>
          </div>

          {!isEditing && (
            <button
              id="profile-edit-btn"
              onClick={() => { setIsEditing(true); setUpdateSuccess(""); }}
              className="btn-glow"
              style={{ padding: '10px 24px', fontSize: '14px' }}
            >
              ✏️ Edit Profile Settings
            </button>
          )}
        </div>

        {/* CHANGES TO FRONTEND — Full Width Profile Details / Edit Card */}
        <div className="glass-panel" style={{
          padding: '36px',
          borderRadius: '24px',
          boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        }}>
          {!isEditing ? (
            /* View Mode: Aligned Grid of Cards */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>USERNAME</p>
                  <p style={{ color: '#ffffff', fontSize: '18px', fontWeight: 700, margin: 0 }}>{profile.username}</p>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>EMAIL ADDRESS</p>
                  <p style={{ color: '#ffffff', fontSize: '18px', fontWeight: 700, margin: 0 }}>{profile.email}</p>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>ACCOUNT TYPE</p>
                  <p style={{ color: '#a855f7', fontSize: '18px', fontWeight: 700, margin: 0, textTransform: 'capitalize' }}>{profile.status}</p>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>TOTAL EXPENDITURE</p>
                  <p
                    onClick={() => navigate('/dashboard/user')}
                    style={{ color: '#f59e0b', fontSize: '18px', fontWeight: 700, margin: 0, cursor: 'pointer' }}
                  >
                    ₹{parseFloat(stats?.total_spent || 0).toLocaleString('en-IN')} →
                  </p>
                </div>
              </div>

              {/* Bio section */}
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>BIOGRAPHY & ABOUT</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6, margin: 0 }}>
                  {profile.bio || "No biography provided yet. Click 'Edit Profile Settings' to add your bio."}
                </p>
              </div>

              {updateSuccess && (
                <div style={{ padding: '12px 18px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', color: '#10b981', fontWeight: 600, fontSize: '14px' }}>
                  ✓ {updateSuccess}
                </div>
              )}
            </div>
          ) : (
            /* CHANGES TO FRONTEND — Full-Width Aligned Edit Profile Form */
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px' }}>
                <h3 className="font-heading" style={{ color: '#ffffff', fontWeight: 700, fontSize: '20px', margin: 0 }}>
                  Edit Profile Information
                </h3>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  Update your avatar & public bio
                </span>
              </div>

              {/* Profile Picture Dropzone Box */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px dashed rgba(124, 58, 237, 0.35)',
                borderRadius: '20px',
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                flexWrap: 'wrap',
              }}>
                <img
                  src={previewUrl || profile.profile_picture || "https://placehold.co/100x100/111/fff?text=?"}
                  alt="Preview"
                  width="72"
                  height="72"
                  style={{ borderRadius: '50%', objectFit: 'cover', border: '2px solid #7c3aed' }}
                />
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: '#ffffff', fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
                    Upload New Avatar Image
                  </label>
                  <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '10px' }}>
                    Supports PNG, JPG, or GIF up to 5MB.
                  </p>
                  <input
                    id="profile-picture-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer' }}
                  />
                </div>
              </div>

              {/* Bio textarea */}
              <div>
                <label style={{ display: 'block', color: '#ffffff', fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>
                  Public Biography
                </label>
                <textarea
                  id="profile-bio-input"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="Share a short bio with the developer community..."
                  className="glass-input"
                  style={{ resize: 'vertical', minHeight: '100px' }}
                />
              </div>

              {updateError && (
                <div style={{ padding: '12px 18px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#f87171', fontWeight: 600, fontSize: '14px' }}>
                  ⚠️ {updateError}
                </div>
              )}

              {/* Aligned Buttons Bar */}
              <div style={{ display: 'flex', gap: '14px', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <button
                  id="profile-cancel-btn"
                  type="button"
                  onClick={() => { setIsEditing(false); setBio(profile.bio || ""); setProfilePicture(null); setPreviewUrl(null); setUpdateError(""); }}
                  className="btn-glass"
                  style={{ padding: '10px 24px' }}
                >
                  Cancel
                </button>
                <button
                  id="profile-save-btn"
                  type="submit"
                  disabled={updating}
                  className="btn-glow"
                  style={{ padding: '10px 28px' }}
                >
                  {updating ? "Saving Changes…" : "✓ Save Changes"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;