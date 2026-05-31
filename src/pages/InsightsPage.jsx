import { useState, useEffect } from 'react';
import api from '../services/api';
import './InsightsPage.css';

export default function InsightsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/insights/self-care');
      setData(res.data);
    } catch (err) {
      console.error('Fetch insights error:', err);
      setError(err.response?.data?.error || 'Gagal memuat wawasan kesehatan.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="insights-loading">
        <div className="loading-spinner" />
        <p>Menganalisis data log harian Anda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="insights-page container animate-fade-in">
        <div className="alert alert-error">
          <span>⚠️ {error}</span>
          <button className="btn btn-secondary btn-sm" onClick={fetchInsights} style={{ marginLeft: 'auto' }}>
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const { currentPhase, symptomSummary, recommendations } = data;

  const phaseProgress = currentPhase.day && currentPhase.name !== 'Fase Tidak Diketahui' 
    ? Math.min((currentPhase.day / 28) * 100, 100) 
    : 0;

  return (
    <div className="insights-page container animate-fade-in">
      <header className="page-header insights-header">
        <h1>💡 Wawasan Kesehatan & Self-Care</h1>
        <p>Rekomendasi harian yang dipersonalisasi khusus berdasarkan fase siklus dan log kesehatan Anda.</p>
      </header>

      <div className="insights-grid">
        {/* Left Column: Cycle Phase & Symptom Summary */}
        <div className="insights-main-col">
          {/* Cycle Phase Card */}
          <div className="insights-card glass-card phase-card">
            <div className="phase-card-header">
              <span className="phase-badge-emoji">🌸</span>
              <div>
                <h2>{currentPhase.name}</h2>
                {currentPhase.day && <p className="phase-day">Hari ke-{currentPhase.day} dari siklus Anda</p>}
              </div>
            </div>
            
            <p className="phase-description">{currentPhase.description}</p>
            
            {currentPhase.day && (
              <div className="phase-progress-wrap">
                <div className="phase-progress-bar">
                  <div className="phase-progress-fill" style={{ width: `${phaseProgress}%` }} />
                </div>
                <div className="phase-progress-labels">
                  <span>Mulai</span>
                  <span>Hari ke-{currentPhase.day}</span>
                  <span>Selesai</span>
                </div>
              </div>
            )}

            <div className="phase-tips-list">
              <h3>💡 Tip Cepat Fase Ini:</h3>
              <ul>
                {currentPhase.tips.map((tip, idx) => (
                  <li key={idx}>✨ {tip}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Weekly Symptom Summary */}
          <div className="insights-card glass-card symptoms-summary-card">
            <h3>📊 Ringkasan Gejala (7 Hari Terakhir)</h3>
            <p className="symptoms-meta-desc">Berdasarkan {symptomSummary.totalLogsAnalyzed} hari pencatatan aktif.</p>
            
            <div className="symptoms-stats-row">
              <div className="symptom-stat-box">
                <span className="symptom-stat-val">{symptomSummary.avgStress !== 'N/A' ? `${symptomSummary.avgStress}/5` : '—'}</span>
                <span className="symptom-stat-label">Rata-rata Stres</span>
              </div>
              <div className="symptom-stat-box">
                <span className="symptom-stat-val">{symptomSummary.avgSleep !== 'N/A' ? `${symptomSummary.avgSleep}/5` : '—'}</span>
                <span className="symptom-stat-label">Kualitas Tidur</span>
              </div>
            </div>

            <div className="symptoms-list-wrap">
              <h4>Gejala yang Paling Sering Terjadi:</h4>
              {symptomSummary.topSymptoms.length > 0 ? (
                <div className="symptom-bars">
                  {symptomSummary.topSymptoms.map((symptom, idx) => {
                    const maxCount = Math.max(...symptomSummary.topSymptoms.map(s => s.count));
                    const widthPercent = (symptom.count / maxCount) * 100;
                    return (
                      <div key={idx} className="symptom-bar-item">
                        <div className="symptom-bar-info">
                          <span className="symptom-name">{symptom.name}</span>
                          <span className="symptom-count">{symptom.count} kali</span>
                        </div>
                        <div className="symptom-bar-bg">
                          <div className="symptom-bar-fill" style={{ width: `${widthPercent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="symptoms-empty">
                  <span className="empty-emoji">🌿</span>
                  <p>Tidak ada gejala fisik/keluhan yang tercatat dalam seminggu terakhir. Kondisi Anda luar biasa!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Self-Care Recommendations */}
        <div className="insights-side-col">
          <h2 className="section-title">📋 Paket Self-Care Hari Ini</h2>
          
          <div className="recommendations-list">
            {recommendations.map((rec, idx) => {
              const icons = {
                diet: '🍎',
                exercise: '🧘',
                mind: '😴'
              };
              const gradients = {
                diet: 'linear-gradient(135deg, rgba(236, 72, 153, 0.05) 0%, rgba(244, 114, 182, 0.05) 100%)',
                exercise: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(192, 132, 252, 0.05) 100%)',
                mind: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(129, 140, 248, 0.05) 100%)'
              };
              const borders = {
                diet: '1px solid rgba(236, 72, 153, 0.15)',
                exercise: '1px solid rgba(168, 85, 247, 0.15)',
                mind: '1px solid rgba(99, 102, 241, 0.15)'
              };

              return (
                <div 
                  key={idx} 
                  className="rec-card glass-card"
                  style={{ background: gradients[rec.type], border: borders[rec.type] }}
                >
                  <div className="rec-card-header">
                    <span className="rec-icon">{icons[rec.type] || '✨'}</span>
                    <h3>{rec.title}</h3>
                  </div>
                  <p className="rec-content">{rec.content}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
