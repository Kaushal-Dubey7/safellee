import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ShieldIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 2L4 8V16C4 23.2 9.2 29.6 16 31C22.8 29.6 28 23.2 28 16V8L16 2Z" fill="#0A0A0A"/>
    <path d="M16 6L8 10V16C8 21.1 11.6 25.8 16 27C20.4 25.8 24 21.1 24 16V10L16 6Z" fill="#FF6B00"/>
    <path d="M14 18L11 15L12.4 13.6L14 15.2L19.6 9.6L21 11L14 18Z" fill="white"/>
  </svg>
);

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to={isAuthenticated ? '/dashboard' : '/'} className="navbar-logo">
        <ShieldIcon />
        <span>SAFELLE</span>
      </Link>

      <div className="navbar-links">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="navbar-link">Dashboard</Link>
            <Link to="/route-planner" className="navbar-link">Plan Route</Link>
            <Link to="/loved-ones" className="navbar-link">Contacts</Link>
            <button onClick={handleLogout} className="navbar-link">
              Logout
            </button>
            <Link to="/profile" className="navbar-link" style={{
              width: 36, height: 36, borderRadius: '50%', padding: 0,
              background: '#FF6B00', color: 'white', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontWeight: 700,
              fontSize: 14
            }}>
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </Link>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-link">Login</Link>
            <Link to="/register" className="navbar-link primary">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
