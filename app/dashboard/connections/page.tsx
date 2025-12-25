"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Database, Plus, Trash2, CheckCircle2, XCircle, Edit } from "lucide-react"

type DatabaseConnection = {
  id: string
  name: string
  type: "postgresql" | "mysql" | "mongodb" | "sqlite"
  host: string
  status: "connected" | "disconnected"
  lastUsed: Date
}

const initialConnections: DatabaseConnection[] = [
  {
    id: "1",
    name: "Production Database",
    type: "postgresql",
    host: "prod-db.example.com",
    status: "connected",
    lastUsed: new Date("2024-03-15"),
  },
  {
    id: "2",
    name: "Development DB",
    type: "mysql",
    host: "dev-db.example.com",
    status: "connected",
    lastUsed: new Date("2024-03-20"),
  },
]

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<DatabaseConnection[]>(initialConnections)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "postgresql" as const,
    host: "",
    port: "",
    database: "",
    username: "",
    password: "",
  })

  const handleAddConnection = () => {
    const newConnection: DatabaseConnection = {
      id: Date.now().toString(),
      name: formData.name,
      type: formData.type,
      host: formData.host,
      status: "connected",
      lastUsed: new Date(),
    }
    setConnections([...connections, newConnection])
    setIsDialogOpen(false)
    setFormData({
      name: "",
      type: "postgresql",
      host: "",
      port: "",
      database: "",
      username: "",
      password: "",
    })
  }

  const handleDeleteConnection = (id: string) => {
    setConnections(connections.filter((conn) => conn.id !== id))
  }

  const getTypeIcon = (type: string) => {
    return <Database className="h-5 w-5" />
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Database Connections</h1>
            <p className="text-muted-foreground mt-1">Manage your database connections and credentials</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Connection
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Database Connection</DialogTitle>
                <DialogDescription>Connect a new database to query with AI</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Connection Name</Label>
                  <Input
                    id="name"
                    placeholder="My Database"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Database Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="postgresql">PostgreSQL</SelectItem>
                      <SelectItem value="mysql">MySQL</SelectItem>
                      <SelectItem value="mongodb">MongoDB</SelectItem>
                      <SelectItem value="sqlite">SQLite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="host">Host</Label>
                    <Input
                      id="host"
                      placeholder="localhost"
                      value={formData.host}
                      onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="port">Port</Label>
                    <Input
                      id="port"
                      placeholder="5432"
                      value={formData.port}
                      onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="database">Database Name</Label>
                  <Input
                    id="database"
                    placeholder="mydb"
                    value={formData.database}
                    onChange={(e) => setFormData({ ...formData, database: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="admin"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddConnection}>Test & Connect</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {connections.map((connection) => (
            <Card key={connection.id} className="relative group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">{getTypeIcon(connection.type)}</div>
                    <div>
                      <CardTitle className="text-lg">{connection.name}</CardTitle>
                      <CardDescription className="text-xs mt-1">{connection.host}</CardDescription>
                    </div>
                  </div>
                  {connection.status === "connected" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Type</span>
                    <Badge variant="secondary" className="capitalize">
                      {connection.type}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={connection.status === "connected" ? "default" : "destructive"}>
                      {connection.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last Used</span>
                    <span className="text-xs">{connection.lastUsed.toLocaleDateString()}</span>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-border">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-destructive hover:text-destructive bg-transparent"
                      onClick={() => handleDeleteConnection(connection.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer group">
            <button
              className="w-full h-full p-6 flex flex-col items-center justify-center gap-3 min-h-[250px]"
              onClick={() => setIsDialogOpen(true)}
            >
              <div className="p-3 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="text-center">
                <p className="font-semibold mb-1">Add New Connection</p>
                <p className="text-sm text-muted-foreground">Connect another database</p>
              </div>
            </button>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Supported Databases</CardTitle>
            <CardDescription>QueryAI supports the following database types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: "PostgreSQL", icon: "🐘" },
                { name: "MySQL", icon: "🐬" },
                { name: "MongoDB", icon: "🍃" },
                { name: "SQLite", icon: "🗄️" },
              ].map((db) => (
                <div
                  key={db.name}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  <span className="text-2xl">{db.icon}</span>
                  <span className="font-medium">{db.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
