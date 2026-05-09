import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink to="/dashboard" className="navbar-brand">
          <img src={logo} alt="YeoCycles" className="brand-logo" />
          <span className="brand-text">YeoCycles</span>
        </NavLink>

        <div className="navbar-links">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/calendar" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">📅</span>
            <span>Calendar</span>
          </NavLink>
          <NavLink to="/cycle" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">🔄</span>
            <span>Cycles</span>
          </NavLink>
          <NavLink to="/daily-log" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">📝</span>
            <span>Daily Log</span>
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">👤</span>
            <span>Profile</span>
          </NavLink>
        </div>

        <div className="navbar-user">
          <div className="user-info">
            <span className="user-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
            <span className="user-greeting">Hi, {user?.name?.split(' ')[0] || 'User'}</span>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
