"use client"
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react" // Import ThumbsUp, ThumbsDown, and MessageSquare icons
import type React from "react"

import { useState } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Treemap,
} from "recharts"
import { Send, Copy, Download, Eye, Plus } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { DynamicForm } from "@/components/dynamic-form"

interface Message {
  id: string
  role: "user" | "assistant"
  parts: any[]
}

const DEMO_QUERIES = [
  {
    trigger: ["users", "show users", "list users", "all users"],
    response: "Here are all the users in your database. I've generated a SQL query to fetch this data.",
    sql: "SELECT * FROM users ORDER BY created_at DESC LIMIT 10;",
    database: "PostgreSQL",
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
  {
    trigger: ["orders", "recent orders", "show orders"],
    response: "I've retrieved the most recent orders from your database.",
    sql: "SELECT o.id, o.total, o.status, u.name as customer, o.city FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 10;",
    database: "PostgreSQL",
    results: [
      { id: 101, customer: "John Doe", total: 249.99, status: "completed", city: "New York" },
      { id: 102, customer: "Jane Smith", total: 149.99, status: "pending", city: "Los Angeles" },
      { id: 103, customer: "Bob Johnson", total: 399.99, status: "completed", city: "Chicago" },
      { id: 104, customer: "Alice Williams", total: 89.99, status: "shipped", city: "New York" },
      { id: 105, customer: "Charlie Brown", total: 199.99, status: "completed", city: "Miami" },
      { id: 106, customer: "Diana Prince", total: 299.99, status: "pending", city: "Los Angeles" },
    ],
  },
  {
    trigger: ["revenue", "sales", "total sales"],
    response: "Here's the total revenue breakdown by month.",
    sql: "SELECT DATE_TRUNC('month', created_at) as month, SUM(total) as revenue FROM orders WHERE status = 'completed' GROUP BY month ORDER BY month DESC;",
    database: "PostgreSQL",
    results: [
      { month: "Jan 2024", revenue: 42156 },
      { month: "Feb 2024", revenue: 38912 },
      { month: "Mar 2024", revenue: 45234 },
      { month: "Apr 2024", revenue: 51890 },
      { month: "May 2024", revenue: 48320 },
      { month: "Jun 2024", revenue: 52100 },
    ],
  },
]

const generateChartData = (results: any[]) => {
  if (!results || results.length === 0) return null

  const keys = Object.keys(results[0])
  const hasStatus = keys.includes("status")
  const hasCity = keys.includes("city")
  const hasNumericValue = keys.some((k) => typeof results[0][k] === "number" && k !== "id")

  return {
    hasStatus,
    hasCity,
    hasNumericValue,
    statusData: hasStatus ? aggregateByKey(results, "status") : [],
    cityData: hasCity ? aggregateByKey(results, "city") : [],
    numericKey: hasNumericValue ? keys.find((k) => typeof results[0][k] === "number" && k !== "id") : null,
  }
}

const aggregateByKey = (data: any[], key: string) => {
  const counts: Record<string, number> = {}
  data.forEach((item) => {
    const value = item[key]
    counts[value] = (counts[value] || 0) + 1
  })
  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"]

export default function DashboardPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
  })

  const [selectedRow, setSelectedRow] = useState<any>(null)
  const [showRowDialog, setShowRowDialog] = useState(false)
  const [showFormDialog, setShowFormDialog] = useState(false)
  const [currentFormConfig, setCurrentFormConfig] = useState<any>(null)

  const getToolResults = (message: any) => {
    if (!message.parts) return null

    for (const part of message.parts) {
      if (part.type === "tool-generateSQL" && part.state === "output-available") {
        return part.output
      }
      if (part.type === "tool-showForm" && part.state === "output-available") {
        return { type: "form", data: part.output }
      }
    }
    return null
  }

  const handleFormSubmit = async (formData: Record<string, any>) => {
    if (!currentFormConfig) return

    try {
      const response = await fetch(`/api/data/${currentFormConfig.tableName}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to create record")
      }

      const result = await response.json()
      console.log("Record created:", result)
    } catch (error) {
      console.error("Error creating record:", error)
      throw error
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="max-w-4xl mx-auto w-full space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-12 space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold">Welcome to QueryAI</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Ask me anything about your database. I can help you query data, create visualizations, and manage
                  records.
                </p>
                <div className="flex flex-wrap gap-2 justify-center pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const event = { preventDefault: () => {} } as React.FormEvent
                      handleInputChange({
                        target: { value: "Show me all users" },
                      } as React.ChangeEvent<HTMLInputElement>)
                      setTimeout(() => handleSubmit(event), 100)
                    }}
                  >
                    Show me all users
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const event = { preventDefault: () => {} } as React.FormEvent
                      handleInputChange({
                        target: { value: "Add a new user" },
                      } as React.ChangeEvent<HTMLInputElement>)
                      setTimeout(() => handleSubmit(event), 100)
                    }}
                  >
                    Add a new user
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const event = { preventDefault: () => {} } as React.FormEvent
                      handleInputChange({
                        target: { value: "Show revenue by city" },
                      } as React.ChangeEvent<HTMLInputElement>)
                      setTimeout(() => handleSubmit(event), 100)
                    }}
                  >
                    Show revenue by city
                  </Button>
                </div>
              </div>
            )}

            {messages.map((message) => {
              const toolResults = message.role === "assistant" ? getToolResults(message) : null
              const textContent = message.parts?.find((p: any) => p.type === "text")?.text || ""

              return (
                <div key={message.id} className="flex gap-3">
                  <div className="flex-shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback
                        className={message.role === "assistant" ? "bg-primary text-primary-foreground" : "bg-muted"}
                      >
                        {message.role === "assistant" ? "AI" : "DU"}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold">
                        {message.role === "assistant" ? "AI Assistant" : "Demo User"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                      </span>
                    </div>

                    <Card className={`p-4 ${message.role === "user" ? "bg-muted" : ""}`}>
                      <p className="text-sm whitespace-pre-wrap">{textContent}</p>

                      {toolResults?.type === "form" && toolResults.data && (
                        <div className="mt-4 space-y-3">
                          <p className="text-sm text-muted-foreground">{toolResults.data.message}</p>
                          <Button
                            onClick={() => {
                              setCurrentFormConfig(toolResults.data)
                              setShowFormDialog(true)
                            }}
                            className="w-full sm:w-auto"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            {toolResults.data.buttonLabel}
                          </Button>
                        </div>
                      )}

                      {toolResults?.query && (
                        <div className="mt-4 p-3 bg-muted rounded-md">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-muted-foreground">
                              Generated SQL {toolResults.database && `(${toolResults.database})`}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2"
                              onClick={() => navigator.clipboard.writeText(toolResults.query)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <code className="text-xs font-mono text-foreground block break-all">{toolResults.query}</code>
                        </div>
                      )}

                      {toolResults?.explanation && (
                        <div className="mt-2 text-xs text-muted-foreground">{toolResults.explanation}</div>
                      )}

                      {toolResults?.results && toolResults.results.length > 0 && (
                        <div className="mt-4">
                          <Tabs defaultValue="data" className="w-full">
                            <div className="flex items-center justify-between mb-2">
                              <TabsList className="h-8">
                                <TabsTrigger value="data" className="text-xs">
                                  Data
                                </TabsTrigger>
                                <TabsTrigger value="chart" className="text-xs">
                                  Charts
                                </TabsTrigger>
                              </TabsList>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-muted-foreground">
                                  {toolResults.rowCount} rows • {toolResults.executionTime}
                                </span>
                                <Button variant="ghost" size="sm" className="h-6 px-2">
                                  <Download className="h-3 w-3 mr-1" />
                                  <span className="text-xs">Export</span>
                                </Button>
                              </div>
                            </div>

                            <TabsContent value="data" className="mt-2">
                              <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-xs border border-border rounded">
                                  <thead className="bg-muted">
                                    <tr>
                                      {Object.keys(toolResults.results[0]).map((key) => (
                                        <th key={key} className="px-3 py-2 text-left font-medium">
                                          {key}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {toolResults.results.map((row: any, idx: number) => (
                                      <tr key={idx} className="border-t border-border">
                                        {Object.values(row).map((value: any, cellIdx) => (
                                          <td key={cellIdx} className="px-3 py-2">
                                            {String(value)}
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              <div className="md:hidden space-y-2">
                                {toolResults.results.map((row: any, idx: number) => (
                                  <Card
                                    key={idx}
                                    className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => {
                                      setSelectedRow(row)
                                      setShowRowDialog(true)
                                    }}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="space-y-1 flex-1">
                                        {Object.entries(row)
                                          .slice(0, 2)
                                          .map(([key, value]) => (
                                            <div key={key} className="text-xs">
                                              <span className="font-medium text-muted-foreground">{key}: </span>
                                              <span className="text-foreground">{String(value)}</span>
                                            </div>
                                          ))}
                                      </div>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            </TabsContent>

                            <TabsContent value="chart" className="mt-2">
                              <ChartViews results={toolResults.results} />
                            </TabsContent>
                          </Tabs>
                        </div>
                      )}

                      {message.role === "assistant" && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                          <Button variant="ghost" size="sm" className="h-7 px-2">
                            <Plus className="mr-2 h-4 w-4" />
                            New Record
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 px-2">
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 px-2">
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </Card>
                  </div>
                </div>
              )
            })}

            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                </Avatar>
                <Card className="p-4 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>

        <div className="border-t p-4 bg-background">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask me anything about your data..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New {currentFormConfig?.schema?.label}</DialogTitle>
            <DialogDescription>{currentFormConfig?.schema?.description}</DialogDescription>
          </DialogHeader>
          {currentFormConfig?.schema && (
            <DynamicForm
              schema={currentFormConfig.schema}
              onSubmit={handleFormSubmit}
              onCancel={() => setShowFormDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showRowDialog} onOpenChange={setShowRowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Row Details</DialogTitle>
          </DialogHeader>
          {selectedRow && (
            <div className="space-y-3">
              {Object.entries(selectedRow).map(([key, value]) => (
                <div key={key} className="border-b border-border pb-2 last:border-0">
                  <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">{key}</div>
                  <div className="text-sm text-foreground">{String(value)}</div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}

function ChartViews({ results }: { results: any[] }) {
  const chartData = generateChartData(results)

  if (!chartData) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No chart data available</p>
      </div>
    )
  }

  const { hasStatus, hasCity, statusData, cityData, numericKey } = chartData

  return (
    <div className="space-y-6">
      {hasStatus && statusData.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Distribution by Status
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      )}

      {hasCity && cityData.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Distribution by City
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={cityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="hsl(var(--chart-1))" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {numericKey && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Trend: {numericKey}
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={results}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={Object.keys(results[0])[0]} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={numericKey} stroke="hsl(var(--chart-2))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {(hasStatus || hasCity) && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3">Treemap View</h3>
          <ResponsiveContainer width="100%" height={250}>
            <Treemap
              data={hasStatus ? statusData : cityData}
              dataKey="value"
              aspectRatio={4 / 3}
              stroke="#fff"
              fill="hsl(var(--chart-3))"
            >
              <Tooltip />
            </Treemap>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  )
}
