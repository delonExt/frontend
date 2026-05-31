import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || '',
    date_of_birth: user?.date_of_birth ? user.date_of_birth.split('T')[0] : '',
    avg_cycle_length: user?.avg_cycle_length || 28
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportRange, setReportRange] = useState('3');
  const [exporting, setExporting] = useState(false);

  const handleDownloadCSV = async () => {
    try {
      setError('');
      setSuccess('');
      setExporting(true);
      const response = await api.get(`/export/csv?range=${reportRange}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const fileName = `Laporan_YeoCycles_${user?.name?.replace(/[^a-z0-9]/gi, '_') || 'User'}_${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      setSuccess('Laporan Excel (.csv) berhasil diunduh! 📥');
    } catch (err) {
      console.error('Error downloading CSV:', err);
      setError('Gagal mengunduh laporan Excel.');
    } finally {
      setExporting(false);
    }
  };

  const handlePrintPDF = () => {
    navigate(`/print-report?range=${reportRange}`);
  };

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

      <div className="profile-card glass-card" style={{ marginTop: '28px' }}>
        <div className="profile-avatar" style={{ marginBottom: '24px', paddingBottom: '20px' }}>
          <span className="avatar-emoji">📄</span>
          <h2 style={{ background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)', WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>
            Doctor Report Generator
          </h2>
          <p>Ekspor riwayat siklus dan catatan kesehatan harian Anda ke dalam format CSV atau PDF siap cetak.</p>
        </div>

        <div className="report-generator-form">
          <div className="form-group">
            <label className="form-label" htmlFor="report-range">Pilih Rentang Waktu Laporan</label>
            <select
              id="report-range"
              className="form-input"
              value={reportRange}
              onChange={(e) => setReportRange(e.target.value)}
            >
              <option value="3">3 Bulan Terakhir</option>
              <option value="6">6 Bulan Terakhir</option>
              <option value="all">Semua Data</option>
            </select>
          </div>

          <div className="report-buttons" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '12px' }}>
            <button 
              onClick={handleDownloadCSV} 
              className="btn btn-secondary" 
              style={{ flex: 1, minWidth: '150px' }}
              disabled={exporting}
            >
              {exporting ? '⏳ Mengunduh...' : '📥 Unduh Excel (.csv)'}
            </button>
            <button 
              onClick={handlePrintPDF} 
              className="btn btn-primary" 
              style={{ flex: 1, minWidth: '150px' }}
              disabled={exporting}
            >
              📄 Unduh PDF (Cetak)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
