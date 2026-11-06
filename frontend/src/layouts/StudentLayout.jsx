import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ThemeContext } from '../context/ThemeContext';
import { FiHome, FiFileText, FiClock, FiUser, FiLogOut, FiMenu, FiX, FiSun, FiMoon } from 'react-icons/fi';

const StudentLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/student', icon: <FiHome />, label: 'Dashboard' },
    { path: '/student/exams', icon: <FiFileText />, label: 'Available Exams' },
    { path: '/student/history', icon: <FiClock />, label: 'Exam History' },
    { path: '/student/profile', icon: <FiUser />, label: 'Profile' },
  ];

  return (
    <div className="dashboard-layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">🎓</div>
          <h2>ExamPortal</h2>
          <button className="modal-close" style={{ marginLeft: 'auto', display: sidebarOpen ? 'flex' : 'none' }} onClick={() => setSidebarOpen(false)}>
            <FiX />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Navigation</div>
            {navItems.map(item => (
              <Link key={item.path} to={item.path} className={`nav-link ${isActive(item.path)}`} onClick={() => setSidebarOpen(false)}>
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Account</div>
            <button className="nav-link" onClick={handleLogout} style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>
              <span className="nav-icon"><FiLogOut /></span>
              Logout
            </button>
          </div>
        </nav>
      </aside>

      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <FiMenu />
            </button>
            <h4 style={{ fontWeight: 600 }}>Student Portal</h4>
          </div>
          <div className="topbar-right">
            <button className="btn-icon btn-ghost" onClick={toggleTheme}>
              {theme === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
            </button>
            <div className="user-menu">
              <div className="user-avatar">{user?.name?.charAt(0)?.toUpperCase()}</div>
              <div className="user-info">
                <span className="user-name">{user?.name}</span>
                <span className="user-role">Student</span>
              </div>
            </div>
          </div>
        </div>

        <div className="page-content">
          <Outlet />
        </div>
      </div>

      {sidebarOpen && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }} onClick={() => setSidebarOpen(false)} />}
    </div>
  );
};

export default StudentLayout;
