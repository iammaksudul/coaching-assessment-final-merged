"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import {
  ArrowLeft,
  Search,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  Ban,
  Play,
  Pause,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Subscription {
  id: string
  organization_name: string
  plan_name: string
  status: "ACTIVE" | "PAST_DUE" | "CANCELED" | "SUSPENDED"
  current_period_start: string
  current_period_end: string
  monthly_amount: number
  assessments_used: number
  assessments_limit: number
  created_at: string
  last_payment_date?: string
  next_payment_date?: string
  payment_method: string
  billing_email: string
  account_holder: string
}

export default function SubscriptionsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      const res = await fetch("/api/admin/subscriptions")
      if (res.ok) {
        const data = await res.json()
        const subs = (data.subscriptions || data || []).map((s: any) => ({
          id: s.id,
          organization_name: s.organization_name || "Unknown",
          plan_name: s.plan_id || "Free",
          status: (s.status || "ACTIVE").toUpperCase(),
          current_period_start: s.current_period_start,
          current_period_end: s.current_period_end,
          monthly_amount: 0,
          assessments_used: 0,
          assessments_limit: 0,
          created_at: s.created_at,
          last_payment_date: s.last_payment_attempt_at,
          next_payment_date: s.current_period_end,
          payment_method: s.stripe_customer_id ? "Stripe" : "None",
          billing_email: "",
          account_holder: "",
        }))
        setSubscriptions(subs)
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error)
      toast({
        title: "Error",
        description: "Failed to load subscriptions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (subscriptionId: string, action: string) => {
    setActionLoading(subscriptionId)

    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const updatedSubscriptions = subscriptions.map((sub) => {
        if (sub.id === subscriptionId) {
          switch (action) {
            case "suspend":
              return { ...sub, status: "SUSPENDED" as const }
            case "reactivate":
              return { ...sub, status: "ACTIVE" as const }
            case "cancel":
              return { ...sub, status: "CANCELED" as const }
            default:
              return sub
          }
        }
        return sub
      })

      setSubscriptions(updatedSubscriptions)

      toast({
        title: "Success",
        description: `Subscription ${action}d successfully.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} subscription. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        )
      case "PAST_DUE":
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Past Due
          </Badge>
        )
      case "SUSPENDED":
        return (
          <Badge className="bg-orange-100 text-orange-800">
            <Pause className="w-3 h-3 mr-1" />
            Suspended
          </Badge>
        )
      case "CANCELED":
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <XCircle className="w-3 h-3 mr-1" />
            Canceled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getUsageBadge = (used: number, limit: number) => {
    const percentage = (used / limit) * 100
    if (percentage >= 90) {
      return (
        <Badge className="bg-red-100 text-red-800">
          {used}/{limit}
        </Badge>
      )
    } else if (percentage >= 70) {
      return (
        <Badge className="bg-orange-100 text-orange-800">
          {used}/{limit}
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-green-100 text-green-800">
          {used}/{limit}
        </Badge>
      )
    }
  }

  const filteredSubscriptions = subscriptions.filter(
    (sub) =>
      sub.organization_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.account_holder.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.billing_email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const activeCount = subscriptions.filter((s) => s.status === "ACTIVE").length
  const pastDueCount = subscriptions.filter((s) => s.status === "PAST_DUE").length
  const suspendedCount = subscriptions.filter((s) => s.status === "SUSPENDED").length
  const totalRevenue = subscriptions.filter((s) => s.status === "ACTIVE").reduce((sum, s) => sum + s.monthly_amount, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading subscriptions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Subscription Management</h1>
            <p className="text-muted-foreground">Manage organization subscriptions and billing</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Past Due</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{pastDueCount}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <Pause className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{suspendedCount}</div>
            <p className="text-xs text-muted-foreground">Temporarily suspended</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From active subscriptions</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions</CardTitle>
          <CardDescription>Manage and monitor organization subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by organization, account holder, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Next Payment</TableHead>
                <TableHead>Account Holder</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{subscription.organization_name}</div>
                      <div className="text-sm text-muted-foreground">{subscription.billing_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{subscription.plan_name}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                  <TableCell>{getUsageBadge(subscription.assessments_used, subscription.assessments_limit)}</TableCell>
                  <TableCell>
                    <div className="font-medium">${subscription.monthly_amount}/month</div>
                    <div className="text-sm text-muted-foreground">{subscription.payment_method}</div>
                  </TableCell>
                  <TableCell>
                    {subscription.next_payment_date ? (
                      <div className="text-sm">
                        {formatDistanceToNow(new Date(subscription.next_payment_date), { addSuffix: true })}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{subscription.account_holder}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedSubscription(subscription)}>
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Subscription Details</DialogTitle>
                            <DialogDescription>
                              {selectedSubscription?.organization_name} subscription information
                            </DialogDescription>
                          </DialogHeader>
                          {selectedSubscription && (
                            <div className="grid gap-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Organization</Label>
                                  <p className="text-sm">{selectedSubscription.organization_name}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Plan</Label>
                                  <p className="text-sm">{selectedSubscription.plan_name}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Status</Label>
                                  <div className="mt-1">{getStatusBadge(selectedSubscription.status)}</div>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Monthly Amount</Label>
                                  <p className="text-sm">${selectedSubscription.monthly_amount}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Assessment Usage</Label>
                                  <p className="text-sm">
                                    {selectedSubscription.assessments_used} of {selectedSubscription.assessments_limit}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Account Holder</Label>
                                  <p className="text-sm">{selectedSubscription.account_holder}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Billing Email</Label>
                                  <p className="text-sm">{selectedSubscription.billing_email}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Payment Method</Label>
                                  <p className="text-sm">{selectedSubscription.payment_method}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Created</Label>
                                  <p className="text-sm">
                                    {formatDistanceToNow(new Date(selectedSubscription.created_at), {
                                      addSuffix: true,
                                    })}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Current Period</Label>
                                  <p className="text-sm">
                                    {new Date(selectedSubscription.current_period_start).toLocaleDateString()} -{" "}
                                    {new Date(selectedSubscription.current_period_end).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {subscription.status === "ACTIVE" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction(subscription.id, "suspend")}
                          disabled={actionLoading === subscription.id}
                        >
                          {actionLoading === subscription.id ? (
                            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                          ) : (
                            <Ban className="w-3 h-3 mr-1" />
                          )}
                          Suspend
                        </Button>
                      )}

                      {subscription.status === "SUSPENDED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction(subscription.id, "reactivate")}
                          disabled={actionLoading === subscription.id}
                        >
                          {actionLoading === subscription.id ? (
                            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                          ) : (
                            <Play className="w-3 h-3 mr-1" />
                          )}
                          Reactivate
                        </Button>
                      )}

                      {(subscription.status === "PAST_DUE" || subscription.status === "SUSPENDED") && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleAction(subscription.id, "cancel")}
                          disabled={actionLoading === subscription.id}
                        >
                          {actionLoading === subscription.id ? (
                            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          Cancel
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredSubscriptions.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No subscriptions found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
