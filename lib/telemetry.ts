import { query } from "./db"

// Model pricing per 1M tokens (as of 2025)
const MODEL_PRICING: Record<string, { prompt: number; completion: number }> = {
  "gpt-4o": { prompt: 2.5, completion: 10.0 },
  "gpt-4o-mini": { prompt: 0.15, completion: 0.6 },
  "gpt-4-turbo": { prompt: 10.0, completion: 30.0 },
  "gpt-3.5-turbo": { prompt: 0.5, completion: 1.5 },
  "claude-sonnet-4.5": { prompt: 3.0, completion: 15.0 },
  "claude-opus-4": { prompt: 15.0, completion: 75.0 },
}

export interface AIRequestMetrics {
  conversationId?: string
  userId: string
  model: string
  promptTokens: number
  completionTokens: number
  durationMs?: number
  status?: string
  errorMessage?: string
  requestData?: any
  responseData?: any
}

export interface QueryExecutionMetrics {
  aiRequestId: string
  userId: string
  naturalQuery: string
  generatedSql?: string
  databaseName?: string
  rowsReturned?: number
  executionTimeMs?: number
  success: boolean
  errorMessage?: string
}

export async function trackAIRequest(metrics: AIRequestMetrics): Promise<string> {
  const totalTokens = metrics.promptTokens + metrics.completionTokens
  const pricing = MODEL_PRICING[metrics.model] || { prompt: 0, completion: 0 }

  const promptCost = (metrics.promptTokens / 1_000_000) * pricing.prompt
  const completionCost = (metrics.completionTokens / 1_000_000) * pricing.completion
  const totalCost = promptCost + completionCost

  const result = await query<{ id: string }>(
    `INSERT INTO ai_requests 
      (conversation_id, user_id, model, prompt_tokens, completion_tokens, total_tokens, 
       prompt_cost, completion_cost, total_cost, duration_ms, status, error_message, 
       request_data, response_data)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING id`,
    [
      metrics.conversationId || null,
      metrics.userId,
      metrics.model,
      metrics.promptTokens,
      metrics.completionTokens,
      totalTokens,
      promptCost,
      completionCost,
      totalCost,
      metrics.durationMs || null,
      metrics.status || "success",
      metrics.errorMessage || null,
      metrics.requestData ? JSON.stringify(metrics.requestData) : null,
      metrics.responseData ? JSON.stringify(metrics.responseData) : null,
    ],
  )

  // Update user usage stats
  await updateUserUsageStats(metrics.userId, totalTokens, totalCost)

  return result[0].id
}

export async function trackQueryExecution(metrics: QueryExecutionMetrics): Promise<void> {
  await query(
    `INSERT INTO query_executions 
      (ai_request_id, user_id, natural_query, generated_sql, database_name, 
       rows_returned, execution_time_ms, success, error_message)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      metrics.aiRequestId,
      metrics.userId,
      metrics.naturalQuery,
      metrics.generatedSql || null,
      metrics.databaseName || null,
      metrics.rowsReturned || null,
      metrics.executionTimeMs || null,
      metrics.success,
      metrics.errorMessage || null,
    ],
  )
}

async function updateUserUsageStats(userId: string, tokens: number, cost: number): Promise<void> {
  await query(
    `INSERT INTO user_usage_stats (user_id, total_requests, total_tokens, total_cost, last_request_at)
    VALUES ($1, 1, $2, $3, NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET
      total_requests = user_usage_stats.total_requests + 1,
      total_tokens = user_usage_stats.total_tokens + $2,
      total_cost = user_usage_stats.total_cost + $3,
      last_request_at = NOW(),
      updated_at = NOW()`,
    [userId, tokens, cost],
  )
}

export async function trackTelemetrySpan(span: {
  traceId: string
  spanId: string
  parentSpanId?: string
  name: string
  kind?: string
  startTime: Date
  endTime?: Date
  durationMs?: number
  status?: string
  attributes?: Record<string, any>
  events?: any[]
}): Promise<void> {
  await query(
    `INSERT INTO telemetry_spans 
      (trace_id, span_id, parent_span_id, name, kind, start_time, end_time, 
       duration_ms, status, attributes, events)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      span.traceId,
      span.spanId,
      span.parentSpanId || null,
      span.name,
      span.kind || null,
      span.startTime,
      span.endTime || null,
      span.durationMs || null,
      span.status || null,
      span.attributes ? JSON.stringify(span.attributes) : null,
      span.events ? JSON.stringify(span.events) : null,
    ],
  )
}

export async function getUserUsageStats(userId: string) {
  const result = await query<{
    total_requests: number
    total_tokens: number
    total_cost: string
    last_request_at: Date
  }>(
    `SELECT total_requests, total_tokens, total_cost, last_request_at
    FROM user_usage_stats
    WHERE user_id = $1`,
    [userId],
  )

  return result[0] || null
}

export async function getRecentAIRequests(userId: string, limit = 10) {
  return await query(
    `SELECT id, model, total_tokens, total_cost, duration_ms, status, created_at
    FROM ai_requests
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT $2`,
    [userId, limit],
  )
}
