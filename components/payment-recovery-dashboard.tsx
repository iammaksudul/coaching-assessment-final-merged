"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { AlertTriangle, Clock, DollarSign } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface FailedPayment {
  id: string
  subscription_id: string
  customer_email: string
  customer_name: string
  organization_name?: string
  amount: number
  currency: string
  failure_code: string
  failure_message: string
  attempted_at: string
  retry_count: number
  next_retry_at?: string
  subscription_status: string
  grace_period_ends_at?: string
  last_dunning_sent?: string
  dunning_type?: string
}

export function PaymentRecoveryDashboard() {
  const { toast } = useToast()
  const [failedPayments, setFailedPayments] = useState<FailedPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState<FailedPayment | null>(null)
  const [actionType, setActionType] = useState<string>("")
  const [actionNotes, setActionNotes] = useState("")
  const [customMessage, setCustomMessage] = useState("")
  const [graceDays, setGraceDays] = useState("7")
  const [suspensionReason, setSuspensionReason] = useState("")

  useEffect(() => {
    fetchFailedPayments()
  }, [])

  const fetchFailedPayments = async () => {
    try {
      const response = await fetch("/api/admin/payments/failed")
      const data = await response.json()
      setFailedPayments(data.failedPayments || [])
    } catch (error) {
      console.error("Error fetching failed payments:", error)
      toast({
        title: "Error",
        description: "Failed to load failed payments",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRetryPayment = async (payment: FailedPayment) => {
    try {
      const response = await fetch("/api/admin/payments/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId: payment.subscription_id,
          paymentIntentId: payment.id,
          notes: actionNotes,
        }),
      })

      if (!response.ok) throw new Error("Failed to retry payment")

      toast({
        title: "Success",
        description: "Payment retry initiated successfully",
      })

      fetchFailedPayments()
      setSelectedPayment(null)
      setActionNotes("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to retry payment",
        variant: "destructive",
      })
    }
  }

  const handleSendDunning = async (payment: FailedPayment, emailType: string) => {
    try {
      const response = await fetch("/api/admin/payments/send-dunning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId: payment.subscription_id,
          emailType,
          customMessage,
        }),
      })

      if (!response.ok) throw new Error("Failed to send dunning email")

      toast({
        title: "Success",
        description: "Dunning email sent successfully",
      })

      fetchFailedPayments()
      setSelectedPayment(null)
      setCustomMessage("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send dunning email",
        variant: "destructive",
      })
    }
  }

  const handleSuspendAccount = async (payment: FailedPayment) => {
    try {
      const response = await fetch("/api/admin/payments/suspend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId: payment.subscription_id,
          reason: suspensionReason,
          notifyCustomer: true,
          notes: actionNotes,
        }),
      })

      if (!response.ok) throw new Error("Failed to suspend account")

      toast({
        title: "Success",
        description: "Account suspended successfully",
      })

      fetchFailedPayments()
      setSelectedPayment(null)
      setSuspensionReason("")
      setActionNotes("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to suspend account",
        variant: "destructive",
      })
    }
  }

  const handleExtendGrace = async (payment: FailedPayment) => {
    try {
      const response = await fetch("/api/admin/payments/extend-grace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId: payment.subscription_id,
          days: Number.parseInt(graceDays),
          notes: actionNotes,
        }),
      })

      if (!response.ok) throw new Error("Failed to extend grace period")

      toast({
        title: "Success",
        description: `Grace period extended by ${graceDays} days`,
      })

      fetchFailedPayments()
      setSelectedPayment(null)
      setGraceDays("7")
      setActionNotes("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to extend grace period",
        variant: "destructive",
      })
    }
  }

  const getFailureCodeBadge = (code: string) => {
    const colors = {
      card_declined: "bg-red-100 text-red-800",
      insufficient_funds: "bg-orange-100 text-orange-800",
      expired_card: "bg-yellow-100 text-yellow-800",
      authentication_required: "bg-blue-100 text-blue-800",
    }
    return (
      <Badge className={colors[code as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {code.replace(/_/g, " ")}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "past_due":
        return <Badge className="bg-yellow-100 text-yellow-800">Past Due</Badge>
      case "suspended":
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading failed payments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Navigation */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold">Payment Recovery</h2>
          <p className="text-muted-foreground">Manage failed payments and customer recovery</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{failedPayments.length}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue at Risk</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ${failedPayments.reduce((sum, p) => sum + p.amount, 0) / 100}
            </div>
            <p className="text-xs text-muted-foreground">Total failed amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grace Period</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {
                failedPayments.filter((p) => p.grace_period_ends_at && new Date(p.grace_period_ends_at) > new Date())
                  .length
              }
            </div>
            <p className="text-xs text-muted-foreground">Accounts in grace</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {failedPayments.filter((p) => p.retry_count >= 3).length}
            </div>
            <p className="text-xs text-muted-foreground">Max retries reached</p>
          </CardContent>
        </Card>
      </div>

      {/* Failed Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Failed Payments</CardTitle>
          <CardDescription>Payments requiring recovery action</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Failure</TableHead>
                <TableHead>Retries</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Grace Period</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {failedPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{payment.customer_email}</div>
                      <div className="text-sm text-muted-foreground">{payment.customer_name}</div>
                      {payment.organization_name && (
                        <div className="text-sm text-muted-foreground">{payment.organization_name}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{formatAmount(payment.amount, payment.currency)}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(payment.attempted_at), { addSuffix: true })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getFailureCodeBadge(payment.failure_code)}
                      <div className="text-sm text-muted-foreground">{payment.failure_message}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{payment.retry_count}/3</div>
                      {payment.next_retry_at && (
                        <div className="text-sm text-muted-foreground">
                          Next: {format(new Date(payment.next_retry_at), "MMM dd")}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(payment.subscription_status)}</TableCell>
                  <TableCell>
                    {payment.grace_period_ends_at ? (
                      <div className="space-y-1">
                        <div className="text-sm">
                          {new Date(payment.grace_period_ends_at) > new Date() ? (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">Expired</Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Until {format(new Date(payment.grace_period_ends_at), "MMM dd")}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedPayment(payment)}>
                          Manage
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Payment Recovery Actions</DialogTitle>
                          <DialogDescription>
                            Choose an action for {payment.customer_name} ({payment.customer_email})
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                              <CardHeader className="pb-3">
                                <CardTitle className="text-sm">Payment Details</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2 text-sm">
                                <div>Amount: {formatAmount(payment.amount, payment.currency)}</div>
                                <div>Failure: {payment.failure_message}</div>
                                <div>Retries: {payment.retry_count}/3</div>
                                <div>
                                  Last Attempt:{" "}
                                  {formatDistanceToNow(new Date(payment.attempted_at), { addSuffix: true })}
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader className="pb-3">
                                <CardTitle className="text-sm">Customer Info</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2 text-sm">
                                <div>Email: {payment.customer_email}</div>
                                <div>Name: {payment.customer_name}</div>
                                {payment.organization_name && <div>Org: {payment.organization_name}</div>}
                                {payment.last_dunning_sent && (
                                  <div>
                                    Last Email:{" "}
                                    {formatDistanceToNow(new Date(payment.last_dunning_sent), { addSuffix: true })}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="action-type">Recovery Action</Label>
                              <Select value={actionType} onValueChange={setActionType}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose an action" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="retry">Retry Payment</SelectItem>
                                  <SelectItem value="dunning-failed">Send Payment Failed Email</SelectItem>
                                  <SelectItem value="dunning-reminder">Send Retry Reminder</SelectItem>
                                  <SelectItem value="dunning-final">Send Final Notice</SelectItem>
                                  <SelectItem value="extend-grace">Extend Grace Period</SelectItem>
                                  <SelectItem value="suspend">Suspend Account</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {actionType === "extend-grace" && (
                              <div>
                                <Label htmlFor="grace-days">Grace Period (Days)</Label>
                                <Input
                                  id="grace-days"
                                  type="number"
                                  value={graceDays}
                                  onChange={(e) => setGraceDays(e.target.value)}
                                  min="1"
                                  max="30"
                                />
                              </div>
                            )}

                            {actionType === "suspend" && (
                              <div>
                                <Label htmlFor="suspension-reason">Suspension Reason</Label>
                                <Input
                                  id="suspension-reason"
                                  value={suspensionReason}
                                  onChange={(e) => setSuspensionReason(e.target.value)}
                                  placeholder="e.g., Payment failure after multiple attempts"
                                />
                              </div>
                            )}

                            {actionType?.startsWith("dunning") && (
                              <div>
                                <Label htmlFor="custom-message">Custom Message (Optional)</Label>
                                <Textarea
                                  id="custom-message"
                                  value={customMessage}
                                  onChange={(e) => setCustomMessage(e.target.value)}
                                  placeholder="Add a personalized message to the email..."
                                  rows={3}
                                />
                              </div>
                            )}

                            <div>
                              <Label htmlFor="action-notes">Admin Notes</Label>
                              <Textarea
                                id="action-notes"
                                value={actionNotes}
                                onChange={(e) => setActionNotes(e.target.value)}
                                placeholder="Internal notes about this action..."
                                rows={2}
                              />
                            </div>
                          </div>
                        </div>

                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedPayment(null)
                              setActionType("")
                              setActionNotes("")
                              setCustomMessage("")
                              setGraceDays("7")
                              setSuspensionReason("")
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => {
                              if (!selectedPayment || !actionType) return

                              switch (actionType) {
                                case "retry":
                                  handleRetryPayment(selectedPayment)
                                  break
                                case "dunning-failed":
                                  handleSendDunning(selectedPayment, "payment_failed")
                                  break
                                case "dunning-reminder":
                                  handleSendDunning(selectedPayment, "retry_reminder")
                                  break
                                case "dunning-final":
                                  handleSendDunning(selectedPayment, "final_notice")
                                  break
                                case "extend-grace":
                                  handleExtendGrace(selectedPayment)
                                  break
                                case "suspend":
                                  handleSuspendAccount(selectedPayment)
                                  break
                              }
                            }}
                            disabled={!actionType}
                          >
                            Execute Action
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
