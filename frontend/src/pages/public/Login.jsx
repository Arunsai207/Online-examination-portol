import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/dataService';
import toast from 'react-hot-toast';

const Login = () => {
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login({ ...form, role });
      const { token, user } = response.data.data;
      login(token, user);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(role === 'admin' ? '/admin' : '/student');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🎓</div>
          <h2>Welcome Back!</h2>
          <p>Login to access your dashboard, take exams, and view your results in real-time.</p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-container animate-in">
          <h2>Login</h2>
          <p className="auth-subtitle">Sign in to your account</p>

          <div className="auth-tabs">
            <button className={`auth-tab ${role === 'student' ? 'active' : ''}`} onClick={() => setRole('student')}>
              Student
            </button>
            <button className={`auth-tab ${role === 'admin' ? 'active' : ''}`} onClick={() => setRole('admin')}>
              Admin
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                required
              />
            </div>

            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
              <Link to="/forgot-password" style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>
                Forgot Password?
              </Link>
            </div>

            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading} style={{ justifyContent: 'center' }}>
              {loading ? 'Signing in...' : `Login as ${role === 'admin' ? 'Admin' : 'Student'}`}
            </button>
          </form>

          {role === 'student' && (
            <div className="auth-footer">
              Don't have an account? <Link to="/register">Register here</Link>
            </div>
          )}

          {role === 'admin' && (
            <div className="auth-footer" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Default: admin@examportal.com / admin123
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
