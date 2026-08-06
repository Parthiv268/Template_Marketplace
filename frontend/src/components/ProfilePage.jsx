/* ============================================================
   CHANGES TO FRONTEND — ProfilePage
   - Dark background: #0a0a0a page, #111 card
   - Avatar ring in white with subtle glow
   - All text adapts to white/grey contrast
   - Inputs and textarea styled with dark palette
   - Save/Cancel buttons updated to white primary / ghost
   - Stat row (username/email/status) styled as info rows
   - Removed raw token debug box from visible production UI
   ============================================================ */

import { useState, useEffect } from "react";
import { getProfile, decodeToken, updateProfile } from "../api.js";

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getProfile();
        setProfile(data);
        setBio(data.bio || "");
      } catch (error) {
        console.log("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

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
    } catch (error) {
      setUpdateError("Failed to update profile. Please try again.");
    } finally {
      setUpdating(false);
    }
  }

  /* CHANGES TO FRONTEND — ProfilePage: dark loading */
  if (loading) return (
    <div className="page-loading">
      <div className="spinner" />
      <span>Loading profile…</span>
    </div>
  );
  if (!profile) return (
    <div className="page-loading">
      <p style={{ color: 'var(--text-secondary)' }}>Could not load profile. Please log in again.</p>
    </div>
  );

  /* CHANGES TO FRONTEND — ProfilePage: helper row for profile info */
  const InfoRow = ({ label, value }) => (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500 }}>{label}</span>
      <span style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500 }}>{value}</span>
    </div>
  );

  return (
    /* CHANGES TO FRONTEND — ProfilePage: dark page wrapper */
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-page)',
      padding: '48px 24px',
      fontFamily: 'var(--font)',
    }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>

        {/* CHANGES TO FRONTEND — ProfilePage: header */}
        <h1 style={{
          fontSize: '28px', fontWeight: 800,
          color: 'var(--text-primary)', marginBottom: '32px',
          letterSpacing: '-0.02em',
        }}>
          My Profile
        </h1>

        {/* CHANGES TO FRONTEND — ProfilePage: avatar with white ring */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
          <img
            src={profile.profile_picture || "https://placehold.co/100x100/111/fff?text=?"}
            alt="Profile"
            width="88"
            height="88"
            style={{
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid rgba(255,255,255,0.2)',
              boxShadow: '0 0 0 4px rgba(255,255,255,0.04)',
            }}
          />
          <div>
            <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '20px', margin: 0 }}>
              {profile.username}
            </p>
            <span style={{
              display: 'inline-block', marginTop: '6px',
              background: profile.status === 'creator' ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.08)',
              color: profile.status === 'creator' ? '#22c55e' : '#a1a1aa',
              fontSize: '11px', fontWeight: 600, padding: '2px 10px',
              borderRadius: '99px', textTransform: 'capitalize',
            }}>
              {profile.status}
            </span>
          </div>
        </div>

        {/* CHANGES TO FRONTEND — ProfilePage: surface card */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '14px',
          padding: '24px',
          marginBottom: '20px',
        }}>
          {!isEditing ? (
            <div>
              <InfoRow label="Username" value={profile.username} />
              <InfoRow label="Email"    value={profile.email} />
              <InfoRow label="Status"   value={profile.status} />
              <div style={{ padding: '12px 0' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '6px' }}>Bio</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                  {profile.bio || "No bio yet."}
                </p>
              </div>

              {/* CHANGES TO FRONTEND — ProfilePage: success message */}
              {updateSuccess && (
                <p style={{ color: 'var(--green)', fontSize: '13px', marginTop: '8px' }}>{updateSuccess}</p>
              )}

              {/* CHANGES TO FRONTEND — ProfilePage: Edit button \u2014 white primary */}
              <button
                id="profile-edit-btn"
                onClick={() => { setIsEditing(true); setUpdateSuccess(""); }}
                onMouseEnter={e => { e.currentTarget.style.background = '#e4e4e7'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.transform = 'translateY(0)'; }}
                style={{
                  marginTop: '20px',
                  padding: '9px 20px',
                  background: '#ffffff',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: 'var(--font)',
                  transition: 'all 0.15s ease',
                }}
              >
                Edit Profile
              </button>
            </div>
          ) : (
            /* CHANGES TO FRONTEND — ProfilePage: edit form with dark inputs */
            <form onSubmit={handleUpdate}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>
                  Bio
                </label>
                <textarea
                  id="profile-bio-input"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="Tell us about yourself..."
                  className="input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>
                  Profile Picture
                </label>
                <input
                  id="profile-picture-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfilePicture(e.target.files[0])}
                  style={{ color: 'var(--text-secondary)', fontSize: '13px' }}
                />
                {profilePicture && (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Selected: {profilePicture.name}
                  </p>
                )}
              </div>

              {updateError && (
                <p style={{ color: 'var(--red)', fontSize: '13px', marginBottom: '12px' }}>{updateError}</p>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                {/* CHANGES TO FRONTEND — ProfilePage: Save button \u2014 white primary */}
                <button
                  id="profile-save-btn"
                  type="submit"
                  disabled={updating}
                  onMouseEnter={e => { if (!updating) e.currentTarget.style.background = '#e4e4e7'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = updating ? '#3f3f46' : '#ffffff'; }}
                  style={{
                    padding: '9px 20px',
                    background: updating ? '#3f3f46' : '#ffffff',
                    color: updating ? '#71717a' : '#000000',
                    border: 'none', borderRadius: '8px',
                    cursor: updating ? 'not-allowed' : 'pointer',
                    fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {updating ? "Saving…" : "Save Changes"}
                </button>

                {/* CHANGES TO FRONTEND — ProfilePage: Cancel ghost button */}
                <button
                  id="profile-cancel-btn"
                  type="button"
                  onClick={() => { setIsEditing(false); setBio(profile.bio || ""); setProfilePicture(null); setUpdateError(""); }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  style={{
                    padding: '9px 20px',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px', fontWeight: 500, fontFamily: 'var(--font)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Cancel
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