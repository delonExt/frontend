import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [prediction, setPrediction] = useState(null);
  const [cycles, setCycles] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async () => {
    try {
      const [predRes, cyclesRes, logsRes] = await Promise.all([
        api.get('/predictions').catch(() => ({ data: null })),
        api.get('/cycles').catch(() => ({ data: [] })),
        api.get('/daily-logs').catch(() => ({ data: [] })),
      ]);
      setPrediction(predRes.data);
      setCycles(cyclesRes.data);
      setRecentLogs(Array.isArray(logsRes.data) ? logsRes.data.slice(0, 5) : []);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntil = () => {
    if (!prediction?.predicted_next_date) return null;
    return Math.ceil((new Date(prediction.predicted_next_date) - new Date()) / (1000 * 60 * 60 * 24));
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Selamat Pagi';
    if (h < 15) return 'Selamat Siang';
    if (h < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const daysUntil = getDaysUntil();
  const moodEmojis = ['', '😢', '😔', '😐', '😊', '😄'];
  const avgCycle = cycles.length > 0
    ? Math.round(cycles.reduce((s, c) => s + (c.cycle_length || 28), 0) / cycles.length)
    : null;

  // SVG ring for prediction
  const ringRadius = 52;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const maxDays = prediction?.predicted_cycle_length || 28;
  const progress = daysUntil !== null ? Math.max(0, 1 - (Math.abs(daysUntil) / maxDays)) : 0;
  const ringOffset = ringCircumference * (1 - progress);

  if (loading) {
    return (
      <div className="dash-loading">
        <div className="loading-spinner" />
        <p>Memuat dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dash animate-fade-in">
      {/* Header */}
      <header className="dash-header">
        <div>
          <h1 className="dash-greeting">
            {getGreeting()}, <span className="dash-name">{user?.name?.split(' ')[0] || 'User'}</span> 👋
          </h1>
          <p className="dash-date">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </header>

      {/* Prediction Hero Card */}
      <div className="dash-prediction">
        <div className="dash-pred-header">
          <h2>🔮 Prediksi Siklus Berikutnya</h2>
          {prediction?.confidence && (
            <span className="dash-confidence-badge">
              {Math.round(prediction.confidence * 100)}% confidence
            </span>
          )}
        </div>

        {prediction?.predicted_next_date ? (
          <div className="dash-pred-body">
            <div className="dash-pred-ring-wrap">
              <svg viewBox="0 0 120 120" className="dash-ring-svg">
                <circle cx="60" cy="60" r={ringRadius} className="dash-ring-bg" />
                <circle
                  cx="60" cy="60" r={ringRadius}
                  className="dash-ring-fill"
                  style={{
                    strokeDasharray: ringCircumference,
                    strokeDashoffset: ringOffset,
                  }}
                />
              </svg>
              <div className="dash-ring-center">
                <span className="dash-ring-num">{daysUntil !== null ? Math.abs(daysUntil) : '—'}</span>
                <span className="dash-ring-label">{daysUntil !== null && daysUntil < 0 ? 'hari lalu' : 'hari lagi'}</span>
              </div>
            </div>

            <div className="dash-pred-info">
              <div className="dash-pred-date-row">
                <span className="dash-pred-label">Tanggal Prediksi</span>
                <span className="dash-pred-date">
                  {new Date(prediction.predicted_next_date).toLocaleDateString('id-ID', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              {prediction.confidence && (
                <div className="dash-pred-bar-wrap">
                  <div className="dash-pred-bar-header">
                    <span>Confidence</span>
                    <span className="dash-pred-bar-pct">{Math.round(prediction.confidence * 100)}%</span>
                  </div>
                  <div className="dash-pred-bar">
                    <div className="dash-pred-bar-fill" style={{ width: `${prediction.confidence * 100}%` }} />
                  </div>
                </div>
              )}

              <div className="dash-pred-meta">
                <div className="dash-meta-item">
                  <span className="dash-meta-icon">📏</span>
                  <div>
                    <span className="dash-meta-val">{prediction.predicted_cycle_length || '—'} hari</span>
                    <span className="dash-meta-label">Panjang Siklus</span>
                  </div>
                </div>
                <div className="dash-meta-item">
                  <span className="dash-meta-icon">🤖</span>
                  <div>
                    <span className="dash-meta-val">{prediction.model_version || 'LSTM'}</span>
                    <span className="dash-meta-label">Model AI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="dash-pred-empty">
            <div className="dash-pred-empty-icon">📝</div>
            <p>Catat siklus pertamamu untuk mendapatkan prediksi AI!</p>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/cycle')}>
              Tambah Siklus Pertama
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="dash-actions">
        {[
          { icon: '🔄', label: 'Log Siklus', path: '/cycle', color: '#ec4899' },
          { icon: '📝', label: 'Log Harian', path: '/daily-log', color: '#a855f7' },
          { icon: '📅', label: 'Kalender', path: '/calendar', color: '#6366f1' },
          { icon: '⚙️', label: 'Pengaturan', path: '/profile', color: '#10b981' },
        ].map(a => (
          <button key={a.label} className="dash-action-card" onClick={() => navigate(a.path)}>
            <span className="dash-action-icon" style={{ '--action-color': a.color }}>{a.icon}</span>
            <span className="dash-action-label">{a.label}</span>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="dash-stats">
        <div className="dash-stat-card">
          <span className="dash-stat-emoji">📊</span>
          <span className="dash-stat-num">{cycles.length}</span>
          <span className="dash-stat-text">Siklus Tercatat</span>
          <div className="dash-stat-bar" style={{ '--bar-pct': `${Math.min(cycles.length * 10, 100)}%`, '--bar-color': '#ec4899' }} />
        </div>
        <div className="dash-stat-card">
          <span className="dash-stat-emoji">📝</span>
          <span className="dash-stat-num">{recentLogs.length > 0 ? recentLogs.length + '+' : '0'}</span>
          <span className="dash-stat-text">Log Harian</span>
          <div className="dash-stat-bar" style={{ '--bar-pct': `${Math.min(recentLogs.length * 15, 100)}%`, '--bar-color': '#a855f7' }} />
        </div>
        <div className="dash-stat-card">
          <span className="dash-stat-emoji">📏</span>
          <span className="dash-stat-num">{avgCycle || '—'}</span>
          <span className="dash-stat-text">Rata-rata Siklus</span>
          <div className="dash-stat-bar" style={{ '--bar-pct': `${avgCycle ? Math.min((avgCycle / 35) * 100, 100) : 0}%`, '--bar-color': '#6366f1' }} />
        </div>
      </div>

      {/* Two Column: Recent Logs + Tips */}
      <div className="dash-two-col">
        {/* Recent Logs */}
        <div className="dash-card">
          <h3 className="dash-card-title">📋 Log Terakhir</h3>
          {recentLogs.length > 0 ? (
            <div className="dash-log-list">
              {recentLogs.map(log => (
                <div key={log.id} className="dash-log-item">
                  <div className="dash-log-date">
                    {new Date(log.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </div>
                  <span className="dash-log-mood">{moodEmojis[log.mood] || '😐'}</span>
                  <div className="dash-log-details">
                    <span>💤 {log.sleep_quality || '—'}/5</span>
                    <span>😰 {log.stress_level || '—'}/5</span>
                    {log.is_fasting ? <span>🕌</span> : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="dash-empty-msg">
              <p>Belum ada log harian. <button className="dash-link" onClick={() => navigate('/daily-log')}>Buat sekarang →</button></p>
            </div>
          )}
        </div>

        {/* Health Tips */}
        <div className="dash-card">
          <h3 className="dash-card-title">💡 Tips Kesehatan</h3>
          <div className="dash-tips">
            {[
              { icon: '🌿', text: 'Olahraga teratur membantu mengurangi kram menstruasi dan memperbaiki mood selama siklus.' },
              { icon: '💧', text: 'Minum cukup air membantu mengurangi kembung dan kelelahan selama menstruasi.' },
              { icon: '😴', text: 'Tidur 7-9 jam berkualitas, terutama selama fase luteal siklus menstruasimu.' },
            ].map((tip, i) => (
              <div key={i} className="dash-tip">
                <span className="dash-tip-icon">{tip.icon}</span>
                <p>{tip.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
