import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import './LandingPage.css';

// ─── Data ──────────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: '🩸', colorClass: 'lp-icon-pink', name: 'Pelacakan Siklus', desc: 'Catat tanggal mulai & selesai, intensitas aliran, dan panjang siklus. Visualisasikan polamu dari waktu ke waktu.' },
  { icon: '📝', colorClass: 'lp-icon-purple', name: 'Log Harian', desc: 'Rekam mood, gejala, kualitas tidur, tingkat stres, dan status puasa setiap hari.' },
  { icon: '🤖', colorClass: 'lp-icon-blue', name: 'Prediksi AI (LSTM)', desc: 'Model deep learning LSTM menganalisis pola siklusmu untuk prediksi tanggal menstruasi berikutnya.' },
  { icon: '📅', colorClass: 'lp-icon-green', name: 'Kalender Interaktif', desc: 'Lihat seluruh riwayat siklus dalam tampilan kalender yang intuitif dan berwarna.' },
  { icon: '📊', colorClass: 'lp-icon-orange', name: 'Dashboard Analytics', desc: 'Ringkasan cerdas: panjang siklus rata-rata, prediksi mendatang, dan status harian.' },
  { icon: '⭐', colorClass: 'lp-icon-rose', name: 'Feedback & Akurasi', desc: 'Beri rating prediksi dan bantu model AI terus belajar dari data nyatamu.' },
];

const STEPS = [
  { emoji: '📱', num: '1', title: 'Daftar Akun Gratis', desc: 'Buat akun dalam hitungan detik. Langsung mulai melacak kesehatanmu.' },
  { emoji: '📋', num: '2', title: 'Catat Siklus & Log', desc: 'Input data siklus dan kondisi harianmu. Semakin banyak data, semakin akurat.' },
  { emoji: '🎯', num: '3', title: 'Dapatkan Prediksi AI', desc: 'Model LSTM menganalisis polamu dan memprediksi siklus berikutnya.' },
];

const TESTIMONIALS = [
  { stars: 5, text: '"Aplikasi ini benar-benar mengubah cara aku memahami tubuhku. Prediksi AI-nya akurat sekali!"', initial: 'S', name: 'Sari Dewi', role: 'Mahasiswi, 22 tahun' },
  { stars: 5, text: '"Fitur log harian yang mencatat mood dan stres sangat membantu. Aku jadi tahu pola emosiku."', initial: 'A', name: 'Anisa Putri', role: 'Karyawan Swasta, 27 tahun' },
  { stars: 5, text: '"Dashboard-nya bersih dan informatif. Sekarang aku tidak khawatir lagi tentang siklusku."', initial: 'R', name: 'Rina Wulandari', role: 'Ibu Rumah Tangga, 31 tahun' },
];

const QUIZ_QUESTIONS = [
  {
    question: "Apakah minum es atau air dingin saat menstruasi dapat membekukan darah haid?",
    type: "MYTH",
    explanation: "MITOS! Air dingin masuk ke lambung (sistem pencernaan), sedangkan darah haid dilepaskan di rahim (sistem reproduksi). Keduanya tidak saling berhubungan sama sekali."
  },
  {
    question: "Apakah olahraga ringan seperti yoga dan jalan santai justru membantu mengurangi kram menstruasi?",
    type: "FACT",
    explanation: "FAKTA! Olahraga ringan melepaskan endorfin (pereda nyeri alami tubuh) dan membantu melancarkan peredaran darah, merelaksasi otot panggul yang tegang."
  },
  {
    question: "Apakah siklus menstruasi yang normal harus selalu tepat 28 hari setiap bulannya?",
    type: "MYTH",
    explanation: "MITOS! Setiap wanita unik. Siklus normal dan sehat berkisar antara 21 hingga 35 hari. Variasi beberapa hari antar siklus adalah hal yang normal."
  },
  {
    question: "Apakah mencatat log harian seperti mood, kualitas tidur, dan stres berkontribusi pada presisi prediksi AI?",
    type: "FACT",
    explanation: "FAKTA! Pola hormonal berinteraksi erat dengan gejala harian. Menyuplai data contextual membantu model AI (LSTM) mempelajari siklus unik Anda secara mendalam."
  },
  {
    question: "Apakah kram perut menstruasi yang sangat parah sampai mengganggu aktivitas harian adalah hal normal?",
    type: "MYTH",
    explanation: "MITOS! Kram ringan wajar terjadi, namun nyeri tak tertahankan (dismenore parah) yang mengganggu produktivitas bisa menjadi indikasi kondisi medis seperti endometriosis dan sebaiknya dikonsultasikan dengan dokter."
  }
];

// ─── Typing Hook ───────────────────────────────────────────────────────────

