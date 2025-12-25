import { NextResponse } from "next/server"
import { getUserUsageStats, getRecentAIRequests } from "@/lib/telemetry"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId") || req.headers.get("x-user-id") || "demo@queryai.com"

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          error: "Database not configured",
          message: "Add DATABASE_URL to enable usage tracking",
        },
        { status: 503 },
      )
    }

    const [stats, recentRequests] = await Promise.all([getUserUsageStats(userId), getRecentAIRequests(userId, 20)])

    return NextResponse.json({
      stats: stats || {
        total_requests: 0,
        total_tokens: 0,
        total_cost: "0.00",
        last_request_at: null,
      },
      recentRequests,
    })
  } catch (error) {
    console.error("[v0] Usage API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch usage stats", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
