-- Tables for tracking AI usage, token costs, and telemetry

-- Users queries and conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Individual messages in conversations
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- AI request tracking and token usage
CREATE TABLE IF NOT EXISTS ai_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  model VARCHAR(100) NOT NULL,
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  prompt_cost DECIMAL(10, 6) NOT NULL DEFAULT 0,
  completion_cost DECIMAL(10, 6) NOT NULL DEFAULT 0,
  total_cost DECIMAL(10, 6) NOT NULL DEFAULT 0,
  duration_ms INTEGER,
  status VARCHAR(50) DEFAULT 'success', -- 'success', 'error', 'timeout'
  error_message TEXT,
  request_data JSONB,
  response_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Query execution tracking
CREATE TABLE IF NOT EXISTS query_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_request_id UUID REFERENCES ai_requests(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  natural_query TEXT NOT NULL,
  generated_sql TEXT,
  database_name VARCHAR(255),
  rows_returned INTEGER,
  execution_time_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User usage statistics (aggregated)
CREATE TABLE IF NOT EXISTS user_usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) UNIQUE NOT NULL,
  total_requests INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  total_cost DECIMAL(10, 2) DEFAULT 0,
  last_request_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- OpenTelemetry spans for distributed tracing
CREATE TABLE IF NOT EXISTS telemetry_spans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trace_id VARCHAR(255) NOT NULL,
  span_id VARCHAR(255) NOT NULL,
  parent_span_id VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  kind VARCHAR(50), -- 'server', 'client', 'internal'
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  duration_ms INTEGER,
  status VARCHAR(50), -- 'ok', 'error'
  attributes JSONB,
  events JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_requests_conversation_id ON ai_requests(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_requests_user_id ON ai_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_requests_created_at ON ai_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_query_executions_user_id ON query_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_query_executions_created_at ON query_executions(created_at);
CREATE INDEX IF NOT EXISTS idx_telemetry_spans_trace_id ON telemetry_spans(trace_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_spans_span_id ON telemetry_spans(span_id);
