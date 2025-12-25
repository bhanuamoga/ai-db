-- =====================================================
-- QueryAI Complete Database Schema
-- =====================================================
-- This script creates all necessary tables for the QueryAI application
-- Run this script on your PostgreSQL database (Supabase, Neon, or any Postgres provider)

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TELEMETRY & TRACKING TABLES
-- =====================================================

-- Conversations: Tracks user chat sessions
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Messages: Individual messages in conversations
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- AI Requests: Token usage and cost tracking
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

-- Query Executions: SQL query tracking
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

-- User Usage Statistics: Aggregated metrics per user
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

-- Telemetry Spans: OpenTelemetry distributed tracing
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

-- =====================================================
-- DEMO DATA TABLES (Optional - for testing)
-- =====================================================

-- Users: Demo user data for testing
CREATE TABLE IF NOT EXISTS demo_users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  city VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders: Demo order data for testing
CREATE TABLE IF NOT EXISTS demo_orders (
  id SERIAL PRIMARY KEY,
  customer VARCHAR(255) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  city VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Products: Demo product data for testing
CREATE TABLE IF NOT EXISTS demo_products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100),
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

CREATE INDEX IF NOT EXISTS idx_ai_requests_conversation_id ON ai_requests(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_requests_user_id ON ai_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_requests_created_at ON ai_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_requests_model ON ai_requests(model);

CREATE INDEX IF NOT EXISTS idx_query_executions_ai_request_id ON query_executions(ai_request_id);
CREATE INDEX IF NOT EXISTS idx_query_executions_user_id ON query_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_query_executions_created_at ON query_executions(created_at);

CREATE INDEX IF NOT EXISTS idx_user_usage_stats_user_id ON user_usage_stats(user_id);

CREATE INDEX IF NOT EXISTS idx_telemetry_spans_trace_id ON telemetry_spans(trace_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_spans_span_id ON telemetry_spans(span_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_spans_start_time ON telemetry_spans(start_time);

CREATE INDEX IF NOT EXISTS idx_demo_users_email ON demo_users(email);
CREATE INDEX IF NOT EXISTS idx_demo_users_status ON demo_users(status);
CREATE INDEX IF NOT EXISTS idx_demo_orders_status ON demo_orders(status);
CREATE INDEX IF NOT EXISTS idx_demo_products_category ON demo_products(category);

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Insert sample users
INSERT INTO demo_users (name, email, status, city) VALUES
  ('John Doe', 'john@example.com', 'active', 'New York'),
  ('Jane Smith', 'jane@example.com', 'active', 'Los Angeles'),
  ('Bob Johnson', 'bob@example.com', 'inactive', 'Chicago'),
  ('Alice Brown', 'alice@example.com', 'active', 'Houston'),
  ('Charlie Wilson', 'charlie@example.com', 'active', 'Phoenix')
ON CONFLICT (email) DO NOTHING;

-- Insert sample orders
INSERT INTO demo_orders (customer, total, status, city) VALUES
  ('John Doe', 299.99, 'completed', 'New York'),
  ('Jane Smith', 149.50, 'pending', 'Los Angeles'),
  ('Bob Johnson', 599.00, 'completed', 'Chicago'),
  ('Alice Brown', 89.99, 'shipped', 'Houston'),
  ('Charlie Wilson', 1299.99, 'completed', 'Phoenix');

-- Insert sample products
INSERT INTO demo_products (name, price, category, stock) VALUES
  ('Laptop Pro', 1299.99, 'Electronics', 45),
  ('Wireless Mouse', 29.99, 'Accessories', 150),
  ('USB-C Cable', 19.99, 'Accessories', 200),
  ('Monitor 27"', 399.99, 'Electronics', 30),
  ('Keyboard Mechanical', 149.99, 'Accessories', 75);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Run these to verify your tables were created successfully:
-- SELECT COUNT(*) FROM conversations;
-- SELECT COUNT(*) FROM ai_requests;
-- SELECT COUNT(*) FROM demo_users;
-- SELECT * FROM demo_users LIMIT 5;

-- =====================================================
-- END OF SCHEMA
-- =====================================================
