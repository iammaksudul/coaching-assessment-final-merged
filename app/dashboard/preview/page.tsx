"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useSession } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bell, CheckCircle2, Clock, Users } from "lucide-react"

type Assessment = {
  id: string
  name: string
  status: string
  created_at: string
  updated_at: string
  sponsored_by: string | null
  type: string
  sponsor_contact?: string
  sponsor_message?: string
  expires_at?: string
}

type RefereeInvitation = {
  id: string
  candidate_name: string
  assessment_name: string
  invited_at: string
  status: string
  survey_token: string
  relationship: string
}

const getUserMockData = (userName: string) => {
  const trimmedUserName = userName?.trim()

  // Different mock data based on user name
  if (trimmedUserName === "Alex Johnson") {
    return {
      assessments: [
        {
          id: "1",
          name: "Leadership Development Assessment",
          status: "COMPLETED",
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-20T15:30:00Z",
          sponsored_by: null,
          type: "SELF_INITIATED",
        },
        {
          id: "2",
          name: "Q1 Performance Review",
          status: "PENDING_CONSENT",
          created_at: "2024-01-25T09:00:00Z",
          updated_at: "2024-01-25T09:00:00Z",
          sponsored_by: "TechCorp Solutions",
          sponsor_contact: "Sarah Johnson (HR Director)",
          sponsor_message:
            "Hi Alex, we'd like you to complete this coachability assessment as part of our Q1 performance review process.",
          expires_at: "2024-03-15T23:59:59Z",
          type: "EMPLOYER_COMMISSIONED",
        },
        {
          id: "3",
          name: "Senior Developer Role Assessment",
          status: "IN_PROGRESS",
          created_at: "2024-01-20T14:00:00Z",
          updated_at: "2024-01-22T10:30:00Z",
          sponsored_by: "InnovateTech Inc",
          sponsor_contact: "Michael Chen (Engineering Manager)",
          sponsor_message:
            "As part of your application for the Senior Developer position, we'd appreciate you completing this assessment.",
          expires_at: "2024-02-28T23:59:59Z",
          type: "EMPLOYER_COMMISSIONED",
        },
      ],
      refereeInvitations: [],
    }
  } else if (trimmedUserName === "Sarah Wilson") {
    return {
      assessments: [
        {
          id: "4",
          name: "Professional Development Assessment",
          status: "COMPLETED",
          created_at: "2024-01-10T08:00:00Z",
          updated_at: "2024-01-15T12:00:00Z",
          sponsored_by: null,
          type: "SELF_INITIATED",
        },
      ],
      refereeInvitations: [
        {
          id: "ref-1",
          candidate_name: "Alex Johnson",
          assessment_name: "Leadership Development Assessment",
          invited_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: "PENDING",
          survey_token: "survey-token-alex-123",
          relationship: "Colleague",
        },
        {
          id: "ref-2",
          candidate_name: "Mike Chen",
          assessment_name: "Executive Coaching Assessment",
          invited_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          status: "PENDING",
          survey_token: "survey-token-mike-456",
          relationship: "Manager",
        },
        {
          id: "ref-3",
          candidate_name: "Jennifer Adams",
          assessment_name: "Team Leadership Assessment",
          invited_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: "PENDING",
          survey_token: "survey-token-jennifer-789",
          relationship: "Direct Report",
        },
      ],
    }
  } else {
    return {
      assessments: [
        {
          id: "default-1",
          name: "Sample Assessment",
          status: "COMPLETED",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sponsored_by: null,
          type: "SELF_INITIATED",
        },
      ],
      refereeInvitations: [],
    }
  }
}

