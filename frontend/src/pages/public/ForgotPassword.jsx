import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/dataService';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword({ email });
      setSent(true);
      toast.success('Password reset link sent to your email');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🔐</div>
          <h2>Reset Password</h2>
          <p>Enter your email address and we'll send you a link to reset your password.</p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-container animate-in">
          {sent ? (
            <div className="text-center">
              <div style={{ fontSize: '4rem', marginBottom: '24px' }}>📧</div>
              <h2>Check Your Email</h2>
              <p style={{ color: 'var(--text-muted)', margin: '16px 0 32px' }}>
                We've sent a password reset link to <strong>{email}</strong>. 
                Please check your inbox and follow the instructions.
              </p>
              <Link to="/login" className="btn btn-primary">Back to Login</Link>
            </div>
          ) : (
            <>
              <h2>Forgot Password</h2>
              <p className="auth-subtitle">Enter your email to receive a reset link</p>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input className="form-input" type="email" placeholder="Enter your registered email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>

                <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading} style={{ justifyContent: 'center' }}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <div className="auth-footer">
                Remember your password? <Link to="/login">Login here</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
