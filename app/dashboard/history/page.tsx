"use client"

import { Suspense, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Search, Download, Clock, Database, Filter, Copy, Play, Trash2 } from "lucide-react"

type QueryHistory = {
  id: string
  query: string
  sql: string
  database: string
  status: "success" | "error"
  executionTime: number
  rowsAffected: number
  timestamp: Date
}

const historyData: QueryHistory[] = [
  {
    id: "1",
    query: "Show me all users created this month",
    sql: "SELECT * FROM users WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)",
    database: "Production Database",
    status: "success",
    executionTime: 45,
    rowsAffected: 127,
    timestamp: new Date("2024-03-20T14:30:00"),
  },
  {
    id: "2",
    query: "Get top 10 customers by revenue",
    sql: "SELECT customer_id, SUM(total) as revenue FROM orders GROUP BY customer_id ORDER BY revenue DESC LIMIT 10",
    database: "Production Database",
    status: "success",
    executionTime: 132,
    rowsAffected: 10,
    timestamp: new Date("2024-03-20T13:15:00"),
  },
  {
    id: "3",
    query: "List all products out of stock",
    sql: "SELECT * FROM products WHERE stock_quantity = 0",
    database: "Development DB",
    status: "success",
    executionTime: 23,
    rowsAffected: 5,
    timestamp: new Date("2024-03-19T16:45:00"),
  },
  {
    id: "4",
    query: "Find users with invalid emails",
    sql: "SELECT * FROM users WHERE email NOT LIKE '%@%'",
    database: "Production Database",
    status: "error",
    executionTime: 0,
    rowsAffected: 0,
    timestamp: new Date("2024-03-19T11:20:00"),
  },
]

function HistoryContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [databaseFilter, setDatabaseFilter] = useState<string>("all")
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const filteredHistory = historyData.filter((item) => {
    const matchesSearch =
      item.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sql.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    const matchesDatabase = databaseFilter === "all" || item.database === databaseFilter
    return matchesSearch && matchesStatus && matchesDatabase
  })

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Query History</h1>
        <p className="text-muted-foreground mt-1">View and manage your past database queries</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search queries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>

            <Select value={databaseFilter} onValueChange={setDatabaseFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Database className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Database" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Databases</SelectItem>
                <SelectItem value="Production Database">Production Database</SelectItem>
                <SelectItem value="Development DB">Development DB</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filteredHistory.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div
                className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={item.status === "success" ? "default" : "destructive"}>{item.status}</Badge>
                      <Badge variant="outline" className="font-mono text-xs">
                        {item.database}
                      </Badge>
                    </div>
                    <p className="font-medium mb-1 text-balance">{item.query}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {item.executionTime}ms
                      </span>
                      <span>{item.rowsAffected} rows</span>
                      <span>{item.timestamp.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {expandedRow === item.id && (
                <div className="border-t border-border bg-muted/30 p-4 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">SQL Query</span>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="h-7">
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7">
                          <Play className="h-3 w-3 mr-1" />
                          Re-run
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-destructive hover:text-destructive">
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="bg-card p-3 rounded-md border border-border">
                      <code className="text-xs font-mono">{item.sql}</code>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Execution Time</p>
                      <p className="text-sm font-semibold">{item.executionTime}ms</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Rows Affected</p>
                      <p className="text-sm font-semibold">{item.rowsAffected}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Database</p>
                      <p className="text-sm font-semibold">{item.database}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Timestamp</p>
                      <p className="text-sm font-semibold">{item.timestamp.toLocaleTimeString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredHistory.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No queries found</h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm || statusFilter !== "all" || databaseFilter !== "all"
                ? "Try adjusting your filters"
                : "Your query history will appear here"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function HistoryPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={null}>
        <HistoryContent />
      </Suspense>
    </DashboardLayout>
  )
}
