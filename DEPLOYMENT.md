# Deployment Guide - QueryAI

Complete step-by-step guide to deploy QueryAI to Vercel.

## Prerequisites

- A GitHub account
- A Vercel account (free tier works)
- Git installed on your computer

## Step 1: Prepare Your Code

### 1.1 Download the Project

If you're using v0.app, click the three dots in the top right and select "Download ZIP" or use the shadcn CLI:

```bash
npx shadcn@latest init
```

### 1.2 Create a GitHub Repository

1. Go to [github.com](https://github.com) and create a new repository
2. Name it `queryai` or any name you prefer
3. Keep it public or private (your choice)
4. Don't initialize with README (we already have one)

### 1.3 Push Code to GitHub

```bash
# Navigate to your project directory
cd queryai

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: QueryAI application"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/queryai.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

### Method A: Using Vercel Dashboard (Recommended for Beginners)

1. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "Sign Up" or "Log In"
   - Sign in with your GitHub account

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select your GitHub repository (`queryai`)
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `next build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: Vercel will auto-detect pnpm/npm

4. **Environment Variables (Optional)**
   
   The app works without environment variables in demo mode. To add real AI functionality:
   
   - Click "Environment Variables"
   - Add the following if needed:
     ```
     OPENAI_API_KEY=your_key_here
     DATABASE_URL=your_database_url
     ```

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Method B: Using Vercel CLI (For Developers)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login**
```bash
vercel login
```

3. **Deploy**
```bash
# From your project directory
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - What's your project's name? queryai
# - In which directory is your code? ./
# - Want to override settings? No
```

4. **Deploy to Production**
```bash
vercel --prod
```

## Step 3: Configure Custom Domain (Optional)

1. Go to your project on Vercel Dashboard
2. Navigate to "Settings" → "Domains"
3. Add your custom domain
4. Follow Vercel's DNS configuration instructions
5. Wait for DNS propagation (5-60 minutes)

## Step 4: Set Up Automatic Deployments

Vercel automatically deploys when you push to GitHub:

- **Main branch** → Production deployment
- **Other branches** → Preview deployments

To disable automatic deployments:
1. Go to Settings → Git
2. Configure deployment branches

## Step 5: Monitor Your Deployment

### Check Build Logs

1. Go to Vercel Dashboard
2. Click on your project
3. Click on a deployment
4. View "Building" logs for any errors

### Common Build Issues

**Issue: Build fails with "Module not found"**
```bash
# Solution: Ensure all dependencies are in package.json
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

**Issue: Environment variables not working**
```bash
# Solution: Check they're added in Vercel Dashboard
# Settings → Environment Variables
# Redeploy after adding variables
```

## Step 6: Test Your Deployment

1. Visit your Vercel URL
2. Test the login with demo credentials:
   - Email: `demo@queryai.com`
   - Password: `demo123`
3. Test all features:
   - AI Chat
   - Database Connections
   - Query History
   - Settings
   - Theme switcher

## Performance Optimization

### Enable Vercel Analytics

1. Go to your project on Vercel
2. Navigate to "Analytics" tab
3. Click "Enable Analytics"
4. Analytics are automatically integrated

### Enable Speed Insights

1. Go to "Speed Insights" tab
2. Click "Enable Speed Insights"
3. View real-user performance metrics

## Environment Variables Reference

### Development (.env.local)

Create this file for local development:

```env
# Optional: AI Configuration
OPENAI_API_KEY=sk-...

# Optional: Database
DATABASE_URL=postgresql://...

# Optional: App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Production (Vercel Dashboard)

Add these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| OPENAI_API_KEY | your_api_key | Production |
| DATABASE_URL | your_db_url | Production |
| NEXT_PUBLIC_APP_URL | https://your-app.vercel.app | Production |

## Adding Real AI Functionality

Currently, the app runs in demo mode. To enable real AI:

### Option 1: Use Vercel AI Gateway (Recommended)

1. In Vercel Dashboard, go to your project
2. Navigate to "Integrations"
3. Search for "AI Gateway"
4. Follow setup instructions
5. No code changes needed!

### Option 2: Add OpenAI API Key

1. Get API key from [platform.openai.com](https://platform.openai.com)
2. Add to Vercel environment variables:
   ```
   OPENAI_API_KEY=sk-...
   ```
3. The app will automatically use real AI

## Connecting Real Databases

To connect actual databases:

### 1. Choose a Database Provider

- **Vercel Postgres** (easiest integration)
- **Supabase** (free tier available)
- **PlanetScale** (MySQL)
- **Railway** (multiple databases)

### 2. Get Connection String

Example for PostgreSQL:
```
postgresql://user:password@host:5432/database
```

### 3. Add to Environment Variables

```env
DATABASE_URL=your_connection_string
```

### 4. Update Code

The demo code needs to be updated to use real database connections. The app currently uses mock data.

## Troubleshooting

### Build Errors

1. Check build logs in Vercel Dashboard
2. Ensure all dependencies are installed
3. Verify no TypeScript errors locally

### Runtime Errors

1. Check Function logs in Vercel
2. Verify environment variables are set
3. Test locally first: `npm run build && npm start`

### Performance Issues

1. Enable Vercel Speed Insights
2. Check bundle size in build logs
3. Optimize images with Next.js Image component

## Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **GitHub Issues**: Create an issue in your repository

## Next Steps

After deployment, consider:

1. **Add Authentication**: Integrate Clerk, Auth0, or Supabase Auth
2. **Connect Real Database**: Use Vercel Postgres or Supabase
3. **Enable AI**: Add OpenAI API key or use Vercel AI Gateway
4. **Custom Domain**: Add your own domain name
5. **Analytics**: Monitor usage with Vercel Analytics
6. **SEO**: Update metadata in `app/layout.tsx`

## Quick Deploy Button

Add this to your README.md for one-click deploy:

```markdown
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/queryai)
```

---

**Congratulations!** Your QueryAI application is now deployed and accessible worldwide.
