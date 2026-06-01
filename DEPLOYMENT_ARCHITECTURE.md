# 📚 Deployment Overview & Architecture

Dokumen ini menjelaskan arsitektur deployment Evalify ke Vercel dan alur koneksi antar services.

---

## 🏗️ Arsitektur Deployment

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         VERCEL (Platform)                              │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Frontend Project: evalify                                       │  │
│  │  ├─ React + Vite (SPA)                                          │  │
│  │  ├─ Build: npm run build → dist/                               │  │
│  │  ├─ Deploy: Automatic dari GitHub main branch                  │  │
│  │  └─ URL: https://evalify.vercel.app                            │  │
│  │                          │                                      │  │
│  │                          ↓ VITE_API_GATEWAY                    │  │
│  │  ┌──────────────────────────────────────────────────────────┐  │  │
│  │  │  Backend Project: evalify-backend                        │  │  │
│  │  │  ├─ Node.js + Express (API Gateway)                      │  │  │
│  │  │  ├─ Routes: /api/auth, /api/cv, /api/interview, etc     │  │  │
│  │  │  ├─ Deploy: Automatic dari GitHub main branch (backend/) │  │  │
│  │  │  └─ URL: https://evalify-backend.vercel.app              │  │  │
│  │  │                          │                               │  │  │
│  │  │        ┌─────────────────┼─────────────────┐             │  │  │
│  │  │        ↓                 ↓                 ↓             │  │  │
│  │  │  ┌──────────┐   ┌──────────┐       ┌──────────┐         │  │  │
│  │  │  │Supabase  │   │CV Score  │       │Interview │         │  │  │
│  │  │  │Database  │   │API       │       │API       │         │  │  │
│  │  │  │(External)│   │(Railway) │       │(Railway) │         │  │  │
│  │  │  └──────────┘   └──────────┘       └──────────┘         │  │  │
│  │  └──────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                   ↕
                            Browser / Client
```

---

## 🔄 Data Flow

### 1️⃣ User membuka aplikasi

```
Browser → HTTPS://evalify.vercel.app
    ↓
Vercel Serverless Function (index.html)
    ↓
React SPA loaded
    ↓
JavaScript execution
    ↓
VITE_API_GATEWAY = "https://evalify-backend.vercel.app"
```

### 2️⃣ User melakukan aksi (login, upload CV, dll)

```
Frontend (React)
    ↓
Call: axios.post('/api/auth/login', { email, password })
    ↓
BaseURL: https://evalify-backend.vercel.app/api
Full URL: https://evalify-backend.vercel.app/api/auth/login
    ↓
Vercel Backend Function (Express Router)
    ↓
Process request:
  - Validate input
  - Check Supabase database
  - Generate JWT token
    ↓
Return response → Frontend
    ↓
Frontend updates UI
```

### 3️⃣ Backend memanggil external API

```
Backend (Express)
    ↓
Receive: POST /api/cv/score with CV file
    ↓
Process:
  1. Upload ke Supabase storage (jika ada)
  2. Call CV_SCORING_API (Railway)
  3. Wait for response
  4. Save hasil ke Supabase DB
    ↓
Return response → Frontend
```

---

## 📊 Service Dependencies

| Service | Provider | Purpose | Timeout | Status Check |
|---------|----------|---------|---------|--------------|
| Frontend | Vercel Serverless | React SPA | N/A | `https://evalify.vercel.app` |
| Backend | Vercel Serverless | API Gateway | 10s | `https://evalify-backend.vercel.app` |
| Database | Supabase | PostgreSQL DB | Varies | Supabase Dashboard |
| CV Scoring | Railway | ML Model API | 30s | `/` endpoint |
| Interview | Railway | Interview Simulation | 30s | `/` endpoint |

---

## 📝 Deployment Checklist

### Phase 1: Preparation
- [ ] All code committed to GitHub
- [ ] `vercel.json` files created in both frontend and backend
- [ ] No hardcoded API URLs in code (use env vars)
- [ ] No credentials in code

### Phase 2: Initial Deploy
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Vercel
- [ ] Both projects accessible via browser

### Phase 3: Configuration
- [ ] Supabase credentials set in backend env vars
- [ ] External API URLs set in backend env vars
- [ ] Frontend API gateway URL set in frontend env vars
- [ ] CORS origins configured in backend
- [ ] Email credentials set (if using email features)

### Phase 4: Verification
- [ ] Frontend loads without console errors
- [ ] Backend health check returns JSON
- [ ] Frontend can call backend endpoints
- [ ] Database queries work
- [ ] External AI services accessible

### Phase 5: Testing
- [ ] Login/Register flow works
- [ ] File upload works
- [ ] CV scoring works
- [ ] Interview simulation works
- [ ] Email notifications sent
- [ ] Error handling works

