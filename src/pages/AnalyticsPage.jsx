import { useState, useEffect } from 'react';
import api from '../services/api';
import './AnalyticsPage.css';

// Helper to format dates to local YYYY-MM-DD strings without timezone shifting
const formatLocalDateString = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1;
  const day = parseInt(parts[2]);
  
  const d = new Date(year, month, day);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/analytics/trends');
      setData(res.data);
    } catch (err) {
      console.error('Fetch analytics error:', err);
      setError(err.response?.data?.error || 'Gagal memuat analitik kesehatan.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner" />
        <p>Menghitung dan memvisualisasikan tren kesehatan Anda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page container animate-fade-in">
        <div className="alert alert-error">
          <span>⚠️ {error}</span>
          <button className="btn btn-secondary btn-sm" onClick={fetchAnalytics} style={{ marginLeft: 'auto' }}>
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const { cycleStats, recentCyclesList, correlation, symptomDistribution, moodDistribution, lifestyleTrends } = data;

  // 1. Calculate needle rotation for Speedometer Gauge (SD ranges 0 to 6 days)
  // standard deviation regularityScore: 0 (most regular) to 6 (irregular)
  // angle range: -90deg (Sangat Teratur) to 90deg (Tidak Teratur)
  const regularityVal = cycleStats.regularityScore || 0;
  const maxRegularityVal = 6;
  const ratio = Math.min(regularityVal / maxRegularityVal, 1);
  const needleRotation = -90 + (ratio * 180); // maps 0..6 to -90..90 deg

  // 2. Generate path points for SVG Stress vs Sleep Line Chart
  const svgWidth = 650;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;
  
  const chartW = svgWidth - (paddingX * 2);
  const chartH = svgHeight - (paddingY * 2);

  let sleepPath = '';
  let stressPath = '';
  const sleepPoints = [];
  const stressPoints = [];

  const trendData = lifestyleTrends || [];

  if (trendData.length > 1) {
    trendData.forEach((item, idx) => {
      const x = paddingX + (idx * (chartW / (trendData.length - 1)));
      
      // Values are 1-5. Map 1 to chart bottom, 5 to chart top
      const sleepVal = item.sleep || 3;
      const stressVal = item.stress || 3;

      const ySleep = paddingY + chartH - ((sleepVal - 1) * (chartH / 4));
      const yStress = paddingY + chartH - ((stressVal - 1) * (chartH / 4));

      sleepPoints.push({ x, y: ySleep, value: sleepVal, date: item.date });
      stressPoints.push({ x, y: yStress, value: stressVal, date: item.date });

      if (idx === 0) {
        sleepPath = `M ${x} ${ySleep}`;
        stressPath = `M ${x} ${yStress}`;
      } else {
        sleepPath += ` L ${x} ${ySleep}`;
        stressPath += ` L ${x} ${yStress}`;
      }
    });
  }

  return (
    <div className="analytics-page container animate-fade-in">
      <header className="page-header analytics-header">
        <h1>📊 Analisis Siklus & Gaya Hidup</h1>
        <p>Analisis statistik mendalam dari riwayat siklus menstruasi, tingkat stres, dan kualitas tidur Anda.</p>
      </header>

      {/* Summary Cards */}
      <div className="analytics-stats-grid">
        <div className="analytics-stat-card glass-card">
          <span className="card-stat-emoji">📊</span>
          <span className="card-stat-num">{cycleStats.totalCycles}</span>
          <span className="card-stat-title">Total Siklus</span>
          <p className="card-stat-desc">Jumlah siklus haid yang tercatat</p>
        </div>

        <div className="analytics-stat-card glass-card">
          <span className="card-stat-emoji">📏</span>
          <span className="card-stat-num">{cycleStats.avgCycleLength || '—'} hari</span>
          <span className="card-stat-title">Rata-rata Panjang Siklus</span>
          <p className="card-stat-desc">Variasi normal berkisar 21-35 hari</p>
        </div>

        <div className="analytics-stat-card glass-card">
          <span className="card-stat-emoji">🩸</span>
          <span className="card-stat-num">{cycleStats.avgPeriodLength || '—'} hari</span>
          <span className="card-stat-title">Rata-rata Durasi Haid</span>
          <p className="card-stat-desc">Lama peluruhan dinding rahim</p>
        </div>

        <div className="analytics-stat-card glass-card">
          <span className="card-stat-emoji">⚖️</span>
          <span className="card-stat-num" style={{ fontSize: '1.25rem', marginTop: '6px', marginBottom: '8px' }}>
            {cycleStats.regularityStatus}
          </span>
          <span className="card-stat-title">Tingkat Regulasi Siklus</span>
          <p className="card-stat-desc">Variabilitas fluktuasi: {cycleStats.regularityScore} hari</p>
        </div>
      </div>

      <div className="analytics-sections-grid">
        {/* Speedometer & Cycle History */}
        <div className="analytics-left-col">
          {/* Speedometer Gauge */}
          <div className="analytics-card glass-card regularity-card">
            <h3>⚖️ Alat Pengukur Regulasi Siklus</h3>
            <p className="section-subtitle">Dihitung berdasarkan standar deviasi (fluktuasi) panjang siklus Anda.</p>
            
            <div className="gauge-wrapper">
              <svg className="gauge-svg" viewBox="0 0 200 120">
                <defs>
                  {/* Gradients */}
                  <linearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" /> {/* Green - Sangat Teratur */}
                    <stop offset="50%" stopColor="#f59e0b" /> {/* Amber - Teratur */}
                    <stop offset="100%" stopColor="#ef4444" /> {/* Red - Tidak Teratur */}
                  </linearGradient>
                </defs>
                
                {/* Arc Track */}
                <path 
                  d="M 20 100 A 80 80 0 0 1 180 100" 
                  fill="none" 
                  stroke="url(#gauge-grad)" 
                  strokeWidth="20" 
                  strokeLinecap="round"
                />

                {/* Needle Point */}
                <g transform={`translate(100, 100) rotate(${needleRotation})`}>
                  <line x1="0" y1="0" x2="0" y2="-75" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" />
                  <polygon points="-6,0 6,0 0,-15" fill="#1f2937" />
                </g>
                <circle cx="100" cy="100" r="10" fill="#111827" />
              </svg>

              <div className="gauge-label-wrap">
                <span className="gauge-val-indicator">{cycleStats.regularityStatus}</span>
                <span className="gauge-subval">Simpangan Baku: {cycleStats.regularityScore} hari</span>
              </div>
            </div>

            <div className="gauge-legend">
              <span className="legend-item"><span className="legend-dot green" /> Sangat Teratur (&lt;2 hari)</span>
              <span className="legend-item"><span className="legend-dot orange" /> Teratur (2-5 hari)</span>
              <span className="legend-item"><span className="legend-dot red" /> Tidak Teratur (&gt;5 hari)</span>
            </div>
          </div>

          {/* Cycle Length History Chart */}
          <div className="analytics-card glass-card history-chart-card">
            <h3>📈 Riwayat Panjang Siklus Menstruasi</h3>
            <p className="section-subtitle">Membandingkan panjang siklus menstruasi Anda dari waktu ke waktu.</p>
            
            {recentCyclesList.length > 0 ? (
              <div className="analytics-chart-container">
                <div className="chart-y-labels">
                  <span>45 hari</span>
                  <span>30 hari</span>
                  <span>15 hari</span>
                  <span>0</span>
                </div>

                <div className="chart-bars-container">
                  {recentCyclesList.map((c, idx) => {
                    const cycleVal = c.cycle_length || 28;
                    const heightPct = Math.min((cycleVal / 45) * 100, 100);
                    return (
                      <div key={c.id || idx} className="chart-bar-col">
                        <div className="bar-tooltip">
                          <p><strong>{cycleVal} hari</strong></p>
                          <p>Mulai: {formatLocalDateString(c.start_date)}</p>
                          <p>Volume: {c.flow_intensity || 'Medium'}</p>
                          {c.notes && <p className="tooltip-notes">"{c.notes}"</p>}
                        </div>
                        <div className="bar-wrapper">
                          <div 
                            className="bar-fill-gradient" 
                            style={{ 
                              height: `${heightPct}%`,
                              background: 'linear-gradient(to top, #c084fc 0%, #ec4899 100%)'
                            }} 
                          />
                        </div>
                        <span className="bar-label">{formatLocalDateString(c.start_date)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="chart-empty-state">
                <p>Belum ada riwayat siklus yang tercatat. Silakan masukkan data siklus Anda di halaman Cycles.</p>
              </div>
            )}
          </div>
        </div>

        {/* Correlation & Mood & Symptoms */}
        <div className="analytics-right-col">
          {/* Stress vs Sleep correlation */}
          <div className="analytics-card glass-card correlation-card">
            <h3>😰 Stres vs 💤 Kualitas Tidur (Korelasi Gaya Hidup)</h3>
            <p className="section-subtitle">Melihat dampak tingkat stres terhadap kenyenyakan istirahat Anda.</p>
            
            {trendData.length > 1 ? (
              <>
                <div className="correlation-info-badge">
                  <span className="corr-status">{correlation.status}</span>
                  <p className="corr-message">{correlation.message}</p>
                </div>

                {/* SVG double-line graph */}
                <div className="correlation-svg-wrapper">
                  <svg className="line-chart-svg" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
                    {/* Grid Lines */}
                    {[1, 2, 3, 4, 5].map((val) => {
                      const y = paddingY + chartH - ((val - 1) * (chartH / 4));
                      return (
                        <g key={val}>
                          <line x1={paddingX} y1={y} x2={svgWidth - paddingX} y2={y} stroke="#e4e4e7" strokeDasharray="3 3" />
                          <text x={paddingX - 10} y={y + 4} textAnchor="end" fontSize="10" fill="#a1a1aa">{val}</text>
                        </g>
                      );
                    })}

                    {/* Chart Paths */}
                    {sleepPath && <path d={sleepPath} fill="none" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" />}
                    {stressPath && <path d={stressPath} fill="none" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" />}

                    {/* Circular Nodes for sleep */}
                    {sleepPoints.map((pt, idx) => (
                      <g key={`sleep-${idx}`} className="chart-node-group">
                        <circle cx={pt.x} cy={pt.y} r="5" fill="#a855f7" stroke="#ffffff" strokeWidth="1.5" />
                        <foreignObject x={pt.x - 40} y={pt.y - 32} width="80" height="25" className="node-tooltip-fo">
                          <div className="node-tooltip-val">Tidur: {pt.value}</div>
                        </foreignObject>
                      </g>
                    ))}

                    {/* Circular Nodes for stress */}
                    {stressPoints.map((pt, idx) => (
                      <g key={`stress-${idx}`} className="chart-node-group">
                        <circle cx={pt.x} cy={pt.y} r="5" fill="#ec4899" stroke="#ffffff" strokeWidth="1.5" />
                        <foreignObject x={pt.x - 40} y={pt.y - 32} width="80" height="25" className="node-tooltip-fo">
                          <div className="node-tooltip-val">Stres: {pt.value}</div>
                        </foreignObject>
                      </g>
                    ))}
                  </svg>
                  
                  <div className="line-chart-legend">
                    <span className="legend-label sleep"><span className="legend-line-color sleep" /> Kualitas Tidur</span>
                    <span className="legend-label stress"><span className="legend-line-color stress" /> Tingkat Stres</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="chart-empty-state">
                <p>Silakan isi setidaknya 4 log harian aktif untuk menghasilkan visualisasi korelasi gaya hidup.</p>
              </div>
            )}
          </div>

          {/* Symptom distribution & Mood frequencies */}
          <div className="analytics-card glass-card symptoms-mood-card">
            <h3>📋 Gejala Terbanyak & Distribusi Mood</h3>
            
            <div className="symptoms-mood-split">
              {/* Symptoms frequencies */}
              <div className="symptom-column">
                <h4>Gejala Fisik Terbanyak</h4>
                {symptomDistribution.length > 0 ? (
                  <div className="symptom-list-pct">
                    {symptomDistribution.map((item, idx) => {
                      const total = symptomDistribution.reduce((sum, s) => sum + s.count, 0);
                      const percent = Math.round((item.count / total) * 100);
                      return (
                        <div key={idx} className="symptom-pct-item">
                          <div className="symptom-pct-info">
                            <span className="sym-name">{item.name}</span>
                            <span className="sym-pct">{percent}%</span>
                          </div>
                          <div className="sym-pct-bar-bg">
                            <div className="sym-pct-bar-fill" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="empty-subtext">Belum ada catatan gejala fisik terdaftar.</p>
                )}
              </div>

              {/* Mood frequencies */}
              <div className="mood-column">
                <h4>Frekuensi Mood Harian</h4>
                <div className="mood-bar-list">
                  {Object.keys(moodDistribution).map((moodVal) => {
                    const count = moodDistribution[moodVal];
                    const maxCount = Math.max(...Object.values(moodDistribution), 1);
                    const widthPct = (count / maxCount) * 100;
                    const moodEmojis = ['', '😢', '😔', '😐', '😊', '😄'];
                    
                    return (
                      <div key={moodVal} className="mood-bar-row">
                        <span className="mood-row-emoji">{moodEmojis[moodVal]}</span>
                        <div className="mood-row-bar-bg">
                          <div 
                            className="mood-row-bar-fill" 
                            style={{ 
                              width: `${widthPct}%`,
                              background: 'var(--gradient-primary)'
                            }} 
                          />
                        </div>
                        <span className="mood-row-count">{count}h</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
