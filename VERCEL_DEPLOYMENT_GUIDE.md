# QueryAI - Complete Vercel Deployment Guide

## Prerequisites Checklist

- [ ] GitHub account
- [ ] Vercel account (free tier works)
- [ ] PostgreSQL database (Supabase/Neon recommended - both have free tiers)
- [ ] OpenAI API key (optional - can use Vercel AI Gateway without key)

---

## Step 1: Database Setup (5 minutes)

### Option A: Supabase (Recommended)

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Name it "queryai" and set a database password
4. Wait 2-3 minutes for provisioning
5. Go to **Settings → Database**
6. Copy the **Connection String** (URI format)
7. Click **SQL Editor** in left sidebar
8. Copy entire contents of `database-schema-complete.sql`
9. Paste into SQL editor and click "Run"
10. Verify: Run `SELECT COUNT(*) FROM ai_requests;` - should return 0

### Option B: Neon

1. Go to [neon.tech](https://neon.tech) and sign in
2. Create new project named "queryai"
3. Copy the **Connection String**
4. Go to SQL Editor
5. Run `database-schema-complete.sql` contents
6. Verify tables created

### Get Your DATABASE_URL

Format: `postgresql://[user]:[password]@[host]:[port]/[database]`

Example:
```
postgresql://postgres:your-password@db.xxxxxxxxxxxx.supabase.co:5432/postgres
```

---

## Step 2: Push to GitHub (2 minutes)

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - QueryAI application"

# Create GitHub repo (via GitHub.com or CLI)
# Then push
git remote add origin https://github.com/YOUR_USERNAME/queryai.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Vercel (3 minutes)

### Via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your `queryai` repository
4. Click "Import"
5. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add: `DATABASE_URL` = `your-postgresql-connection-string`
   - (Optional) Add: `OPENAI_API_KEY` = `sk-...` if you have one
6. Click "Deploy"
7. Wait 2-3 minutes for deployment
8. Click "Visit" to open your app

### Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variable
vercel env add DATABASE_URL

# Paste your connection string when prompted

# Deploy to production
vercel --prod
```

---

## Step 4: Configure Environment Variables

### Required Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | **YES** | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `OPENAI_API_KEY` | No | OpenAI API key (uses AI Gateway if omitted) | `sk-proj-...` |

### How to Add on Vercel

1. Go to your project on Vercel
2. Click **Settings** tab
3. Click **Environment Variables** in sidebar
4. Click **Add New**
5. Enter variable name and value
6. Select all environments (Production, Preview, Development)
7. Click **Save**
8. **Redeploy** your application

---

## Step 5: Test Your Deployment

1. Visit your deployed URL (e.g., `queryai.vercel.app`)
2. Click "Login" or "Get Started"
3. Use demo credentials:
   - Email: `demo@queryai.com`
   - Password: `demo123`
4. Try these queries:
   - "Show me all users"
   - "Create a new user" (test dynamic forms)
   - "Show revenue by city"
5. Check charts and visualizations
6. Go to **Usage & Costs** to see telemetry data

---

## Step 6: Verify Database Tracking

### Check Telemetry Tables

Run these queries in Supabase SQL Editor:

```sql
-- Check if requests are being tracked
SELECT COUNT(*) FROM ai_requests;

-- View recent requests with costs
SELECT 
  model, 
  total_tokens, 
  total_cost, 
  created_at 
FROM ai_requests 
ORDER BY created_at DESC 
LIMIT 10;

-- Check query executions
SELECT 
  natural_query, 
  generated_sql, 
  execution_time_ms 
FROM query_executions 
ORDER BY created_at DESC 
LIMIT 10;

-- View user usage stats
SELECT * FROM user_usage_stats;
```

If tables are empty, make sure:
- DATABASE_URL is correctly set in Vercel
- You've made at least one query in the app
- No errors in Vercel function logs

---

## Step 7: Monitor & Debug

### Vercel Function Logs

1. Go to your project on Vercel
2. Click **Logs** tab
3. Filter by "Functions"
4. Look for `/api/chat` requests
5. Check for errors

### Common Issues

**Blank page after login:**
- Check browser console for errors (F12)
- Verify all environment variables are set
- Redeploy after adding env vars

**Database connection errors:**
- Test connection string format
- Ensure IP is whitelisted (Supabase: Settings → Database → Connection Pooling)
- Check database is active

**AI not responding:**
- Verify API route is working: Visit `your-app.vercel.app/api/chat`
- Check if OPENAI_API_KEY is needed
- Look at function logs for errors

---

## Optional: Custom Domain

1. Go to Project Settings → Domains
2. Click "Add"
3. Enter your domain (e.g., `queryai.yourdomain.com`)
4. Follow DNS instructions
5. Wait for DNS propagation (5-60 minutes)

---

## Cost Estimates

**Free Tier (Most Users):**
- Vercel: Free (100GB bandwidth, unlimited requests)
- Supabase: Free (500MB database, 2GB bandwidth)
- Vercel AI Gateway: Free (uses your OpenAI key if provided)

**Estimated Costs with Usage:**
- OpenAI GPT-4o: ~$0.01 per 10 queries
- Database: $0 (free tier) or $25/month (Supabase Pro)
- Vercel: $0 (hobby) or $20/month (Pro)

**For 1,000 queries/month:**
- ~$1-2 in OpenAI costs
- Free hosting and database

---

## Production Checklist

- [ ] Database schema deployed and verified
- [ ] Environment variables configured on Vercel
- [ ] Test login with demo credentials works
- [ ] AI chat responds to queries
- [ ] Charts and visualizations render
- [ ] Usage dashboard shows data
- [ ] Forms can create new records
- [ ] Mobile responsive tested
- [ ] Function logs show no errors
- [ ] Custom domain configured (optional)

---

## Environment Variables Summary

Create a `.env.local` file for local development:

```bash
# Required for database features
DATABASE_URL="postgresql://user:password@host:5432/database"

# Optional - uses Vercel AI Gateway if omitted
OPENAI_API_KEY="sk-proj-your-key-here"

# Optional - for development redirects
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL="http://localhost:3000"
```

**Never commit `.env.local` to git!**

---

## Support & Resources

- **Documentation**: See `DATABASE_SETUP.md` and `AI_SETTINGS.md`
- **Test Database**: Run `npm run test:db` locally
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **AI SDK Docs**: [sdk.vercel.ai](https://sdk.vercel.ai)

---

## Quick Deploy Command

```bash
# One-liner to deploy
git add . && git commit -m "Deploy to production" && git push && vercel --prod
```

**Your app is now live! 🎉**

Visit `https://your-project.vercel.app` and start querying your databases with AI.