---

## 🚨 Common Issues & Solutions

### Frontend dapat't connect ke Backend

**Symptoms**: 
- CORS error di browser console
- Network tab menunjukkan request ke backend gagal

**Root Causes**:
1. ❌ `VITE_API_GATEWAY` environment variable tidak di-set
2. ❌ Backend belum selesai deploy
3. ❌ Backend environment variables tidak lengkap
4. ❌ CORS configuration salah di backend

**Solutions**:
```
1. Check env var di Vercel Frontend → Settings → Environment Variables
2. Check backend deployment status → Recent Deployments
3. Redeploy frontend SETELAH set env var
4. Check backend CORS config: const allowedOrigins = [...frontend-url...]
```

### Backend error "Cannot find module"

**Symptoms**: Error 502 Bad Gateway

**Root Causes**:
1. ❌ `package.json` tidak ada
2. ❌ Dependencies tidak terinstall
3. ❌ Wrong import paths

**Solutions**:
```bash
# Local testing
cd backend/express
npm install
node index.js

# Push and redeploy
git push origin main
# Vercel will auto-redeploy
```

### Environment variables tidak apply

**Symptoms**: Code works locally dengan .env, tapi gagal di Vercel

**Root Causes**:
1. ❌ Tidak di-redeploy setelah set env vars

**Solutions**:
```
Vercel Dashboard → Project → Deployments → Latest → Redeploy
```

### Database connection timeout

**Symptoms**: Database queries timeout atau gagal

**Root Causes**:
1. ❌ Wrong Supabase credentials
2. ❌ Supabase project tidak active
3. ❌ Network firewall issue

**Solutions**:
```javascript
// Test local
node -e "
const {createClient} = require('@supabase/supabase-js');
const sb = createClient('YOUR_URL', 'YOUR_KEY');
sb.from('users').select('COUNT(*)').then(r => console.log(r));
"
```

---

## 🔍 Monitoring & Debugging

### Check Frontend Logs
```
Vercel Dashboard → Frontend Project → Deployments → Latest → Logs
Or: Browser DevTools → Console tab
```

### Check Backend Logs
```
Vercel Dashboard → Backend Project → Deployments → Latest → Functions → Logs
```

### Test Backend Health
```bash
# Terminal
curl https://evalify-backend.vercel.app

# Browser DevTools
fetch('https://evalify-backend.vercel.app')
  .then(r => r.json())
  .then(console.log)
```

### Test Database Connection
```bash
# Using psql (if installed)
psql postgresql://username:password@host:port/dbname

# Or via Supabase Dashboard
Settings → API → Under Connection String → Find connection details
```

---

## 📈 Performance Considerations

### Frontend Optimization
```
Vite: Fast HMR & build
React: Lazy loading components
Network: CDN cached by Vercel
Typical load time: < 2s
```

### Backend Optimization
```
Express: Lightweight routing
Serverless: Auto-scaling
Connection pooling: Use with Supabase
Typical API response: < 1s (excluding external APIs)
```

### Database Optimization
```
Supabase: Managed PostgreSQL
Connection pooling: Enabled by default
Indexes: Create on frequently queried fields
Typical query: < 100ms
```

---

## 🔐 Security Best Practices

1. **Never commit secrets**
   ```bash
   # Bad ❌
   git add .env
   
   # Good ✅
   echo ".env" >> .gitignore
   # Use Vercel Environment Variables instead
   ```

2. **Validate all inputs**
   ```javascript
   // Backend
   app.post('/api/auth/login', (req, res) => {
     if (!req.body.email || !req.body.password) {
       return res.status(400).json({ error: 'Missing fields' });
     }
     // ... rest of logic
   });
   ```

3. **Use HTTPS only**
   ```javascript
   // All Vercel URLs are HTTPS by default ✅
   ```

4. **Implement rate limiting**
   ```javascript
   const rateLimit = require('express-rate-limit');
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   app.use(limiter);
   ```

5. **Use CORS carefully**
   ```javascript
   // Only allow specific origins
   const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
   app.use(cors({ origin: allowedOrigins, credentials: true }));
   ```

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Express Docs**: https://expressjs.com
- **Vite Docs**: https://vitejs.dev
- **React Docs**: https://react.dev

---

## ✅ Quick Command Reference

```bash
# Update code and redeploy
git add .
git commit -m "Your message"
git push origin main
# Vercel auto-deploys

# Test backend locally
cd backend/express
npm install
npm run dev
# Should run on http://localhost:3000

# Test frontend locally
cd frontend
npm install
npm run dev
# Should run on http://localhost:5173

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

Terakhir update: Juni 2024 🎉
