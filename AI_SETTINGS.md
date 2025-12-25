# AI Configuration Guide

This guide explains how to configure AI models and API keys for QueryAI.

## Overview

QueryAI uses the **Vercel AI SDK v5** which provides:

- ✅ **Streaming responses** - Real-time AI output
- ✅ **Tool calling** - AI can execute SQL queries
- ✅ **Token tracking** - Automatic usage and cost monitoring
- ✅ **OpenTelemetry** - Built-in observability
- ✅ **Multiple providers** - OpenAI, Anthropic, and more

## Default Configuration (No Setup Required)

When deployed to Vercel, QueryAI uses the **Vercel AI Gateway** which:

- Works without any API keys
- Supports OpenAI, Anthropic, AWS Bedrock, Google Vertex, Fireworks AI
- Automatically handles authentication
- Provides analytics and monitoring
- **Requires credit card on file with Vercel**

### Using AI Gateway (Recommended)

No configuration needed! Just deploy to Vercel and it works.

**Supported models:**
```typescript
"openai/gpt-4o"           // GPT-4o (default)
"openai/gpt-4o-mini"      // GPT-4o Mini (cheaper)
"openai/gpt-4-turbo"      // GPT-4 Turbo
"anthropic/claude-sonnet-4.5"  // Claude Sonnet
"anthropic/claude-opus-4"      // Claude Opus
"xai/grok-beta"           // Grok
```

## Custom API Keys (Optional)

If you want to use your own API keys instead of AI Gateway:

### Option 1: OpenAI

1. Get API key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Add to environment variables:
   ```bash
   OPENAI_API_KEY=sk-proj-...
   ```
3. Update `app/api/chat/route.ts`:
   ```typescript
   import { openai } from "@ai-sdk/openai"
   
   // Change from:
   model: "openai/gpt-4o"
   
   // To:
   model: openai("gpt-4o", {
     apiKey: process.env.OPENAI_API_KEY
   })
   ```

**Pricing (per 1M tokens):**
- GPT-4o: $2.50 input / $10.00 output
- GPT-4o Mini: $0.15 input / $0.60 output
- GPT-4 Turbo: $10.00 input / $30.00 output

### Option 2: Anthropic (Claude)

