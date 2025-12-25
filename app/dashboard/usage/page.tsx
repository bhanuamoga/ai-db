"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Activity, DollarSign, MessageSquare, Zap } from "lucide-react"

interface UsageStats {
  total_requests: number
  total_tokens: number
  total_cost: string
  last_request_at: string | null
}

interface AIRequest {
  id: string
  model: string
  total_tokens: number
  total_cost: string
  duration_ms: number
  status: string
  created_at: string
}

export default function UsagePage() {
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [recentRequests, setRecentRequests] = useState<AIRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsageData()
  }, [])

  const fetchUsageData = async () => {
    try {
      const response = await fetch("/api/usage")
      const data = await response.json()

      if (response.ok) {
        setStats(data.stats)
        setRecentRequests(data.recentRequests)
        setError(null)
      } else {
        setError(data.message || data.error)
      }
    } catch (err) {
      setError("Failed to load usage data")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const chartData = recentRequests
    .slice(0, 10)
    .reverse()
    .map((req, idx) => ({
      name: `Req ${idx + 1}`,
      tokens: req.total_tokens,
      cost: Number.parseFloat(req.total_cost),
      time: req.duration_ms,
    }))

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Usage & Costs</h1>
          <p className="text-muted-foreground mt-1">Monitor your AI usage and token costs</p>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="h-20 animate-pulse bg-muted rounded" />
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="p-6">
            <div className="text-center space-y-2">
              <p className="text-destructive font-medium">{error}</p>
              <p className="text-sm text-muted-foreground">
                {error.includes("Database")
                  ? "Add DATABASE_URL environment variable to enable tracking"
                  : "Check your database connection"}
              </p>
            </div>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                    <p className="text-2xl font-bold mt-1">{stats?.total_requests.toLocaleString() || 0}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Tokens</p>
                    <p className="text-2xl font-bold mt-1">{stats?.total_tokens.toLocaleString() || 0}</p>
                  </div>
                  <Zap className="h-8 w-8 text-yellow-500" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Cost</p>
                    <p className="text-2xl font-bold mt-1">${stats?.total_cost || "0.00"}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Cost/Request</p>
                    <p className="text-2xl font-bold mt-1">
                      $
                      {stats && stats.total_requests > 0
                        ? (Number.parseFloat(stats.total_cost) / stats.total_requests).toFixed(4)
                        : "0.00"}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-500" />
                </div>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Token Usage (Last 10 Requests)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="tokens" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Cost Trend (Last 10 Requests)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Line type="monotone" dataKey="cost" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Requests</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4 text-sm font-medium">Time</th>
                      <th className="text-left py-2 px-4 text-sm font-medium">Model</th>
                      <th className="text-right py-2 px-4 text-sm font-medium">Tokens</th>
                      <th className="text-right py-2 px-4 text-sm font-medium">Cost</th>
                      <th className="text-right py-2 px-4 text-sm font-medium">Duration</th>
                      <th className="text-left py-2 px-4 text-sm font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRequests.map((req) => (
                      <tr key={req.id} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-4 text-sm">{new Date(req.created_at).toLocaleString()}</td>
                        <td className="py-2 px-4 text-sm">{req.model}</td>
                        <td className="py-2 px-4 text-sm text-right">{req.total_tokens.toLocaleString()}</td>
                        <td className="py-2 px-4 text-sm text-right">${req.total_cost}</td>
                        <td className="py-2 px-4 text-sm text-right">{req.duration_ms}ms</td>
                        <td className="py-2 px-4 text-sm">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs ${
                              req.status === "success" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
