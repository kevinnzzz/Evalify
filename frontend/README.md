# Evalify – AI Career Assistant Frontend

A modern React.js + Vite frontend application for AI-powered career tools: CV review, mock interviews, and personalized feedback.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open in browser
# http://localhost:5173
```

## 📁 Project Structure

```
src/
├── assets/           # Static assets
├── components/
│   ├── ui/           # Reusable UI components (Button, Input, Card, Modal, etc.)
│   └── layout/       # Layout components (Sidebar, Topbar)
├── context/          # React Context (Auth, Theme, Toast)
├── data/             # Mock/dummy data
├── hooks/            # Custom hooks
├── layouts/          # Page layouts (AuthLayout, DashboardLayout)
├── pages/
│   ├── auth/         # Login, Register
│   └── dashboard/    # Home, ReviewCV, Interview, Feedback, Settings
├── routes/           # ProtectedRoute
├── services/         # Axios setup (ready for API integration)
├── styles/           # Global CSS
└── utils/            # Helper functions
```

## 🔑 Login Credentials (Demo)

Any username/password combination works in demo mode. Just fill in:
- **Username**: anything (e.g. `demo`)
- **Password**: anything (e.g. `password`)

## 🛠 Tech Stack

- **React 18** + **Vite 5**
- **React Router DOM v6** – client-side routing
- **Tailwind CSS** – utility-first styling
- **Framer Motion** – smooth animations
- **Recharts** – data visualization charts
- **Lucide React** – icon library
- **Zustand** – state management (ready)
- **Axios** – HTTP client (ready for API integration)

## 📄 Pages

| Route | Page |
|-------|------|
| `/login` | Login page |
| `/register` | Registration page |
| `/dashboard` | Home dashboard |
| `/dashboard/review-cv` | CV upload & analysis |
| `/dashboard/interview` | AI mock interview |
| `/dashboard/feedback` | Feedback form |
| `/dashboard/settings` | Account settings |

## 🎨 Features

- ✅ Clean, modern UI matching reference designs
- ✅ Dark mode support
- ✅ Fully responsive (mobile + desktop)
- ✅ Protected routes (auth guard)
- ✅ Drag & drop file upload
- ✅ Animated score rings
- ✅ Toast notifications
- ✅ Mock AI results (ready for real API)
- ✅ Smooth page transitions

## 🔌 API Integration

All API calls are mocked. To integrate your backend:

1. Edit `src/services/api.js` to configure your base URL
2. Replace `sleep()` mock delays in pages with real Axios calls
3. Map response data to the result state

## 📦 Build

```bash
npm run build   # Production build → /dist
npm run preview # Preview production build
```
