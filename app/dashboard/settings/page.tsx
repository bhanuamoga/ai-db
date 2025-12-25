"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { DashboardLayout } from "@/components/dashboard-layout"
import { User, Bell, Key, Shield, Trash2, Eye, EyeOff, Copy, Palette } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const themes = [
  { id: "vercel", name: "Vercel", description: "Clean, minimal design inspired by Vercel" },
  { id: "blue", name: "Blue", description: "Modern blue theme for AI applications" },
  { id: "purple", name: "Purple", description: "Rich purple tones for a creative feel" },
  { id: "green", name: "Green", description: "Fresh green theme for productivity" },
]

export default function SettingsPage() {
  const [showApiKey, setShowApiKey] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState("vercel")
  const apiKey = process.env.NEXT_PUBLIC_API_KEY 

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Palette className="h-4 w-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="api">
              <Key className="h-4 w-4 mr-2" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information and profile settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-lg">JD</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button size="sm">Change Photo</Button>
                    <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max size 2MB.</p>
                  </div>
                </div>

                <Separator />

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue="John1" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue="Doe" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue="john@example.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" defaultValue="Acme Inc." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Tell us about yourself"
                    defaultValue="Full-stack developer passionate about databases and AI"
                  />
                </div>

                <div className="flex justify-end">
                  <Button>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>Select a theme for your dashboard</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup value={selectedTheme} onValueChange={setSelectedTheme}>
                  <div className="grid gap-4">
                    {themes.map((theme) => (
                      <div
                        key={theme.id}
                        className="flex items-center space-x-4 rounded-lg border p-4 hover:bg-accent cursor-pointer"
                        onClick={() => setSelectedTheme(theme.id)}
                      >
                        <RadioGroupItem value={theme.id} id={theme.id} />
                        <div className="flex-1">
                          <Label htmlFor={theme.id} className="cursor-pointer font-medium">
                            {theme.name}
                          </Label>
                          <p className="text-sm text-muted-foreground">{theme.description}</p>
                        </div>
                        {theme.id === "vercel" && (
                          <div className="flex gap-2">
                            <div className="w-6 h-6 rounded-full bg-black border" />
                            <div className="w-6 h-6 rounded-full bg-white border" />
                            <div className="w-6 h-6 rounded-full bg-gray-200 border" />
                          </div>
                        )}
                        {theme.id === "blue" && (
                          <div className="flex gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-600 border" />
                            <div className="w-6 h-6 rounded-full bg-blue-400 border" />
                            <div className="w-6 h-6 rounded-full bg-blue-900 border" />
                          </div>
                        )}
                        {theme.id === "purple" && (
                          <div className="flex gap-2">
                            <div className="w-6 h-6 rounded-full bg-purple-600 border" />
                            <div className="w-6 h-6 rounded-full bg-purple-400 border" />
                            <div className="w-6 h-6 rounded-full bg-purple-900 border" />
                          </div>
                        )}
                        {theme.id === "green" && (
                          <div className="flex gap-2">
                            <div className="w-6 h-6 rounded-full bg-green-600 border" />
                            <div className="w-6 h-6 rounded-full bg-green-400 border" />
                            <div className="w-6 h-6 rounded-full bg-green-900 border" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </RadioGroup>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Switch between light and dark mode</p>
                  </div>
                  <Switch id="dark-mode" defaultChecked />
                </div>

                <div className="flex justify-end">
                  <Button>Apply Theme</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Choose what emails you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="query-notifications">Query Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications when your queries complete</p>
                  </div>
                  <Switch id="query-notifications" defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="connection-alerts">Connection Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get alerts when database connections fail or disconnect
                    </p>
                  </div>
                  <Switch id="connection-alerts" defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="weekly-summary">Weekly Summary</Label>
                    <p className="text-sm text-muted-foreground">Receive a weekly summary of your database activity</p>
                  </div>
                  <Switch id="weekly-summary" />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="product-updates">Product Updates</Label>
                    <p className="text-sm text-muted-foreground">Get notified about new features and improvements</p>
                  </div>
                  <Switch id="product-updates" defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketing">Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">Receive tips, guides, and promotional content</p>
                  </div>
                  <Switch id="marketing" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Push Notifications</CardTitle>
                <CardDescription>Manage push notification settings for the web app</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-enabled">Enable Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Allow browser notifications for important updates</p>
                  </div>
                  <Switch id="push-enabled" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>Manage your API keys for programmatic access</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Your API Key</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showApiKey ? "text" : "password"}
                        value={apiKey}
                        readOnly
                        className="font-mono text-sm"
                      />
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowApiKey(!showApiKey)}>
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Keep your API key secure and never share it publicly.</p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Generate New Key</p>
                      <p className="text-sm text-muted-foreground">Create a new API key for your account</p>
                    </div>
                    <Button variant="outline">Generate</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Usage</CardTitle>
                <CardDescription>Monitor your API usage and limits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Calls This Month</span>
                    <span className="font-semibold">1,247 / 10,000</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: "12.47%" }} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your usage resets on the 1st of each month. Upgrade for higher limits.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                <Button>Update Password</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security to your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>2FA Status</Label>
                    <p className="text-sm text-muted-foreground">Two-factor authentication is not enabled</p>
                  </div>
                  <Button>Enable 2FA</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions that affect your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Delete Account</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
