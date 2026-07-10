import { useState, useEffect } from "react";
import { getProfile,decodeToken } from "../api.js";

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [tokenInfo,setTokenInfo]=useState(null);
  const [loading, setLoading] = useState(true);

  // useeffect used to call getProfilefunction on page load(rather than user action)
  // runs the part after the component is rendered automatically
  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getProfile();
        setProfile(data);
        // set profile gave the dictionary of values in data directly to profile
        //decode token used to parse access token to object and get info of that particular token
        const token=localStorage.getItem('access');
        const decoded=decodeToken(token);
        setTokenInfo(decoded);
      } catch (error) {
        console.log("Error loading profile:", error);
      } finally {
        //runs every time so if there is an error it will still stop loading and show error message
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  if (loading) {
    return <p>Loading profile...</p>;
  }
  if (!profile) {
  return <p>Could not load profile. Please log in again.</p>;
  }

  return (
    <div>
      <h1>My Profile</h1>
      <img
      // || means use left side if it exists otherwise use right side (placeholder image)
        src={profile.profile_picture || "https://placehold.co/120"}
        alt="Profile"
        width="120"
        height="120"
      />
      <p>Username: {profile.username}</p>
      <p>Email: {profile.email}</p>
      <p>Status: {profile.status}</p>
      <p>Bio: {profile.bio || "No bio yet."}</p>

      {tokenInfo && (
  <div>
    <h2>Decoded Token</h2>
    <pre>{JSON.stringify(tokenInfo, null, 2)}</pre>
  </div>
  // this is another way of writing of tokenInfo exists show the following otherwise skip it entirely.
)}
    </div>

    
  );
}

export default ProfilePage;