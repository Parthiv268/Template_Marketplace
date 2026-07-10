import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import ProfilePage from './components/ProfilePage';
import Navbar from './components/Navbar';

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
        <Route
          path="/"
          element={<Navigate to={isLoggedIn ? "/profile" : "/login"} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;