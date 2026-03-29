"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { CreditCard, Calendar, TrendingUp, ArrowLeft, Home } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

const SUBSCRIPTION_TIERS = [
  { id: "TIER_1_5", name: "Starter", assessments: "1-5", monthly: 39, annual: 433 },
  { id: "TIER_6_12", name: "Professional", assessments: "6-12", monthly: 89, annual: 988 },
  { id: "TIER_13_20", name: "Business", assessments: "13-20", monthly: 139, annual: 1543 },
  { id: "TIER_21_40", name: "Enterprise", assessments: "21-40", monthly: 239, annual: 2653 },
  { id: "TIER_40_PLUS", name: "Enterprise Plus", assessments: "40+", monthly: 389, annual: 4318 },
]

export default function ManageSubscriptionPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [changingPlan, setChangingPlan] = useState(false)

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      const res = await fetch("/api/user/subscription")
      if (res.ok) {
        const data = await res.json()
        if (data.subscription) {
          setSubscription(data.subscription)
        } else {
          // Free plan — no active subscription
          setSubscription({
            id: "free",
            tier: "FREE",
            status: "ACTIVE",
            billing_cycle: "monthly",
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
            assessments_used_current_period: data.assessments_used || 0,
            assessments_limit: data.assessments_limit || 1,
            total_assessments: data.assessments_used || 0,
            next_billing_date: null,
            amount: 0,
          })
        }
      }
    } catch (error) {
      console.error("Error fetching subscription:", error)
      toast({
        title: "Error",
        description: "Failed to load subscription details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePlanChange = async (newTier: string, billingCycle: string) => {
    setChangingPlan(true)

    try {
      // In production, this would call Stripe to change the subscription
      toast({
        title: "Plan Change Requested",
        description: "Your plan change will be processed and take effect on your next billing cycle.",
      })

      // Update local state for demo
      const newTierData = SUBSCRIPTION_TIERS.find((t) => t.id === newTier)
      if (newTierData) {
        setSubscription((prev: any) => ({
          ...prev,
          tier: newTier,
          billing_cycle: billingCycle,
          amount: billingCycle === "annual" ? newTierData.annual : newTierData.monthly,
          assessments_limit: Number.parseInt(
            newTierData.assessments.split("-")[1] || newTierData.assessments.replace("+", ""),
          ),
        }))
      }
    } catch (error) {
      console.error("Error changing plan:", error)
      toast({
        title: "Error",
        description: "Failed to change plan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setChangingPlan(false)
    }
  }

  const getCurrentTier = () => {
    return SUBSCRIPTION_TIERS.find((tier) => tier.id === subscription?.tier)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      case "PAST_DUE":
        return <Badge className="bg-yellow-100 text-yellow-800">Past Due</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading subscription...</p>
        </div>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Subscription Management</h1>
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">You don't have an active subscription.</p>
            <Button>Choose a Plan</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentTier = getCurrentTier()

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl py-8 px-4 sm:px-6 lg:px-8">
        {/* Navigation Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="h-4 w-px bg-border" />
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscription Management</h1>
        <p className="text-muted-foreground">Manage your subscription and billing preferences</p>
      </div>

      {/* Current Subscription Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentTier?.name}</div>
            <p className="text-xs text-muted-foreground">
              ${subscription.amount}/{subscription.billing_cycle === "annual" ? "year" : "month"}
            </p>
            <div className="mt-2">{getStatusBadge(subscription.status)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage This Period</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscription.assessments_used_current_period}/{subscription.assessments_limit}
            </div>
            <p className="text-xs text-muted-foreground">Assessments used</p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                  width: `${(subscription.assessments_used_current_period / subscription.assessments_limit) * 100}%`,
                }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Billing</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{format(new Date(subscription.next_billing_date), "MMM dd")}</div>
            <p className="text-xs text-muted-foreground">{format(new Date(subscription.next_billing_date), "yyyy")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Plan Options */}
      <Card>
        <CardHeader>
          <CardTitle>Change Your Plan</CardTitle>
          <CardDescription>Upgrade or downgrade your subscription at any time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SUBSCRIPTION_TIERS.map((tier) => (
              <Card key={tier.id} className={`relative ${tier.id === subscription.tier ? "ring-2 ring-blue-500" : ""}`}>
                <CardHeader>
                  <CardTitle className="text-lg">{tier.name}</CardTitle>
                  <CardDescription>{tier.assessments} assessments/month</CardDescription>
                  {tier.id === subscription.tier && (
                    <Badge className="absolute top-2 right-2 bg-blue-100 text-blue-800">Current</Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">${tier.monthly}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-semibold">${tier.annual}</span>
                      <span className="text-muted-foreground">/year</span>
                      <Badge variant="secondary" className="text-xs">
                        Save 7.5%
                      </Badge>
                    </div>
                  </div>

                  {tier.id !== subscription.tier && (
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        disabled={changingPlan}
                        onClick={() => handlePlanChange(tier.id, "monthly")}
                      >
                        Switch to Monthly
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        disabled={changingPlan}
                        onClick={() => handlePlanChange(tier.id, "annual")}
                      >
                        Switch to Annual
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Your recent payments and invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
            <p>Billing history will appear here once you have an active paid subscription.</p>
          </div>
        </CardContent>
      </Card>
      </div>
      </div>
    </div>
  )
}
