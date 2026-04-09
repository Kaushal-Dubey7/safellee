import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Register = () => {
  const { register, isAuthenticated, error, setError } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '', phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  if (isAuthenticated) return <Navigate to="/profile-setup" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setError(null);

    if (form.password !== form.confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.phone
      });
      navigate('/profile-setup');
    } catch (err) {
      // error handled in context
    } finally {
      setLoading(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="page-container">
      <Navbar />
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '100px 24px 40px'
      }}>
        <div className="card animate-fadeSlideUp" style={{ maxWidth: 440, width: '100%', padding: 40 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Create Account</h1>
            <p style={{ color: '#585F6C', fontSize: 15 }}>Join Safelle and travel safer</p>
          </div>

          {displayError && (
            <div style={{
              background: '#fef2f2', color: '#dc2626', padding: '12px 16px',
              borderRadius: 10, fontSize: 14, fontWeight: 500, marginBottom: 20
            }}>
              {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group" style={{ marginBottom: 16 }}>
              <label className="input-label">Full Name</label>
              <input
                type="text"
                className="input-field"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Your full name"
                required
                id="register-name"
              />
            </div>

            <div className="input-group" style={{ marginBottom: 16 }}>
              <label className="input-label">Email</label>
              <input
                type="email"
                className="input-field"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                required
                id="register-email"
              />
            </div>

            <div className="input-group" style={{ marginBottom: 16 }}>
              <label className="input-label">Phone Number</label>
              <input
                type="tel"
                className="input-field"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+919876543210"
                required
                id="register-phone"
              />
            </div>

            <div className="input-group" style={{ marginBottom: 16 }}>
              <label className="input-label">Password</label>
              <input
                type="password"
                className="input-field"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min. 6 characters"
                required
                id="register-password"
              />
            </div>

            <div className="input-group" style={{ marginBottom: 24 }}>
              <label className="input-label">Confirm Password</label>
              <input
                type="password"
                className="input-field"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="Re-enter password"
                required
                id="register-confirm"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={loading}
              id="register-submit"
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <div className="loading-spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#585F6C' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#FF6B00', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