1. Get API key from [console.anthropic.com](https://console.anthropic.com)
2. Add to environment variables:
   ```bash
   ANTHROPIC_API_KEY=sk-ant-...
   ```
3. Update `app/api/chat/route.ts`:
   ```typescript
   import { anthropic } from "@ai-sdk/anthropic"
   
   model: anthropic("claude-sonnet-4.5", {
     apiKey: process.env.ANTHROPIC_API_KEY
   })
   ```

**Pricing (per 1M tokens):**
- Claude Sonnet 4.5: $3.00 input / $15.00 output
- Claude Opus 4: $15.00 input / $75.00 output

### Option 3: Other Providers

QueryAI supports any provider through Vercel AI SDK:

```bash
npm install @ai-sdk/google @ai-sdk/mistral @ai-sdk/cohere
```

See [sdk.vercel.ai/providers](https://sdk.vercel.ai/providers) for all options.

## System Prompt Customization

The system prompt defines how the AI behaves. Located in `app/api/chat/route.ts`:

```typescript
const SYSTEM_PROMPT = `You are an expert SQL assistant...`
```

### Customization Tips:

**For different database types:**
```typescript
Available databases:
- PostgreSQL 16 (primary database)
- MySQL 8.0 (analytics database)
- MongoDB 7.0 (document store)

Use appropriate syntax for each database type.
```

**For specific domains:**
```typescript
You are an expert e-commerce database assistant.
Focus on order management, inventory tracking, and customer analytics.

Key tables:
- orders (id, customer_id, total, status, created_at)
- products (id, name, price, stock, category)
- customers (id, name, email, tier, lifetime_value)
```

**For security-focused queries:**
```typescript
IMPORTANT SECURITY RULES:
1. Never execute DELETE or DROP statements
2. Always use parameterized queries
3. Limit results to 1000 rows maximum
4. Only query tables user has permission for
5. Redact sensitive PII in responses
```

## Token Tracking & Cost Management

QueryAI automatically tracks:

- ✅ Prompt tokens
- ✅ Completion tokens
- ✅ Total cost per request
- ✅ Cost per user
- ✅ Daily/monthly aggregates

### View Usage:

Navigate to `/dashboard/usage` to see:

- Total requests and tokens
- Cost breakdown by model
- Cost trends over time
- Individual request details

### Model Pricing Configuration

Pricing is defined in `lib/telemetry.ts`:

```typescript
const MODEL_PRICING = {
  "gpt-4o": { prompt: 2.5, completion: 10.0 },
  "gpt-4o-mini": { prompt: 0.15, completion: 0.6 },
  "claude-sonnet-4.5": { prompt: 3.0, completion: 15.0 },
}
```

Add new models or update pricing as needed.

## OpenTelemetry Integration

QueryAI includes full OpenTelemetry support for:

- 🔍 **Distributed tracing** - Track requests across services
- 📊 **Metrics collection** - Performance monitoring
- 🐛 **Error tracking** - Automatic exception logging
- ⏱️ **Latency monitoring** - Response time tracking

### Trace Example:

```
chat.request (1250ms)
  ├─ sql.execute (340ms)
  │   ├─ db.query (280ms)
  │   └─ result.format (60ms)
  └─ ai.stream (910ms)
      ├─ token.prompt (150ms)
      └─ token.completion (760ms)
```

### Viewing Traces:

Traces are stored in the `telemetry_spans` table. View them:

```sql
SELECT 
  name,
  duration_ms,
  status,
  attributes
FROM telemetry_spans
WHERE trace_id = 'your-trace-id'
ORDER BY start_time;
```

### Export to External Services:

Integrate with observability platforms:

- **Vercel Analytics** - Built-in (automatic)
- **Datadog** - Add `@opentelemetry/exporter-datadog`
- **New Relic** - Add `@opentelemetry/exporter-newrelic`
- **Jaeger** - Add `@opentelemetry/exporter-jaeger`

## Advanced Configuration

### Streaming Settings

Adjust streaming behavior in `app/api/chat/route.ts`:

```typescript
const result = streamText({
  model: "openai/gpt-4o",
  prompt,
  system: SYSTEM_PROMPT,
  
  // Control response length
  maxTokens: 1000,
  
  // Control randomness (0-2, lower = more focused)
  temperature: 0.7,
  
  // Control diversity (0-1, higher = more diverse)
  topP: 0.9,
  
  // Stop sequences
  stop: ["\n\nHuman:", "\n\nAssistant:"],
  
  // Timeout
  abortSignal: req.signal,
})
```

### Tool Configuration

Add more tools for the AI:

```typescript
tools: {
  generateSQL: tool({ /* existing */ }),
  
  // New tool: Visualize data
  createChart: tool({
    description: "Create a chart visualization",
    inputSchema: z.object({
      type: z.enum(["bar", "line", "pie"]),
      data: z.array(z.any()),
      title: z.string(),
    }),
    execute: async ({ type, data, title }) => {
      // Chart generation logic
      return { chartUrl: "..." }
    },
  }),
  
  // New tool: Export data
  exportData: tool({
    description: "Export query results",
    inputSchema: z.object({
      format: z.enum(["csv", "json", "excel"]),
      data: z.array(z.any()),
    }),
    execute: async ({ format, data }) => {
      // Export logic
      return { downloadUrl: "..." }
    },
  }),
}
```

## Environment Variables Summary

Required for production:

```bash
# Database (required for telemetry)
DATABASE_URL=postgresql://...

# AI (optional - uses AI Gateway if not set)
OPENAI_API_KEY=sk-proj-...        # For custom OpenAI
ANTHROPIC_API_KEY=sk-ant-...      # For custom Anthropic

# Application
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production
```

## Testing AI Configuration

Test your setup locally:

```bash
# 1. Set environment variables
export DATABASE_URL="your-db-url"
export OPENAI_API_KEY="your-api-key"  # optional

# 2. Start development server
npm run dev

# 3. Go to http://localhost:3000
# 4. Login and send a test message
# 5. Check /dashboard/usage for tracking
```

## Troubleshooting

### AI Gateway 403 Error

**Problem:** "AI Gateway requires a credit card on file"

**Solution:**
1. Go to [vercel.com/account/billing](https://vercel.com/account/billing)
2. Add a payment method
3. Redeploy your application

Or use custom API keys (see above).

### High Token Usage

**Problem:** Costs are higher than expected

**Solutions:**
1. Switch to cheaper model (gpt-4o-mini instead of gpt-4o)
2. Reduce `maxTokens` in config
3. Simplify system prompt
4. Add request rate limiting

### Slow Responses

**Problem:** AI takes too long to respond

**Solutions:**
1. Use faster model (gpt-4o-mini)
2. Reduce `maxTokens`
3. Implement response caching
4. Use streaming (already enabled)

### Token Tracking Not Working

**Problem:** Usage page shows errors

**Solutions:**
1. Verify `DATABASE_URL` is set
2. Run database migration script
3. Check database connection
4. Review logs for errors

## Next Steps

1. ✅ Configure AI provider
2. ✅ Set up database for tracking
3. ✅ Customize system prompt
4. ✅ Deploy to Vercel
5. 📊 Monitor usage in dashboard
6. 🎯 Optimize costs based on usage
