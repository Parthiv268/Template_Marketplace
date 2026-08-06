import { useNavigate } from 'react-router-dom';

function Navbar({ isLoggedIn, setIsLoggedIn, profile }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <nav style={{
      padding: '12px 24px',
      background: '#1a1a2e',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <span
        onClick={() => navigate('/')}
        style={{ color: 'white', fontWeight: 'bold', fontSize: '20px', cursor: 'pointer' }}
      >
        DevVault
      </span>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button
          onClick={() => navigate('/marketplace')}
          style={{ background: 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px' }}
        >
          Marketplace
        </button>

        {isLoggedIn ? (
          <>
            <button
              onClick={() => navigate('/profile')}
              style={{ background: 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px' }}
            >
              Profile
            </button>
            <button
              onClick={handleLogout}
              style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', fontSize: '14px' }}
            >
              Logout
            </button>
            <button onClick={() => navigate('/upload')} style={{ background: 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px' }}>Upload</button>
            <button onClick={() => navigate('/wishlist')} style={{ background: 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px' }}>Wishlist</button>
            <button onClick={() => navigate('/library')} style={{ background: 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px' }}>Library</button>
            <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px' }}>Dashboard</button>
            <button onClick={() => navigate('/nft-dashboard')} style={{
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              color: 'white', border: 'none', borderRadius: '6px',
              padding: '6px 14px', cursor: 'pointer', fontSize: '14px',
              fontWeight: 600, boxShadow: '0 0 12px rgba(124,58,237,0.5)',
            }}>⬡ NFT</button>

            {/* ── NEW: two additions below ── */}
            <button onClick={() => navigate('/dashboard/user')} style={{ background: 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
              My Dashboard
            </button>
            {profile?.is_staff && (
              <button onClick={() => navigate('/dashboard/admin')} style={{ background: 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
                Admin
              </button>
            )}
          </>
        ) : (
          <button
            onClick={() => navigate('/login')}
            style={{ background: '#1a56db', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', fontSize: '14px' }}
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;