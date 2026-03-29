"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import {
  Users,
  Building2,
  CreditCard,
  FileText,
  TrendingUp,
  AlertTriangle,
  Settings,
  Search,
  UserX,
  DollarSign,
  CheckCircle,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface SystemStats {
  totalUsers: number
  totalOrganizations: number
  activeSubscriptions: number
  totalAssessments: number
  completedAssessments: number
  pendingAssessments: number
  expiredAssessments: number
  monthlyRevenue: number
  cumulativeRevenue: number
  paymentIssues: number
  activeAccounts: number
  lapsedAccounts: number
}

interface User {
  id: string
  name: string
  email: string
  role: string
  account_type: string
  status: string
  created_at: string
  last_login?: string
  assessments_count: number
  organization_name?: string
  subscription_status?: string
}

interface PaymentIssue {
  id: string
  user_email: string
  user_name: string
  organization_name?: string
  amount: number
  currency: string
  failure_reason: string
  failed_at: string
  retry_count: number
  status: string
}

// Pre-computed static data to avoid computation delays
const STATIC_STATS: SystemStats = {
  totalUsers: 1247,
  totalOrganizations: 89,
  activeSubscriptions: 156,
  totalAssessments: 3421,
  completedAssessments: 2876,
  pendingAssessments: 445,
  expiredAssessments: 100,
  monthlyRevenue: 18750,
  cumulativeRevenue: 245600,
  paymentIssues: 7,
  activeAccounts: 149,
  lapsedAccounts: 7,
}

const STATIC_USERS: User[] = [
  {
    id: "alex-johnson-preview",
    name: "Alex Johnson",
    email: "alex.johnson@preview.com",
    role: "PARTICIPANT",
    account_type: "SELF_CREATED",
    status: "ACTIVE",
    created_at: "2024-01-15T10:00:00Z",
    last_login: "2024-02-28T14:30:00Z",
    assessments_count: 2,
  },
  {
    id: "sarah-wilson-preview",
    name: "Sarah Wilson",
    email: "sarah.wilson@preview.com",
    role: "PARTICIPANT",
    account_type: "SELF_CREATED",
    status: "ACTIVE",
    created_at: "2024-01-10T14:00:00Z",
    last_login: "2024-02-27T09:15:00Z",
    assessments_count: 2,
  },
  {
    id: "employer-preview",
    name: "John Smith",
    email: "john.smith@preview.com",
    role: "EMPLOYER",
    account_type: "EMPLOYER",
    status: "ACTIVE",
    created_at: "2024-01-05T09:00:00Z",
    last_login: "2024-02-28T16:45:00Z",
    assessments_count: 0,
    organization_name: "Preview Organization",
    subscription_status: "ACTIVE",
  },
  {
    id: "mike-chen-preview",
    name: "Mike Chen",
    email: "mike.chen@preview.com",
    role: "ADMIN",
    account_type: "SELF_CREATED",
    status: "ACTIVE",
    created_at: "2024-01-01T08:00:00Z",
    last_login: "2024-02-28T18:00:00Z",
    assessments_count: 1,
  },
  {
    id: "suspended-user",
    name: "Problem User",
    email: "problem@example.com",
    role: "PARTICIPANT",
    account_type: "SELF_CREATED",
    status: "SUSPENDED",
    created_at: "2024-02-01T12:00:00Z",
    last_login: "2024-02-15T10:30:00Z",
    assessments_count: 0,
  },
]

const STATIC_PAYMENT_ISSUES: PaymentIssue[] = [
  {
    id: "payment-issue-1",
    user_email: "billing@techcorp.com",
    user_name: "Tech Corp",
    organization_name: "Tech Corporation",
    amount: 8900,
    currency: "USD",
    failure_reason: "Card declined",
    failed_at: "2024-02-25T10:00:00Z",
    retry_count: 2,
    status: "PENDING_RETRY",
  },
  {
    id: "payment-issue-2",
    user_email: "finance@startup.com",
    user_name: "Startup Inc",
    organization_name: "Startup Inc",
    amount: 3900,
    currency: "USD",
    failure_reason: "Insufficient funds",
    failed_at: "2024-02-26T14:30:00Z",
    retry_count: 1,
    status: "PENDING_RETRY",
  },
]

