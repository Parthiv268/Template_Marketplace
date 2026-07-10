import { useNavigate } from 'react-router-dom';

function Navbar({ isLoggedIn, setIsLoggedIn }) {
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