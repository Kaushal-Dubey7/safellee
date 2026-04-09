import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import SOSButton from '../components/SOSButton';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.put('/api/user/profile', form);
      updateUser(res.data.user);
      setEditing(false);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await api.put('/api/user/profile', { profilePhoto: reader.result });
        updateUser(res.data.user);
      } catch (err) {
        console.error('Photo update error:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="page-container">
      <Navbar />
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '96px 24px 40px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>Profile</h1>

        {message && (
          <div style={{ background: '#dcfce7', color: '#15803d', padding: '12px 16px', borderRadius: 10, fontSize: 14, marginBottom: 20 }}>
            {message}
          </div>
        )}
        {error && (
          <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: 10, fontSize: 14, marginBottom: 20 }}>
            {error}
          </div>
        )}

        {/* Profile header */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', overflow: 'hidden',
              background: '#f0f0f0', border: '3px solid #EDEDED'
            }}>
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{
                  width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, fontWeight: 800, background: '#FF6B00', color: 'white'
                }}>
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <label style={{
              position: 'absolute', bottom: -4, right: -4,
              width: 28, height: 28, borderRadius: '50%',
              background: '#0A0A0A', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 14, border: '2px solid white'
            }}>
              ✏️
              <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
            </label>
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>{user?.fullName}</h2>
            <p style={{ color: '#585F6C', fontSize: 14 }}>{user?.email}</p>
            <span className="badge badge-success" style={{ marginTop: 4 }}>Profile Complete</span>
          </div>
        </div>

        {/* Profile fields */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Personal Information</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setEditing(!editing)}>
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editing ? (
            <>
              <div className="input-group" style={{ marginBottom: 12 }}>
                <label className="input-label">Full Name</label>
                <input type="text" className="input-field" value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              </div>
              <div className="input-group" style={{ marginBottom: 12 }}>
                <label className="input-label">Phone</label>
                <input type="tel" className="input-field" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="input-group" style={{ marginBottom: 16 }}>
                <label className="input-label">Address</label>
                <input type="text" className="input-field" value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <button className="btn btn-primary btn-block" onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Full Name', value: user?.fullName },
                { label: 'Email', value: user?.email },
                { label: 'Phone', value: user?.phone },
                { label: 'Address', value: user?.address }
              ].map(field => (
                <div key={field.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                  <span style={{ color: '#585F6C', fontSize: 14 }}>{field.label}</span>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{field.value || '—'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Account actions */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Account</h3>
          <button
            onClick={logout}
            className="btn btn-outline btn-block"
            style={{ color: '#EF4444', borderColor: '#fecaca' }}
          >
            Logout
          </button>
        </div>
      </div>
      <SOSButton />
    </div>
  );
};

export default Profile;
