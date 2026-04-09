import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';

const ProfileSetup = () => {
  const { user, updateUser, isProfileComplete } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    address: user?.address || '',
    profilePhoto: user?.profilePhoto || ''
  });

  const [contacts, setContacts] = useState([{ name: '', phone: '' }]);

  if (isProfileComplete) return <Navigate to="/dashboard" />;

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Photo must be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, profilePhoto: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const addContact = () => {
    if (contacts.length >= 5) return;
    setContacts([...contacts, { name: '', phone: '' }]);
  };

  const updateContact = (index, field, value) => {
    const updated = [...contacts];
    updated[index][field] = value;
    setContacts(updated);
  };

  const removeContact = (index) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const getProgress = () => {
    let filled = 0;
    const total = 5;
    if (form.fullName.trim()) filled++;
    if (form.profilePhoto) filled++;
    if (form.address.trim()) filled++;
    if (form.phone.trim()) filled++;
    if (contacts.some(c => c.name.trim() && c.phone.trim())) filled++;
    return Math.round((filled / total) * 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.fullName.trim()) return setError('Full name is required.');
    if (!form.profilePhoto) return setError('Profile photo is required.');
    if (!form.address.trim()) return setError('Home address is required.');
    if (!form.phone.trim()) return setError('Phone number is required.');

    const validContacts = contacts.filter(c => c.name.trim() && c.phone.trim());
    if (validContacts.length === 0) return setError('Add at least one emergency contact.');

    setLoading(true);
    try {
      const profileRes = await api.put('/api/user/profile', {
        fullName: form.fullName,
        phone: form.phone,
        address: form.address,
        profilePhoto: form.profilePhoto
      });

      for (const contact of validContacts) {
        await api.post('/api/lovedones', {
          name: contact.name,
          phone: contact.phone.replace(/[\s-]/g, ''),
          relationship: ''
        });
      }

      updateUser(profileRes.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  const progress = getProgress();

  return (
    <div className="page-container">
      <Navbar />
      <div style={{
        maxWidth: 560, margin: '0 auto',
        padding: '100px 24px 40px'
      }}>
        <div className="animate-fadeSlideUp">
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
              Complete Your Safety Profile
            </h1>
            <p style={{ color: '#585F6C', fontSize: 15 }}>
              Required before using Safelle. All fields are mandatory.
            </p>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span style={{ fontWeight: 600 }}>Profile Progress</span>
              <span style={{ fontWeight: 700, color: progress === 100 ? '#22C55E' : '#FF6B00' }}>{progress}%</span>
            </div>
            <div className="progress-bar" style={{ height: 8 }}>
              <div className="progress-bar-fill" style={{
                width: `${progress}%`,
                background: progress === 100 ? '#22C55E' : '#FF6B00',
                transition: 'width 0.5s ease'
              }} />
            </div>
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
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Personal Information</h3>

              {/* Photo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%', overflow: 'hidden',
                  background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '3px solid #EDEDED', flexShrink: 0
                }}>
                  {form.profilePhoto ? (
                    <img src={form.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 32, color: '#ccc' }}>📷</span>
                  )}
                </div>
                <div>
                  <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer', display: 'inline-flex' }}>
                    Upload Photo
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                  </label>
                  <p style={{ fontSize: 12, color: '#585F6C', marginTop: 4 }}>JPG, PNG under 5MB</p>
                </div>
              </div>

              <div className="input-group" style={{ marginBottom: 16 }}>
                <label className="input-label">Official Full Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="As per government ID"
                  required
                  id="setup-fullname"
                />
              </div>

              <div className="input-group" style={{ marginBottom: 16 }}>
                <label className="input-label">Home Address</label>
                <input
                  type="text"
                  className="input-field"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Full residential address"
                  required
                  id="setup-address"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Phone Number (+91)</label>
                <input
                  type="tel"
                  className="input-field"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+919876543210"
                  required
                  id="setup-phone"
                />
              </div>
            </div>

            {/* Emergency contacts */}
            <div className="card" style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Emergency Contacts</h3>
                <span style={{ fontSize: 12, color: '#585F6C' }}>{contacts.length}/5</span>
              </div>

              {contacts.map((contact, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 10, marginBottom: 12, alignItems: 'start'
                }}>
                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      className="input-field"
                      value={contact.name}
                      onChange={(e) => updateContact(i, 'name', e.target.value)}
                      placeholder="Contact name"
                      style={{ marginBottom: 8 }}
                    />
                    <input
                      type="tel"
                      className="input-field"
                      value={contact.phone}
                      onChange={(e) => updateContact(i, 'phone', e.target.value)}
                      placeholder="+919876543210"
                    />
                  </div>
                  {contacts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeContact(i)}
                      style={{
                        width: 36, height: 36, borderRadius: 8, border: '1px solid #EDEDED',
                        background: 'white', cursor: 'pointer', fontSize: 16, color: '#EF4444',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 4
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              {contacts.length < 5 && (
                <button
                  type="button"
                  onClick={addContact}
                  className="btn btn-ghost btn-sm"
                  style={{ width: '100%', marginTop: 4 }}
                >
                  + Add Another Contact
                </button>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={loading || progress < 100}
              id="setup-submit"
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <div className="loading-spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                  Saving...
                </span>
              ) : 'Complete Setup & Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
