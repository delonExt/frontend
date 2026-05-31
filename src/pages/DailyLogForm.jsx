import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import './FormPage.css';

const SYMPTOMS = [
  { id: 'cramps', label: 'Cramps', emoji: '😖' },
  { id: 'headache', label: 'Headache', emoji: '🤕' },
  { id: 'bloating', label: 'Bloating', emoji: '🫧' },
  { id: 'fatigue', label: 'Fatigue', emoji: '😴' },
  { id: 'backpain', label: 'Back Pain', emoji: '💆' },
  { id: 'nausea', label: 'Nausea', emoji: '🤢' },
  { id: 'acne', label: 'Acne', emoji: '🧼' },
  { id: 'breast_tender', label: 'Breast Tenderness', emoji: '😣' },
  { id: 'mood_swings', label: 'Mood Swings', emoji: '🎭' },
  { id: 'cravings', label: 'Cravings', emoji: '🍫' },
];

const MOOD_EMOJIS = [
  { value: 1, emoji: '😢', label: 'Very Bad' },
  { value: 2, emoji: '😔', label: 'Bad' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '😊', label: 'Good' },
  { value: 5, emoji: '😄', label: 'Great' },
];

const SLEEP_LEVELS = [
  { value: 1, emoji: '😭', label: 'Sangat Buruk', desc: 'Insomnia / gelisah' },
  { value: 2, emoji: '🥱', label: 'Kurang', desc: 'Sering terbangun' },
  { value: 3, emoji: '😐', label: 'Cukup', desc: 'Tidur rata-rata' },
  { value: 4, emoji: '😴', label: 'Nyenyak', desc: 'Rileks & segar' },
  { value: 5, emoji: '🌟', label: 'Pulas', desc: 'Deep sleep sempurna' },
];

const STRESS_LEVELS = [
  { value: 1, emoji: '🧘', label: 'Sangat Tenang', desc: 'Tenang & rileks' },
  { value: 2, emoji: '🙂', label: 'Tenang', desc: 'Sedikit tertekan' },
  { value: 3, emoji: '😐', label: 'Sedang', desc: 'Normal / seimbang' },
  { value: 4, emoji: '😰', label: 'Stres', desc: 'Tinggi / cemas' },
  { value: 5, emoji: '🌋', label: 'Sangat Stres', desc: 'Sangat kewalahan' },
];

