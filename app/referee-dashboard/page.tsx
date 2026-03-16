"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { useAuth } from "@/components/auth-provider"
import { FileText, Clock, CheckCircle } from "lucide-react"

export default function RefereeDashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [refereeInvitations, setRefereeInvitations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  const handleRedirect = useCallback(() => {
    router.push("/login")
  }, [router])

  useEffect(() => {
    if (isInitialized) return

    if (!user) {
      handleRedirect()
      return
    }

    // Mock referee invitations for Sarah Wilson
    const mockInvitations = [
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
    ]

    setRefereeInvitations(mockInvitations)
    setIsLoading(false)
    setIsInitialized(true)
  }, [user, handleRedirect, isInitialized])

  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading referee dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Redirecting to login...</p>
        </div>
      </div>
    )
  }

  const pendingInvitations = refereeInvitations.filter((inv) => inv.status === "PENDING").length
  const completedInvitations = refereeInvitations.filter((inv) => inv.status === "COMPLETED").length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        )
      case "PENDING":
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Referee Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Welcome back, {user.name}! Complete assessments for candidates who have requested your feedback.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invitations</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{refereeInvitations.length}</div>
              <p className="text-sm text-muted-foreground">Referee requests</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{pendingInvitations}</div>
              <p className="text-sm text-muted-foreground">Awaiting your response</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{completedInvitations}</div>
              <p className="text-sm text-muted-foreground">Assessments completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Referee Invitations Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Referee Invitations</CardTitle>
            <CardDescription className="text-base">
              Complete coachability assessments for candidates who have requested your feedback
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {refereeInvitations.length === 0 ? (
              <div className="text-center py-12 px-6">
                <p className="text-lg text-muted-foreground">You don't have any referee invitations at this time.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="w-[250px] py-4 px-6 text-left font-semibold">Candidate</TableHead>
                    <TableHead className="w-[200px] py-4 px-4 text-left font-semibold">Assessment</TableHead>
                    <TableHead className="w-[150px] py-4 px-4 text-left font-semibold">Organization</TableHead>
                    <TableHead className="w-[120px] py-4 px-4 text-left font-semibold">Status</TableHead>
                    <TableHead className="w-[140px] py-4 px-4 text-left font-semibold">Invited</TableHead>
                    <TableHead className="w-[140px] py-4 px-4 text-left font-semibold">Expires</TableHead>
                    <TableHead className="py-4 px-6 text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {refereeInvitations.map((invitation) => (
                    <TableRow key={invitation.id} className="border-b hover:bg-muted/50">
                      <TableCell className="py-6 px-6">
                        <div className="space-y-1">
                          <p className="font-semibold text-base">{invitation.candidate_name}</p>
                          <p className="text-sm text-muted-foreground">{invitation.candidate_email}</p>
                          <p className="text-xs text-muted-foreground">Invited by: {invitation.invited_by}</p>
                        </div>
                      </TableCell>
                      <TableCell className="py-6 px-4">
                        <p className="font-medium">{invitation.assessment_name}</p>
                      </TableCell>
                      <TableCell className="py-6 px-4">
                        <p className="text-sm">{invitation.organization_name || "Personal Assessment"}</p>
                      </TableCell>
                      <TableCell className="py-6 px-4">{getStatusBadge(invitation.status)}</TableCell>
                      <TableCell className="py-6 px-4 text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(invitation.invited_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="py-6 px-4 text-sm text-muted-foreground">
                        {invitation.status === "PENDING" && (
                          <span className={isExpired(invitation.expires_at) ? "text-red-600" : ""}>
                            {formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })}
                          </span>
                        )}
                        {invitation.status === "COMPLETED" && (
                          <span className="text-green-600">
                            {formatDistanceToNow(new Date(invitation.completed_at), { addSuffix: true })}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-6 px-6 text-right">
                        {invitation.status === "PENDING" && !isExpired(invitation.expires_at) && (
                          <Link href={`/referee-survey/${invitation.survey_token}`}>
                            <Button size="sm" className="px-4">
                              Complete Survey
                            </Button>
                          </Link>
                        )}
                        {invitation.status === "PENDING" && isExpired(invitation.expires_at) && (
                          <Badge variant="destructive">Expired</Badge>
                        )}
                        {invitation.status === "COMPLETED" && (
                          <Link href={`/referee-responses/${invitation.survey_token}`}>
                            <Button variant="outline" size="sm" className="px-4">
                              View My Responses
                            </Button>
                          </Link>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
