import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Login = () => {
  const { login, isAuthenticated, isProfileComplete, error, setError } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  if (isAuthenticated && isProfileComplete) return <Navigate to="/dashboard" />;
  if (isAuthenticated && !isProfileComplete) return <Navigate to="/profile-setup" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await login(form.email, form.password);
      if (data.user.isProfileComplete) {
        navigate('/dashboard');
      } else {
        navigate('/profile-setup');
      }
    } catch (err) {
      // error is set in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <Navbar />
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '100px 24px 40px'
      }}>
        <div className="card animate-fadeSlideUp" style={{ maxWidth: 440, width: '100%', padding: 40 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Welcome Back</h1>
            <p style={{ color: '#585F6C', fontSize: 15 }}>Sign in to continue to Safelle</p>
          </div>

          {error && (
            <div style={{
              background: '#fef2f2', color: '#dc2626', padding: '12px 16px',
              borderRadius: 10, fontSize: 14, fontWeight: 500, marginBottom: 20
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group" style={{ marginBottom: 16 }}>
              <label className="input-label">Email Address</label>
              <input
                type="email"
                className="input-field"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                required
                id="login-email"
              />
            </div>

            <div className="input-group" style={{ marginBottom: 24 }}>
              <label className="input-label">Password</label>
              <input
                type="password"
                className="input-field"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
                id="login-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={loading}
              id="login-submit"
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <div className="loading-spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#585F6C' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#FF6B00', fontWeight: 600 }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
