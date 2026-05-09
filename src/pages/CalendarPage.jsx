import { useState, useEffect } from 'react';
import api from '../services/api';
import './CalendarPage.css';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [cycles, setCycles] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [dailyLogs, setDailyLogs] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cyclesRes, predRes, logsRes] = await Promise.all([
        api.get('/cycles'),
        api.get('/predictions').catch(() => ({ data: null })),
        api.get('/daily-logs').catch(() => ({ data: [] })),
      ]);
      setCycles(cyclesRes.data);
      setPrediction(predRes.data);
      setDailyLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
    } catch (err) {
      console.error('Calendar load error:', err);
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const goToPrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Normalize any date value (Date object, ISO string, etc.) to "YYYY-MM-DD"
  const toDateStr = (val) => {
    if (!val) return '';
    if (typeof val === 'string' && val.length === 10) return val;
    return new Date(val).toISOString().split('T')[0];
  };

  const isInPeriod = (dateStr) => {
    return cycles.some(c => {
      const start = new Date(toDateStr(c.start_date));
      const end = c.end_date
        ? new Date(toDateStr(c.end_date))
        : new Date(start.getTime() + (c.period_length || 5) * 86400000);
      const d = new Date(dateStr);
      return d >= start && d <= end;
    });
  };

  const isPredicted = (dateStr) => {
    if (!prediction?.predicted_next_date) return false;
    const predDate = new Date(toDateStr(prediction.predicted_next_date));
    const d = new Date(dateStr);
    const predEnd = new Date(predDate.getTime() + 5 * 86400000);
    return d >= predDate && d <= predEnd;
  };

  const hasLog = (dateStr) => {
    return dailyLogs.some(l => toDateStr(l.date) === dateStr);
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const renderDays = () => {
    const days = [];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="cal-day empty"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
      const period = isInPeriod(dateStr);
      const predicted = isPredicted(dateStr);
      const logged = hasLog(dateStr);

      let className = 'cal-day';
      if (isToday) className += ' today';
      if (period) className += ' period';
      if (predicted) className += ' predicted';

      days.push(
        <div key={d} className={className}>
          <span className="day-number">{d}</span>
          <div className="day-indicators">
            {period && <span className="indicator period-dot" title="Period">🔴</span>}
            {predicted && !period && <span className="indicator predicted-dot" title="Predicted">🔮</span>}
            {logged && <span className="indicator log-dot" title="Daily log">📝</span>}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="calendar-page container animate-fade-in">
      <header className="page-header">
        <h1>📅 Cycle Calendar</h1>
      </header>

      <div className="calendar-card glass-card">
        <div className="calendar-nav">
          <button className="nav-btn" onClick={goToPrevMonth}>←</button>
          <div className="current-month">
            <h2>{monthNames[month]} {year}</h2>
            <button className="btn btn-sm btn-secondary" onClick={goToToday}>Today</button>
          </div>
          <button className="nav-btn" onClick={goToNextMonth}>→</button>
        </div>

        <div className="calendar-grid">
          {dayNames.map(name => (
            <div key={name} className="cal-header">{name}</div>
          ))}
          {renderDays()}
        </div>
      </div>

      <div className="calendar-legend glass-card">
        <h3>Legend</h3>
        <div className="legend-items">
          <div className="legend-item"><span className="legend-color period-color"></span> Period Days</div>
          <div className="legend-item"><span className="legend-color predicted-color"></span> Predicted Period</div>
          <div className="legend-item"><span>📝</span> Daily Log Recorded</div>
          <div className="legend-item"><span className="legend-color today-color"></span> Today</div>
        </div>
      </div>
    </div>
  );
}
