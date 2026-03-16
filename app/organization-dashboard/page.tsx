"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import {
  Building2,
  Users,
  FileText,
  CreditCard,
  Search,
  Plus,
  BarChart3,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Mail,
  TrendingUp,
  Calendar,
  Send,
  Eye,
  UserPlus,
  Archive,
  RotateCcw,
  ShoppingCart,
  Lock,
} from "lucide-react"
import { ExistingUserDialog } from "@/components/existing-user-dialog"
import { UsageLimitWarning } from "@/components/usage-limit-warning"
import Link from "next/link"

// --- Types ---

interface SponsoredAssessment {
  id: string
  candidate_name: string
  candidate_email: string
  assessment_name: string
  status: string
  requested_at: string
  completed_at: string | null
  responded_at: string | null
  decline_message: string | null
  is_archived: boolean
  archived_at: string | null
}

interface AccessRequest {
  id: string
  candidate_name: string
  candidate_email: string
  assessment_name: string
  status: string
  requested_at: string
  resolved_at: string | null
}

interface OrgReport {
  id: string
  candidate_name: string
  assessment_name: string
  completed_at: string
  source: string
  shared: boolean
  is_archived: boolean
  archived_at: string | null
}

interface SubscriptionData {
  tier: string
  tier_name: string
  status: string
  billing_cycle: string
  assessments_used: number
  assessments_limit: number
  bonus_credits: number
  amount: number
  next_billing_date: string
  stripe_customer_id: string | null
}

// --- Subscription Tiers ---

const SUBSCRIPTION_TIERS = [
  { id: "FREE", name: "Free", assessments: "1 lifetime", monthly: 0, annual: 0 },
  { id: "TIER_1_5", name: "Starter", assessments: "1-5/mo", monthly: 39, annual: 433 },
  { id: "TIER_6_12", name: "Professional", assessments: "6-12/mo", monthly: 89, annual: 988 },
  { id: "TIER_13_20", name: "Business", assessments: "13-20/mo", monthly: 139, annual: 1543 },
  { id: "TIER_21_40", name: "Enterprise", assessments: "21-40/mo", monthly: 239, annual: 2653 },
  { id: "TIER_40_PLUS", name: "Enterprise Plus", assessments: "40+/mo", monthly: 389, annual: 4318 },
]

