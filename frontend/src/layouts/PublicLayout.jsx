import { Outlet, Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

const PublicLayout = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <div>
      <nav className="public-navbar">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🎓</span>
          ExamPortal
        </Link>

        <ul className="navbar-links">
          <li><Link to="/" className={isActive('/')}>Home</Link></li>
          <li><Link to="/about" className={isActive('/about')}>About</Link></li>
          <li><Link to="/contact" className={isActive('/contact')}>Contact</Link></li>
        </ul>

        <div className="navbar-actions">
          <button className="btn-icon btn-ghost" onClick={toggleTheme} title="Toggle theme">
            {theme === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
          </button>
          <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
        </div>
      </nav>

      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>🎓 ExamPortal</h4>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', lineHeight: '1.6' }}>
              A comprehensive online examination and result management system for educational institutions.
            </p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/login">Login</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Features</h4>
            <ul>
              <li><a href="#">Online Exams</a></li>
              <li><a href="#">Instant Results</a></li>
              <li><a href="#">Performance Analytics</a></li>
              <li><a href="#">Secure Platform</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <ul>
              <li><a href="#">admin@examportal.com</a></li>
              <li><a href="#">+91 9876543210</a></li>
              <li><a href="#">India</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Online Exam System. All rights reserved. | B.Tech Final Year Project</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
