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
      // Mock subscription data
      const mockSubscriptions: Subscription[] = [
        {
          id: "sub_1",
          organization_name: "TechCorp Solutions",
          plan_name: "Professional Plan",
          status: "ACTIVE",
          current_period_start: "2024-01-01T00:00:00Z",
          current_period_end: "2024-02-01T00:00:00Z",
          monthly_amount: 299,
          assessments_used: 12,
          assessments_limit: 25,
          created_at: "2023-12-01T00:00:00Z",
          last_payment_date: "2024-01-01T00:00:00Z",
          next_payment_date: "2024-02-01T00:00:00Z",
          payment_method: "Visa ****4242",
          billing_email: "billing@techcorp.com",
          account_holder: "John Smith",
        },
        {
          id: "sub_2",
          organization_name: "Global Innovations Inc",
          plan_name: "Enterprise Plan",
          status: "PAST_DUE",
          current_period_start: "2024-01-15T00:00:00Z",
          current_period_end: "2024-02-15T00:00:00Z",
          monthly_amount: 599,
          assessments_used: 45,
          assessments_limit: 100,
          created_at: "2023-11-15T00:00:00Z",
          last_payment_date: "2023-12-15T00:00:00Z",
          next_payment_date: "2024-01-15T00:00:00Z",
          payment_method: "Mastercard ****8888",
          billing_email: "finance@globalinnovations.com",
          account_holder: "Sarah Johnson",
        },
        {
          id: "sub_3",
          organization_name: "StartupHub",
          plan_name: "Basic Plan",
          status: "ACTIVE",
          current_period_start: "2024-01-20T00:00:00Z",
          current_period_end: "2024-02-20T00:00:00Z",
          monthly_amount: 99,
          assessments_used: 3,
          assessments_limit: 10,
          created_at: "2024-01-20T00:00:00Z",
          last_payment_date: "2024-01-20T00:00:00Z",
          next_payment_date: "2024-02-20T00:00:00Z",
          payment_method: "Visa ****1234",
          billing_email: "admin@startuphub.com",
          account_holder: "Mike Chen",
        },
        {
          id: "sub_4",
          organization_name: "Enterprise Corp",
          plan_name: "Professional Plan",
          status: "SUSPENDED",
          current_period_start: "2024-01-10T00:00:00Z",
          current_period_end: "2024-02-10T00:00:00Z",
          monthly_amount: 299,
          assessments_used: 8,
          assessments_limit: 25,
          created_at: "2023-10-10T00:00:00Z",
          last_payment_date: "2023-12-10T00:00:00Z",
          payment_method: "Amex ****9999",
          billing_email: "payments@enterprisecorp.com",
          account_holder: "Lisa Park",
        },
        {
          id: "sub_5",
          organization_name: "Digital Solutions Ltd",
          plan_name: "Enterprise Plan",
          status: "CANCELED",
          current_period_start: "2023-12-01T00:00:00Z",
          current_period_end: "2024-01-01T00:00:00Z",
          monthly_amount: 599,
          assessments_used: 22,
          assessments_limit: 100,
          created_at: "2023-06-01T00:00:00Z",
          last_payment_date: "2023-12-01T00:00:00Z",
          payment_method: "Visa ****5555",
          billing_email: "billing@digitalsolutions.com",
          account_holder: "David Wilson",
        },
      ]

      setSubscriptions(mockSubscriptions)
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
