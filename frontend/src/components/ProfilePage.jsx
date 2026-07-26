import { useState, useEffect } from "react";
import { getProfile, decodeToken, updateProfile } from "../api.js";

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [tokenInfo, setTokenInfo] = useState(null);
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
        const token = localStorage.getItem('access');
        const decoded = decodeToken(token);
        setTokenInfo(decoded);
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
    if (profilePicture) {
      formData.append("profile_picture", profilePicture);
      // this is to ensure that the old value of profuile_picture remains
    }

    try {
      const updated = await updateProfile(formData);
      setProfile(updated);
      setIsEditing(false);
      setUpdateSuccess("Profile updated successfully.");
      setProfilePicture(null);
    } catch (error) {
      setUpdateError("Failed to update profile. Please try again.");
      console.log("Update error:", error);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <p>Loading profile...</p>;
  if (!profile) return <p>Could not load profile. Please log in again.</p>;

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>My Profile</h1>

      <img
        src={profile.profile_picture
          ? profile.profile_picture
          : "https://placehold.co/120"}
        alt="Profile"
        width="120"
        height="120"
        style={{ borderRadius: '50%', objectFit: 'cover', marginBottom: '16px' }}
      />

      {!isEditing ? (
        <div>
          <p><strong>Username:</strong> {profile.username}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Status:</strong> {profile.status}</p>
          <p><strong>Bio:</strong> {profile.bio || "No bio yet."}</p>

          {updateSuccess && (
            <p style={{ color: 'green' }}>{updateSuccess}</p>
          )}

          <button
            onClick={() => {
              setIsEditing(true);
              setUpdateSuccess("");
            }}
            style={{
              marginTop: '16px',
              padding: '8px 20px',
              background: '#1a56db',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <form onSubmit={handleUpdate}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Tell us about yourself..."
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              Profile Picture
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePicture(e.target.files[0])}
            />
            {profilePicture && (
              <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                Selected: {profilePicture.name}
              </p>
            )}
          </div>

          {updateError && (
            <p style={{ color: 'red', marginBottom: '12px' }}>{updateError}</p>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              disabled={updating}
              style={{
                padding: '8px 20px',
                background: updating ? '#9ca3af' : '#1a56db',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: updating ? 'not-allowed' : 'pointer'
              }}
            >
              {updating ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setBio(profile.bio || "");
                setProfilePicture(null);
                setUpdateError("");
              }}
              style={{
                padding: '8px 20px',
                background: 'transparent',
                border: '1px solid #ccc',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {tokenInfo && (
        <div style={{ marginTop: '32px', padding: '16px', background: '#f3f4f6', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '14px', color: '#6b7280' }}>Decoded Token (dev only)</h2>
          <pre style={{ fontSize: '12px', overflow: 'auto' }}>
            {JSON.stringify(tokenInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;