const getLocalDateString = (dateObj = new Date()) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function DailyLogForm() {
  const location = useLocation();
  const initialDate = location.state?.prefilledDate || getLocalDateString();

  const [form, setForm] = useState({
    date: initialDate,
    mood: 3,
    symptoms: [],
    sleep_quality: 3,
    stress_level: 3,
    is_fasting: false,
    notes: ''
  });
  const [recentLogs, setRecentLogs] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRecentLogs();
  }, []);

  // Preload daily log whenever selected date changes
  useEffect(() => {
    preloadLogData(form.date);
  }, [form.date]);

  const loadRecentLogs = async () => {
    try {
      const res = await api.get('/daily-logs');
      setRecentLogs(Array.isArray(res.data) ? res.data.slice(0, 7) : []);
    } catch (err) {
      console.error('Load logs error:', err);
    }
  };

  const preloadLogData = async (selectedDate) => {
    if (!selectedDate) return;
    try {
      const res = await api.get(`/daily-logs/${selectedDate}`);
      if (res.data) {
        setForm({
          date: selectedDate,
          mood: Number(res.data.mood) || 3,
          symptoms: Array.isArray(res.data.symptoms) ? res.data.symptoms : [],
          sleep_quality: Number(res.data.sleep_quality) || 3,
          stress_level: Number(res.data.stress_level) || 3,
          is_fasting: res.data.is_fasting === 1 || res.data.is_fasting === true,
          notes: res.data.notes || ''
        });
      }
    } catch (err) {
      if (err.response?.status === 404) {
        // Reset to default values if no log exists for selected date
        setForm(f => ({
          ...f,
          mood: 3,
          symptoms: [],
          sleep_quality: 3,
          stress_level: 3,
          is_fasting: false,
          notes: ''
        }));
      } else {
        console.error('Preload log error:', err);
      }
    }
  };

  const toggleSymptom = (id) => {
    setForm(f => ({
      ...f,
      symptoms: f.symptoms.includes(id)
        ? f.symptoms.filter(s => s !== id)
        : [...f.symptoms, id]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      try {
        await api.post('/daily-logs', form);
      } catch (err) {
        if (err.response?.status === 409) {
          // If the log already exists for this date, update it using PUT
          await api.put(`/daily-logs/${form.date}`, form);
        } else {
          throw err;
        }
      }
      setSuccess('Daily log saved! 🌟');
      loadRecentLogs();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save daily log');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page container animate-fade-in">
      <header className="page-header">
        <h1>📝 Daily Health Log</h1>
        <p className="page-description">Track your daily mood, symptoms, and wellness</p>
      </header>

      <div className="form-card glass-card">
        {error && <div className="alert alert-error">⚠️ {error}</div>}
        {success && <div className="alert alert-success">✅ {success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="log-date">Date</label>
            <input
              id="log-date"
              type="date"
              className="form-input"
              value={form.date}
              onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
              required
            />
          </div>

          {/* Mood Selector */}
          <div className="form-group">
            <label className="form-label">Mood</label>
            <div className="mood-selector">
              {MOOD_EMOJIS.map(m => (
                <button
                  key={m.value}
                  type="button"
                  className={`mood-btn ${Number(form.mood) === m.value ? 'active' : ''}`}
                  onClick={() => setForm(f => ({ ...f, mood: m.value }))}
                >
                  <span className="mood-emoji">{m.emoji}</span>
                  <span className="mood-label">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Symptoms */}
          <div className="form-group">
            <label className="form-label">Symptoms</label>
            <div className="symptoms-grid">
              {SYMPTOMS.map(s => (
                <button
                  key={s.id}
                  type="button"
                  className={`symptom-btn ${form.symptoms.includes(s.id) ? 'active' : ''}`}
                  onClick={() => toggleSymptom(s.id)}
                >
                  <span className="symptom-emoji">{s.emoji}</span>
                  <span className="symptom-label">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sleep Quality Card Selector */}
          <div className="form-group">
            <label className="form-label">Sleep Quality 💤</label>
            <div className="wellness-selector">
              {SLEEP_LEVELS.map(s => (
                <button
                  key={s.value}
                  type="button"
                  className={`wellness-card sleep-card ${Number(form.sleep_quality) === s.value ? 'active' : ''}`}
                  onClick={() => setForm(f => ({ ...f, sleep_quality: s.value }))}
                >
                  <span className="wellness-emoji">{s.emoji}</span>
                  <span className="wellness-label">{s.label}</span>
                  <span className="wellness-desc">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stress Level Card Selector */}
          <div className="form-group">
            <label className="form-label">Stress Level 😰</label>
            <div className="wellness-selector">
              {STRESS_LEVELS.map(s => (
                <button
                  key={s.value}
                  type="button"
                  className={`wellness-card stress-card ${Number(form.stress_level) === s.value ? 'active' : ''}`}
                  onClick={() => setForm(f => ({ ...f, stress_level: s.value }))}
                >
                  <span className="wellness-emoji">{s.emoji}</span>
                  <span className="wellness-label">{s.label}</span>
                  <span className="wellness-desc">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Fasting Toggle */}
          <div className="form-group">
            <label className="toggle-container">
              <input
                type="checkbox"
                checked={form.is_fasting}
                onChange={(e) => setForm(f => ({ ...f, is_fasting: e.target.checked }))}
              />
              <span className="toggle-slider"></span>
              <span className="toggle-label">🕌 Fasting Today</span>
            </label>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label" htmlFor="log-notes">Notes</label>
            <textarea
              id="log-notes"
              className="form-input"
              value={form.notes}
              onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="How are you feeling today?"
              rows="3"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '⏳ Saving...' : '📝 Save Daily Log'}
          </button>
        </form>
      </div>

      {/* Recent Logs */}
      {recentLogs.length > 0 && (
        <div className="history-card glass-card">
          <h2>📋 Recent Logs</h2>
          <div className="history-list">
            {recentLogs.map(log => (
              <div key={log.id} className="history-item compact">
                <div className="history-main">
                  <span className="history-start">
                    {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="history-mood">{MOOD_EMOJIS.find(m => m.value === Number(log.mood))?.emoji || '😐'}</span>
                  <span className="history-detail">💤 {log.sleep_quality}/5</span>
                  <span className="history-detail">😰 {log.stress_level}/5</span>
                  {log.is_fasting ? <span>🕌</span> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
