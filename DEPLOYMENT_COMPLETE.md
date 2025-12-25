# Complete Deployment Guide

Follow these steps to deploy QueryAI to Vercel with full OpenTelemetry tracking and cost monitoring.

## Prerequisites Checklist

- [ ] GitHub account
- [ ] Vercel account
- [ ] PostgreSQL database (Supabase, Neon, or other)
- [ ] Credit card on Vercel (for AI Gateway) OR OpenAI API key

## Step 1: Prepare Your Database

### Option A: Supabase (Easiest)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to SQL Editor → New Query
4. Copy and paste contents of `scripts/01-create-telemetry-tables.sql`
5. Click "Run"
6. Go to Settings → Database → Copy connection string

### Option B: Neon

1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Install psql or use Neon SQL Editor
5. Run: `psql "your-connection-string" -f scripts/01-create-telemetry-tables.sql`

See `DATABASE_SETUP.md` for detailed instructions.

## Step 2: Test Database Locally

```bash
# 1. Create .env.local file
cp .env.local.example .env.local

# 2. Add your database URL
echo 'DATABASE_URL="postgresql://..."' >> .env.local

# 3. Install dependencies
npm install

# 4. Test connection
npm run test:db
```

You should see:
```
✅ Connection successful!
✅ All tables are set up correctly!
🎉 Database is ready for use!
```

## Step 3: Test Locally

```bash
# Start development server
npm run dev

# Open http://localhost:3000
# Login with demo credentials:
#   Email: demo@queryai.com
#   Password: demo123

# Test AI chat:
# - Send: "Show me all users"
# - Verify SQL query appears
# - Check data table loads
# - Try Charts tab

# Check usage tracking:
# - Go to /dashboard/usage
# - Verify stats are being recorded
```

## Step 4: Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: QueryAI with OpenTelemetry"

# Create GitHub repo (https://github.com/new)
# Then push:
git remote add origin https://github.com/your-username/queryai.git
git branch -M main
git push -u origin main
```

## Step 5: Deploy to Vercel

### Method 1: Vercel Dashboard (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your GitHub repo
4. Configure project:
   - **Framework Preset:** Next.js
   - **Root Directory:** ./
   - **Build Command:** `npm run build`
   - **Install Command:** `npm install`

5. Add Environment Variables:
   ```
   DATABASE_URL = postgresql://...
   NEXT_PUBLIC_APP_URL = https://your-app.vercel.app
   NODE_ENV = production
   ```

6. Click "Deploy"

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables
vercel env add DATABASE_URL
# Paste your connection string

vercel env add NEXT_PUBLIC_APP_URL  
# Enter: https://your-app.vercel.app

# Deploy to production
vercel --prod
```

## Step 6: Configure AI Provider

### Option A: Use AI Gateway (Easiest)

