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

  // Auto-rotating tips carousel state
  const [activeTip, setActiveTip] = useState(0);

  const tips = [
    { icon: '🌿', text: 'Olahraga teratur membantu mengurangi kram menstruasi dan memperbaiki mood selama siklus.' },
    { icon: '💧', text: 'Minum cukup air membantu mengurangi kembung dan kelelahan selama menstruasi.' },
    { icon: '😴', text: 'Tidur 7-9 jam berkualitas sangat penting, terutama selama fase luteal siklus menstruasimu.' },
    { icon: '🍎', text: 'Makanan tinggi zat besi seperti bayam membantu mengembalikan zat besi yang hilang saat haid.' },
    { icon: '🧘', text: 'Latihan meditasi dan yoga ringan membantu menyeimbangkan kadar stres dan regulasi hormon.' }
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Auto rotate tips
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTip((prev) => (prev + 1) % tips.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

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

  // Insight calculations
  const getCurrentDayOfCycle = () => {
    if (cycles.length === 0) return null;
    // Find last cycle starting date
    const latestCycle = [...cycles].sort((a, b) => new Date(b.start_date) - new Date(a.start_date))[0];
    const diffTime = Math.abs(new Date() - new Date(latestCycle.start_date));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getMostCommonMood = () => {
    if (!recentLogs || recentLogs.length === 0) return '😐';
    const counts = {};
    recentLogs.forEach(l => {
      if (l.mood) counts[l.mood] = (counts[l.mood] || 0) + 1;
    });
    let maxMood = 4; // Default to '😊'
    let maxCount = 0;
    Object.keys(counts).forEach(m => {
      if (counts[m] > maxCount) {
        maxCount = counts[m];
        maxMood = parseInt(m);
      }
    });
    return moodEmojis[maxMood] || '😐';
  };

  const getLast5Cycles = () => {
    return [...cycles]
      .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
      .slice(-5);
  };

  // SVG ring for prediction
  const ringRadius = 52;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const maxDays = prediction?.predicted_cycle_length || 28;
  const progress = daysUntil !== null ? Math.max(0, 1 - (Math.abs(daysUntil) / maxDays)) : 0;
  const ringOffset = ringCircumference * (1 - progress);

  const currentDayOfCycle = getCurrentDayOfCycle();
  const mostCommonMood = getMostCommonMood();
  const last5Cycles = getLast5Cycles();

  if (loading) {
    return (
      <div className="dash-loading">
        <div className="loading-spinner" />
        <p>Memuat dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dash">
      {/* Header with entrance animation delay */}
      <header className="dash-header dash-animate-1">
        <div className="dash-header-flex">
          <div>
            <h1 className="dash-greeting">
              {getGreeting()}, <span className="dash-name">{user?.name?.split(' ')[0] || 'User'}</span> 👋
            </h1>
            <p className="dash-date">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          {currentDayOfCycle !== null && (
            <div className="dash-cycle-badge">
              <span className="dash-cycle-badge-pulse" />
              Siklus Hari ke-{currentDayOfCycle}
            </div>
          )}
        </div>
      </header>

      {/* Prediction Hero Card */}
      <div className="dash-prediction dash-animate-2">
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
                <defs>
                  <linearGradient id="pred-grad-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
                <circle cx="60" cy="60" r={ringRadius} className="dash-ring-bg" />
                <circle
                  cx="60" cy="60" r={ringRadius}
                  className="dash-ring-fill"
                  style={{
                    strokeDasharray: ringCircumference,
                    strokeDashoffset: ringOffset,
                    stroke: 'url(#pred-grad-ring)'
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
      <div className="dash-actions dash-animate-3">
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

      {/* Stats with Quick Insight Badges */}
      <div className="dash-stats dash-animate-4">
        <div className="dash-stat-card">
          <span className="dash-stat-emoji">📊</span>
          <span className="dash-stat-num">{cycles.length}</span>
          <span className="dash-stat-text">Siklus Tercatat</span>
          <div className="dash-stat-bar" style={{ '--bar-pct': `${Math.min(cycles.length * 10, 100)}%`, '--bar-color': '#ec4899' }} />
          <div className="dash-stat-meta-info">Total log data</div>
        </div>
        <div className="dash-stat-card">
          <span className="dash-stat-emoji">{mostCommonMood}</span>
          <span className="dash-stat-num">{recentLogs.length > 0 ? `${recentLogs.length} hari` : '0'}</span>
          <span className="dash-stat-text">Mood Paling Sering</span>
          <div className="dash-stat-bar" style={{ '--bar-pct': `${Math.min(recentLogs.length * 15, 100)}%`, '--bar-color': '#a855f7' }} />
          <div className="dash-stat-meta-info">Dominan: {mostCommonMood}</div>
        </div>
        <div className="dash-stat-card">
          <span className="dash-stat-emoji">📏</span>
          <span className="dash-stat-num">{avgCycle || '—'}</span>
          <span className="dash-stat-text">Rata-rata Siklus</span>
          <div className="dash-stat-bar" style={{ '--bar-pct': `${avgCycle ? Math.min((avgCycle / 35) * 100, 100) : 0}%`, '--bar-color': '#6366f1' }} />
          <div className="dash-stat-meta-info">{avgCycle ? `${avgCycle} hari` : 'Belum cukup data'}</div>
        </div>
      </div>

      {/* Mini Cycle History Chart (NEW) */}
      {last5Cycles.length > 0 && (
        <div className="dash-card dash-mini-chart-card dash-animate-5" style={{ marginBottom: '28px' }}>
          <h3 className="dash-card-title">📈 Visualisasi Riwayat 5 Siklus Terakhir</h3>
          <div className="dash-chart-wrapper">
            <div className="dash-chart-y-axis">
              <span>45h</span>
              <span>30h</span>
              <span>15h</span>
              <span>0</span>
            </div>
            <div className="dash-chart-bars">
              {last5Cycles.map((c, idx) => {
                const heightPercentage = Math.min(((c.cycle_length || 28) / 45) * 100, 100);
                return (
                  <div key={c.id || idx} className="dash-chart-bar-container">
                    <div className="dash-chart-bar-tooltip">
                      {c.cycle_length || 28} hari ({c.flow_intensity || 'medium'})
                    </div>
                    <div 
                      className="dash-chart-bar" 
                      style={{ 
                        height: `${heightPercentage}%`,
                        background: `linear-gradient(to top, #a855f7 0%, #ec4899 100%)`
                      }}
                    />
                    <span className="dash-chart-bar-label">
                      {new Date(c.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Two Column: Recent Logs + Health Tips Carousel */}
      <div className="dash-two-col dash-animate-6">
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
                    <span>💤 {log.sleep_quality || '—'}/5 Tidur</span>
                    <span>😰 {log.stress_level || '—'}/5 Stres</span>
                    {log.is_fasting ? <span className="dash-badge-fasting">🕌 Puasa</span> : null}
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

        {/* Health Tips Carousel (NEW) */}
        <div className="dash-card dash-tips-carousel-card">
          <h3 className="dash-card-title">💡 Tips Kesehatan Harian</h3>
          <div className="dash-tips-carousel">
            <div className="dash-tips-slide">
              <div className="dash-tip-icon-glow">{tips[activeTip].icon}</div>
              <p className="dash-tip-text-large">{tips[activeTip].text}</p>
            </div>
            
            <div className="dash-tips-carousel-dots">
              {tips.map((_, i) => (
                <span 
                  key={i} 
                  className={`dash-tips-carousel-dot ${i === activeTip ? 'active' : ''}`}
                  onClick={() => setActiveTip(i)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
