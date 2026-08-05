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

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (token) {
      setIsLoggedIn(true);
    }
    setCheckingAuth(false);
  }, []);

  if (checkingAuth) {
    return <p style={{ padding: '24px' }}>Loading...</p>;
  }

  return (
    <BrowserRouter>
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Routes>
        <Route
          path="/login"
          element={
            isLoggedIn
              ? <Navigate to="/profile" />
              : <AuthPage setIsLoggedIn={setIsLoggedIn} />
          }
        />
        <Route
          path="/profile"
          element={
            isLoggedIn
              ? <ProfilePage />
              : <Navigate to="/login" />
          }
        />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/resources/:id" element={<ResourceDetailPage />} />
        <Route
          path="/"
          element={<Navigate to={isLoggedIn ? "/profile" : "/login"} />}
        />
        <Route path="/upload" element={isLoggedIn ? <UploadPage /> : <Navigate to="/login" />} />
        <Route path="/wishlist" element={isLoggedIn ? <WishlistPage /> : <Navigate to="/login" />} />
        <Route path="/library" element={isLoggedIn ? <LibraryPage /> : <Navigate to="/login" />} />
        <Route path="/dashboard" element={isLoggedIn ? <DashboardPage /> : <Navigate to="/login" />} />
        <Route path="/nft-dashboard" element={isLoggedIn ? <NFTDashboardPage /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;