1. Go to [vercel.com/account/billing](https://vercel.com/account/billing)
2. Add payment method
3. That's it! AI Gateway works automatically

**No environment variables needed.**

### Option B: Use Custom OpenAI Key

1. Get API key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Add to Vercel:
   ```bash
   vercel env add OPENAI_API_KEY
   # Paste: sk-proj-...
   ```
3. Redeploy:
   ```bash
   vercel --prod
   ```

See `AI_SETTINGS.md` for more provider options.

## Step 7: Verify Deployment

### Test Production App

1. Go to your deployment URL
2. Login with demo credentials
3. Test chat: "Show me all users"
4. Verify response loads with data and charts
5. Check `/dashboard/usage` for tracking
6. Check `/dashboard/connections` for database management
7. Check `/dashboard/history` for query history
8. Check `/dashboard/settings` for theme switcher

### Check Database

Run queries to verify tracking:

```sql
-- Check AI requests
SELECT 
  COUNT(*) as total_requests,
  SUM(total_tokens) as total_tokens,
  SUM(total_cost) as total_cost
FROM ai_requests;

-- Check query executions
SELECT 
  COUNT(*) as total_queries,
  AVG(execution_time_ms) as avg_time
FROM query_executions;

-- Check user stats
SELECT * FROM user_usage_stats;
```

### Monitor Logs

```bash
# View real-time logs
vercel logs --follow

# View specific deployment
vercel logs [deployment-url]
```

## Step 8: Production Configuration

### Add Custom Domain

1. Go to Project Settings → Domains
2. Add your domain: `app.yourdomain.com`
3. Configure DNS (Vercel provides instructions)
4. Update environment variable:
   ```bash
   vercel env add NEXT_PUBLIC_APP_URL production
   # Enter: https://app.yourdomain.com
   ```

### Set Up Monitoring

**Vercel Analytics (Automatic):**
- Already included in app
- View at: `your-project.vercel.app/_analytics`

**Error Tracking:**
Consider adding:
- Sentry
- LogRocket
- Datadog

### Configure Backups

**Supabase:**
- Automatic daily backups included
- Manual backups: Project Settings → Database → Backups

**Neon:**
- Point-in-time restore included
- Automatic backups every 24 hours

### Set Up Alerts

Create alerts for:
- High token usage
- Database connection errors
- High response times
- Cost thresholds

## Environment Variables Reference

### Required

```bash
DATABASE_URL=postgresql://user:pass@host:port/db
```

### Optional (AI)

```bash
OPENAI_API_KEY=sk-proj-...           # For custom OpenAI
ANTHROPIC_API_KEY=sk-ant-...         # For Anthropic Claude
```

### Optional (App)

```bash
NEXT_PUBLIC_APP_URL=https://...      # Your app URL
NODE_ENV=production                   # Environment
```

## Cost Estimates

### Vercel

- **Hobby (Free):** 100 GB bandwidth, unlimited requests
- **Pro ($20/mo):** 1 TB bandwidth, team features, advanced analytics

### AI Costs (GPT-4o via AI Gateway)

**Example usage:**
- 100 queries/day
- 500 prompt tokens per query
- 200 completion tokens per query

**Monthly cost:**
```
Prompt:   100 * 30 * 500 = 1,500,000 tokens = $3.75
Complete: 100 * 30 * 200 = 600,000 tokens = $6.00
Total: ~$10/month
```

Switch to GPT-4o-mini: ~$0.60/month (16x cheaper!)

### Database

- **Supabase Free:** 500 MB database, 2 GB bandwidth
- **Neon Free:** 3 GB storage, 3 compute hours
- **Paid plans:** ~$10-25/month for production

## Troubleshooting

### Build Fails

**Error:** "Module not found: Can't resolve '@/lib/db'"

**Solution:**
```bash
npm install
npm run build
```

### AI Not Working

**Error:** "AI Gateway requires credit card"

**Solutions:**
1. Add payment method to Vercel account
2. OR use custom OpenAI API key

### Database Connection Fails

**Error:** "connection timeout"

**Solutions:**
1. Check DATABASE_URL is correct
2. Verify SSL settings: `?sslmode=require`
3. Check IP whitelist (Supabase/Neon)
4. Test connection: `npm run test:db`

### Telemetry Not Tracking

**Checks:**
1. DATABASE_URL environment variable set?
2. Database tables created?
3. Check Vercel logs for errors
4. Verify `/api/chat` route works

## Security Checklist

- [ ] Environment variables set correctly
- [ ] Database uses SSL
- [ ] Strong database password
- [ ] API keys kept secret
- [ ] CORS configured properly
- [ ] Rate limiting implemented (optional)
- [ ] SQL injection prevention (parameterized queries)

## Performance Optimization

### Edge Functions

Already optimized with:
- Edge runtime for API routes
- Streaming responses
- Optimized database queries

### Caching

Consider adding:
- Redis for query result caching
- CDN for static assets
- Service worker for offline support

### Database Optimization

- Indexes already created
- Connection pooling enabled
- Query optimization in telemetry

## Next Steps

1. ✅ App deployed and working
2. ✅ Database configured with tracking
3. ✅ AI provider connected
4. 📧 Set up authentication (optional)
5. 🔐 Add real database connections (optional)
6. 👥 Invite team members
7. 📊 Monitor usage and costs
8. 🎨 Customize branding and theme
9. 🚀 Add custom features

## Getting Help

- **Documentation:** See README.md, AI_SETTINGS.md, DATABASE_SETUP.md
- **Vercel Support:** [vercel.com/help](https://vercel.com/help)
- **AI SDK Docs:** [sdk.vercel.ai/docs](https://sdk.vercel.ai/docs)
- **Database Issues:** Check provider documentation

## Summary

You now have a fully functional AI database chat application with:

✅ AI-powered SQL generation (Vercel AI SDK v5)  
✅ Streaming responses with tool calling  
✅ Complete OpenTelemetry integration  
✅ Token usage and cost tracking  
✅ PostgreSQL database for telemetry  
✅ Beautiful responsive UI with charts  
✅ Multi-theme support  
✅ Production-ready deployment  

**Total setup time:** ~30 minutes  
**Monthly cost:** ~$10-30 (depending on usage)

Congratulations! 🎉
