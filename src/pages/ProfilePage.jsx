import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    date_of_birth: user?.date_of_birth ? user.date_of_birth.split('T')[0] : '',
    avg_cycle_length: user?.avg_cycle_length || 28
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.put('/profile', form);
      updateUser(res.data.user);
      setSuccess('Profile updated successfully! ✨');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page container animate-fade-in">
      <header className="page-header">
        <h1>👤 Profile Settings</h1>
      </header>

      <div className="profile-card glass-card">
        <div className="profile-avatar">
          <span className="avatar-emoji">🌸</span>
          <h2>{user?.name || 'User'}</h2>
          <p>{user?.email}</p>
          <span className="member-badge">
            Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
          </span>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}
        {success && <div className="alert alert-success">✅ {success}</div>}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label className="form-label" htmlFor="profile-name">Full Name</label>
            <input
              id="profile-name"
              type="text"
              className="form-input"
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="profile-dob">Date of Birth</label>
            <input
              id="profile-dob"
              type="date"
              className="form-input"
              value={form.date_of_birth}
              onChange={(e) => setForm(f => ({ ...f, date_of_birth: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="profile-cycle">Average Cycle Length (days)</label>
            <input
              id="profile-cycle"
              type="number"
              className="form-input"
              value={form.avg_cycle_length}
              onChange={(e) => setForm(f => ({ ...f, avg_cycle_length: parseInt(e.target.value) || 28 }))}
              min="18" max="50"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '⏳ Saving...' : '💾 Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