export default function DashboardPreviewPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [refereeInvitations, setRefereeInvitations] = useState<RefereeInvitation[]>([])

  const userName = session?.user?.name
  const userRole = session?.user?.role

  useEffect(() => {
    if (status === "loading") return
    if (!userName) return

    const mockData = getUserMockData(userName)
    setAssessments(mockData.assessments)
    setRefereeInvitations(mockData.refereeInvitations)
  }, [userName, status]) // Depend on primitive values, not objects

  const completedAssessments = assessments.filter((a) => a.status === "COMPLETED").length
  const pendingConsent = assessments.filter((a) => a.status === "PENDING_CONSENT").length
  const pendingRefereeInvitations = refereeInvitations.filter((inv) => inv.status === "PENDING").length
  const completedRefereeInvitations = refereeInvitations.filter((inv) => inv.status === "COMPLETED").length
  const isReferee = userRole === "REFEREE" || userRole === "REFEREE_PARTICIPANT"

  const getStatusBadge = (status: string, type: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        )
      case "IN_PROGRESS":
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        )
      case "PENDING_CONSENT":
        return (
          <Badge variant="outline" className="border-orange-200 text-orange-800">
            <Bell className="w-3 h-3 mr-1" />
            Awaiting Consent
          </Badge>
        )
      case "PENDING":
        return <Badge variant="outline">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getSponsorIcon = (type: string) => {
    if (type === "EMPLOYER_COMMISSIONED") {
      return <Users className="w-4 h-4 text-blue-600" />
    }
    return null
  }

  const formatDistanceToNow = (date: Date, options?: any) => {
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return options?.addSuffix ? "today" : "Today"
    if (diffInDays === 1) return options?.addSuffix ? "yesterday" : "Yesterday"
    if (diffInDays < 0) return `in ${Math.abs(diffInDays)} days`
    return `${diffInDays} days ago`
  }

  const formatExpirationDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays <= 0) return "Expired"
    if (diffInDays === 1) return "Expires tomorrow"
    if (diffInDays <= 7) return `Expires in ${diffInDays} days`
    if (diffInDays <= 30) return `Expires in ${diffInDays} days`
    return `Expires ${date.toLocaleDateString()}`
  }

  const handleAcceptCommission = (assessment: Assessment) => {
    // setSelectedAssessment(assessment)
    // setConsentDialogOpen(true)
  }

  const handleConsentProvided = (consents: any) => {
    // setAssessments((prev) => prev.map((a) => (a.id === selectedAssessment.id ? { ...a, status: "IN_PROGRESS" } : a)))
    // alert(
    //   `Consent provided! Assessment "${selectedAssessment.name}" is now active. You can begin completing your assessment.`,
    // )
    // setSelectedAssessment(null)
  }

  const handleDeclineAssessment = (assessmentId: string, sponsorName: string) => {
    const confirmed = confirm(
      `Are you sure you want to decline the assessment from ${sponsorName}? A polite message will be sent to inform them of your decision.`,
    )
    if (confirmed) {
      setAssessments((prev) => prev.map((a) => (a.id === assessmentId ? { ...a, status: "DECLINED" } : a)))
      alert(`Assessment declined. A message has been sent to ${sponsorName} informing them of your decision.`)
    }
  }

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {userName}!</p>
      </div>

      {/* Pending Consent Alerts */}
      {pendingConsent > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <Bell className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            You have {pendingConsent} assessment{pendingConsent > 1 ? "s" : ""} from employer
            {pendingConsent > 1 ? "s" : ""} awaiting your consent. Please review and respond below.
          </AlertDescription>
        </Alert>
      )}

      {/* Getting Started - Central focus */}
      <Card className="bg-blue-50/50">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Follow these steps to complete your coachability assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-muted">1</div>
              <div>
                <h3 className="font-medium">Create & Name Your Assessment</h3>
                <p className="text-sm text-muted-foreground">
                  Start a new assessment and give it a meaningful name (e.g., "Q1 Performance Review")
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-muted">2</div>
              <div>
                <h3 className="font-medium">Complete Self-Assessment</h3>
                <p className="text-sm text-muted-foreground">
                  Answer questions about your coachability across 12 dimensions
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-muted">3</div>
              <div>
                <h3 className="font-medium">Select Referees</h3>
                <p className="text-sm text-muted-foreground">
                  Choose at least 2 people from your referee pool (or add new ones) for this assessment
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-muted">
                {completedRefereeInvitations >= 2 ? "✓" : "4"}
              </div>
              <div>
                <h3 className="font-medium">View Your Report</h3>
                <p className="text-sm text-muted-foreground">
                  Once referees complete their assessments, view your comprehensive report
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Self-Assessments - Central focus */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Your Assessments</CardTitle>
            <CardDescription>
              Manage your coachability assessments (self-initiated and employer-commissioned)
            </CardDescription>
          </div>
          <Link href="/dashboard/assessments/create">
            <Button>Create New Assessment</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assessment Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessments.map((assessment) => (
                <TableRow key={assessment.id} className={assessment.status === "PENDING_CONSENT" ? "bg-orange-50" : ""}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getSponsorIcon(assessment.type)}
                      <div>
                        <div className="font-medium">{assessment.name}</div>
                        {assessment.sponsored_by && (
                          <div className="text-sm text-muted-foreground">Requested by {assessment.sponsored_by}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {assessment.type === "EMPLOYER_COMMISSIONED" ? (
                      <Badge variant="outline" className="text-blue-700 border-blue-200">
                        <Users className="w-3 h-3 mr-1" />
                        Employer
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Self</Badge>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(assessment.status, assessment.type)}</TableCell>
                  <TableCell>{formatDistanceToNow(new Date(assessment.created_at))}</TableCell>
                  <TableCell>
                    {assessment.expires_at ? (
                      <span
                        className={
                          new Date(assessment.expires_at) < new Date()
                            ? "text-red-600"
                            : new Date(assessment.expires_at).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000
                              ? "text-orange-600"
                              : "text-muted-foreground"
                        }
                      >
                        {formatExpirationDate(assessment.expires_at)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">No expiration</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {assessment.status === "PENDING_CONSENT" ? (
                      <Button size="sm" onClick={() => handleAcceptCommission(assessment)}>
                        Review Request
                      </Button>
                    ) : assessment.status === "COMPLETED" ? (
                      <Link href={`/dashboard/reports/${assessment.id}`}>
                        <Button size="sm" variant="outline">
                          View Report
                        </Button>
                      </Link>
                    ) : assessment.status === "IN_PROGRESS" ? (
                      <Link href={`/take-assessment?id=${assessment.id}`}>
                        <Button size="sm">Continue</Button>
                      </Link>
                    ) : (
                      <Link href={`/take-assessment?id=${assessment.id}`}>
                        <Button size="sm">Start</Button>
                      </Link>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Referee Invitations section for all users */}
      <Card>
        <CardHeader>
          <CardTitle>Referee Invitations</CardTitle>
          <CardDescription>
            Complete coachability assessments for candidates who have requested your feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          {refereeInvitations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              You don't have any referee invitations at this time.
            </div>
          ) : (
            <div className="space-y-4">
              {refereeInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className={`border rounded-lg p-4 ${invitation.status === "PENDING" ? "border-orange-200 bg-orange-50/50" : "border-gray-200"}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-base">Referee Survey for {invitation.candidate_name}</h4>
                        {invitation.status === "COMPLETED" ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{invitation.assessment_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Invited {formatDistanceToNow(new Date(invitation.invited_at), { addSuffix: true })}
                      </p>
                      <p className="text-xs text-muted-foreground">Relationship: {invitation.relationship}</p>
                    </div>
                    <div>
                      {invitation.status === "PENDING" ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            if (invitation.survey_token) {
                              router.push(`/referee-survey/${invitation.survey_token}`)
                            }
                          }}
                        >
                          Complete Survey
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline">
                          View Response
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {pendingRefereeInvitations > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>{pendingRefereeInvitations}</strong> referee{" "}
                {pendingRefereeInvitations === 1 ? "survey" : "surveys"} pending your response
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Overview - Secondary position */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedAssessments}</div>
            <p className="text-xs text-muted-foreground">Total completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Consent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingConsent}</div>
            <p className="text-xs text-muted-foreground">Employer requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Referees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRefereeInvitations}</div>
            <p className="text-xs text-muted-foreground">Awaiting responses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referee Pool</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{refereeInvitations.length}</div>
            <p className="text-xs text-muted-foreground">Total referees</p>
            <div className="mt-4">
              <Link href="/dashboard/referees">
                <Button variant="outline" size="sm">
                  Manage Pool
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consent Dialog */}
      {/* {selectedAssessment && (
        <ConsentDialog
          isOpen={consentDialogOpen}
          onClose={() => {
            setConsentDialogOpen(false)
            setSelectedAssessment(null)
          }}
          onConsent={handleConsentProvided}
          assessment={selectedAssessment}
        />
      )} */}
    </div>
  )
}
