import { streamText, tool } from "ai"
import { z } from "zod"
import { trackAIRequest, trackQueryExecution } from "@/lib/telemetry"
import { withSpan } from "@/lib/otel"
import { TABLE_SCHEMAS } from "@/lib/table-schemas"

export const maxDuration = 30

const SYSTEM_PROMPT = `You are an expert SQL assistant that helps users query their databases using natural language.

Your responsibilities:
1. Understand the user's intent and translate it into accurate SQL queries
2. Generate queries that follow database best practices
3. Provide clear explanations of what each query does
4. Consider edge cases and potential issues
5. When users want to CREATE/ADD/INSERT data, offer them a form to fill out

When generating SQL:
- Use proper syntax and formatting
- Add appropriate WHERE, ORDER BY, and LIMIT clauses
- Join tables when necessary for meaningful data
- Consider performance implications
- Use mock data for demo purposes but generate realistic queries

Always use the generateSQL tool to execute queries. Provide helpful context and explanations.

When users want to add/create new records:
- Use the showForm tool to present a data entry form
- Suggest the form proactively: "I can help you add a new [item]. Would you like to fill out a form?"
- Supported tables: users, orders, products

Available demo tables:
- users (id, name, email, status, city, created_at)
- orders (id, customer, total, status, city, created_at)
- products (id, name, price, category, stock)

Be conversational and helpful. If the user's request is unclear, ask for clarification.`

const generateMockData = (queryType: string) => {
  const queries: Record<string, any> = {
    users: {
      results: [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          status: "active",
          city: "New York",
          created_at: "2024-01-15",
        },
        {
          id: 2,
          name: "Jane Smith",
          email: "jane@example.com",
          status: "active",
          city: "Los Angeles",
          created_at: "2024-01-20",
        },
        {
          id: 3,
          name: "Bob Johnson",
          email: "bob@example.com",
          status: "inactive",
          city: "Chicago",
          created_at: "2024-02-01",
        },
        {
          id: 4,
          name: "Alice Williams",
          email: "alice@example.com",
          status: "active",
          city: "New York",
          created_at: "2024-02-10",
        },
        {
          id: 5,
          name: "Charlie Brown",
          email: "charlie@example.com",
          status: "pending",
          city: "Miami",
          created_at: "2024-02-15",
        },
        {
          id: 6,
          name: "Diana Prince",
          email: "diana@example.com",
          status: "active",
          city: "Los Angeles",
          created_at: "2024-02-20",
        },
        {
          id: 7,
          name: "Edward Norton",
          email: "edward@example.com",
          status: "inactive",
          city: "Chicago",
          created_at: "2024-02-25",
        },
        {
          id: 8,
          name: "Fiona Apple",
          email: "fiona@example.com",
          status: "active",
          city: "New York",
          created_at: "2024-03-01",
        },
      ],
    },
    orders: {
      results: [
        { id: 101, customer: "John Doe", total: 249.99, status: "completed", city: "New York" },
        { id: 102, customer: "Jane Smith", total: 149.99, status: "pending", city: "Los Angeles" },
        { id: 103, customer: "Bob Johnson", total: 399.99, status: "completed", city: "Chicago" },
        { id: 104, customer: "Alice Williams", total: 89.99, status: "shipped", city: "New York" },
        { id: 105, customer: "Charlie Brown", total: 199.99, status: "completed", city: "Miami" },
        { id: 106, customer: "Diana Prince", total: 299.99, status: "pending", city: "Los Angeles" },
      ],
    },
    revenue: {
      results: [
        { month: "Jan 2024", revenue: 42156 },
        { month: "Feb 2024", revenue: 38912 },
        { month: "Mar 2024", revenue: 45234 },
        { month: "Apr 2024", revenue: 51890 },
        { month: "May 2024", revenue: 48320 },
        { month: "Jun 2024", revenue: 52100 },
      ],
    },
  }

  const lowerQuery = queryType.toLowerCase()
  if (lowerQuery.includes("user")) return queries.users
  if (lowerQuery.includes("order")) return queries.orders
  if (lowerQuery.includes("revenue") || lowerQuery.includes("sales")) return queries.revenue

  return queries.users
}

export async function POST(req: Request) {
  return await withSpan("chat.request", async () => {
    const { messages } = await req.json()
    const userId = req.headers.get("x-user-id") || "demo@queryai.com"

    const startTime = Date.now()

    const result = streamText({
      model: "openai/gpt-4o",
      messages, // Pass messages directly in v5
      system: SYSTEM_PROMPT,
      tools: {
        generateSQL: tool({
          description: "Generate and execute a SQL query based on the user's natural language request",
          parameters: z.object({
            // v5 uses 'parameters' instead of 'inputSchema'
            query: z.string().describe("The SQL query to execute"),
            explanation: z.string().describe("Clear explanation of what the query does and why"),
            database: z.string().describe("Target database type (e.g., PostgreSQL, MySQL)"),
          }),
          execute: async ({ query, explanation, database }) => {
            return await withSpan("sql.execute", async () => {
              const queryStartTime = Date.now()

              await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 200))

              const mockData = generateMockData(query)
              const executionTime = Date.now() - queryStartTime

              if (process.env.DATABASE_URL) {
                try {
                  await trackQueryExecution({
                    aiRequestId: "temp-id",
                    userId,
                    naturalQuery: messages[messages.length - 1]?.content || "",
                    generatedSql: query,
                    databaseName: database,
                    rowsReturned: mockData.results.length,
                    executionTimeMs: executionTime,
                    success: true,
                  })
                } catch (error) {
                  console.error("[v0] Failed to track query execution:", error)
                }
              }

              return {
                query,
                explanation,
                database,
                results: mockData.results,
                rowCount: mockData.results.length,
                executionTime: `${executionTime}ms`,
              }
            })
          },
        }),
        showForm: tool({
          description: "Show a data entry form to the user for creating new records in the database",
          parameters: z.object({
            // v5 uses 'parameters' instead of 'inputSchema'
            tableName: z.enum(["users", "orders", "products"]).describe("The table to insert data into"),
            buttonLabel: z.string().describe("Label for the button that opens the form"),
            message: z.string().describe("Friendly message to show before the button"),
          }),
          execute: async ({ tableName, buttonLabel, message }) => {
            const schema = TABLE_SCHEMAS[tableName]

            if (!schema) {
              return {
                error: `Table ${tableName} not found`,
              }
            }

            return {
              tableName,
              buttonLabel,
              message,
              schema,
            }
          },
        }),
      },
      abortSignal: req.signal,
      experimental_telemetry: {
        isEnabled: true,
        functionId: "chat-stream",
        metadata: {
          userId,
          endpoint: "/api/chat",
        },
      },
      onFinish: async ({ usage, response }) => {
        if (process.env.DATABASE_URL && usage) {
          try {
            const durationMs = Date.now() - startTime

            await trackAIRequest({
              userId,
              model: "gpt-4o",
              promptTokens: usage.promptTokens,
              completionTokens: usage.completionTokens,
              durationMs,
              status: "success",
              requestData: {
                messageCount: messages.length,
                lastMessage: messages[messages.length - 1]?.content?.substring(0, 100),
              },
              responseData: {
                text: response.text?.substring(0, 100),
              },
            })
          } catch (error) {
            console.error("[v0] Failed to track AI request:", error)
          }
        }
      },
    })

    return result.toDataStreamResponse()
  })
}
