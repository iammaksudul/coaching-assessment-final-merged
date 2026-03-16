"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileText, Clock, CheckCircle, AlertCircle, User, Plus, Users, Calendar, UserCheck, Building2, XCircle, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AdminDashboard } from "@/components/admin-dashboard"

interface Assessment {
  id: string
  name: string
  status: string
  created_at: string
  updated_at: string
  referee_count: number
  completion_rate: number
  description: string
  purpose: string
}

interface AccessRequest {
  id: string
  assessment_id: string
  assessment_name: string
  requesting_organization_name: string
  requested_by_name: string
  status: string
  request_message: string
  requested_at: string
  expires_at: string
}

interface SponsoredRequest {
  id: string
  organization_name: string
  requested_by_name: string
  requested_by_title: string
  assessment_name: string
  request_message: string
  status: string
  requested_at: string
  expires_at: string
}

interface RefereeInvitation {
  id: string
  candidate_name: string
  candidate_email: string
  assessment_name: string
  organization_name: string | null
  invited_by: string
  status: string
  invited_at: string
  expires_at?: string
  completed_at?: string
  survey_token: string
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([])
  const [refereeInvitations, setRefereeInvitations] = useState<RefereeInvitation[]>([])
  const [sponsoredRequests, setSponsoredRequests] = useState<SponsoredRequest[]>([])
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false)
  const [declineRequestId, setDeclineRequestId] = useState<string | null>(null)
  const [declineMessage, setDeclineMessage] = useState("")
  const [respondingTo, setRespondingTo] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Get initial tab from URL params
  const initialTab = searchParams.get("tab") || "assessments"

  useEffect(() => {
    // Wait for auth to finish loading before making redirect decisions
    if (authLoading) return

    if (!user) {
      router.push("/login")
      return
    }

    // Redirect employers to organization dashboard
    if (user.role === "EMPLOYER" || user.accountType === "EMPLOYER") {
      router.push("/organization-dashboard")
      return
    }

    // Only load data for non-admin users
    if (user.role !== "ADMIN") {
      fetchUserData()
    }
  }, [user, authLoading, router])

  // Early return for admin users - no data loading needed
  if (user?.role === "ADMIN") {
    return <AdminDashboard />
  }

  const fetchUserData = async () => {
    try {
      // Pre-defined user data to avoid heavy computation
      const userData = getUserData(user.id)

  setAssessments(userData.assessments)
  setAccessRequests(userData.accessRequests)
  setRefereeInvitations(userData.refereeInvitations)
  setSponsoredRequests(userData.sponsoredRequests || [])
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Optimized data lookup function
  const getUserData = (userId: string) => {
    const userDataMap: Record<string, any> = {
      "alex-johnson-preview": {
        assessments: [
          {
            id: "alex-assessment-1",
            name: "Leadership Development Assessment",
            status: "COMPLETED",
            created_at: "2024-01-15T10:00:00Z",
            updated_at: "2024-01-20T15:30:00Z",
            referee_count: 3,
            completion_rate: 100,
            description: "Personal leadership assessment for career development",
            purpose: "Career Development",
          },
          {
            id: "alex-assessment-2",
            name: "Q1 Performance Review Assessment",
            status: "IN_PROGRESS",
            created_at: "2024-01-25T09:00:00Z",
            updated_at: "2024-01-25T09:00:00Z",
            referee_count: 2,
            completion_rate: 60,
            description: "Quarterly performance and growth assessment",
            purpose: "Performance Review",
          },
        ],
        accessRequests: [
          {
            id: "alex-access-req-1",
            assessment_id: "alex-assessment-1",
            assessment_name: "Leadership Development Assessment",
            requesting_organization_name: "Preview Organization",
            requested_by_name: "John Smith",
            status: "PENDING",
            request_message:
              "We would like to review your Leadership Development Assessment as part of our hiring evaluation process.",
            requested_at: "2024-01-20T10:00:00Z",
            expires_at: "2024-02-20T10:00:00Z",
          },
        ],
        refereeInvitations: [],
        sponsoredRequests: [
          {
            id: "sponsored-req-1",
            organization_name: "Global Tech Solutions",
            requested_by_name: "Maria Rodriguez",
            requested_by_title: "VP of Talent Development",
            assessment_name: "Executive Leadership Coachability Assessment",
            request_message:
              "As part of our leadership development initiative, we invite you to complete a coachability assessment. This will help us design a personalized development program for your role in our upcoming project.",
            status: "PENDING",
            requested_at: "2024-02-01T09:00:00Z",
            expires_at: "2024-03-01T09:00:00Z",
          },
          {
            id: "sponsored-req-2",
            organization_name: "Pinnacle Consulting Group",
            requested_by_name: "James Chen",
            requested_by_title: "Director of Executive Coaching",
            assessment_name: "Team Dynamics Coachability Review",
            request_message:
              "We are conducting a team dynamics review and would appreciate your participation in a coachability assessment. Your results will be used to help design team coaching interventions.",
            status: "PENDING",
            requested_at: "2024-02-05T14:00:00Z",
            expires_at: "2024-03-05T14:00:00Z",
          },
        ],
      },
      "sarah-wilson-preview": {
        assessments: [
          {
            id: "sarah-assessment-1",
            name: "Personal Development Assessment",
            status: "COMPLETED",
            created_at: "2024-01-10T14:00:00Z",
            updated_at: "2024-01-15T16:45:00Z",
            referee_count: 4,
            completion_rate: 100,
            description: "Comprehensive personal development evaluation",
            purpose: "Personal Growth",
          },
          {
            id: "sarah-assessment-2",
            name: "Career Growth Assessment",
            status: "IN_PROGRESS",
            created_at: "2024-02-01T10:30:00Z",
            updated_at: "2024-02-01T10:30:00Z",
            referee_count: 2,
            completion_rate: 40,
            description: "Assessment focused on career advancement opportunities",
            purpose: "Career Planning",
          },
        ],
        accessRequests: [
          {
            id: "sarah-access-req-1",
            assessment_id: "sarah-assessment-1",
            assessment_name: "Personal Development Assessment",
            requesting_organization_name: "Tech Innovations Inc",
            requested_by_name: "HR Manager",
            status: "PENDING",
            request_message: "We are interested in reviewing your assessment for a senior role opportunity.",
            requested_at: "2024-01-25T14:00:00Z",
            expires_at: "2024-02-25T14:00:00Z",
          },
        ],
        refereeInvitations: [
          {
            id: "ref-inv-4",
            candidate_name: "David Martinez",
            candidate_email: "david.martinez@preview.com",
            assessment_name: "Senior Leadership Evaluation",
            organization_name: "Global Tech Solutions",
            invited_by: "Maria Rodriguez",
            status: "PENDING",
            invited_at: "2024-02-10T08:30:00Z",
            expires_at: "2024-03-15T08:30:00Z",
            survey_token: "survey-token-david-2024",
          },
          {
            id: "ref-inv-1",
            candidate_name: "Alex Johnson",
            candidate_email: "alex.johnson@preview.com",
            assessment_name: "Leadership Development Assessment",
            organization_name: "Preview Organization",
            invited_by: "John Smith",
            status: "PENDING",
            invited_at: "2024-01-20T10:00:00Z",
            expires_at: "2024-02-20T10:00:00Z",
            survey_token: "survey-token-alex-123",
          },
          {
            id: "ref-inv-2",
            candidate_name: "Mike Chen",
            candidate_email: "mike.chen@preview.com",
            assessment_name: "Executive Coaching Assessment",
            organization_name: "Tech Solutions Inc",
            invited_by: "Lisa Park",
            status: "COMPLETED",
            invited_at: "2024-01-15T14:30:00Z",
            completed_at: "2024-01-18T16:45:00Z",
            survey_token: "survey-token-mike-456",
          },
          {
            id: "ref-inv-3",
            candidate_name: "Jennifer Adams",
            candidate_email: "jennifer.adams@preview.com",
            assessment_name: "Management Development Assessment",
            organization_name: null,
            invited_by: "Jennifer Adams",
            status: "PENDING",
            invited_at: "2024-02-01T09:15:00Z",
            expires_at: "2024-03-01T09:15:00Z",
            survey_token: "survey-token-jennifer-789",
          },
        ],
      },
      "mike-chen-preview": {
        assessments: [
          {
            id: "mike-assessment-1",
            name: "Technical Leadership Assessment",
            status: "COMPLETED",
            created_at: "2024-01-20T13:00:00Z",
            updated_at: "2024-01-25T15:20:00Z",
            referee_count: 3,
            completion_rate: 100,
            description: "Assessment of technical leadership and mentoring skills",
            purpose: "Leadership Development",
          },
        ],
        accessRequests: [],
        refereeInvitations: [],
      },
    }

    return userDataMap[userId] || { assessments: [], accessRequests: [], refereeInvitations: [] }
  }

  const getStatusBadge = (status: string, type: "assessment" | "referee" = "assessment") => {
    if (type === "referee") {
      const statusConfig = {
        COMPLETED: { variant: "default" as const, className: "bg-green-600 text-white", label: "Completed" },
        PENDING: { variant: "secondary" as const, className: "bg-amber-100 text-amber-800", label: "Pending" },
        EXPIRED: { variant: "outline" as const, className: "text-gray-600 border-gray-300", label: "Expired" },
      }

      const config = statusConfig[status as keyof typeof statusConfig] || {
        variant: "outline" as const,
        className: "text-gray-600 border-gray-300",
        label: status,
      }

      return (
        <Badge variant={config.variant} className={config.className}>
          {config.label}
        </Badge>
      )
    }

    const statusConfig = {
      COMPLETED: { variant: "default" as const, className: "bg-green-600 text-white", label: "Completed" },
      IN_PROGRESS: { variant: "secondary" as const, className: "bg-blue-100 text-blue-800", label: "In Progress" },
      DRAFT: { variant: "outline" as const, className: "text-gray-600 border-gray-300", label: "Draft" },
      PENDING: { variant: "secondary" as const, className: "bg-amber-100 text-amber-800", label: "Pending" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: "outline" as const,
      className: "text-gray-600 border-gray-300",
      label: status,
    }

    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const getStatusIcon = (status: string, type: "assessment" | "referee" = "assessment") => {
    if (type === "referee") {
      switch (status) {
        case "COMPLETED":
          return <CheckCircle className="w-4 h-4 text-green-600" />
        case "PENDING":
          return <Clock className="w-4 h-4 text-amber-600" />
        case "EXPIRED":
          return <AlertCircle className="w-4 h-4 text-gray-600" />
        default:
          return <Clock className="w-4 h-4 text-gray-600" />
      }
    }

    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "IN_PROGRESS":
        return <Clock className="w-4 h-4 text-blue-600" />
      case "PENDING":
        return <Clock className="w-4 h-4 text-amber-600" />
      case "DRAFT":
        return <FileText className="w-4 h-4 text-gray-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getCompletionBadge = (rate: number) => {
    if (rate === 100) {
      return <Badge className="bg-green-100 text-green-800">{rate}%</Badge>
    } else if (rate >= 50) {
      return <Badge className="bg-amber-100 text-amber-800">{rate}%</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-800">{rate}%</Badge>
    }
  }

  const handleSponsoredResponse = async (requestId: string, action: "accept" | "decline", message?: string) => {
    setRespondingTo(requestId)
    try {
      const res = await fetch("/api/sponsored-requests/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
        },
        body: JSON.stringify({
          requestId,
          action,
          ...(action === "decline" && message ? { declineMessage: message } : {}),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setSponsoredRequests((prev) =>
          prev.map((r) =>
            r.id === requestId
              ? { ...r, status: action === "accept" ? "ACCEPTED" : "DECLINED" }
              : r
          )
        )
        // The API response includes adminNotification payload that will be
        // delivered to the organization admin's dashboard
        console.log("Admin notification queued:", data.response?.adminNotification)
      }
    } catch (error) {
      console.error("Failed to respond to sponsored request:", error)
    } finally {
      setRespondingTo(null)
    }
  }

  const openDeclineDialog = (requestId: string) => {
    setDeclineRequestId(requestId)
    setDeclineMessage("")
    setDeclineDialogOpen(true)
  }

  const confirmDecline = async () => {
    if (!declineRequestId) return
    await handleSponsoredResponse(declineRequestId, "decline", declineMessage)
    setDeclineDialogOpen(false)
    setDeclineRequestId(null)
    setDeclineMessage("")
  }

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true })
  }

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Calculate summary stats
  const completedAssessments = assessments.filter((a) => a.status === "COMPLETED").length
  const inProgressAssessments = assessments.filter((a) => a.status === "IN_PROGRESS").length
  const pendingRequests = accessRequests.filter((r) => r.status === "PENDING").length
  const pendingRefereeInvitations = refereeInvitations.filter((r) => r.status === "PENDING").length
  const completedRefereeInvitations = refereeInvitations.filter((r) => r.status === "COMPLETED").length

  // Determine if user is a referee
  const isReferee = user.role === "REFEREE" || refereeInvitations.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome back, {user.name}!{isReferee && <span className="text-blue-600 ml-2">(Referee)</span>}
          </h1>
          <p className="text-lg text-muted-foreground">
            {isReferee
              ? "Manage your personal assessments and complete referee evaluations"
              : "Manage your personal assessments and development journey"}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/assessments/create">
            <Button size="lg" className="px-8">
              <Plus className="w-4 h-4 mr-2" />
              Create Assessment
            </Button>
          </Link>
        </div>
      </div>

      {/* Alerts */}
      {pendingRequests > 0 && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            You have {pendingRequests} pending access request{pendingRequests > 1 ? "s" : ""} for your assessments.
          </AlertDescription>
        </Alert>
      )}

      {pendingRefereeInvitations > 0 && (
        <Alert className="bg-amber-50 border-amber-200">
          <UserCheck className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            You have {pendingRefereeInvitations} pending referee invitation{pendingRefereeInvitations > 1 ? "s" : ""} to
            complete.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Assessments</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assessments.length}</div>
            <p className="text-xs text-muted-foreground">Personal assessments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedAssessments}</div>
            <p className="text-xs text-muted-foreground">Ready to view</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgressAssessments}</div>
            <p className="text-xs text-muted-foreground">Continue working</p>
          </CardContent>
        </Card>

        {isReferee && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Referee Tasks</CardTitle>
                <UserCheck className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">{pendingRefereeInvitations}</div>
                <p className="text-xs text-muted-foreground">Pending completion</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Referee Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{completedRefereeInvitations}</div>
                <p className="text-xs text-muted-foreground">Assessments completed</p>
              </CardContent>
            </Card>
          </>
        )}

        {!isReferee && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Access Requests</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{pendingRequests}</div>
              <p className="text-xs text-muted-foreground">Pending approval</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue={initialTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="assessments" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            My Assessments ({assessments.length})
          </TabsTrigger>
          {isReferee && (
            <TabsTrigger value="referee" className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Referee Invitations ({refereeInvitations.length})
            </TabsTrigger>
          )}
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Access Requests ({accessRequests.length})
          </TabsTrigger>
          <TabsTrigger value="sponsored" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Requests from Other(s) ({sponsoredRequests.filter(r => r.status === "PENDING").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assessments">
          <Card>
            <CardHeader>
              <CardTitle>My Personal Assessments</CardTitle>
              <CardDescription>Your personal coachability assessments and development reports</CardDescription>
            </CardHeader>
            <CardContent>
              {assessments.length === 0 ? (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">You haven't created any assessments yet.</p>
                  <Link href="/dashboard/assessments/create">
                    <Button>Create Your First Assessment</Button>
                  </Link>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Assessment Details</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Referees</TableHead>
                      <TableHead className="text-center">Completion</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assessments.map((assessment) => (
                      <TableRow key={assessment.id}>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="font-semibold">{assessment.name}</div>
                            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                              {assessment.description}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {assessment.purpose}
                              </Badge>
                              <span className="text-xs text-muted-foreground">• 12 Domains</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(assessment.status)}
                            {getStatusBadge(assessment.status)}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-base font-medium">{assessment.referee_count || 0}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          {getCompletionBadge(assessment.completion_rate || 0)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(assessment.created_at)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(assessment.updated_at || assessment.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            {assessment.status === "COMPLETED" ? (
                              <Link href={`/dashboard/reports/${assessment.id}`}>
                                <Button variant="outline" size="sm">
                                  View Report
                                </Button>
                              </Link>
                            ) : (
                              <Link href={`/dashboard/assessments/new?assessmentId=${assessment.id}`}>
                                <Button variant="outline" size="sm">
                                  Continue
                                </Button>
                              </Link>
                            )}

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

        {isReferee && (
          <TabsContent value="referee">
            <Card>
              <CardHeader>
                <CardTitle>Referee Invitations</CardTitle>
                <CardDescription>
                  Complete coachability assessments for candidates who have requested your feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                {refereeInvitations.length === 0 ? (
                  <div className="text-center py-8">
                    <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">You don't have any referee invitations at this time.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">Candidate</TableHead>
                        <TableHead className="w-[200px]">Assessment</TableHead>
                        <TableHead className="w-[150px]">Organization</TableHead>
                        <TableHead className="w-[120px]">Status</TableHead>
                        <TableHead className="w-[140px]">Invited</TableHead>
                        <TableHead className="w-[140px]">Expires</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {refereeInvitations.map((invitation) => (
                        <TableRow key={invitation.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-semibold text-base">{invitation.candidate_name}</p>
                              <p className="text-sm text-muted-foreground">{invitation.candidate_email}</p>
                              <p className="text-xs text-muted-foreground">Invited by: {invitation.invited_by}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{invitation.assessment_name}</p>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{invitation.organization_name || "Personal Assessment"}</p>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(invitation.status, "referee")}
                              {getStatusBadge(invitation.status, "referee")}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(invitation.invited_at)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {invitation.status === "PENDING" && invitation.expires_at && (
                              <span className={isExpired(invitation.expires_at) ? "text-red-600" : ""}>
                                {formatDate(invitation.expires_at)}
                              </span>
                            )}
                            {invitation.status === "COMPLETED" && invitation.completed_at && (
                              <span className="text-green-600">{formatDate(invitation.completed_at)}</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              {invitation.status === "PENDING" && (
                                <Link href={`/referee-survey/${invitation.survey_token}`}>
                                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white px-4">
                                    Complete Survey
                                  </Button>
                                </Link>
                              )}
                              {invitation.status === "COMPLETED" && (
                                <Link href={`/referee-responses/${invitation.survey_token}`}>
                                  <Button variant="outline" size="sm" className="px-4 bg-transparent">
                                    View My Responses
                                  </Button>
                                </Link>
                              )}
                              {invitation.status === "EXPIRED" && (
                                <Badge variant="destructive" className="px-3 py-1">
                                  Expired
                                </Badge>
                              )}
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
        )}

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Access Requests</CardTitle>
              <CardDescription>Organizations requesting access to your assessment reports</CardDescription>
            </CardHeader>
            <CardContent>
              {accessRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No access requests yet.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Assessment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accessRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{request.requesting_organization_name}</div>
                            <div className="text-sm text-muted-foreground">by {request.requested_by_name}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{request.assessment_name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(request.status)}
                            {getStatusBadge(request.status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate text-sm">{request.request_message}</div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(request.requested_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {formatDate(request.expires_at)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            {request.status === "PENDING" ? (
                              <>
                                <Button variant="outline" size="sm">
                                  Approve
                                </Button>
                                <Button variant="ghost" size="sm">
                                  Decline
                                </Button>
                              </>
                            ) : (
                              <Badge variant="outline">{request.status}</Badge>
                            )}
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

        <TabsContent value="sponsored">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Requests from Organizations</CardTitle>
              <CardDescription>
                Organizations that have invited you to complete a coachability assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sponsoredRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No assessment requests from organizations at this time.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sponsoredRequests.map((request) => (
                    <Card
                      key={request.id}
                      className={`border ${
                        request.status === "PENDING"
                          ? "border-blue-200 bg-blue-50/30"
                          : request.status === "ACCEPTED"
                            ? "border-green-200 bg-green-50/30"
                            : "border-muted"
                      }`}
                    >
                      <CardContent className="pt-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <Building2 className="h-5 w-5 text-blue-600 shrink-0" />
                              <div>
                                <h3 className="font-semibold text-base">{request.organization_name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Requested by {request.requested_by_name}, {request.requested_by_title}
                                </p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Assessment: {request.assessment_name}</p>
                            </div>
                            <div className="bg-background rounded-md border p-3">
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {request.request_message}
                              </p>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Requested {formatDate(request.requested_at)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Expires {formatDate(request.expires_at)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {request.status === "PENDING" ? (
                              <>
                                <Button
                                  size="sm"
                                  disabled={respondingTo === request.id}
                                  onClick={() => handleSponsoredResponse(request.id, "accept")}
                                >
                                  {respondingTo === request.id ? (
                                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                  )}
                                  Accept & Complete Assessment
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={respondingTo === request.id}
                                  onClick={() => openDeclineDialog(request.id)}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Politely Decline
                                </Button>
                              </>
                            ) : request.status === "ACCEPTED" ? (
                              <Badge className="bg-green-100 text-green-800 border-green-300">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Accepted
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-muted-foreground">
                                <XCircle className="w-3 h-3 mr-1" />
                                Declined
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

  </Tabs>

      {/* Decline Request Dialog */}
      <Dialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Decline Assessment Request
            </DialogTitle>
            <DialogDescription>
              You may optionally include a message to the organization explaining your decision. This will be shared with the requesting admin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="decline-message">Message (optional)</Label>
              <Textarea
                id="decline-message"
                placeholder="Thank you for the opportunity, but I am unable to participate at this time..."
                value={declineMessage}
                onChange={(e) => setDeclineMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeclineDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDecline}
              disabled={respondingTo !== null}
            >
              {respondingTo ? "Sending..." : "Confirm Decline"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