export function AdminDashboard() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [suspensionReason, setSuspensionReason] = useState("")
  const [stats, setStats] = useState(STATIC_STATS)
  const [paymentIssues, setPaymentIssues] = useState<PaymentIssue[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, paymentsRes] = await Promise.all([
          fetch("/api/admin/users"),
          fetch("/api/admin/payments/failed"),
        ])
        if (usersRes.ok) {
          const data = await usersRes.json()
          setUsers((data.users || []).map((u: any) => ({
            id: u.id, name: u.name || "", email: u.email || "", role: u.role || "PARTICIPANT",
            account_type: u.account_type || "SELF_CREATED", status: "ACTIVE",
            created_at: u.created_at, organization_name: u.organization_name,
          })))
          setStats((s: any) => ({ ...s, totalUsers: (data.users || []).length }))
        }
        if (paymentsRes.ok) {
          const data = await paymentsRes.json()
          setPaymentIssues((data.failedPayments || []).map((p: any) => ({
            id: p.id, user_email: p.customer_email || "", user_name: p.customer_name || "",
            organization_name: p.organization_name || "", amount: p.amount || 0, currency: p.currency || "USD",
            failure_reason: p.failure_message || p.failure_code || "Unknown", failed_at: p.attempted_at,
            retry_count: p.retry_count || 0, status: "PENDING_RETRY",
          })))
        }
      } catch {}
    }
    fetchData()
  }, [])

  // Memoize filtered users to avoid recalculation on every render
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users

    const term = searchTerm.toLowerCase()
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        (user.organization_name && user.organization_name.toLowerCase().includes(term)),
    )
  }, [users, searchTerm])

  const handleSuspendUser = async (user: User) => {
    if (!suspensionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for suspension",
        variant: "destructive",
      })
      return
    }

    try {
      // In real implementation, this would call an API
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: "SUSPENDED" } : u)))

      toast({
        title: "Success",
        description: `User ${user.name} has been suspended`,
      })

      setSelectedUser(null)
      setSuspensionReason("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to suspend user",
        variant: "destructive",
      })
    }
  }

  const handleReactivateUser = async (user: User) => {
    try {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: "ACTIVE" } : u)))

      toast({
        title: "Success",
        description: `User ${user.name} has been reactivated`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reactivate user",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "SUSPENDED":
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>
      case "INACTIVE":
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge className="bg-purple-100 text-purple-800">Admin</Badge>
      case "EMPLOYER":
        return <Badge className="bg-blue-100 text-blue-800">Employer</Badge>
      case "PARTICIPANT":
        return <Badge className="bg-green-100 text-green-800">Participant</Badge>
      case "REFEREE":
        return <Badge className="bg-orange-100 text-orange-800">Referee</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_RETRY":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Retry</Badge>
      case "FAILED":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      case "RESOLVED":
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">System Administration</h1>
          <p className="text-lg text-muted-foreground">Platform overview and management tools</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/subscriptions">
            <Button variant="outline">
              <CreditCard className="h-4 w-4 mr-2" />
              Manage Subscriptions
            </Button>
          </Link>
          <Link href="/admin/payments">
            <Button variant="outline">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Payment Issues ({stats.paymentIssues})
            </Button>
          </Link>
        </div>
      </div>

      {/* System Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrganizations}</div>
            <p className="text-xs text-muted-foreground">Active organizations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assessments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssessments.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Completed:</span>
                <span className="text-green-600">{stats.completedAssessments}</span>
              </div>
              <div className="flex justify-between">
                <span>Pending:</span>
                <span className="text-yellow-600">{stats.pendingAssessments}</span>
              </div>
              <div className="flex justify-between">
                <span>Expired:</span>
                <span className="text-red-600">{stats.expiredAssessments}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Current month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${stats.cumulativeRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Active:</span>
                <span className="text-green-600 font-medium">{stats.activeAccounts}</span>
              </div>
              <div className="flex justify-between">
                <span>Lapsed:</span>
                <span className="text-red-600 font-medium">{stats.lapsedAccounts}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Issues:</span>
                <span className="text-orange-600 font-medium">{stats.paymentIssues}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Admin Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            User Management ({stats.totalUsers})
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Payment Issues ({stats.paymentIssues})
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="w-4 w-4" />
            System Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage all platform users and their account status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name, email, or organization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Details</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assessments</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          {user.organization_name && (
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {user.organization_name}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        <div className="text-center">
                          <span className="font-medium">{user.assessments_count}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.last_login
                          ? formatDistanceToNow(new Date(user.last_login), { addSuffix: true })
                          : "Never"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          {user.status === "ACTIVE" ? (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                                  onClick={() => setSelectedUser(user)}
                                >
                                  <UserX className="h-4 w-4 mr-1" />
                                  Suspend
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Suspend User Account</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to suspend {user.name}? This will prevent them from accessing
                                    the platform.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="suspension-reason">Reason for Suspension</Label>
                                    <Textarea
                                      id="suspension-reason"
                                      value={suspensionReason}
                                      onChange={(e) => setSuspensionReason(e.target.value)}
                                      placeholder="Enter the reason for suspending this account..."
                                      rows={3}
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedUser(null)
                                      setSuspensionReason("")
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => selectedUser && handleSuspendUser(selectedUser)}
                                  >
                                    Suspend Account
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-200 hover:bg-green-50 bg-transparent"
                              onClick={() => handleReactivateUser(user)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Reactivate
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Issues</CardTitle>
              <CardDescription>Monitor and resolve payment problems</CardDescription>
            </CardHeader>
            <CardContent>
              {paymentIssues.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <p className="text-muted-foreground">No payment issues at this time</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Failure Reason</TableHead>
                      <TableHead>Failed Date</TableHead>
                      <TableHead>Retries</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentIssues.map((issue) => (
                      <TableRow key={issue.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{issue.user_name}</div>
                            <div className="text-sm text-muted-foreground">{issue.user_email}</div>
                            {issue.organization_name && (
                              <div className="text-sm text-muted-foreground">{issue.organization_name}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            ${(issue.amount / 100).toFixed(2)} {issue.currency.toUpperCase()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{issue.failure_reason}</div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(issue.failed_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <span className="font-medium">{issue.retry_count}/3</span>
                          </div>
                        </TableCell>
                        <TableCell>{getPaymentStatusBadge(issue.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm">
                              Retry Payment
                            </Button>
                            <Button variant="ghost" size="sm">
                              Contact Customer
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure platform settings and features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Assessment Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Default Assessment Expiry</Label>
                        <Select defaultValue="30">
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7">7 days</SelectItem>
                            <SelectItem value="14">14 days</SelectItem>
                            <SelectItem value="30">30 days</SelectItem>
                            <SelectItem value="60">60 days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Max Referees per Assessment</Label>
                        <Select defaultValue="5">
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Email Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Reminder Frequency</Label>
                        <Select defaultValue="3">
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Daily</SelectItem>
                            <SelectItem value="3">Every 3 days</SelectItem>
                            <SelectItem value="7">Weekly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Max Reminders</Label>
                        <Select defaultValue="3">
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="5">5</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex gap-4">
                  <Button>Save Settings</Button>
                  <Button variant="outline">Reset to Defaults</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
