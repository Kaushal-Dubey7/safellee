import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import SOSButton from '../components/SOSButton';

const LovedOnes = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', relationship: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { loadContacts(); }, []);

  const loadContacts = async () => {
    try {
      const res = await api.get('/api/lovedones');
      setContacts(res.data.contacts || []);
    } catch (err) {
      console.error('Load contacts error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Name and phone are required.');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/api/lovedones/${editingId}`, form);
      } else {
        await api.post('/api/lovedones', form);
      }
      setForm({ name: '', phone: '', relationship: '' });
      setEditingId(null);
      setShowForm(false);
      await loadContacts();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save contact.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (contact) => {
    setForm({ name: contact.name, phone: contact.phone, relationship: contact.relationship || '' });
    setEditingId(contact._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/lovedones/${id}`);
      setDeleteConfirm(null);
      await loadContacts();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const getInitials = (name) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const colors = ['#FF6B00', '#22C55E', '#3B82F6', '#8B5CF6', '#EF4444'];

  return (
    <div className="page-container">
      <Navbar />
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '96px 24px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800 }}>Emergency Contacts</h1>
            <p style={{ color: '#585F6C', fontSize: 14, marginTop: 4 }}>{contacts.length}/5 contacts added</p>
          </div>
          {contacts.length < 5 && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: '', phone: '', relationship: '' }); }}
            >
              + Add
            </button>
          )}
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="card animate-slideDown" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
              {editingId ? 'Edit Contact' : 'Add Emergency Contact'}
            </h3>
            {error && (
              <div style={{ background: '#fef2f2', color: '#dc2626', padding: '8px 12px', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="input-group" style={{ marginBottom: 12 }}>
                <label className="input-label">Name</label>
                <input type="text" className="input-field" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Contact name" required />
              </div>
              <div className="input-group" style={{ marginBottom: 12 }}>
                <label className="input-label">Phone (with country code)</label>
                <input type="tel" className="input-field" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+919876543210" required />
              </div>
              <div className="input-group" style={{ marginBottom: 16 }}>
                <label className="input-label">Relationship (optional)</label>
                <input type="text" className="input-field" value={form.relationship}
                  onChange={(e) => setForm({ ...form, relationship: e.target.value })} placeholder="e.g. Mother, Friend" />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-outline" onClick={() => { setShowForm(false); setEditingId(null); }} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 2 }}>
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Add Contact'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Contacts list */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 16 }} />)}
          </div>
        ) : contacts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>No contacts yet</h3>
            <p style={{ color: '#585F6C', marginTop: 8, marginBottom: 20 }}>
              Add emergency contacts who will be notified during SOS.
            </p>
            <button className="btn btn-accent" onClick={() => setShowForm(true)}>
              + Add First Contact
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {contacts.map((contact, i) => (
              <div key={contact._id} className="card animate-fadeSlideUp" style={{
                display: 'flex', alignItems: 'center', gap: 16,
                animationDelay: `${i * 0.1}s`
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: colors[i % colors.length],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: 16, flexShrink: 0
                }}>
                  {getInitials(contact.name)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{contact.name}</div>
                  <div style={{ display: 'flex', gap: 8, fontSize: 13, color: '#585F6C', marginTop: 2 }}>
                    <span>{contact.phone}</span>
                    {contact.relationship && <span>· {contact.relationship}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <a href={`tel:${contact.phone}`} className="btn btn-ghost btn-sm" style={{ fontSize: 18, padding: '6px 10px' }}>📞</a>
                  <button onClick={() => handleEdit(contact)} className="btn btn-ghost btn-sm" style={{ fontSize: 16, padding: '6px 10px' }}>✏️</button>
                  {deleteConfirm === contact._id ? (
                    <button onClick={() => handleDelete(contact._id)} className="btn btn-danger btn-sm" style={{ fontSize: 12 }}>Confirm</button>
                  ) : (
                    <button onClick={() => setDeleteConfirm(contact._id)} className="btn btn-ghost btn-sm" style={{ fontSize: 16, padding: '6px 10px', color: '#EF4444' }}>🗑</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <SOSButton />
    </div>
  );
};

export default LovedOnes;
