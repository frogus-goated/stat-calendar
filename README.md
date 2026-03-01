# Stat Calendar v4

Multi-user performance tracking for OnlyFans agencies. Deployed on Railway with PostgreSQL.

## Features
- **Admin + Viewer roles** — First signup becomes admin, can promote others
- **Admin panel** — Manage users, assign models to viewers
- **Viewer mode** — Read-only dashboard + calendars for assigned models only
- **Color system** — Green (excellent), Orange (min met), Red (below min), 🔥 (LTV met)
- **Forecasting** — 30-day projections, progress bars, % change indicators
- **Groups** — Organize models into teams
- **Export/Import** — JSON backup, CSV reports, PDF exports
- **Toggleable charts** — Click legend to show/hide metrics
- **Light/Dark mode**

## Deploy to Railway (5 minutes)

### Step 1: Create GitHub repo
```bash
cd stat-calendar
git init
git add .
git commit -m "Initial commit"
```
Push to GitHub (create a new repo on github.com, then):
```bash
git remote add origin https://github.com/YOUR-USERNAME/stat-calendar.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Railway
1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub Repo"**
3. Select your `stat-calendar` repo
4. Railway will detect Next.js and start building

### Step 3: Add PostgreSQL database
1. In your Railway project, click **"+ New"** → **"Database"** → **"PostgreSQL"**
2. Railway automatically sets `DATABASE_URL` for your app

### Step 4: Set environment variables
In your app's **Variables** tab, add:
```
JWT_SECRET=generate-a-random-32-char-string-here
```
(Go to https://generate-secret.vercel.app/32 to generate one)

### Step 5: Generate a domain
1. Go to your app's **Settings** tab
2. Under **Networking**, click **"Generate Domain"**
3. You'll get a URL like `stat-calendar-production.up.railway.app`

### Step 6: First login
1. Visit your Railway URL
2. Click **"Create one"** to register
3. **First user automatically becomes admin**
4. Go to **Settings → Import Data** to upload your v3 backup

That's it! Your app runs 24/7 with automatic restarts and backups.

---

## Importing v3 Data
Your v2/v3 backup JSON is fully compatible. The import will:
- Create all models with proper min/excellent goals
- Import all entries
- Create groups
- After import, edit each model in the dashboard to fine-tune goals

## User Roles

| Feature | Admin | Viewer |
|---------|-------|--------|
| View dashboard | ✅ All models | ✅ Assigned models only |
| View calendars | ✅ All | ✅ Assigned only |
| Edit entries | ✅ | ❌ |
| Add/edit models | ✅ | ❌ |
| Manage groups | ✅ | ❌ |
| Settings | ✅ | ❌ |
| Reports | ✅ | ❌ |
| User management | ✅ | ❌ |
| Export/Import data | ✅ | ❌ |

## Local Development
```bash
# Need PostgreSQL running locally or use Railway's DB
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
npm install
npx prisma db push
npm run dev
```

## Tech Stack
Next.js 14 + Prisma + PostgreSQL + Tailwind + Recharts + JWT Auth
