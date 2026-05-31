import { useNavigate } from 'react-router-dom';
import './LogDetailModal.css';

const SYMPTOMS_MAP = {
  cramps: { label: 'Cramps', emoji: '😖' },
  headache: { label: 'Headache', emoji: '🤕' },
  bloating: { label: 'Bloating', emoji: '🫧' },
  fatigue: { label: 'Fatigue', emoji: '😴' },
  backpain: { label: 'Back Pain', emoji: '💆' },
  nausea: { label: 'Nausea', emoji: '🤢' },
  acne: { label: 'Acne', emoji: '🧼' },
  breast_tender: { label: 'Breast Tenderness', emoji: '😣' },
  mood_swings: { label: 'Mood Swings', emoji: '🎭' },
  cravings: { label: 'Cravings', emoji: '🍫' }
};

const MOOD_MAP = {
  1: { emoji: '😢', label: 'Very Bad' },
  2: { emoji: '😔', label: 'Bad' },
  3: { emoji: '😐', label: 'Okay' },
  4: { emoji: '😊', label: 'Good' },
  5: { emoji: '😄', label: 'Great' }
};

const SLEEP_MAP = {
  1: { emoji: '😭', label: 'Sangat Buruk', desc: 'Insomnia / gelisah' },
  2: { emoji: '🥱', label: 'Kurang', desc: 'Sering terbangun' },
  3: { emoji: '😐', label: 'Cukup', desc: 'Tidur rata-rata' },
  4: { emoji: '😴', label: 'Nyenyak', desc: 'Rileks & segar' },
  5: { emoji: '🌟', label: 'Pulas', desc: 'Deep sleep sempurna' }
};

const STRESS_MAP = {
  1: { emoji: '🧘', label: 'Sangat Tenang', desc: 'Tenang & rileks' },
  2: { emoji: '🙂', label: 'Tenang', desc: 'Sedikit tertekan' },
  3: { emoji: '😐', label: 'Sedang', desc: 'Normal / seimbang' },
  4: { emoji: '😰', label: 'Stres', desc: 'Tinggi / cemas' },
  5: { emoji: '🌋', label: 'Sangat Stres', desc: 'Sangat kewalahan' }
};

export default function LogDetailModal({ log, isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen || !log) return null;

  const moodVal = Number(log.mood);
  const sleepVal = Number(log.sleep_quality);
  const stressVal = Number(log.stress_level);

  const moodInfo = MOOD_MAP[moodVal] || { emoji: '😐', label: 'Okay' };
  const sleepInfo = SLEEP_MAP[sleepVal] || { emoji: '😐', label: 'Cukup', desc: 'Tidur rata-rata' };
  const stressInfo = STRESS_MAP[stressVal] || { emoji: '😐', label: 'Sedang', desc: 'Normal / seimbang' };

  // Parse symptoms
  const symptomsList = Array.isArray(log.symptoms)
    ? log.symptoms
    : log.symptoms
      ? JSON.parse(log.symptoms)
      : [];

  const handleEditRedirect = () => {
    // Pass date string in state or query params so that form preloads it
    navigate('/daily-log', { state: { prefilledDate: log.date } });
    if (onClose) onClose();
  };

  const formattedDate = new Date(log.date).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="log-detail-backdrop" onClick={onClose}>
      <div className="log-detail-modal glass-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="log-detail-close" onClick={onClose} aria-label="Close details">
          ✕
        </button>

        {/* Modal Header */}
        <header className="log-detail-header">
          <span className="log-detail-title-badge">📋 LOG HARIAN</span>
          <h2 className="log-detail-date">{formattedDate}</h2>
        </header>

        {/* Modal Body */}
        <div className="log-detail-body">
          {/* Mood Section */}
          <div className="log-detail-section mood-section-glow">
            <h3>Mood Hari Ini</h3>
            <div className="detail-mood-card">
              <span className="detail-mood-emoji">{moodInfo.emoji}</span>
              <div>
                <span className="detail-mood-label">{moodInfo.label}</span>
                <span className="detail-mood-desc">Kondisi emosi dominan</span>
              </div>
            </div>
          </div>

          {/* Sleep and Stress Side-by-side */}
          <div className="log-detail-grid">
            <div className="log-detail-section sleep-section-glow">
              <h3>Kualitas Tidur 💤</h3>
              <div className="detail-wellness-info">
                <div className="detail-circular-gauge">
                  <span className="detail-gauge-num">{sleepVal}</span>
                  <span className="detail-gauge-max">/5</span>
                </div>
                <div className="detail-gauge-text">
                  <span className="detail-gauge-title">{sleepInfo.label}</span>
                  <span className="detail-gauge-desc">{sleepInfo.desc}</span>
                </div>
              </div>
            </div>

            <div className="log-detail-section stress-section-glow">
              <h3>Tingkat Stres 😰</h3>
              <div className="detail-wellness-info">
                <div className="detail-circular-gauge stress-gauge">
                  <span className="detail-gauge-num">{stressVal}</span>
                  <span className="detail-gauge-max">/5</span>
                </div>
                <div className="detail-gauge-text">
                  <span className="detail-gauge-title">{stressInfo.label}</span>
                  <span className="detail-gauge-desc">{stressInfo.desc}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Fasting Badge */}
          {log.is_fasting === 1 || log.is_fasting === true ? (
            <div className="log-detail-fasting-card">
              <span className="fasting-mosque-icon">🕌</span>
              <div>
                <span className="fasting-card-title">Sedang Menjalankan Ibadah Puasa</span>
                <span className="fasting-card-desc">Suhu tubuh dan metabolisme dipantau secara puasa</span>
              </div>
            </div>
          ) : null}

          {/* Symptoms Section */}
          <div className="log-detail-section">
            <h3>Gejala Fisik & Mental</h3>
            {symptomsList.length > 0 ? (
              <div className="detail-symptoms-list">
                {symptomsList.map((symId) => {
                  const sym = SYMPTOMS_MAP[symId] || { label: symId, emoji: '🩺' };
                  return (
                    <div key={symId} className="detail-symptom-tag">
                      <span className="tag-emoji">{sym.emoji}</span>
                      <span className="tag-label">{sym.label}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="detail-empty-text">Tidak ada gejala spesifik yang dicatat hari ini. 👍</p>
            )}
          </div>

          {/* Notes Section */}
          {log.notes && (
            <div className="log-detail-section">
              <h3>Catatan Pribadi</h3>
              <blockquote className="detail-notes-quote">
                <p>"{log.notes}"</p>
              </blockquote>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <footer className="log-detail-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Tutup
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleEditRedirect}>
            ✏️ Ubah Log Ini
          </button>
        </footer>
      </div>
    </div>
  );
}
