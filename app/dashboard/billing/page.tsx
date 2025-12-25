"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Check, CreditCard, Download, Calendar } from "lucide-react"

const plans = [
  {
    name: "Starter",
    price: { monthly: 29, yearly: 290 },
    description: "Perfect for individuals and small projects",
    features: [
      "Up to 1,000 queries/month",
      "2 database connections",
      "Email support",
      "Query history (30 days)",
      "Basic visualizations",
      "CSV export",
    ],
    limits: "Limited to 1,000 queries per month",
  },
  {
    name: "Professional",
    price: { monthly: 99, yearly: 990 },
    description: "For growing teams and businesses",
    features: [
      "Unlimited queries",
      "10 database connections",
      "Priority support",
      "Query history (unlimited)",
      "Advanced visualizations",
      "CSV & JSON export",
      "API access",
      "Custom AI models",
    ],
    limits: "No query limits",
    popular: true,
  },
  {
    name: "Enterprise",
    price: { monthly: "Custom", yearly: "Custom" },
    description: "For large organizations with specific needs",
    features: [
      "Everything in Professional",
      "Unlimited database connections",
      "Dedicated support manager",
      "Custom integrations",
      "SLA guarantee",
      "Advanced security features",
      "On-premise deployment option",
      "Training & onboarding",
    ],
    limits: "Fully customizable",
  },
]

export default function BillingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const currentPlan = "Professional"

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Billing & Plans</h1>
          <p className="text-muted-foreground mt-1">Manage your subscription and billing information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>You are currently on the Professional plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">Professional</p>
                <p className="text-sm text-muted-foreground">
                  ${billingCycle === "monthly" ? "99" : "990"}/{billingCycle === "monthly" ? "month" : "year"}
                </p>
              </div>
              <Badge className="bg-green-500">Active</Badge>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Queries this month</span>
                <span className="font-semibold">2,847 / Unlimited</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Database connections</span>
                <span className="font-semibold">2 / 10</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Next billing date</span>
                <span className="font-semibold">April 15, 2024</span>
              </div>
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button variant="outline">Change Plan</Button>
              <Button variant="outline" className="text-destructive hover:text-destructive bg-transparent">
                Cancel Subscription
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-4 py-6">
          <Label htmlFor="billing-cycle" className="text-base">
            Monthly
          </Label>
          <Switch
            id="billing-cycle"
            checked={billingCycle === "yearly"}
            onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
          />
          <Label htmlFor="billing-cycle" className="text-base">
            Yearly <span className="text-sm text-green-500 font-semibold ml-1">(Save 17%)</span>
          </Label>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${plan.popular ? "border-primary shadow-lg" : ""} ${
                plan.name === currentPlan ? "border-2 border-primary" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary">Most Popular</Badge>
                </div>
              )}
              {plan.name === currentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-green-500">Current Plan</Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">
                      {typeof plan.price[billingCycle] === "number" ? "$" : ""}
                      {plan.price[billingCycle]}
                    </span>
                    {typeof plan.price[billingCycle] === "number" && (
                      <span className="text-muted-foreground">/{billingCycle === "monthly" ? "mo" : "yr"}</span>
                    )}
                  </div>
                  {billingCycle === "yearly" && typeof plan.price.yearly === "number" && (
                    <p className="text-sm text-muted-foreground mt-1">
                      ${(plan.price.yearly / 12).toFixed(0)}/month billed annually
                    </p>
                  )}
                </div>

                <Separator />

                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.name === currentPlan ? "outline" : plan.popular ? "default" : "outline"}
                  disabled={plan.name === currentPlan}
                >
                  {plan.name === currentPlan
                    ? "Current Plan"
                    : plan.name === "Enterprise"
                      ? "Contact Sales"
                      : "Upgrade"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Manage your payment information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">•••• •••• •••• 4242</p>
                  <p className="text-sm text-muted-foreground">Expires 12/2025</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Update
              </Button>
            </div>

            <Button variant="outline">
              <CreditCard className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>View and download your past invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { date: "Mar 15, 2024", amount: 99, status: "Paid" },
                { date: "Feb 15, 2024", amount: 99, status: "Paid" },
                { date: "Jan 15, 2024", amount: 99, status: "Paid" },
              ].map((invoice, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{invoice.date}</p>
                      <p className="text-sm text-muted-foreground">${invoice.amount}.00</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-green-500 border-green-500">
                      {invoice.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
