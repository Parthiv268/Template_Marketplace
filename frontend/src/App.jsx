import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import ProfilePage from './components/ProfilePage';
import Navbar from './components/Navbar';
import MarketplacePage from './components/MarketplacePage';
import ResourceDetailPage from './components/ResourceDetailPage';
import UploadPage from './components/UploadPage';
import WishlistPage from './components/WishlistPage';
import LibraryPage from './components/LibraryPage';
import DashboardPage from './components/DashboardPage';
import NFTDashboardPage from './components/NFTDashboardPage';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import { getProfile } from './api.js';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem('access');
      if (token) {
        try {
          const data = await getProfile();
          setProfile(data);
          setIsLoggedIn(true);
        } catch {
          localStorage.clear();
          setIsLoggedIn(false);
        }
      }
      setCheckingAuth(false);
    }
    checkAuth();
  }, []);

  const handleLoginSuccess = async () => {
    const data = await getProfile();
    setProfile(data);
    setIsLoggedIn(true);
  };

  if (checkingAuth) return <p style={{ padding: '24px' }}>Loading...</p>;

  return (
    <BrowserRouter>
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} profile={profile} />
      <Routes>
        <Route path="/login" element={isLoggedIn ? <Navigate to="/profile" /> : <AuthPage setIsLoggedIn={handleLoginSuccess} />} />
        <Route path="/profile" element={isLoggedIn ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/resources/:id" element={<ResourceDetailPage />} />
        <Route path="/upload" element={isLoggedIn ? <UploadPage /> : <Navigate to="/login" />} />
        <Route path="/wishlist" element={isLoggedIn ? <WishlistPage /> : <Navigate to="/login" />} />
        <Route path="/library" element={isLoggedIn ? <LibraryPage /> : <Navigate to="/login" />} />
        <Route path="/dashboard" element={isLoggedIn ? <DashboardPage /> : <Navigate to="/login" />} />
        <Route path="/nft-dashboard" element={isLoggedIn ? <NFTDashboardPage /> : <Navigate to="/login" />} />

        {/* new */}
        <Route path="/dashboard/user" element={isLoggedIn ? <UserDashboard /> : <Navigate to="/login" />} />
        <Route
          path="/dashboard/admin"
          element={isLoggedIn && profile?.is_staff ? <AdminDashboard /> : <Navigate to="/dashboard/user" />}
        />

        <Route path="/" element={<Navigate to={isLoggedIn ? "/profile" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;