export default function OrganizationDashboard() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Tab state
  const [activeTab, setActiveTab] = useState("overview")

  // Data
  const [sponsoredAssessments, setSponsoredAssessments] = useState<SponsoredAssessment[]>([])
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([])
  const [reports, setReports] = useState<OrgReport[]>([])
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)

  // Lookup state
  const [lookupEmail, setLookupEmail] = useState("")
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupResult, setLookupResult] = useState<any>(null)
  const [existingUserDialogOpen, setExistingUserDialogOpen] = useState(false)
  const [notFoundDialogOpen, setNotFoundDialogOpen] = useState(false)

  // Commission new state
  const [commissionDialogOpen, setCommissionDialogOpen] = useState(false)
  const [commissionForm, setCommissionForm] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [commissioning, setCommissioning] = useState(false)

  // Decline detail dialog
  const [declineDetailOpen, setDeclineDetailOpen] = useState(false)
  const [selectedDecline, setSelectedDecline] = useState<SponsoredAssessment | null>(null)

  // Archive state
  const [showArchivedAssessments, setShowArchivedAssessments] = useState(false)
  const [showArchivedReports, setShowArchivedReports] = useState(false)
  const [archiving, setArchiving] = useState<string | null>(null)

  // Limit enforcement
  const [overLimitError, setOverLimitError] = useState<any>(null)

  // One-off purchase
  const [purchasing, setPurchasing] = useState(false)

  const orgName = "Global Tech Solutions"

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Mock data for employer preview
      setSponsoredAssessments([
        {
          id: "sa-1",
          candidate_name: "Alex Johnson",
          candidate_email: "alex.johnson@preview.com",
          assessment_name: "Executive Leadership Coachability Assessment",
          status: "PENDING",
          requested_at: "2024-02-01T09:00:00Z",
          completed_at: null,
          responded_at: null,
          decline_message: null,
          is_archived: false,
          archived_at: null,
        },
        {
          id: "sa-2",
          candidate_name: "Emily Davis",
          candidate_email: "emily.davis@company.com",
          assessment_name: "Team Lead Coachability Assessment",
          status: "ACCEPTED",
          requested_at: "2024-01-15T10:00:00Z",
          completed_at: null,
          responded_at: "2024-01-16T14:30:00Z",
          decline_message: null,
          is_archived: false,
          archived_at: null,
        },
        {
          id: "sa-3",
          candidate_name: "Robert Kim",
          candidate_email: "robert.kim@company.com",
          assessment_name: "Manager Development Assessment",
          status: "COMPLETED",
          requested_at: "2024-01-05T08:00:00Z",
          completed_at: "2024-01-20T16:00:00Z",
          responded_at: "2024-01-06T09:00:00Z",
          decline_message: null,
          is_archived: false,
          archived_at: null,
        },
        {
          id: "sa-4",
          candidate_name: "Maria Santos",
          candidate_email: "maria.santos@external.com",
          assessment_name: "Executive Leadership Coachability Assessment",
          status: "DECLINED",
          requested_at: "2024-01-10T11:00:00Z",
          completed_at: null,
          responded_at: "2024-01-12T08:15:00Z",
          decline_message:
            "Thank you for the opportunity, but I am currently engaged in another assessment process and would prefer not to take on additional evaluations at this time.",
          is_archived: false,
          archived_at: null,
        },
      ])

      setAccessRequests([
        {
          id: "ar-1",
          candidate_name: "Sarah Wilson",
          candidate_email: "sarah.wilson@preview.com",
          assessment_name: "Coachability Assessment - Q4 2024",
          status: "APPROVED",
          requested_at: "2024-01-20T10:00:00Z",
          resolved_at: "2024-01-21T14:00:00Z",
        },
        {
          id: "ar-2",
          candidate_name: "David Park",
          candidate_email: "david.park@external.com",
          assessment_name: "Leadership Coachability Assessment",
          status: "PENDING",
          requested_at: "2024-02-05T09:00:00Z",
          resolved_at: null,
        },
      ])

      setReports([
        {
          id: "rpt-1",
          candidate_name: "Robert Kim",
          assessment_name: "Manager Development Assessment",
          completed_at: "2024-01-20T16:00:00Z",
          source: "Commissioned",
          shared: true,
          is_archived: false,
          archived_at: null,
        },
        {
          id: "rpt-2",
          candidate_name: "Sarah Wilson",
          assessment_name: "Coachability Assessment - Q4 2024",
          completed_at: "2023-12-15T12:00:00Z",
          source: "Shared (Access Granted)",
          shared: true,
          is_archived: false,
          archived_at: null,
        },
      ])

      setSubscription({
        tier: "TIER_6_12",
        tier_name: "Professional",
        status: "ACTIVE",
        billing_cycle: "monthly",
        assessments_used: 4,
        assessments_limit: 12,
        bonus_credits: 0,
        amount: 89,
        next_billing_date: "2024-03-01T00:00:00Z",
        stripe_customer_id: "cus_mock_123",
      })
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  // --- Candidate Email Lookup ---

  const handleEmailLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lookupEmail.trim()) return

    setLookupLoading(true)
    setLookupResult(null)

    try {
      const res = await fetch("/api/candidates/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
        },
        body: JSON.stringify({
          candidates: [{ email: lookupEmail.trim(), name: "" }],
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const validation = data.validations?.[0]
        if (validation?.exists) {
          setLookupResult(validation)
          setExistingUserDialogOpen(true)
        } else {
          setNotFoundDialogOpen(true)
        }
      } else {
        setNotFoundDialogOpen(true)
      }
    } catch (error) {
      console.error("Lookup error:", error)
      toast({
        title: "Lookup failed",
        description: "Unable to search at this time. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLookupLoading(false)
    }
  }

  // --- Request Access ---

  const handleRequestAccess = (assessmentId: string) => {
    const target = lookupResult
    setAccessRequests((prev) => [
      {
        id: `ar-new-${Date.now()}`,
        candidate_name: target?.name || lookupEmail,
        candidate_email: lookupEmail,
        assessment_name: "Coachability Assessment",
        status: "PENDING",
        requested_at: new Date().toISOString(),
        resolved_at: null,
      },
      ...prev,
    ])
    toast({
      title: "Access request sent",
      description: `A request has been sent to ${target?.name || lookupEmail} to share their assessment report.`,
    })
    setLookupEmail("")
    setExistingUserDialogOpen(false)
  }

  // --- Commission New Assessment ---

  const openCommissionDialog = (prefillEmail?: string) => {
    setCommissionForm({
      name: lookupResult?.name || "",
      email: prefillEmail || lookupEmail || "",
      message: `As part of ${orgName}'s leadership development initiative, we invite you to complete a Coachability Assessment. This will help us design a personalized development program for your role.`,
    })
    setExistingUserDialogOpen(false)
    setNotFoundDialogOpen(false)
    setCommissionDialogOpen(true)
  }

  const handleCommission = async () => {
    if (!commissionForm.email.trim() || !commissionForm.name.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both name and email for the candidate.",
        variant: "destructive",
      })
      return
    }

    setCommissioning(true)
    try {
      const res = await fetch("/api/assessments/commission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
        },
        body: JSON.stringify({
          candidateEmail: commissionForm.email,
          candidateName: commissionForm.name,
          assessmentName: "Coachability Assessment",
          message: commissionForm.message,
          organizationName: orgName,
        }),
      })

      // Add to local state regardless of API response (preview mode)
      setSponsoredAssessments((prev) => [
        {
          id: `sa-new-${Date.now()}`,
          candidate_name: commissionForm.name,
          candidate_email: commissionForm.email,
          assessment_name: "Coachability Assessment",
          status: "PENDING",
          requested_at: new Date().toISOString(),
          completed_at: null,
          responded_at: null,
          decline_message: null,
          is_archived: false,
          archived_at: null,
        },
        ...prev,
      ])

      // Increment local usage counter
      setSubscription((prev) =>
        prev ? { ...prev, assessments_used: prev.assessments_used + 1 } : prev
      )

      toast({
        title: "Assessment commissioned",
        description: `An invitation has been sent to ${commissionForm.name} at ${commissionForm.email}.`,
      })

      setCommissionDialogOpen(false)
      setLookupEmail("")
      setActiveTab("assessments")
    } catch (error) {
      console.error("Commission error:", error)
      toast({
        title: "Error",
        description: "Failed to commission assessment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setCommissioning(false)
    }
  }

  // --- Archive / Restore ---

  const handleArchive = async (id: string, type: "assessment" | "report") => {
    setArchiving(id)
    try {
      const res = await fetch("/api/employer/assessments/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": user?.id || "" },
        body: JSON.stringify({ assessmentId: id, action: "archive" }),
      })

      // Update local state regardless (preview mode)
      const now = new Date().toISOString()
      if (type === "assessment") {
        setSponsoredAssessments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, is_archived: true, archived_at: now } : a))
        )
      } else {
        setReports((prev) =>
          prev.map((r) => (r.id === id ? { ...r, is_archived: true, archived_at: now } : r))
        )
      }
      // Release a credit
      setSubscription((prev) =>
        prev ? { ...prev, assessments_used: Math.max(0, prev.assessments_used - 1) } : prev
      )
      toast({ title: "Archived", description: "Assessment archived. One plan credit has been released." })
    } catch (error) {
      toast({ title: "Error", description: "Could not archive. Please try again.", variant: "destructive" })
    } finally {
      setArchiving(null)
    }
  }

  const handleRestore = async (id: string, type: "assessment" | "report") => {
    // Check capacity before restoring
    if (subscription) {
      const totalCapacity = subscription.assessments_limit + subscription.bonus_credits
      if (subscription.assessments_used >= totalCapacity) {
        toast({
          title: "Cannot reactivate",
          description: "Your plan is at capacity. Upgrade or buy an extra assessment credit ($9) first.",
          variant: "destructive",
        })
        return
      }
    }

    setArchiving(id)
    try {
      const res = await fetch("/api/employer/assessments/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": user?.id || "" },
        body: JSON.stringify({ assessmentId: id, action: "restore" }),
      })

      if (!res.ok) {
        const data = await res.json()
        if (data.code === "OVER_LIMIT") {
          toast({
            title: "Cannot reactivate",
            description: data.error || "Your plan is at capacity.",
            variant: "destructive",
          })
          return
        }
      }

      if (type === "assessment") {
        setSponsoredAssessments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, is_archived: false, archived_at: null } : a))
        )
      } else {
        setReports((prev) =>
          prev.map((r) => (r.id === id ? { ...r, is_archived: false, archived_at: null } : r))
        )
      }
      // Re-consume a credit
      setSubscription((prev) =>
        prev ? { ...prev, assessments_used: prev.assessments_used + 1 } : prev
      )
      toast({ title: "Reactivated", description: "Assessment restored. One plan credit has been consumed." })
    } catch (error) {
      toast({ title: "Error", description: "Could not restore. Please try again.", variant: "destructive" })
    } finally {
      setArchiving(null)
    }
  }

  // --- One-Off Purchase ---

  const handlePurchaseCredit = async () => {
    setPurchasing(true)
    try {
      const res = await fetch("/api/stripe/purchase-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": user?.id || "" },
        body: JSON.stringify({ organizationId: "org-preview", returnUrl: window.location.origin }),
      })
      const data = await res.json()

      if (data.url) {
        // Production: redirect to Stripe Checkout
        window.location.href = data.url
      } else if (data.success && data.preview) {
        // Preview mode: simulate credit addition
        setSubscription((prev) =>
          prev ? { ...prev, bonus_credits: prev.bonus_credits + 1 } : prev
        )
        setOverLimitError(null)
        toast({
          title: "Credit purchased",
          description: "One extra assessment credit ($9) has been added to your account.",
        })
      }
    } catch (error) {
      toast({ title: "Error", description: "Purchase failed. Please try again.", variant: "destructive" })
    } finally {
      setPurchasing(false)
    }
  }

  // --- Commission with limit enforcement ---

  const handleCommissionWithLimitCheck = async () => {
    setOverLimitError(null)
    if (!commissionForm.email.trim() || !commissionForm.name.trim()) {
      toast({ title: "Missing information", description: "Please provide both name and email.", variant: "destructive" })
      return
    }

    // Client-side limit check
    if (subscription) {
      const totalCapacity = subscription.assessments_limit + subscription.bonus_credits
      if (subscription.assessments_used >= totalCapacity) {
        setOverLimitError({
          used: subscription.assessments_used,
          limit: subscription.assessments_limit,
          bonusCredits: subscription.bonus_credits,
        })
        return
      }
    }

    // Proceed with original commission logic
    await handleCommission()
  }

  // --- Helpers ---

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-300">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "ACCEPTED":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Accepted
          </Badge>
        )
      case "COMPLETED":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        )
      case "DECLINED":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-300">
            <XCircle className="w-3 h-3 mr-1" />
            Declined
          </Badge>
        )
      case "APPROVED":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Stats
  const activeAssessments = sponsoredAssessments.filter((a) => !a.is_archived)
  const archivedAssessments = sponsoredAssessments.filter((a) => a.is_archived)
  const activeReports = reports.filter((r) => !r.is_archived)
  const archivedReports = reports.filter((r) => r.is_archived)
  const totalCommissioned = activeAssessments.length
  const pendingRequests =
    activeAssessments.filter((a) => a.status === "PENDING").length +
    accessRequests.filter((a) => a.status === "PENDING").length
  const completedReports = activeReports.length
  const totalCapacity = subscription
    ? subscription.assessments_limit + subscription.bonus_credits
    : 0
  const usagePercent = totalCapacity > 0
    ? Math.round((subscription!.assessments_used / totalCapacity) * 100)
    : 0
  const isAtLimit = subscription ? subscription.assessments_used >= totalCapacity : false

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading organization dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-slate-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{orgName}</h1>
              <p className="text-sm text-muted-foreground">Organization Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden md:block">
              {user?.name} ({user?.email})
            </span>
            <Button onClick={signOut} variant="outline" size="sm">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-purple-200 bg-purple-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Assessments Commissioned</p>
                  <p className="text-3xl font-bold text-purple-900">{totalCommissioned}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Send className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700">Pending Responses</p>
                  <p className="text-3xl font-bold text-amber-900">{pendingRequests}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Reports Available</p>
                  <p className="text-3xl font-bold text-green-900">{completedReports}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Plan Usage</p>
                  <p className="text-3xl font-bold text-blue-900">
                    {subscription?.assessments_used}/{totalCapacity}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Limit Warning */}
        {subscription && (
          <div className="mb-6">
            <UsageLimitWarning
              currentUsage={subscription.assessments_used}
              planLimit={totalCapacity}
              planName={subscription.tier_name}
              billingPeriodEnd={subscription.next_billing_date}
            />
          </div>
        )}

        {/* Bonus Credits Notice */}
        {subscription && subscription.bonus_credits > 0 && (
          <div className="mb-6 flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
            <ShoppingCart className="h-4 w-4 text-green-600 shrink-0" />
            <span className="text-green-800">
              You have <strong>{subscription.bonus_credits}</strong> extra assessment credit{subscription.bonus_credits !== 1 ? "s" : ""} from one-off purchases.
              Effective capacity: <strong>{totalCapacity}</strong> assessments this period.
            </span>
          </div>
        )}

        {/* Candidate Lookup Bar */}
        <Card className="mb-8 border-purple-200">
          <CardContent className="pt-6">
            <form onSubmit={handleEmailLookup} className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div className="flex-1 w-full">
                <Label htmlFor="candidate-email" className="text-sm font-medium mb-2 block">
                  Look up a candidate by email
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Search for existing participants to request access to their report, or commission a new assessment.
                </p>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="candidate-email"
                    type="email"
                    placeholder="Enter candidate email address..."
                    value={lookupEmail}
                    onChange={(e) => setLookupEmail(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={lookupLoading || !lookupEmail.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {lookupLoading ? "Searching..." : "Search"}
                <Search className="ml-2 h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => openCommissionDialog()}
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <Plus className="mr-2 h-4 w-4" />
                Commission New
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="assessments" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Assessments</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Subscription</span>
            </TabsTrigger>
          </TabsList>

          {/* === OVERVIEW TAB === */}
          <TabsContent value="overview">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest updates across your assessments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sponsoredAssessments
                      .filter((a) => a.status === "DECLINED")
                      .map((a) => (
                        <div
                          key={`decline-${a.id}`}
                          className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200 cursor-pointer hover:bg-red-100 transition-colors"
                          onClick={() => {
                            setSelectedDecline(a)
                            setDeclineDetailOpen(true)
                          }}
                        >
                          <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-red-900">
                              {a.candidate_name} declined your request
                            </p>
                            <p className="text-xs text-red-700 mt-0.5">
                              {a.assessment_name} -- {formatDate(a.responded_at || a.requested_at)}
                            </p>
                            {a.decline_message && (
                              <p className="text-xs text-red-600 mt-1 line-clamp-2 italic">
                                {'"'}{a.decline_message}{'"'}
                              </p>
                            )}
                          </div>
                          <ArrowRight className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                        </div>
                      ))}
                    {sponsoredAssessments
                      .filter((a) => a.status === "COMPLETED")
                      .map((a) => (
                        <div
                          key={`complete-${a.id}`}
                          className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200"
                        >
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-green-900">
                              {a.candidate_name} completed assessment
                            </p>
                            <p className="text-xs text-green-700 mt-0.5">
                              {a.assessment_name} -- {formatDate(a.completed_at || a.requested_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    {sponsoredAssessments
                      .filter((a) => a.status === "ACCEPTED")
                      .map((a) => (
                        <div
                          key={`accepted-${a.id}`}
                          className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200"
                        >
                          <Mail className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-blue-900">
                              {a.candidate_name} accepted -- assessment in progress
                            </p>
                            <p className="text-xs text-blue-700 mt-0.5">
                              {a.assessment_name} -- Accepted {formatDate(a.responded_at || a.requested_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    {accessRequests
                      .filter((a) => a.status === "PENDING")
                      .map((a) => (
                        <div
                          key={`access-${a.id}`}
                          className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200"
                        >
                          <Clock className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-amber-900">
                              Awaiting report access from {a.candidate_name}
                            </p>
                            <p className="text-xs text-amber-700 mt-0.5">
                              {a.assessment_name} -- Requested {formatDate(a.requested_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks for your organization</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full justify-start bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => openCommissionDialog()}
                  >
                    <UserPlus className="mr-3 h-5 w-5" />
                    Commission a New Assessment
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-purple-300 text-purple-700 hover:bg-purple-50"
                    onClick={() => setActiveTab("assessments")}
                  >
                    <Users className="mr-3 h-5 w-5" />
                    View All Assessments
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-purple-300 text-purple-700 hover:bg-purple-50"
                    onClick={() => setActiveTab("reports")}
                  >
                    <FileText className="mr-3 h-5 w-5" />
                    View Available Reports
                  </Button>
                  <Link href="/dashboard/commission/bulk" className="block">
                    <Button
                      variant="outline"
                      className="w-full justify-start border-purple-300 text-purple-700 hover:bg-purple-50"
                    >
                      <Plus className="mr-3 h-5 w-5" />
                      Bulk Commission (CSV Upload)
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-purple-300 text-purple-700 hover:bg-purple-50"
                    onClick={() => setActiveTab("subscription")}
                  >
                    <CreditCard className="mr-3 h-5 w-5" />
                    Manage Subscription
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* === ASSESSMENTS TAB === */}
          <TabsContent value="assessments">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Commissioned Assessments</CardTitle>
                    <CardDescription>
                      Assessment requests sent to candidates on behalf of {orgName}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="show-archived-assessments"
                        checked={showArchivedAssessments}
                        onCheckedChange={setShowArchivedAssessments}
                      />
                      <Label htmlFor="show-archived-assessments" className="text-sm text-muted-foreground cursor-pointer">
                        Show Archived ({archivedAssessments.length})
                      </Label>
                    </div>
                    <Button
                      onClick={() => openCommissionDialog()}
                      disabled={isAtLimit}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Commission New
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Assessment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Response</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeAssessments.map((assessment) => (
                      <TableRow key={assessment.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{assessment.candidate_name}</p>
                            <p className="text-xs text-muted-foreground">{assessment.candidate_email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{assessment.assessment_name}</TableCell>
                        <TableCell>{getStatusBadge(assessment.status)}</TableCell>
                        <TableCell className="text-sm">{formatDate(assessment.requested_at)}</TableCell>
                        <TableCell className="text-sm">
                          {assessment.responded_at ? formatDate(assessment.responded_at) : "--"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {assessment.status === "COMPLETED" && (
                              <Button variant="outline" size="sm" onClick={() => setActiveTab("reports")}>
                                <Eye className="w-4 h-4 mr-1" />
                                Report
                              </Button>
                            )}
                            {assessment.status === "DECLINED" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => { setSelectedDecline(assessment); setDeclineDetailOpen(true) }}
                              >
                                View Response
                              </Button>
                            )}
                            {assessment.status === "PENDING" && (
                              <Badge variant="outline" className="text-muted-foreground">Awaiting</Badge>
                            )}
                            {assessment.status === "ACCEPTED" && (
                              <Badge variant="outline" className="text-blue-700 border-blue-200">In Progress</Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-red-600"
                              disabled={archiving === assessment.id}
                              onClick={() => handleArchive(assessment.id, "assessment")}
                              title="Archive this assessment"
                            >
                              <Archive className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Archived Assessments */}
                {showArchivedAssessments && archivedAssessments.length > 0 && (
                  <div className="mt-6 border-t pt-6">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <Archive className="w-4 h-4" />
                      Archived Assessments
                    </h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Candidate</TableHead>
                          <TableHead>Archived</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {archivedAssessments.map((assessment) => (
                          <TableRow key={assessment.id} className="opacity-60">
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Lock className="w-3 h-3 text-muted-foreground" />
                                <p className="font-medium text-muted-foreground">{assessment.candidate_name}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {assessment.archived_at ? formatDate(assessment.archived_at) : "--"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={archiving === assessment.id}
                                onClick={() => handleRestore(assessment.id, "assessment")}
                                className="text-purple-700 border-purple-300 hover:bg-purple-50"
                              >
                                <RotateCcw className="w-4 h-4 mr-1" />
                                {archiving === assessment.id ? "Restoring..." : "Reactivate"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {isAtLimit && (
                      <p className="text-xs text-amber-700 mt-2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Your plan is at capacity. Upgrade or buy an extra credit to reactivate.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Access Requests Section */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Report Access Requests</CardTitle>
                <CardDescription>
                  Requests to view existing assessment reports from candidates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {accessRequests.length === 0 ? (
                  <p className="text-center text-muted-foreground py-6">
                    No access requests. Use the search bar above to find a candidate and request report access.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Candidate</TableHead>
                        <TableHead>Assessment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Requested</TableHead>
                        <TableHead>Resolved</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accessRequests.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{req.candidate_name}</p>
                              <p className="text-xs text-muted-foreground">{req.candidate_email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{req.assessment_name}</TableCell>
                          <TableCell>{getStatusBadge(req.status)}</TableCell>
                          <TableCell className="text-sm">{formatDate(req.requested_at)}</TableCell>
                          <TableCell className="text-sm">
                            {req.resolved_at ? formatDate(req.resolved_at) : "--"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* === REPORTS TAB === */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Available Reports</CardTitle>
                    <CardDescription>
                      Completed assessment reports available to {orgName}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="show-archived-reports"
                      checked={showArchivedReports}
                      onCheckedChange={setShowArchivedReports}
                    />
                    <Label htmlFor="show-archived-reports" className="text-sm text-muted-foreground cursor-pointer">
                      Show Archived ({archivedReports.length})
                    </Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {activeReports.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">No reports available yet.</p>
                    <p className="text-sm text-muted-foreground">
                      Reports appear here when commissioned assessments are completed or when candidates share their
                      existing reports with your organization.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeReports.map((report) => (
                      <Card
                        key={report.id}
                        className="border-green-200 bg-green-50/30 hover:shadow-md transition-shadow"
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                                <FileText className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{report.candidate_name}</h3>
                                <p className="text-sm text-muted-foreground">{report.assessment_name}</p>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Completed {formatDate(report.completed_at)}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className={
                                      report.source === "Commissioned"
                                        ? "text-purple-700 border-purple-200"
                                        : "text-blue-700 border-blue-200"
                                    }
                                  >
                                    {report.source}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                                onClick={() => router.push(`/organization-report?candidateId=${report.id}`)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Report
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-red-600"
                                disabled={archiving === report.id}
                                onClick={() => handleArchive(report.id, "report")}
                                title="Archive this report"
                              >
                                <Archive className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Archived Reports */}
                {showArchivedReports && archivedReports.length > 0 && (
                  <div className="mt-6 border-t pt-6">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <Archive className="w-4 h-4" />
                      Archived Reports
                    </h4>
                    <div className="space-y-3">
                      {archivedReports.map((report) => (
                        <Card key={report.id} className="border-gray-200 bg-gray-50/50 opacity-60">
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                                <div>
                                  <p className="font-medium text-muted-foreground">{report.candidate_name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Archived {report.archived_at ? formatDate(report.archived_at) : "--"}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={archiving === report.id}
                                onClick={() => handleRestore(report.id, "report")}
                                className="text-purple-700 border-purple-300 hover:bg-purple-50"
                              >
                                <RotateCcw className="w-4 h-4 mr-1" />
                                {archiving === report.id ? "Restoring..." : "Reactivate"}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    {isAtLimit && (
                      <p className="text-xs text-amber-700 mt-2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Your plan is at capacity. Upgrade or buy an extra credit to reactivate.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* === SUBSCRIPTION TAB === */}
          <TabsContent value="subscription">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Current Plan */}
              <Card className="lg:col-span-2 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                    Current Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {subscription && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div>
                          <h3 className="text-2xl font-bold text-purple-900">{subscription.tier_name}</h3>
                          <p className="text-sm text-purple-700">
                            Up to {subscription.assessments_limit} assessments per month
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-purple-900">
                            ${subscription.amount}
                          </p>
                          <p className="text-sm text-purple-700">per {subscription.billing_cycle === "annual" ? "year" : "month"}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm font-medium text-muted-foreground">Usage This Period</p>
                          <p className="text-2xl font-bold mt-1">
                            {subscription.assessments_used} of {totalCapacity}
                          </p>
                          {subscription.bonus_credits > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              ({subscription.assessments_limit} plan + {subscription.bonus_credits} bonus)
                            </p>
                          )}
                          <div className="mt-2 w-full bg-purple-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(usagePercent, 100)}%` }}
                            />
                          </div>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm font-medium text-muted-foreground">Next Billing Date</p>
                          <p className="text-2xl font-bold mt-1">
                            {formatDate(subscription.next_billing_date)}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Status:{" "}
                            <span className="text-green-600 font-medium">{subscription.status}</span>
                          </p>
                        </div>
                      </div>

                      {/* Buy Extra Assessment */}
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-900">Need more this month?</p>
                            <p className="text-xs text-green-700 mt-0.5">
                              Buy individual assessment credits at $9 each -- no plan change needed.
                            </p>
                          </div>
                          <Button
                            onClick={handlePurchaseCredit}
                            disabled={purchasing}
                            className="bg-green-700 hover:bg-green-800 text-white shrink-0"
                          >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            {purchasing ? "Processing..." : "Buy Credit -- $9"}
                          </Button>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Link href="/subscription/manage" className="flex-1">
                          <Button
                            variant="outline"
                            className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                          >
                            Change Plan
                          </Button>
                        </Link>
                        <Link href="/pricing" className="flex-1">
                          <Button
                            variant="outline"
                            className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                          >
                            View All Plans
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Available Plans Quick View */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Available Plans</CardTitle>
                  <CardDescription>Upgrade or downgrade anytime</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {SUBSCRIPTION_TIERS.filter((t) => t.id !== "FREE").map((tier) => (
                    <div
                      key={tier.id}
                      className={`p-3 rounded-lg border transition-colors ${
                        tier.id === subscription?.tier
                          ? "bg-purple-50 border-purple-300"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{tier.name}</p>
                          <p className="text-xs text-muted-foreground">{tier.assessments}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">${tier.monthly}/mo</p>
                          {tier.id === subscription?.tier && (
                            <Badge className="bg-purple-100 text-purple-800 border-purple-300 text-xs mt-1">
                              Current
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* === DIALOGS === */}

      {/* Existing User Dialog */}
      {lookupResult && (
        <ExistingUserDialog
          isOpen={existingUserDialogOpen}
          onClose={() => setExistingUserDialogOpen(false)}
          onRequestAccess={handleRequestAccess}
          onCreateNew={() => openCommissionDialog(lookupEmail)}
          candidateData={{
            name: lookupResult.name || lookupEmail.split("@")[0],
            email: lookupEmail,
            existingAssessments: lookupResult.existingAssessments || [],
          }}
          organizationName={orgName}
        />
      )}

      {/* Not Found Dialog */}
      <Dialog open={notFoundDialogOpen} onOpenChange={setNotFoundDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Candidate Not Found
            </DialogTitle>
            <DialogDescription>
              No account was found for <strong>{lookupEmail}</strong> in the Coaching Digs system.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              This person does not have an existing assessment. You can commission a new assessment, and they will
              receive an invitation to create an account and complete it.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setNotFoundDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => openCommissionDialog(lookupEmail)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Commission New Assessment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Commission Dialog */}
      <Dialog open={commissionDialogOpen} onOpenChange={setCommissionDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-purple-600" />
              Commission New Assessment
            </DialogTitle>
            <DialogDescription>
              Send an invitation for a candidate to complete a Coachability Assessment sponsored by {orgName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="commission-name">Candidate Name</Label>
              <Input
                id="commission-name"
                value={commissionForm.name}
                onChange={(e) => setCommissionForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="commission-email">Candidate Email</Label>
              <Input
                id="commission-email"
                type="email"
                value={commissionForm.email}
                onChange={(e) => setCommissionForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="candidate@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="commission-message">Personal Message (sent with invitation)</Label>
              <Textarea
                id="commission-message"
                value={commissionForm.message}
                onChange={(e) => setCommissionForm((p) => ({ ...p, message: e.target.value }))}
                rows={4}
              />
            </div>

            {/* Over-limit error with purchase option */}
            {overLimitError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Plan limit reached</p>
                    <p className="text-xs text-red-700 mt-0.5">
                      You have used {overLimitError.used} of {overLimitError.limit + overLimitError.bonusCredits} assessments this billing period.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handlePurchaseCredit}
                    disabled={purchasing}
                    className="bg-green-700 hover:bg-green-800 text-white"
                  >
                    <ShoppingCart className="mr-1 h-3 w-3" />
                    {purchasing ? "Processing..." : "Buy 1 Credit -- $9"}
                  </Button>
                  <Link href="/subscription/manage">
                    <Button size="sm" variant="outline" className="border-purple-300 text-purple-700">
                      <CreditCard className="mr-1 h-3 w-3" />
                      Upgrade Plan
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setCommissionDialogOpen(false); setOverLimitError(null) }}>
              Cancel
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={handleCommissionWithLimitCheck}
              disabled={commissioning}
            >
              {commissioning ? "Sending..." : "Send Invitation"}
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decline Detail Dialog */}
      <Dialog open={declineDetailOpen} onOpenChange={setDeclineDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Assessment Request Declined
            </DialogTitle>
            {selectedDecline && (
              <DialogDescription>
                {selectedDecline.candidate_name} declined your assessment request.
              </DialogDescription>
            )}
          </DialogHeader>
          {selectedDecline && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Candidate</p>
                  <p>{selectedDecline.candidate_name}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Assessment</p>
                  <p>{selectedDecline.assessment_name}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Requested</p>
                  <p>{formatDate(selectedDecline.requested_at)}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Declined</p>
                  <p>{selectedDecline.responded_at ? formatDate(selectedDecline.responded_at) : "--"}</p>
                </div>
              </div>
              {selectedDecline.decline_message && (
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <p className="text-sm font-medium mb-2">Message from candidate:</p>
                  <p className="text-sm text-muted-foreground italic leading-relaxed">
                    {'"'}{selectedDecline.decline_message}{'"'}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeclineDetailOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
