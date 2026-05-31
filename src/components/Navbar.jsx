import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Sidebar toggle state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
    navigate('/login');
  };

  // Auto-close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add('sidebar-active-lock');
    } else {
      document.body.classList.remove('sidebar-active-lock');
    }
    return () => {
      document.body.classList.remove('sidebar-active-lock');
    };
  }, [sidebarOpen]);

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <NavLink to="/dashboard" className="navbar-brand">
            <img src={logo} alt="YeoCycles" className="brand-logo" />
            <span className="brand-text">YeoCycles</span>
          </NavLink>

          {/* Desktop-only Dynamic Page Title */}
          <div className="navbar-page-title">
            {location.pathname === '/dashboard' && '🌸 Dashboard Overview'}
            {location.pathname === '/calendar' && '📅 Cycle Calendar'}
            {location.pathname === '/cycle' && '🔄 Cycle Tracker'}
            {location.pathname === '/daily-log' && '📝 Daily Health Log'}
            {location.pathname === '/profile' && '👤 Profile & Settings'}
          </div>

          {/* Desktop Nav Links */}
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

          {/* Desktop User Section */}
          <div className="navbar-user">
            <div className="user-info">
              <span className="user-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
              <span className="user-greeting">Hi, {user?.name?.split(' ')[0] || 'User'}</span>
            </div>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>

          {/* Hamburger Menu Button for Mobile */}
          <button 
            className={`navbar-hamburger ${sidebarOpen ? 'active' : ''}`}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle navigation menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* Backdrop overlay for sidebar */}
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile sliding Sidebar Drawer */}
      <aside className={`sidebar-drawer ${sidebarOpen ? 'active' : ''}`}>
        <div className="sidebar-header">
          <img src={logo} alt="YeoCycles Logo" className="sidebar-logo" />
          <span className="sidebar-title">YeoCycles</span>
        </div>

        <div className="sidebar-user-section">
          <div className="sidebar-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
          <div className="sidebar-user-details">
            <span className="sidebar-user-name">{user?.name || 'User'}</span>
            <span className="sidebar-user-email">{user?.email || 'user@email.com'}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="sidebar-icon">📊</span>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/calendar" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="sidebar-icon">📅</span>
            <span>Calendar</span>
          </NavLink>
          <NavLink to="/cycle" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="sidebar-icon">🔄</span>
            <span>Cycles</span>
          </NavLink>
          <NavLink to="/daily-log" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="sidebar-icon">📝</span>
            <span>Daily Log</span>
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="sidebar-icon">👤</span>
            <span>Profile</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="sidebar-btn-logout">
            🚪 Logout dari Akun
          </button>
        </div>
      </aside>
    </>
  );
}
