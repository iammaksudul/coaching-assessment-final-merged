"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import {
  Users, Building2, CreditCard, FileText, AlertTriangle, Settings, Search,
  UserX, CheckCircle, TrendingUp,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Stats {
  totalUsers: number
  totalOrganizations: number
  totalAssessments: number
  completedAssessments: number
  pendingAssessments: number
  expiredAssessments: number
  activeSubscriptions: number
  lapsedAccounts: number
}

interface User {
  id: string; name: string; email: string; role: string; status: string
  created_at: string; organization_name?: string
}

interface PaymentIssue {
  id: string; user_email: string; user_name: string; organization_name?: string
  amount: number; currency: string; failure_reason: string; failed_at: string
  retry_count: number; status: string
}

const EMPTY_STATS: Stats = {
  totalUsers: 0, totalOrganizations: 0, totalAssessments: 0,
  completedAssessments: 0, pendingAssessments: 0, expiredAssessments: 0,
  activeSubscriptions: 0, lapsedAccounts: 0,
}

export function AdminDashboard() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<Stats>(EMPTY_STATS)
  const [paymentIssues, setPaymentIssues] = useState<PaymentIssue[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [suspensionReason, setSuspensionReason] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes, paymentsRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/users"),
          fetch("/api/admin/payments/failed"),
        ])
        if (statsRes.ok) setStats(await statsRes.json())
        if (usersRes.ok) {
          const data = await usersRes.json()
          setUsers((data.users || []).map((u: any) => ({
            id: u.id, name: u.name || "", email: u.email || "", role: u.role || "PARTICIPANT",
            status: "ACTIVE", created_at: u.created_at, organization_name: u.organization_name,
          })))
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
      } catch {} finally { setLoading(false) }
    }
    fetchData()
  }, [])

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users
    const term = searchTerm.toLowerCase()
    return users.filter(u =>
      u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term) ||
      (u.organization_name && u.organization_name.toLowerCase().includes(term))
    )
  }, [users, searchTerm])

  const handleSuspendUser = async (user: User) => {
    if (!suspensionReason.trim()) {
      toast({ title: "Error", description: "Please provide a reason", variant: "destructive" })
      return
    }
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: "SUSPENDED" } : u))
    toast({ title: "Success", description: `${user.name} suspended` })
    setSelectedUser(null)
    setSuspensionReason("")
  }

  const handleReactivateUser = (user: User) => {
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: "ACTIVE" } : u))
    toast({ title: "Success", description: `${user.name} reactivated` })
  }

  const roleBadge = (role: string) => {
    const m: Record<string, string> = { ADMIN: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200", EMPLOYER: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", PARTICIPANT: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" }
    return <Badge className={m[role] || ""}>{role}</Badge>
  }

  const statusBadge = (status: string) => {
    const m: Record<string, string> = { ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", SUSPENDED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" }
    return <Badge className={m[status] || ""}>{status}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Administration</h1>
          <p className="text-muted-foreground">Platform overview and management tools</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/subscriptions">
            <Button variant="outline" size="sm"><CreditCard className="h-4 w-4 mr-2" />Subscriptions</Button>
          </Link>
          <Link href="/admin/payments">
            <Button variant="outline" size="sm"><AlertTriangle className="h-4 w-4 mr-2" />Payment Issues</Button>
          </Link>
        </div>
      </div>

      {/* Stats — all from real DB */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
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
            <div className="text-2xl font-bold">{stats.totalAssessments}</div>
            <div className="text-xs text-muted-foreground space-y-0.5 mt-1">
              <div className="flex justify-between"><span>Completed:</span><span className="text-green-600 dark:text-green-400">{stats.completedAssessments}</span></div>
              <div className="flex justify-between"><span>Pending:</span><span className="text-yellow-600 dark:text-yellow-400">{stats.pendingAssessments}</span></div>
              <div className="flex justify-between"><span>Expired:</span><span className="text-red-600 dark:text-red-400">{stats.expiredAssessments}</span></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            <div className="text-xs text-muted-foreground space-y-0.5 mt-1">
              <div className="flex justify-between"><span>Active:</span><span className="text-green-600 dark:text-green-400">{stats.activeSubscriptions}</span></div>
              <div className="flex justify-between"><span>Lapsed:</span><span className="text-red-600 dark:text-red-400">{stats.lapsedAccounts}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users"><Users className="w-4 h-4 mr-2" />Users ({stats.totalUsers})</TabsTrigger>
          <TabsTrigger value="payments"><AlertTriangle className="w-4 h-4 mr-2" />Payment Issues ({paymentIssues.length})</TabsTrigger>
          <TabsTrigger value="system"><Settings className="w-4 h-4 mr-2" />System Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage all platform users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by name, email, or organization..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="max-w-sm" />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        {user.organization_name && <div className="text-xs text-muted-foreground flex items-center gap-1"><Building2 className="h-3 w-3" />{user.organization_name}</div>}
                      </TableCell>
                      <TableCell>{roleBadge(user.role)}</TableCell>
                      <TableCell>{statusBadge(user.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</TableCell>
                      <TableCell className="text-right">
                        {user.status === "ACTIVE" ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950 bg-transparent" onClick={() => setSelectedUser(user)}>
                                <UserX className="h-4 w-4 mr-1" />Suspend
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Suspend {user.name}</DialogTitle>
                                <DialogDescription>This will prevent them from accessing the platform.</DialogDescription>
                              </DialogHeader>
                              <div><Label htmlFor="reason">Reason</Label><Textarea id="reason" value={suspensionReason} onChange={e => setSuspensionReason(e.target.value)} placeholder="Reason for suspension..." rows={3} /></div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => { setSelectedUser(null); setSuspensionReason("") }}>Cancel</Button>
                                <Button variant="destructive" onClick={() => selectedUser && handleSuspendUser(selectedUser)}>Suspend</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-950 bg-transparent" onClick={() => handleReactivateUser(user)}>
                            <CheckCircle className="h-4 w-4 mr-1" />Reactivate
                          </Button>
                        )}
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
                      <TableHead>Reason</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Retries</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentIssues.map(issue => (
                      <TableRow key={issue.id}>
                        <TableCell>
                          <div className="font-medium">{issue.user_name}</div>
                          <div className="text-sm text-muted-foreground">{issue.user_email}</div>
                        </TableCell>
                        <TableCell className="font-medium">${(issue.amount / 100).toFixed(2)}</TableCell>
                        <TableCell className="text-sm">{issue.failure_reason}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(issue.failed_at), { addSuffix: true })}</TableCell>
                        <TableCell className="text-center">{issue.retry_count}/3</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">Retry</Button>
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
              <CardDescription>Configure platform settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader><CardTitle className="text-lg">Assessment Settings</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between"><Label>Default Expiry</Label><Select defaultValue="30"><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="7">7 days</SelectItem><SelectItem value="14">14 days</SelectItem><SelectItem value="30">30 days</SelectItem><SelectItem value="60">60 days</SelectItem></SelectContent></Select></div>
                    <div className="flex items-center justify-between"><Label>Max Referees</Label><Select defaultValue="5"><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="3">3</SelectItem><SelectItem value="5">5</SelectItem><SelectItem value="10">10</SelectItem></SelectContent></Select></div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-lg">Email Settings</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between"><Label>Reminder Frequency</Label><Select defaultValue="3"><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">Daily</SelectItem><SelectItem value="3">Every 3 days</SelectItem><SelectItem value="7">Weekly</SelectItem></SelectContent></Select></div>
                    <div className="flex items-center justify-between"><Label>Max Reminders</Label><Select defaultValue="3"><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="2">2</SelectItem><SelectItem value="3">3</SelectItem><SelectItem value="5">5</SelectItem></SelectContent></Select></div>
                  </CardContent>
                </Card>
              </div>
              <div className="flex gap-4 mt-6"><Button>Save Settings</Button><Button variant="outline">Reset to Defaults</Button></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
