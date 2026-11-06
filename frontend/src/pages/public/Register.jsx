import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/dataService';
import toast from 'react-hot-toast';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '', course: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      const response = await authService.register(form);
      const { token, user } = response.data.data;
      login(token, user);
      toast.success('Registration successful! Welcome aboard!');
      navigate('/student');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const update = (field, value) => setForm({ ...form, [field]: value });

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <div style={{ fontSize: '4rem', marginBottom: '24px' }}>📝</div>
          <h2>Create Account</h2>
          <p>Register to start taking online exams, track your progress, and view detailed performance analytics.</p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-container animate-in">
          <h2>Student Registration</h2>
          <p className="auth-subtitle">Fill in your details to get started</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" placeholder="Enter your full name" value={form.name} onChange={e => update('name', e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input className="form-input" type="email" placeholder="Enter your email" value={form.email} onChange={e => update('email', e.target.value)} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" placeholder="Phone number" value={form.phone} onChange={e => update('phone', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Course</label>
                <select className="form-select" value={form.course} onChange={e => update('course', e.target.value)}>
                  <option value="">Select course</option>
                  <option value="B.Tech CSE">B.Tech CSE</option>
                  <option value="B.Tech IT">B.Tech IT</option>
                  <option value="B.Tech ECE">B.Tech ECE</option>
                  <option value="B.Tech EEE">B.Tech EEE</option>
                  <option value="B.Tech ME">B.Tech ME</option>
                  <option value="BCA">BCA</option>
                  <option value="MCA">MCA</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input className="form-input" type="password" placeholder="Min 6 characters" value={form.password} onChange={e => update('password', e.target.value)} required minLength="6" />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <input className="form-input" type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} required />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading} style={{ justifyContent: 'center' }}>
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Login here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
