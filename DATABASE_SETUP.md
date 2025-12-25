# Database Setup Guide

This guide will help you set up PostgreSQL for telemetry, usage tracking, and cost monitoring.

## Prerequisites

- PostgreSQL 14+ database (Supabase, Neon, or any PostgreSQL provider)
- Database admin access
- Connection string with SSL enabled

## Option 1: Supabase (Recommended)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details:
   - Name: `queryai-production`
   - Database Password: (generate a strong password)
   - Region: (choose closest to your users)

### Step 2: Get Connection String

1. Go to Project Settings → Database
2. Copy the "Connection string" under "Connection pooling"
3. Replace `[YOUR-PASSWORD]` with your database password
4. Your connection string should look like:
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```

### Step 3: Run Migration Script

1. Go to SQL Editor in Supabase dashboard
2. Click "New Query"
3. Copy the entire contents of `scripts/01-create-telemetry-tables.sql`
4. Paste and click "Run"
5. Verify tables were created in Table Editor

## Option 2: Neon

### Step 1: Create Neon Project

1. Go to [neon.tech](https://neon.tech)
2. Click "Create Project"
3. Name your project: `queryai-production`
4. Select region closest to your users

### Step 2: Get Connection String

1. Copy the connection string from the dashboard
2. It should look like:
   ```
   postgresql://[user]:[password]@[host].neon.tech/[dbname]?sslmode=require
   ```

### Step 3: Run Migration Script

**Option A: Using Neon SQL Editor**
1. Go to SQL Editor in Neon console
2. Copy contents of `scripts/01-create-telemetry-tables.sql`
3. Paste and execute

**Option B: Using psql**
```bash
psql "postgresql://[user]:[password]@[host].neon.tech/[dbname]?sslmode=require" -f scripts/01-create-telemetry-tables.sql
```

## Option 3: Local PostgreSQL

### Step 1: Install PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Step 2: Create Database

```bash
# Create database
createdb queryai

# Create user (optional)
psql -c "CREATE USER queryai_user WITH PASSWORD 'your_password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE queryai TO queryai_user;"
```

### Step 3: Run Migration

```bash
psql queryai -f scripts/01-create-telemetry-tables.sql
```

### Step 4: Connection String

```
postgresql://localhost:5432/queryai
# or with custom user:
postgresql://queryai_user:your_password@localhost:5432/queryai
```

## Verify Setup

### Check Tables Exist

Run this query in your database:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'conversations',
    'messages', 
    'ai_requests',
    'query_executions',
    'user_usage_stats',
    'telemetry_spans'
  );
```

You should see all 6 tables listed.

### Test Connection from Application

```bash
# Set environment variable
export DATABASE_URL="your_connection_string_here"

# Test connection
npm run test:db
```

Or manually test in Node.js:

```javascript
const { Pool } = require('pg')
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Connection error:', err)
  } else {
    console.log('Connected! Server time:', res.rows[0].now)
  }
  pool.end()
})
```

## Environment Variables

Add to your `.env.local` file:

```bash
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
```

For Vercel deployment, add the environment variable in:
1. Go to your Vercel project
2. Settings → Environment Variables
3. Add `DATABASE_URL` with your connection string
4. Add to Production, Preview, and Development environments

## Troubleshooting

### Connection Timeout
- Check if your IP is whitelisted (Supabase/Neon)
- Verify SSL mode is set correctly
- Check firewall settings

### Permission Denied
- Ensure user has proper permissions
- Run `GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;`

### Tables Not Created
- Check PostgreSQL version (need 14+)
- Ensure you have CREATE TABLE permissions
- Check for syntax errors in migration script

### SSL Certificate Issues
Add to connection string:
```
?sslmode=require&sslrootcert=/path/to/ca-certificate.crt
```

Or disable SSL verification (not recommended for production):
```
?sslmode=require
```

## Schema Overview

### Tables

1. **conversations** - User chat sessions
2. **messages** - Individual chat messages
3. **ai_requests** - AI API calls with token usage and costs
4. **query_executions** - SQL query executions
5. **user_usage_stats** - Aggregated user statistics
6. **telemetry_spans** - OpenTelemetry distributed tracing

### Indexes

All tables have optimized indexes for:
- User lookups (user_id)
- Time-based queries (created_at)
- Trace lookups (trace_id, span_id)

## Monitoring

### Check Usage Stats

```sql
SELECT 
  user_id,
  total_requests,
  total_tokens,
  total_cost,
  last_request_at
FROM user_usage_stats
ORDER BY total_cost DESC;
```

### Recent AI Requests

```sql
SELECT 
  model,
  total_tokens,
  total_cost,
  duration_ms,
  created_at
FROM ai_requests
ORDER BY created_at DESC
LIMIT 10;
```

### Cost by Model

```sql
SELECT 
  model,
  COUNT(*) as request_count,
  SUM(total_tokens) as total_tokens,
  SUM(total_cost) as total_cost
FROM ai_requests
GROUP BY model
ORDER BY total_cost DESC;
```

## Backup and Maintenance

### Daily Backups

Most providers (Supabase, Neon) handle backups automatically.

For local PostgreSQL:
```bash
pg_dump queryai > backup_$(date +%Y%m%d).sql
```

### Cleanup Old Data

```sql
-- Delete telemetry data older than 90 days
DELETE FROM telemetry_spans WHERE created_at < NOW() - INTERVAL '90 days';
DELETE FROM query_executions WHERE created_at < NOW() - INTERVAL '90 days';
DELETE FROM ai_requests WHERE created_at < NOW() - INTERVAL '90 days';
```

## Next Steps

1. ✅ Database created and tables set up
2. ✅ Connection string added to environment variables
3. ✅ Test connection successful
4. 🚀 Deploy to Vercel
5. 📊 Monitor usage in `/dashboard/usage`
```

```json file="" isHidden