function useTypingEffect(text, speed = 80, delay = 800) {
  const [displayText, setDisplayText] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let timeout;
    let i = 0;
    timeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayText(text.slice(0, i + 1));
          i++;
        } else {
          setDone(true);
          clearInterval(interval);
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return { displayText, done };
}

// ─── Counter Hook ──────────────────────────────────────────────────────────

function AnimatedCounter({ target, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const num = parseInt(target);
          if (isNaN(num)) { setCount(target); return; }
          const step = Math.ceil(num / (duration / 16));
          let current = 0;
          const timer = setInterval(() => {
            current += step;
            if (current >= num) { setCount(num); clearInterval(timer); }
            else setCount(current);
          }, 16);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const navRef = useRef(null);
  const confidenceFillRef = useRef(null);
  const heroTyping = useTypingEffect('Kuasai Siklusmu ✨', 90, 600);

  // Hamburger mobile menu state
  const [menuOpen, setMenuOpen] = useState(false);

  // Myth vs Fact Game states
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [gameState, setGameState] = useState('PLAYING'); // 'PLAYING', 'ANSWERED', 'COMPLETED'
  const [selectedAnswer, setSelectedAnswer] = useState(null); // 'MYTH', 'FACT'
  const [score, setScore] = useState(0);
  const [confetti, setConfetti] = useState([]);

  // Chatbot states
  const [chatOpen, setChatOpen] = useState(false);
  const [chatbotMessages, setChatbotMessages] = useState([
    {
      sender: 'bot',
      text: 'Halo! Saya Siska, asisten digital kesehatan menstruasimu di YeoCycles. Ada yang bisa saya bantu hari ini seputar siklus haid atau menstruasimu?'
    }
  ]);
  const [chatbotInput, setChatbotInput] = useState('');
  const [botTyping, setBotTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (token) navigate('/dashboard', { replace: true });
  }, [token, navigate]);

  // Navbar scroll
  useEffect(() => {
    const onScroll = () => navRef.current?.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll reveal
  useEffect(() => {
    const els = document.querySelectorAll('.lp-reveal, .lp-feature-card, .lp-step, .lp-testimonial-card, .lp-phase, .lp-myth-card, .lp-health-tip, .lp-game-card');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('lp-visible'); }),
      { threshold: 0.1 }
    );
    els.forEach((el) => observer.observe(el));

    const barObs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting && confidenceFillRef.current) confidenceFillRef.current.classList.add('lp-animate'); }),
      { threshold: 0.5 }
    );
    if (confidenceFillRef.current) barObs.observe(confidenceFillRef.current);
    return () => { observer.disconnect(); barObs.disconnect(); };
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatbotMessages, botTyping]);

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Chatbot logic
  const handleSendChat = (e) => {
    if (e) e.preventDefault();
    if (!chatbotInput.trim()) return;

    const userText = chatbotInput.trim();
    setChatbotMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatbotInput('');
    setBotTyping(true);

    setTimeout(() => {
      let reply = '';
      const cleanText = userText.toLowerCase();

      // Check if creator-related question
      if (
        cleanText.includes('siapa yang membuat') ||
        cleanText.includes('siapa pembuat') ||
        cleanText.includes('siapa yang bikin') ||
        cleanText.includes('siapa pembuatnya') ||
        cleanText.includes('siapa developer') ||
        cleanText.includes('siapa buat') ||
        cleanText.includes('dibuat oleh') ||
        cleanText.includes('nama pembuat')
      ) {
        reply = 'Aplikasi YeoCycles dan chatbot ini dibuat oleh Ridho dan teman-teman, powered by kamidukung!';
      } else {
        // Keyword checking
        const keywords = [
          'haid', 'menstruasi', 'datang bulan', 'period', 'siklus', 'pms', 
          'kram', 'nyeri', 'pembalut', 'ovulasi', 'subur', 'darah', 'hormon', 
          'mood', 'stres', 'puasa', 'yeocycles', 'aplikasi', 'fitur', 'lstm', 'ai', 'prediksi',
          'kamidukung', 'ridho'
        ];

        const isRelated = keywords.some(keyword => cleanText.includes(keyword));

        if (!isRelated) {
          reply = 'Maaf, saya hanya dapat menjawab pertanyaan yang berkaitan dengan kesehatan menstruasi dan siklus haid. Ada hal seputar menstruasi yang ingin Anda tanyakan?';
        } else {
          // Specific responses
          if (cleanText.includes('kram') || cleanText.includes('nyeri') || cleanText.includes('sakit')) {
            reply = 'Untuk meredakan kram menstruasi ringan, Anda bisa mengompres hangat perut bagian bawah, minum air putih hangat, berolahraga ringan seperti yoga, dan pastikan istirahat cukup.';
          } else if (cleanText.includes('normal') || cleanText.includes('berapa hari') || cleanText.includes('panjang')) {
            reply = 'Siklus menstruasi sehat dan normal biasanya berkisar 21-35 hari, dengan lama haid 3-7 hari. Mengalami pergeseran beberapa hari adalah hal wajar karena pengaruh hormon atau stres.';
          } else if (cleanText.includes('pms') || cleanText.includes('gejala')) {
            reply = 'Sindrom Pramenstruasi (PMS) ditandai dengan perubahan mood, nyeri payudara, kram ringan, dan kelelahan. Ini disebabkan fluktuasi hormon estrogen dan progesteron.';
          } else if (cleanText.includes('lstm') || cleanText.includes('ai') || cleanText.includes('prediksi') || cleanText.includes('cara kerja')) {
            reply = 'YeoCycles menggunakan algoritma LSTM deep learning untuk menganalisis data siklus historis dan log harian Anda guna memberikan prediksi hari mulai haid berikutnya dengan presisi tinggi.';
          } else if (cleanText.includes('puasa')) {
            reply = 'Status puasa dalam YeoCycles membantu model AI kami mendeteksi apakah pola asupan nutrisi Anda memengaruhi keteraturan siklus bulanan Anda secara biologis.';
          } else {
            reply = 'Tentu! Menjaga pola hidup sehat, beristirahat cukup, mengonsumsi nutrisi kaya zat besi dan magnesium, serta melacak siklus secara rutin dengan YeoCycles sangat baik untuk memantau kesehatan reproduksi Anda. Apakah ada pertanyaan spesifik lainnya?';
          }
        }
      }

      setBotTyping(false);
      setChatbotMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    }, 1000);
  };

  // Game Handlers
  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
    setGameState('ANSWERED');
    const isCorrect = answer === QUIZ_QUESTIONS[currentQuestion].type;
    if (isCorrect) {
      setScore(prev => prev + 1);
      // Spawn CSS confetti
      const particles = [];
      const colors = ['#ec4899', '#a855f7', '#6366f1', '#10b981', '#f59e0b'];
      for (let i = 0; i < 30; i++) {
        particles.push({
          id: Math.random(),
          left: `${10 + Math.random() * 80}%`,
          color: colors[Math.floor(Math.random() * colors.length)],
          delay: `${Math.random() * 0.5}s`,
          size: `${4 + Math.random() * 8}px`
        });
      }
      setConfetti(particles);
      setTimeout(() => setConfetti([]), 2500);
    }
  };

  const handleNext = () => {
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setGameState('PLAYING');
      setSelectedAnswer(null);
    } else {
      setGameState('COMPLETED');
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setGameState('PLAYING');
    setSelectedAnswer(null);
    setScore(0);
  };

  return (
    <div className="lp-root">
      {/* ── NAVBAR ─── */}
      <nav ref={navRef} className="lp-nav">
        <div className="lp-nav-inner">
          <Link to="/" className="lp-logo" onClick={() => setMenuOpen(false)}>
            <img src={logo} alt="YeoCycles" className="lp-logo-img" />
            <span className="lp-logo-text">YeoCycles</span>
          </Link>
          <ul className={`lp-nav-links ${menuOpen ? 'active' : ''}`}>
            <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollTo('features'); }}>Fitur</a></li>
            <li><a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollTo('how-it-works'); }}>Cara Kerja</a></li>
            <li><a href="#education" onClick={(e) => { e.preventDefault(); scrollTo('education'); }}>Edukasi</a></li>
            <li><a href="#cycle-game" onClick={(e) => { e.preventDefault(); scrollTo('cycle-game'); }}>Game Edukasi</a></li>
            <li><a href="#testimonials" onClick={(e) => { e.preventDefault(); scrollTo('testimonials'); }}>Testimoni</a></li>
          </ul>
          <div className="lp-nav-actions">
            <Link to="/login" className="lp-btn-ghost">Masuk</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Daftar Gratis</Link>
          </div>
          <div 
            className={`lp-hamburger ${menuOpen ? 'active' : ''}`} 
            role="button" 
            tabIndex={0}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span />
            <span />
            <span />
          </div>
        </div>
      </nav>

      {/* ── HERO ─── */}
      <section className="lp-hero">
        {/* Blobs */}
        <div className="lp-blobs">
          <div className="lp-blob lp-blob-1" />
          <div className="lp-blob lp-blob-2" />
          <div className="lp-blob lp-blob-3" />
        </div>

        {/* Floating petals */}
        <div className="lp-petals">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className={`lp-petal lp-petal-${(i % 3) + 1}`} style={{
              left: `${5 + Math.random() * 90}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${8 + Math.random() * 6}s`,
            }} />
          ))}
        </div>

        {/* Sparkle particles */}
        <div className="lp-sparkles">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="lp-sparkle" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
            }} />
          ))}
        </div>

        <div className="lp-hero-inner">
          <div className="lp-hero-copy">
            <div className="lp-hero-badge">
              <span className="lp-badge-pulse" />
              Berbasis AI · LSTM · Gratis Selamanya
            </div>

            <h1 className="lp-hero-title">
              Kenali Tubuhmu,<br />
              <span className="lp-gradient-text lp-typing-text">
                {heroTyping.displayText}
                {!heroTyping.done && <span className="lp-cursor">|</span>}
              </span>
            </h1>

            <p className="lp-hero-subtitle">
              <strong>YeoCycles</strong> membantu kamu melacak siklus menstruasi,
              mencatat kondisi harian, dan mendapatkan <strong>prediksi AI berbasis LSTM</strong>{' '}
              yang personal dan akurat.
            </p>

            <div className="lp-hero-actions">
              <Link to="/register" className="btn btn-primary btn-lg lp-btn-glow lp-btn-shimmer">
                🚀 Mulai Gratis Sekarang
              </Link>
              <button className="btn btn-secondary btn-lg" onClick={() => scrollTo('how-it-works')}>
                Lihat Cara Kerja
              </button>
            </div>

            <div className="lp-hero-trust">
              <div className="lp-trust-avatars">
                <span>S</span><span>A</span><span>R</span><span>+</span>
              </div>
              <p className="lp-trust-text">
                Dipercaya <strong>500+ pengguna</strong> · Prediksi AI <strong>92% akurat</strong>
              </p>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="lp-hero-visual">
            <div className="lp-hero-phone">
              <div className="lp-phone-glow" />
              <div className="lp-app-mock">
                <div className="lp-mock-header">
                  <div className="lp-mock-brand">
                    <img src={logo} alt="" className="lp-mock-logo" />
                    <span className="lp-mock-title">Dashboard</span>
                  </div>
                  <span className="lp-mock-badge lp-badge-pulse-ring">AI Active</span>
                </div>
                <div className="lp-mock-cycle">
                  <div className="lp-mock-cycle-ring">
                    <svg viewBox="0 0 80 80" className="lp-ring-svg">
                      <circle cx="40" cy="40" r="34" className="lp-ring-bg" />
                      <circle cx="40" cy="40" r="34" className="lp-ring-fill" />
                    </svg>
                    <div className="lp-ring-content">
                      <div className="lp-mock-cycle-days">12</div>
                      <div className="lp-mock-cycle-sub">hari lagi</div>
                    </div>
                  </div>
                  <div className="lp-mock-cycle-label">Siklus Berikutnya · Est. 7 April</div>
                </div>
                <div className="lp-mock-row">
                  <div className="lp-mock-stat"><div className="lp-mock-stat-icon">😊</div><div className="lp-mock-stat-val">4/5</div><div className="lp-mock-stat-label">Mood</div></div>
                  <div className="lp-mock-stat"><div className="lp-mock-stat-icon">💤</div><div className="lp-mock-stat-val">7j</div><div className="lp-mock-stat-label">Tidur</div></div>
                  <div className="lp-mock-stat"><div className="lp-mock-stat-icon">🧘</div><div className="lp-mock-stat-val">Low</div><div className="lp-mock-stat-label">Stres</div></div>
                </div>
                <div className="lp-mock-ai"><div className="lp-mock-ai-text">🤖 Prediksi AI (LSTM)</div><div className="lp-mock-ai-conf">92%</div></div>
              </div>
              <div className="lp-float-card lp-float-1"><div className="lp-float-icon" style={{ background: '#f0fdf4' }}>✅</div>Log harian tersimpan!</div>
              <div className="lp-float-card lp-float-2"><div className="lp-float-icon" style={{ background: '#fdf4ff' }}>🎯</div>Prediksi diperbarui</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ─── */}
      <section className="lp-stats">
        <div className="lp-stats-inner">
          <div className="lp-stats-grid">
            {[
              { icon: '👩', num: 500, suffix: '+', label: 'Pengguna Aktif', sub: 'Dan terus bertumbuh setiap hari' },
              { icon: '🎯', num: 92, suffix: '%', label: 'Akurasi Prediksi AI', sub: 'Berdasarkan feedback pengguna' },
              { icon: '✨', num: 8, suffix: '+', label: 'Fitur Lengkap', sub: 'Semuanya gratis tanpa batas' },
            ].map((s) => (
              <div key={s.label} className="lp-stat-card lp-reveal">
                <div className="lp-stat-icon">{s.icon}</div>
                <div className="lp-stat-number"><AnimatedCounter target={s.num} suffix={s.suffix} /></div>
                <div className="lp-stat-label">{s.label}</div>
                <div className="lp-stat-sub">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─── */}
      <section id="features" className="lp-features">
        <div className="lp-features-inner">
          <div className="lp-section-header lp-reveal">
            <div className="lp-section-tag">✨ Fitur Unggulan</div>
            <h2 className="lp-section-title">Semua yang Kamu Butuhkan</h2>
            <p className="lp-section-desc">Dari pelacakan siklus hingga prediksi berbasis deep learning — teknologi terkini untuk kesehatanmu.</p>
          </div>
          <div className="lp-features-grid">
            {FEATURES.map((f, i) => (
              <div key={f.name} className="lp-feature-card" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={`lp-feature-icon-wrap ${f.colorClass}`}>{f.icon}</div>
                <h3 className="lp-feature-name">{f.name}</h3>
                <p className="lp-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─── */}
      <section id="how-it-works" className="lp-how">
        <div className="lp-how-inner">
          <div className="lp-section-header lp-reveal">
            <div className="lp-section-tag">🚀 Cara Kerja</div>
            <h2 className="lp-section-title">Mulai dalam 3 Langkah Mudah</h2>
            <p className="lp-section-desc">Daftar, catat, dan biarkan AI kami bekerja untukmu.</p>
          </div>
          <div className="lp-steps">
            {STEPS.map((s, i) => (
              <div key={s.title} className="lp-step" style={{ animationDelay: `${i * 0.2}s` }}>
                <div className="lp-step-num"><span className="lp-step-emoji">{s.emoji}</span><span className="lp-step-count">{s.num}</span></div>
                <h3 className="lp-step-title">{s.title}</h3>
                <p className="lp-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EDUKASI KESEHATAN ─── */}
      <section id="education" className="lp-edu">
        <div className="lp-edu-inner">
          <div className="lp-section-header lp-reveal">
            <div className="lp-section-tag">🌸 Edukasi Kesehatan</div>
            <h2 className="lp-section-title">Pahami Siklusmu Lebih Dalam</h2>
            <p className="lp-section-desc">Setiap siklus menstruasi terdiri dari 4 fase penting. Kenali setiap fase untuk memahami tubuhmu lebih baik.</p>
          </div>

          {/* Cycle Phases */}
          <div className="lp-edu-subtitle lp-reveal"><h3>🔄 Fase Siklus Menstruasi</h3></div>
          <div className="lp-cycle-phases">
            {[
              { icon: '🔴', bg: '#fef2f2', color: '#ef4444', name: 'Menstruasi', days: 'Hari 1-5', desc: 'Lapisan rahim luruh. Istirahat cukup & jaga nutrisi.' },
              { icon: '🟡', bg: '#fffbeb', color: '#f59e0b', name: 'Folikular', days: 'Hari 6-13', desc: 'Energi meningkat. Waktu terbaik untuk olahraga.' },
              { icon: '🟢', bg: '#f0fdf4', color: '#22c55e', name: 'Ovulasi', days: 'Hari 14-16', desc: 'Sel telur dilepaskan. Masa paling subur.' },
              { icon: '🟣', bg: '#faf5ff', color: '#a855f7', name: 'Luteal', days: 'Hari 17-28', desc: 'PMS bisa muncul. Kelola stres & tidur cukup.' },
            ].map((phase, i) => (
              <React.Fragment key={phase.name}>
                {i > 0 && <span className="lp-phase-arrow">→</span>}
                <div className="lp-phase" style={{ animationDelay: `${i * 0.15}s` }}>
                  <div className="lp-phase-icon" style={{ background: phase.bg, color: phase.color }}>{phase.icon}</div>
                  <div className="lp-phase-name">{phase.name}</div>
                  <div className="lp-phase-days">{phase.days}</div>
                  <div className="lp-phase-desc">{phase.desc}</div>
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Myth vs Fact */}
          <div className="lp-edu-subtitle lp-reveal"><h3>❌ Mitos vs ✅ Fakta</h3><p>Klik kartu untuk lihat faktanya!</p></div>
          <div className="lp-myths-grid">
            {[
              { myth: '"Tidak boleh keramas saat menstruasi"', fact: 'Keramas saat menstruasi aman dan justru membantu menjaga kebersihan serta mengurangi ketidaknyamanan.' },
              { myth: '"Olahraga harus dihindari saat haid"', fact: 'Olahraga ringan seperti jalan kaki dan yoga justru membantu mengurangi kram dan memperbaiki mood.' },
              { myth: '"Siklus harus selalu 28 hari"', fact: 'Siklus normal berkisar 21-35 hari. Setiap wanita memiliki pola unik yang bisa dilacak dengan YeoCycles.' },
              { myth: '"Makan pedas memperburuk menstruasi"', fact: 'Tidak ada bukti ilmiah yang mendukung hal ini. Makan sesuai selera tetap aman dilakukan.' },
            ].map((item, i) => (
              <div key={i} className="lp-myth-card" style={{ animationDelay: `${i * 0.1}s` }}
                onClick={(e) => e.currentTarget.classList.toggle('flipped')}>
                <div className="lp-myth-card-inner">
                  <div className="lp-myth-front">
                    <span className="lp-myth-label myth">❌ Mitos</span>
                    <p className="lp-myth-text">{item.myth}</p>
                    <p className="lp-myth-hint">👆 Klik untuk lihat faktanya</p>
                  </div>
                  <div className="lp-myth-back">
                    <span className="lp-myth-label fact">✅ Fakta</span>
                    <p className="lp-myth-text">{item.fact}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Health Tips */}
          <div className="lp-edu-subtitle lp-reveal"><h3>💡 Tips Sehat Selama Siklus</h3></div>
          <div className="lp-health-grid">
            {[
              { icon: '🧘', title: 'Olahraga Ringan', text: 'Yoga, stretching, dan jalan santai membantu mengurangi kram dan meningkatkan mood.' },
              { icon: '💧', title: 'Tetap Terhidrasi', text: 'Minum 8-10 gelas air per hari untuk mengurangi kembung dan kelelahan.' },
              { icon: '🍎', title: 'Nutrisi Seimbang', text: 'Perbanyak zat besi, magnesium, dan vitamin B6 untuk mengganti nutrisi yang hilang.' },
              { icon: '😴', title: 'Istirahat Cukup', text: 'Tidur 7-9 jam berkualitas, terutama selama fase luteal untuk mengatur hormon.' },
            ].map((tip, i) => (
              <div key={i} className="lp-health-tip" style={{ animationDelay: `${i * 0.12}s` }}>
                <span className="lp-health-tip-icon">{tip.icon}</span>
                <div className="lp-health-tip-title">{tip.title}</div>
                <p className="lp-health-tip-text">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GAME EDUKASI INTERAKTIF (NEW) ─── */}
      <section id="cycle-game" className="lp-game-section">
        <div className="lp-game-container">
          <div className="lp-section-header lp-reveal">
            <div className="lp-section-tag">🎮 Game Edukasi</div>
            <h2 className="lp-section-title">Cycle Myth-Busters</h2>
            <p className="lp-section-desc">Uji pengetahuanmu seputar menstruasi dan tubuh wanita dalam game kuis edukatif yang seru ini!</p>
          </div>

          <div className="lp-game-card lp-reveal">
            {confetti.map((c) => (
              <div 
                key={c.id} 
                className="lp-confetti-particle" 
                style={{ left: c.left, backgroundColor: c.color, animationDelay: c.delay, width: c.size, height: c.size }}
              />
            ))}

            {gameState !== 'COMPLETED' ? (
              <>
                <div className="lp-game-progress-bar">
                  <div 
                    className="lp-game-progress-fill" 
                    style={{ width: `${((currentQuestion + (gameState === 'ANSWERED' ? 1 : 0)) / QUIZ_QUESTIONS.length) * 100}%` }}
                  />
                </div>
                
                <div className="lp-game-step-info">
                  Pertanyaan {currentQuestion + 1} dari {QUIZ_QUESTIONS.length}
                </div>

                <h3 className="lp-game-question">
                  "{QUIZ_QUESTIONS[currentQuestion].question}"
                </h3>

                <div className="lp-game-btn-grid">
                  <button 
                    className="btn lp-game-btn-myth"
                    disabled={gameState === 'ANSWERED'}
                    onClick={() => handleAnswer('MYTH')}
                  >
                    ❌ Mitos
                  </button>
                  <button 
                    className="btn lp-game-btn-fact"
                    disabled={gameState === 'ANSWERED'}
                    onClick={() => handleAnswer('FACT')}
                  >
                    ✅ Fakta
                  </button>
                </div>

                {gameState === 'ANSWERED' && (
                  <div className={`lp-game-feedback-card ${selectedAnswer === QUIZ_QUESTIONS[currentQuestion].type ? 'correct' : 'wrong'}`}>
                    <div className={`lp-game-feedback-title ${selectedAnswer === QUIZ_QUESTIONS[currentQuestion].type ? 'correct' : 'wrong'}`}>
                      {selectedAnswer === QUIZ_QUESTIONS[currentQuestion].type ? '🎉 Tepat Sekali!' : '😢 Belum Tepat'}
                    </div>
                    <p className="lp-game-explanation">
                      {QUIZ_QUESTIONS[currentQuestion].explanation}
                    </p>
                    <button 
                      className="btn btn-primary" 
                      style={{ marginTop: '20px' }}
                      onClick={handleNext}
                    >
                      {currentQuestion < QUIZ_QUESTIONS.length - 1 ? 'Pertanyaan Berikutnya ➡️' : 'Lihat Hasil Akhir 🏆'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="lp-game-result-slide">
                <span style={{ fontSize: '4rem' }}>🏆</span>
                <h3 className="lp-game-result-title">Tantangan Selesai!</h3>
                <div className="lp-game-score-badge">
                  {score} / {QUIZ_QUESTIONS.length}
                </div>
                <p className="lp-game-score-msg">
                  {score === QUIZ_QUESTIONS.length 
                    ? "Luar biasa! Anda adalah pakar kesehatan siklus sejati! 🌟" 
                    : score >= 3 
                    ? "Hebat sekali! Anda sangat mengenal tubuh Anda dengan baik. 👍" 
                    : "Bagus! Mari terus belajar memahami siklus tubuh Anda bersama YeoCycles. 🌸"}
                </p>
                <button className="btn btn-primary" onClick={handleRestart}>
                  🔄 Main Lagi
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── AI PREVIEW ─── */}
      <section id="ai-preview" className="lp-ai">
        <div className="lp-ai-inner">
          <div className="lp-ai-content">
            <div className="lp-section-header" style={{ textAlign: 'left', marginBottom: 0 }}>
              <div className="lp-section-tag">🧠 Teknologi AI</div>
              <h2 className="lp-section-title" style={{ color: 'white' }}>Prediksi Cerdas Berbasis Deep Learning</h2>
              <p className="lp-section-desc" style={{ color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                Arsitektur <strong style={{ color: 'white' }}>LSTM</strong> — jaringan saraf tiruan untuk memahami pola data sekuensial seperti siklus menstruasimu.
              </p>
            </div>
            <ul className="lp-ai-features-list">
              {['Belajar dari pola unik setiap pengguna', 'Mempertimbangkan 5 faktor: siklus, durasi, tidur, stres & puasa', 'Dilatih dengan EarlyStopping untuk presisi optimal', 'Confidence score real-time pada setiap prediksi'].map((item) => (
                <li key={item}><span className="lp-ai-check">✓</span>{item}</li>
              ))}
            </ul>
          </div>
          <div className="lp-ai-card lp-reveal">
            <div className="lp-ai-card-header">
              <div className="lp-ai-card-icon">🤖</div>
              <div><div className="lp-ai-card-title">Prediksi LSTM Model</div><div className="lp-ai-card-sub">v2.1.0 · TensorFlow 2.16</div></div>
            </div>
            <div className="lp-prediction-result">
              <div className="lp-prediction-label">Prediksi Siklus Berikutnya</div>
              <div className="lp-prediction-date">7 April 2026</div>
              <div className="lp-prediction-days">dalam 12 hari · Panjang siklus: 28 hari</div>
            </div>
            <div className="lp-confidence-row"><span className="lp-confidence-label">Confidence Score</span><span className="lp-confidence-val">92.4%</span></div>
            <div className="lp-confidence-bar"><div ref={confidenceFillRef} className="lp-confidence-fill" /></div>
            <div className="lp-ai-mini-stats">
              {[{ val: '28 hr', label: 'Avg. Cycle' }, { val: '5 hr', label: 'Avg. Period' }, { val: '7.2', label: 'Sleep Avg' }, { val: '2.1', label: 'Stress Avg' }].map((s) => (
                <div key={s.label} className="lp-ai-mini-stat"><div className="lp-ai-mini-val">{s.val}</div><div className="lp-ai-mini-label">{s.label}</div></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─── */}
      <section id="testimonials" className="lp-testimonials">
        <div className="lp-testimonials-inner">
          <div className="lp-section-header lp-reveal">
            <div className="lp-section-tag">💬 Testimoni</div>
            <h2 className="lp-section-title">Dipercaya Ribuan Pengguna</h2>
            <p className="lp-section-desc">Dengar langsung dari para wanita yang sudah merasakan manfaatnya.</p>
          </div>
          <div className="lp-testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} className="lp-testimonial-card" style={{ animationDelay: `${i * 0.12}s` }}>
                <div className="lp-testimonial-quote">"</div>
                <div className="lp-testimonial-stars">{Array.from({ length: t.stars }).map((_, j) => <span key={j}>⭐</span>)}</div>
                <p className="lp-testimonial-text">{t.text}</p>
                <div className="lp-testimonial-author">
                  <div className="lp-author-avatar">{t.initial}</div>
                  <div><div className="lp-author-name">{t.name}</div><div className="lp-author-role">{t.role}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─── */}
      <section className="lp-cta">
        <div className="lp-cta-inner">
          <div className="lp-cta-card">
            <img src={logo} alt="" className="lp-cta-logo" />
            <h2 className="lp-cta-title">Mulai Perjalanan Kesehatanmu Hari Ini</h2>
            <p className="lp-cta-desc">Bergabunglah dengan ratusan wanita yang sudah mengenali pola tubuh mereka. Gratis, aman, dan dipersonalisasi.</p>
            <div className="lp-cta-actions">
              <Link to="/register" className="lp-btn-white lp-btn-shimmer">🚀 Daftar Gratis Sekarang</Link>
              <Link to="/login" className="lp-btn-outline-white">Sudah punya akun? Masuk</Link>
            </div>
            <p className="lp-cta-note">✓ Gratis selamanya · ✓ Tidak perlu kartu kredit · ✓ Data aman & privat</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-top">
            <div>
              <div className="lp-footer-brand">
                <img src={logo} alt="YeoCycles" className="lp-footer-logo" />
                <span className="lp-footer-brand-name">YeoCycles</span>
              </div>
              <p className="lp-footer-tagline">Aplikasi pelacak siklus menstruasi berbasis AI yang membantu wanita memahami kesehatan reproduksi secara personal.</p>
            </div>
            <div>
              <div className="lp-footer-col-title">Fitur</div>
              <ul className="lp-footer-links">
                <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollTo('features'); }}>Pelacakan Siklus</a></li>
                <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollTo('features'); }}>Log Harian</a></li>
                <li><a href="#ai-preview" onClick={(e) => { e.preventDefault(); scrollTo('ai-preview'); }}>Prediksi AI</a></li>
              </ul>
            </div>
            <div>
              <div className="lp-footer-col-title">Akun</div>
              <ul className="lp-footer-links">
                <li><Link to="/register">Daftar Gratis</Link></li>
                <li><Link to="/login">Masuk</Link></li>
              </ul>
            </div>
          </div>
          <div className="lp-footer-bottom">
            <span>© 2026 YeoCycles · Coding Camp Capstone Project</span>
            <div className="lp-footer-powered">
              Powered by <a href="https://kamidukung.biz.id/" target="_blank" rel="noopener noreferrer" className="lp-powered-link">kamidukung.biz.id</a>
            </div>
            <div className="lp-footer-tech">
              <span className="lp-tech-badge">React</span>
              <span className="lp-tech-badge">Express</span>
              <span className="lp-tech-badge">TensorFlow LSTM</span>
              <span className="lp-tech-badge">MySQL</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ── CHATBOT SISKA WIDGET (NEW) ─── */}
      <div className="lp-chatbot-widget">
        {!chatOpen ? (
          <div className="lp-chatbot-bubble" onClick={() => setChatOpen(true)}>
            <span>💬</span>
            <span className="lp-chatbot-badge" />
            <div className="lp-chatbot-tooltip">Tanya Siska AI 💬</div>
          </div>
        ) : (
          <div className="lp-chatbot-window">
            <div className="lp-chatbot-header">
              <div className="lp-chatbot-header-info">
                <div className="lp-chatbot-avatar">🌸</div>
                <div className="lp-chatbot-name-container">
                  <span className="lp-chatbot-name">Siska AI</span>
                  <span className="lp-chatbot-status">Online</span>
                </div>
              </div>
              <button className="lp-chatbot-close" onClick={() => setChatOpen(false)}>×</button>
            </div>
            
            <div className="lp-chatbot-body">
              {chatbotMessages.map((m, idx) => (
                <div key={idx} className={`lp-chat-msg ${m.sender}`}>
                  {m.text}
                </div>
              ))}
              {botTyping && (
                <div className="lp-chat-typing">
                  <span />
                  <span />
                  <span />
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="lp-chatbot-chips">
              <div className="lp-chat-chip" onClick={() => { setChatbotInput('Bagaimana meredakan kram?'); }}>🌸 Kram Haid</div>
              <div className="lp-chat-chip" onClick={() => { setChatbotInput('Berapa hari siklus haid normal?'); }}>📅 Siklus Normal</div>
              <div className="lp-chat-chip" onClick={() => { setChatbotInput('Bagaimana cara kerja prediksi AI LSTM?'); }}>🤖 Prediksi AI</div>
              <div className="lp-chat-chip" onClick={() => { setChatbotInput('Siapa pembuat program ini?'); }}>💻 Pembuat Program</div>
            </div>

            <form className="lp-chatbot-input-form" onSubmit={handleSendChat}>
              <input
                type="text"
                className="lp-chatbot-input"
                placeholder="Tanyakan kesehatan menstruasi..."
                value={chatbotInput}
                onChange={(e) => setChatbotInput(e.target.value)}
              />
              <button type="submit" className="lp-chatbot-send-btn">
                ✈️
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
