<![CDATA[<div align="center">

# 🌸 YeoCycles — Frontend

### Menstrual Health Companion · Single Page Application

[![React](https://img.shields.io/badge/React-19.1-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Antarmuka premium modern** untuk melacak siklus menstruasi, mencatat kondisi harian, dan melihat prediksi AI — dibangun dengan **React + Vite** serta desain **glassmorphism** yang interaktif.

[Fitur Utama](#-fitur-utama) · [Arsitektur](#️-arsitektur-sistem) · [Quick Start](#-quick-start) · [Pages Overview](#-pages-overview) · [API Integration](#-api-integration)

</div>

---

## 🏗️ Arsitektur Sistem

### Full-Stack Overview

Berikut adalah arsitektur keseluruhan sistem **YeoCycles** yang menunjukkan bagaimana Frontend berinteraksi dengan Backend dan ML Service:

<p align="center">
  <img src="docs/images/system_architecture.png" alt="System Architecture" width="700" />
</p>

### Frontend Internal Architecture

```mermaid
graph TB
    subgraph Browser["🌐 Browser (Client)"]
        direction TB
        
        subgraph PublicRoutes["Public Routes"]
            LP["🏠 LandingPage<br/>Hero, Features, Game, Chatbot"]
            Login["🔑 LoginPage<br/>Glassmorphism Form"]
            Register["📝 RegisterPage<br/>Glassmorphism Form"]
        end

        subgraph ProtectedRoutes["🔒 Protected Routes"]
            Dashboard["📊 Dashboard<br/>Charts, Ring, Cards, Tips"]
            Calendar["📅 CalendarPage<br/>Interactive Month View"]
            CycleForm["🩸 CycleForm<br/>Cycle Data Input"]
            DailyLog["📋 DailyLogForm<br/>Mood, Symptoms, Sleep"]
            Profile["👤 ProfilePage<br/>User Settings"]
        end

        subgraph SharedComponents["Shared Components"]
            Navbar["🧭 Navbar<br/>Sidebar + Mobile Drawer"]
            AuthCtx["🔐 AuthContext<br/>JWT Token Management"]
        end

        subgraph Services["Services Layer"]
            API["🌐 api.js<br/>Axios Instance + Interceptors"]
        end
    end

    LP --> Login
    Login --> AuthCtx
    Register --> AuthCtx
    AuthCtx --> API
    Dashboard --> API
    Calendar --> API
    CycleForm --> API
    DailyLog --> API
    Profile --> API
    Navbar --> AuthCtx

    API -->|"HTTP + JWT Bearer Token"| Backend["⚙️ Backend API<br/>localhost:5000"]

    style PublicRoutes fill:#1a1a2e,stroke:#ec4899,color:#fff
    style ProtectedRoutes fill:#1a1a2e,stroke:#a855f7,color:#fff
    style SharedComponents fill:#1a1a2e,stroke:#6366f1,color:#fff
    style Services fill:#1a1a2e,stroke:#10b981,color:#fff
```

### Component Dependency Graph

```mermaid
graph LR
    main["main.jsx"] --> App["App.jsx"]
    App --> AuthProvider["AuthProvider"]
    AuthProvider --> Router["BrowserRouter"]
    
    Router --> PublicRoute["PublicRoute Guard"]
    Router --> ProtectedRoute["ProtectedRoute Guard"]
    
    PublicRoute --> Landing["LandingPage"]
    PublicRoute --> Login["LoginPage"]
    PublicRoute --> Register["RegisterPage"]
    
    ProtectedRoute --> Navbar["Navbar"]
    ProtectedRoute --> Dashboard["Dashboard"]
    ProtectedRoute --> Calendar["CalendarPage"]
    ProtectedRoute --> Cycle["CycleForm"]
    ProtectedRoute --> Daily["DailyLogForm"]
    ProtectedRoute --> Profile["ProfilePage"]
    
    Landing --> Chatbot["Siska Chatbot"]
    Landing --> Game["Myth-Buster Game"]
    
    Dashboard --> ProgressRing["SVG Progress Ring"]
    Dashboard --> MiniChart["5-Cycle Sparkline"]
    Dashboard --> TipsCarousel["Tips Carousel"]
    
    Navbar --> Drawer["Mobile Drawer"]
    
    Login --> api["api.js"]
    Register --> api
    Dashboard --> api
    Calendar --> api
    Cycle --> api
    Daily --> api
    Profile --> api

    style Landing fill:#ec4899,stroke:#fff,color:#fff
    style Dashboard fill:#a855f7,stroke:#fff,color:#fff
    style Chatbot fill:#6366f1,stroke:#fff,color:#fff
    style Game fill:#f59e0b,stroke:#fff,color:#fff
```

---

## ✨ Fitur Utama

### 🏠 Landing Page — Premium Experience

<p align="center">
  <img src="docs/images/landing_page.png" alt="Landing Page" width="600" />
</p>

| Fitur | Deskripsi |
|-------|-----------|
| **Hero Section** | Gradient animation dengan floating geometric shapes |
| **Feature Cards** | Hover lift effects dengan glassmorphic cards |
| **Edukasi Interaktif** | Menstrual education section dengan accordion cards |
| **Cycle Myth-Buster Game** 🎮 | Quiz 10 pertanyaan, progress bar, score tracker, confetti, penjelasan ilmiah |
| **Siska AI Chatbot** 🤖 | Keyword-based NLP, strict topic filter, typing animation |
| **Footer** | "Powered by kamidukung.biz.id" dengan gradient link |
| **Mobile Nav** | Hamburger slide-in overlay + backdrop blur |

#### Chatbot Siska — Alur Kerja

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant C as 🤖 Siska Chatbot
    participant KB as 📚 Knowledge Base

    U->>C: Mengetik pertanyaan
    C->>C: Analisis keyword (regex matching)
    
    alt Topik: Menstruasi/Haid/PMS/Ovulasi/dll
        C->>KB: Cari jawaban dari database
        KB-->>C: Return respons medis
        C-->>U: 💬 Jawaban + typing animation
    else Topik: "Siapa yang buat?"
        C-->>U: "Dibuat oleh Ridho dan teman-teman,<br/>powered by kamidukung"
    else Topik: Di luar kesehatan menstruasi
        C-->>U: "Maaf, saya hanya bisa menjawab<br/>pertanyaan seputar kesehatan menstruasi 🌸"
    end
```

#### Myth-Buster Game — Flow

```mermaid
stateDiagram-v2
    [*] --> Idle: Game belum dimulai
    Idle --> Playing: Klik "Mulai Game"
    
    Playing --> ShowQuestion: Load pertanyaan ke-N
    ShowQuestion --> AnswerSelected: User pilih True/False
    AnswerSelected --> ShowExplanation: Tampilkan penjelasan ilmiah
    ShowExplanation --> ShowQuestion: Next question (N < 10)
    ShowExplanation --> GameOver: N = 10
    
    GameOver --> ShowScore: Tampilkan skor akhir
    ShowScore --> ConfettiAnimation: Skor sempurna? 🎉
    ShowScore --> Idle: Klik "Main Lagi"
    ConfettiAnimation --> Idle: Klik "Main Lagi"
```

---

### 🔐 Auth Pages — Glassmorphism Design

<p align="center">
  <img src="docs/images/auth_page.png" alt="Auth Page" width="500" />
</p>

| Teknik | Implementasi |
|--------|-------------|
| **Glassmorphism** | `backdrop-filter: blur(20px)` + `rgba(255,255,255,0.08)` |
| **Animated Blobs** | CSS `@keyframes blob-morph` — 8s infinite morphing |
| **Gradient Border** | Linear gradient border via pseudo-elements |
| **Input Glow** | Focus state dengan `box-shadow: 0 0 20px rgba(236,72,153,0.3)` |
| **Password Toggle** | Eye icon toggle visibility |
| **Loading State** | Spinner animation saat submit |

---

### 📊 Dashboard — Interactive Data Visualization

<p align="center">
  <img src="docs/images/dashboard.png" alt="Dashboard" width="600" />
</p>

```mermaid
graph TB
    subgraph Dashboard["📊 Dashboard Page"]
        direction TB
        Welcome["👋 Welcome Animation<br/>Staggered fade-in entrance"]
        
        subgraph TopRow["Top Section"]
            Ring["🔮 Cycle Progress Ring<br/>Animated SVG, glow effect<br/>Shows Day X of Y"]
            Cards["📊 Quick Insight Cards<br/>4 metrics: Cycle Day, ETA,<br/>Avg Length, Total Logs"]
            Chart["📈 5-Cycle Mini Chart<br/>Inline SVG sparkline<br/>Last 5 cycle lengths"]
        end
        
        subgraph BottomRow["Bottom Section"]
            Tips["💡 Tips Carousel<br/>Auto-rotate 5s interval<br/>Health tips slider"]
            Actions["⚡ Quick Actions<br/>Shortcut buttons to<br/>Cycle, Log, Calendar"]
        end
    end

    Welcome --> TopRow
    TopRow --> BottomRow
    
    style Dashboard fill:#0f0f23,stroke:#a855f7,color:#fff
    style TopRow fill:#1a1a2e,stroke:#ec4899,color:#fff
    style BottomRow fill:#1a1a2e,stroke:#6366f1,color:#fff
```

**Dashboard Data Flow:**

```mermaid
sequenceDiagram
    participant D as 📊 Dashboard
    participant A as 🌐 API Service
    participant B as ⚙️ Backend

    D->>D: componentDidMount → useEffect
    
    par Parallel API Calls
        D->>A: GET /api/cycles
        A->>B: Fetch user cycles
        B-->>A: cycles[]
        A-->>D: Update cycle state
    and
        D->>A: GET /api/predictions
        A->>B: Fetch/generate prediction
        B-->>A: prediction{}
        A-->>D: Update prediction state
    and
        D->>A: GET /api/daily-logs
        A->>B: Fetch user logs
        B-->>A: logs[]
        A-->>D: Update logs state
    end
    
    D->>D: Render Progress Ring (SVG)
    D->>D: Render Insight Cards
    D->>D: Render Mini Chart (SVG sparkline)
    D->>D: Start Tips Carousel (setInterval 5s)
```

---

## 🛠️ Tech Stack

| Technology           | Version | Purpose                              |
| -------------------- | ------- | ------------------------------------ |
| **React**            | 19.1    | UI Library (Hooks, Context, Router)  |
| **Vite**             | 8.0     | Build tool & dev server (HMR)        |
| **TypeScript**       | 5.9     | Type safety & DX                     |
| **React Router**     | 7.x     | Client-side routing & route guards   |
| **Axios**            | 1.x     | HTTP client with interceptors        |
| **Vanilla CSS**      | —       | Custom styling (no framework)        |

### Design Techniques

| Technique | Implementation |
|-----------|---------------|
| **Glassmorphism** | `backdrop-filter: blur()` + semi-transparent backgrounds |
| **CSS Custom Properties** | Design tokens for consistent theming |
| **CSS Animations** | `@keyframes` — floating shapes, fade-ins, slide-ins |
| **SVG Graphics** | Inline SVGs — charts, progress rings, decorative elements |
| **CSS Grid + Flexbox** | Responsive layouts without media query complexity |
| **Mobile-First** | All styles built from `320px` upward |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18.x · **npm** ≥ 9.x
- Backend API at `http://localhost:5000` ([Backend Repo](https://github.com/Coding-Camp-Capstone-Project-2026/backend))

```bash
# 1. Clone repository
git clone https://github.com/Coding-Camp-Capstone-Project-2026/frontend.git
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server (HMR)
npm run dev
# → http://localhost:5173

# 4. Build for production
npm run build

# 5. Preview production build
npm run preview
```

> **⚠️ Penting**: Pastikan Backend API dan ML Service sudah berjalan sebelum menggunakan fitur prediksi.

---

## 📁 Project Structure

```
frontend/
├── package.json                 # Dependencies & scripts
├── index.html                   # HTML entry point (SPA shell)
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts               # Vite build configuration
├── docs/
│   └── images/                  # Documentation visuals
├── public/
│   ├── favicon.svg              # App favicon
│   └── icons.svg                # SVG icon sprites
└── src/
    ├── main.jsx                 # 🚀 React entry point
    ├── App.jsx                  # 🏠 Root — routing & auth guards
    ├── index.css                # 🎨 Global styles, CSS vars, resets
    ├── context/
    │   └── AuthContext.jsx      # 🔐 Auth state provider
    ├── components/
    │   ├── Navbar.jsx           # 🧭 Nav + mobile drawer
    │   └── Navbar.css           # Sidebar & drawer styles
    ├── pages/
    │   ├── LandingPage.jsx      # 🏠 Hero, features, game, chatbot
    │   ├── LandingPage.css      # Landing animations (53KB)
    │   ├── LoginPage.jsx        # 🔑 Login form
    │   ├── RegisterPage.jsx     # 📝 Registration form
    │   ├── Auth.css             # Glassmorphic auth styling
    │   ├── Dashboard.jsx        # 📊 Charts, ring, cards
    │   ├── Dashboard.css        # Dashboard animations
    │   ├── CalendarPage.jsx     # 📅 Interactive calendar
    │   ├── CalendarPage.css     # Calendar grid
    │   ├── CycleForm.jsx        # 🩸 Cycle input form
    │   ├── DailyLogForm.jsx     # 📋 Daily health log
    │   ├── FormPage.css         # Shared form styling
    │   ├── ProfilePage.jsx      # 👤 Profile management
    │   └── ProfilePage.css      # Profile styling
    └── services/
        └── api.js               # 🌐 Axios instance & interceptors
```

---

## 🗺️ Routing

```mermaid
graph LR
    subgraph Public["🔓 Public Routes"]
        Landing["/landing<br/>LandingPage"]
        LoginR["/login<br/>LoginPage"]
        RegisterR["/register<br/>RegisterPage"]
    end
    
    subgraph Protected["🔒 Protected Routes"]
        DashR["/ <br/>Dashboard"]
        CalR["/calendar<br/>CalendarPage"]
        CycR["/cycle<br/>CycleForm"]
        DaiR["/daily-log<br/>DailyLogForm"]
        ProR["/profile<br/>ProfilePage"]
    end
    
    Landing -->|"Login/Register"| LoginR
    LoginR -->|"Success"| DashR
    RegisterR -->|"Success"| DashR
    
    DashR --> CalR
    DashR --> CycR
    DashR --> DaiR
    DashR --> ProR
    
    style Public fill:#1a1a2e,stroke:#10b981,color:#fff
    style Protected fill:#1a1a2e,stroke:#ec4899,color:#fff
```

| Path | Component | Auth | Description |
|------|-----------|------|-------------|
| `/landing` | `LandingPage` | Public | Landing page (hero, game, chatbot) |
| `/login` | `LoginPage` | Public | Halaman login |
| `/register` | `RegisterPage` | Public | Halaman registrasi |
| `/` | `Dashboard` | 🔒 Protected | Dashboard utama |
| `/calendar` | `CalendarPage` | 🔒 Protected | Kalender siklus interaktif |
| `/cycle` | `CycleForm` | 🔒 Protected | Form input siklus |
| `/daily-log` | `DailyLogForm` | 🔒 Protected | Form log harian |
| `/profile` | `ProfilePage` | 🔒 Protected | Profil pengguna |

---

## 🔐 State Management — AuthContext

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant LP as 🔑 LoginPage
    participant AC as 🔐 AuthContext
    participant LS as 💾 localStorage
    participant AX as 🌐 Axios
    participant BE as ⚙️ Backend

    U->>LP: Submit email + password
    LP->>AX: POST /api/auth/login
    AX->>BE: Forward request
    BE-->>AX: { token, user }
    AX-->>LP: Response
    LP->>AC: login(token, user)
    AC->>LS: setItem('token', token)
    AC->>AC: setState({ token, user })
    AC-->>LP: Redirect to Dashboard

    Note over AX: Setiap request berikutnya:
    AX->>AX: Attach "Authorization: Bearer <token>"
    
    Note over AX,BE: Jika token expired (401/403):
    BE-->>AX: 401 Unauthorized
    AX->>AC: logout()
    AC->>LS: removeItem('token')
    AC-->>U: Redirect to /login
```

---

## 🌐 API Integration

### API Endpoints per Page

| Page | Method | Endpoint | Description |
|------|--------|----------|-------------|
| **LoginPage** | POST | `/api/auth/login` | Autentikasi |
| **RegisterPage** | POST | `/api/auth/register` | Registrasi |
| **Dashboard** | GET | `/api/cycles` | Data siklus |
| | GET | `/api/predictions` | Prediksi ML |
| | GET | `/api/daily-logs` | Daily logs |
| **CalendarPage** | GET | `/api/cycles` | Data siklus |
| | GET | `/api/daily-logs?start=&end=` | Filter range |
| **CycleForm** | POST/PUT | `/api/cycles` | CRUD siklus |
| **DailyLogForm** | POST | `/api/daily-logs` | Tambah log |
| **ProfilePage** | GET/PUT | `/api/profile` | CRUD profil |

---

## 🎨 Design System

### Color Palette

```css
--primary: #ec4899;      /* Pink */
--secondary: #a855f7;    /* Purple */
--accent: #6366f1;       /* Indigo */
--bg-dark: #0f0f23;      /* Navy background */
--surface: #1a1a2e;      /* Card surface */
--glass-bg: rgba(255, 255, 255, 0.08);
--glass-border: rgba(255, 255, 255, 0.15);
```

### Animation Library

| Animation | Duration | Usage |
|-----------|----------|-------|
| `float` | 6–8s | Floating shapes |
| `fadeInUp` | 0.6s | Page entrances |
| `slideInRight` | 0.3s | Mobile drawer |
| `pulse-glow` | 2s | Progress ring |
| `gradient-shift` | 3s | Auth background |
| `blob-morph` | 8s | Morphing blobs |
| `typing-dots` | 1.4s | Chatbot typing |
| `confetti-fall` | 1s | Game completion |

### Responsive Breakpoints

| Breakpoint | Target |
|------------|--------|
| `≤480px` | Small phones — single column |
| `≤768px` | Tablets — hamburger nav |
| `≤1024px` | Small laptops — condensed sidebar |
| `≥1025px` | Desktop — full layout |

---

## 📱 Mobile Responsiveness

| Feature | Implementation |
|---------|---------------|
| **Touch targets** | Min `44×44px` semua interactive elements |
| **Safe area** | `env(safe-area-inset-*)` untuk notched phones |
| **Fluid typography** | `clamp()` untuk font sizes |
| **Hamburger menu** | Slide-in drawer + backdrop blur |
| **Form layouts** | Stack vertical, full-width inputs |
| **Card grids** | Auto-collapse to single column |
| **Chatbot** | Full-screen mode on mobile |

---

## ⚙️ Build & Deploy

```bash
npm run dev          # Dev server + HMR → localhost:5173
npm run build        # Production build → /dist
npm run preview      # Preview production locally
```

---

## 🔗 Related Repositories

| Repository | Description | Link |
|------------|-------------|------|
| **Frontend** | React SPA (this repo) | [frontend](https://github.com/Coding-Camp-Capstone-Project-2026/frontend) |
| **Backend** | Express.js REST API | [backend](https://github.com/Coding-Camp-Capstone-Project-2026/backend) |
| **Machine Learning** | Flask + LSTM Service | [machinelearning](https://github.com/Coding-Camp-Capstone-Project-2026/machinelearning) |

---

## 👥 Tim Pengembang

Dibuat oleh **Ridho dan teman-teman** — Capstone Project Coding Camp 2026

**Powered by [kamidukung.biz.id](https://kamidukung.biz.id/)**
]]>
