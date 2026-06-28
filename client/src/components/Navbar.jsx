import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HealthStatusDot from './HealthStatusDot';

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

  const location = useLocation();
  const [imgError, setImgError] = useState(false);

  const userInitials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const getLinkStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      padding: '24px 0',
      margin: '0 16px',
      fontSize: 15,
      fontWeight: isActive ? 700 : 600,
      color: isActive ? '#FF6B00' : '#1a1c1c',
      borderBottom: isActive ? '3px solid #FF6B00' : '3px solid transparent',
      transition: 'all 0.2s',
      textDecoration: 'none'
    };
  };

  return (
    <nav className="navbar" style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '0 40px',
      background: '#fff',
      borderBottom: '1px solid #f0f0f0',
      boxShadow: 'none',
      height: 80
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="navbar-logo" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: '#1a1c1c' }}>
          <ShieldIcon />
          <span style={{ fontWeight: 900, fontSize: 24, letterSpacing: '-0.5px' }}>SAFELLE</span>
        </Link>
        <Link 
          to="/system-health" 
          style={{ display: 'flex', alignItems: 'center', marginLeft: 12, transition: 'transform 0.2s' }} 
          className="health-dot-link" 
          title="View system status" 
          aria-label="View system status"
        >
          <HealthStatusDot />
        </Link>
      </div>

      <div className="navbar-links">
        {isAuthenticated ? (
          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', height: '100%', alignItems: 'center' }}>
            <Link to="/dashboard" style={getLinkStyle('/dashboard')}>Dashboard</Link>
            <Link to="/route-planner" style={getLinkStyle('/route-planner')}>Plan Route</Link>
            <Link to="/loved-ones" style={getLinkStyle('/loved-ones')}>Contacts</Link>
            <Link to="/system-health" style={getLinkStyle('/system-health')}>System Status</Link>
            <button onClick={handleLogout} style={{...getLinkStyle('/logout'), borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '3px solid transparent', outline: 'none', background: 'none', cursor: 'pointer'}}>
              Logout
            </button>
          </div>
        ) : null}
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        {isAuthenticated ? (
          <Link to="/profile" style={{
            width: 40, height: 40, borderRadius: '50%', padding: 0,
            background: '#FF6B00', color: 'white', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontWeight: 700,
            fontSize: 16, overflow: 'hidden', border: '2px solid white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            {user?.profilePhoto && !imgError ? (
              <img src={user.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setImgError(true)} />
            ) : (
              <span>{userInitials}</span>
            )}
          </Link>
        ) : (
          <div style={{ display: 'flex', gap: 16 }}>
            <Link to="/login" className="navbar-link">Login</Link>
            <Link to="/register" className="navbar-link primary">Sign Up</Link>
          </div>
        )}
      </div>

      <style>{`
        @keyframes healthDotPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .health-dot-link:hover {
          transform: scale(1.15);
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
