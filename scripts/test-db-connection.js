const { Pool } = require("pg")

async function testConnection() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    console.error("❌ DATABASE_URL environment variable is not set")
    console.log("\nPlease set DATABASE_URL in your .env.local file:")
    console.log('DATABASE_URL="postgresql://user:password@host:port/database"\n')
    process.exit(1)
  }

  console.log("🔍 Testing database connection...\n")

  const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
  })

  try {
    // Test basic connection
    const timeResult = await pool.query("SELECT NOW() as current_time")
    console.log("✅ Connection successful!")
    console.log(`📅 Database time: ${timeResult.rows[0].current_time}\n`)

    // Check if tables exist
    console.log("🔍 Checking tables...\n")
    const tablesResult = await pool.query(`
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
        )
      ORDER BY table_name
    `)

    const expectedTables = [
      "ai_requests",
      "conversations",
      "messages",
      "query_executions",
      "telemetry_spans",
      "user_usage_stats",
    ]

    const existingTables = tablesResult.rows.map((row) => row.table_name)

    for (const table of expectedTables) {
      if (existingTables.includes(table)) {
        console.log(`✅ Table "${table}" exists`)
      } else {
        console.log(`❌ Table "${table}" is missing`)
      }
    }

    if (existingTables.length === 0) {
      console.log("\n⚠️  No tables found. Please run the migration script:")
      console.log("   See DATABASE_SETUP.md for instructions\n")
    } else if (existingTables.length < expectedTables.length) {
      console.log("\n⚠️  Some tables are missing. Please run the migration script:")
      console.log("   See DATABASE_SETUP.md for instructions\n")
    } else {
      console.log("\n✅ All tables are set up correctly!\n")
    }

    // Show some stats
    const statsResult = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM ai_requests) as ai_requests_count,
        (SELECT COUNT(*) FROM query_executions) as query_executions_count,
        (SELECT COUNT(*) FROM user_usage_stats) as users_count
    `)

    const stats = statsResult.rows[0]
    console.log("📊 Current statistics:")
    console.log(`   AI Requests: ${stats.ai_requests_count}`)
    console.log(`   Query Executions: ${stats.query_executions_count}`)
    console.log(`   Users: ${stats.users_count}\n`)

    console.log("🎉 Database is ready for use!\n")
  } catch (error) {
    console.error("❌ Connection failed:", error.message)
    console.log("\nPlease check:")
    console.log("1. Database connection string is correct")
    console.log("2. Database is running and accessible")
    console.log("3. SSL settings are correct")
    console.log("4. Firewall allows connections\n")
    process.exit(1)
  } finally {
    await pool.end()
  }
}

testConnection()
