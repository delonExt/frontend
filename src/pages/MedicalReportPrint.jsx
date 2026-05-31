import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import './MedicalReportPrint.css';

// Helper to format dates to local YYYY-MM-DD strings without timezone shifting
const formatLocalDateString = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1;
  const day = parseInt(parts[2]);
  
  const d = new Date(year, month, day);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

export default function MedicalReportPrint() {
  const [searchParams] = useSearchParams();
  const range = searchParams.get('range') || '3';
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [cycleData, setCycleData] = useState([]);
  const [logData, setLogData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportData();
  }, [range]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      // Get Profile, Cycles, and daily logs
      const [profileRes, cyclesRes, logsRes] = await Promise.all([
        api.get('/profile'),
        api.get('/cycles'),
        api.get('/daily-logs')
      ]);

      setUserData(profileRes.data.user);
      
      // Filter logs by date range if necessary
      let filteredLogs = logsRes.data || [];
      if (range === '3' || range === '6') {
        const monthsLimit = parseInt(range);
        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - monthsLimit);
        
        filteredLogs = filteredLogs.filter(log => {
          const logDate = new Date(log.date);
          return logDate >= cutoffDate;
        });
      }
      setLogData(filteredLogs);

      // Filter cycles by date range if necessary
      let filteredCycles = cyclesRes.data || [];
      if (range === '3' || range === '6') {
        const monthsLimit = parseInt(range);
        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - monthsLimit);
        
        filteredCycles = filteredCycles.filter(c => {
          const cycleDate = new Date(c.start_date);
          return cycleDate >= cutoffDate;
        });
      }
      setCycleData(filteredCycles);

    } catch (err) {
      console.error('Error loading report data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger print dialog once data is loaded and rendered
  useEffect(() => {
    if (!loading && userData) {
      const timer = setTimeout(() => {
        window.print();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [loading, userData]);

  if (loading) {
    return (
      <div className="print-loading-screen">
        <div className="loading-spinner" />
        <p>Mempersiapkan Laporan Medis...</p>
      </div>
    );
  }

  // Calculate statistics
  const avgCycle = cycleData.length > 0
    ? Math.round(cycleData.reduce((s, c) => s + (c.cycle_length || 28), 0) / cycleData.length)
    : userData?.avg_cycle_length || 28;

  const avgPeriod = cycleData.length > 0
    ? parseFloat((cycleData.reduce((s, c) => s + (c.period_length || 5), 0) / cycleData.length).toFixed(1))
    : 5;

  return (
    <div className="print-report-container">
      {/* Interactive Controls (Hidden on Print) */}
      <div className="print-controls no-print">
        <button onClick={() => navigate('/profile')} className="btn btn-secondary btn-sm">
          ⬅️ Kembali ke Profil
        </button>
        <button onClick={() => window.print()} className="btn btn-primary btn-sm">
          🖨️ Cetak Ulang Laporan
        </button>
      </div>

      {/* Printable Report Document */}
      <div className="print-document">
        <header className="doc-header">
          <div className="header-title-block">
            <h1>LAPORAN RIWAYAT KESEHATAN MENSTRUASI</h1>
            <span className="doc-brand">Aplikasi Companion YeoCycles</span>
          </div>
          <div className="header-meta-block">
            <p><strong>Tanggal Cetak:</strong> {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
            <p><strong>Periode Laporan:</strong> {range === 'all' ? 'Semua Riwayat' : `${range} Bulan Terakhir`}</p>
          </div>
        </header>

        <section className="doc-section patient-info-section">
          <h2>👤 Informasi Pengguna</h2>
          <div className="patient-info-grid">
            <div className="info-item">
              <span className="info-label">Nama Lengkap:</span>
              <span className="info-value">{userData?.name || '—'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email Terdaftar:</span>
              <span className="info-value">{userData?.email || '—'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Tanggal Lahir:</span>
              <span className="info-value">
                {userData?.date_of_birth ? formatLocalDateString(userData.date_of_birth.split('T')[0]) : '—'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Rerata Siklus Terdaftar:</span>
              <span className="info-value">{userData?.avg_cycle_length || 28} hari</span>
            </div>
          </div>
        </section>

        <section className="doc-section summary-stats-section">
          <h2>📊 Ringkasan Statistik Periode Ini</h2>
          <div className="summary-stats-grid-print">
            <div className="stat-print-box">
              <span className="stat-print-val">{cycleData.length}</span>
              <span className="stat-print-label">Siklus Tercatat</span>
            </div>
            <div className="stat-print-box">
              <span className="stat-print-val">{avgCycle} hari</span>
              <span className="stat-print-label">Rerata Panjang Siklus</span>
            </div>
            <div className="stat-print-box">
              <span className="stat-print-val">{avgPeriod} hari</span>
              <span className="stat-print-label">Rerata Durasi Menstruasi</span>
            </div>
            <div className="stat-print-box">
              <span className="stat-print-val">{logData.length} hari</span>
              <span className="stat-print-label">Total Log Harian</span>
            </div>
          </div>
        </section>

        <section className="doc-section cycles-section">
          <h2>🔄 Riwayat Siklus Menstruasi</h2>
          {cycleData.length > 0 ? (
            <table className="report-table">
              <thead>
                <tr>
                  <th>Mulai Siklus</th>
                  <th>Selesai Siklus</th>
                  <th>Panjang Siklus</th>
                  <th>Durasi Haid</th>
                  <th>Volume Aliran</th>
                  <th>Catatan / Keluhan</th>
                </tr>
              </thead>
              <tbody>
                {cycleData.map((c, index) => (
                  <tr key={c.id || index}>
                    <td>{formatLocalDateString(c.start_date)}</td>
                    <td>{c.end_date ? formatLocalDateString(c.end_date) : 'Aktif/Sedang Berjalan'}</td>
                    <td>{c.cycle_length ? `${c.cycle_length} hari` : '—'}</td>
                    <td>{c.period_length ? `${c.period_length} hari` : '—'}</td>
                    <td className="capitalize">{c.flow_intensity || 'medium'}</td>
                    <td>{c.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data-msg">Tidak ada catatan siklus dalam rentang waktu terpilih.</p>
          )}
        </section>

        <section className="doc-section logs-section">
          <h2>📝 Log Gejala & Gaya Hidup Harian</h2>
          {logData.length > 0 ? (
            <table className="report-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Mood (1-5)</th>
                  <th>Tidur (1-5)</th>
                  <th>Stres (1-5)</th>
                  <th>Puasa</th>
                  <th>Gejala Fisik</th>
                  <th>Catatan Harian</th>
                </tr>
              </thead>
              <tbody>
                {logData.map((l, index) => {
                  let symptomsArr = [];
                  if (l.symptoms) {
                    try {
                      symptomsArr = JSON.parse(l.symptoms);
                    } catch (e) {
                      symptomsArr = [];
                    }
                  }
                  
                  return (
                    <tr key={l.id || index}>
                      <td>{formatLocalDateString(l.date)}</td>
                      <td>{l.mood || '—'}/5</td>
                      <td>{l.sleep_quality || '—'}/5</td>
                      <td>{l.stress_level || '—'}/5</td>
                      <td>{l.is_fasting ? 'Ya' : 'Tidak'}</td>
                      <td>
                        {symptomsArr.length > 0 ? (
                          <div className="print-symptoms-list">
                            {symptomsArr.map((sym, sIdx) => (
                              <span key={sIdx} className="print-symptom-tag">{sym}</span>
                            ))}
                          </div>
                        ) : 'Tidak ada'}
                      </td>
                      <td>{l.notes || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="no-data-msg">Tidak ada catatan harian dalam rentang waktu terpilih.</p>
          )}
        </section>

        <footer className="doc-footer">
          <p>Dokumen ini dihasilkan secara otomatis oleh sistem YeoCycles atas permintaan pengguna.</p>
          <p>© {new Date().getFullYear()} YeoCycles. Seluruh hak cipta dilindungi undang-undang.</p>
        </footer>
      </div>
    </div>
  );
}
