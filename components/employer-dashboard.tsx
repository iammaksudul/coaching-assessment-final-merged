"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Building2, FileText, TrendingUp, UserPlus, CheckCircle, Clock, XCircle, Eye, Mail } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface OrganizationStats {
  assessmentsCommissioned: number
  assessmentsCompleted: number
  assessmentsPending: number
  assessmentsExpired: number
  accessRequestsSent: number
  accessRequestsApproved: number
  accessRequestsPending: number
  subscriptionTier: string
  assessmentsUsedThisPeriod: number
  assessmentsAllowedThisPeriod: number
  periodEndsAt: string
}

interface SponsoredAssessment {
  id: string
  assessment_id: string
  candidate_email: string
  candidate_name: string
  status: string
  assessment_name: string
  assessment_status: string
  organization_name: string
  sponsored_by_name: string
  created_at: string
  expires_at: string
}

interface AccessRequest {
  id: string
  assessment_id: string
  candidate_email: string
  candidate_name: string
  assessment_name: string
  status: string
  requested_by_name: string
  organization_name: string
  requested_at: string
  expires_at: string
  originally_requested_assessment_id?: string
  originally_requested_assessment_name?: string
}

// ============================================================================
// TEMPORARY TEST STATE - ASSESSMENT LIMIT ENFORCEMENT
// ============================================================================
// Assessment limit enforcement configuration.
// The organization is set to be AT THEIR LIMIT (12/12 assessments used).
// When attempting to commission or request access, the upgrade dialog should appear.
//
// Default empty stats for initial state
const EMPTY_STATS: OrganizationStats = {
  assessmentsCommissioned: 0, assessmentsCompleted: 0, assessmentsPending: 0,
  assessmentsExpired: 0, accessRequestsSent: 0, accessRequestsApproved: 0,
  accessRequestsPending: 0, subscriptionTier: "Free",
  assessmentsUsedThisPeriod: 0, assessmentsAllowedThisPeriod: 5,
  periodEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
}

const getTierLimits = (tier: string): { min: number; max: number } => {
  switch (tier) {
    case "TIER_1_5":
      return { min: 1, max: 5 }
    case "TIER_6_12":
      return { min: 6, max: 12 }
    case "TIER_13_20":
      return { min: 13, max: 20 }
    case "TIER_21_40":
      return { min: 21, max: 40 }
    case "TIER_40_PLUS":
      return { min: 41, max: 999 }
    default:
      return { min: 1, max: 5 }
  }
}

const getNextTier = (currentTier: string): { tier: string; name: string; limit: number } | null => {
  const tiers = [
    { tier: "TIER_1_5", name: "Starter", limit: 5 },
    { tier: "TIER_6_12", name: "Professional", limit: 12 },
    { tier: "TIER_13_20", name: "Business", limit: 20 },
    { tier: "TIER_21_40", name: "Enterprise", limit: 40 },
    { tier: "TIER_40_PLUS", name: "Enterprise Plus", limit: 999 },
  ]

  const currentIndex = tiers.findIndex((t) => t.tier === currentTier)
  if (currentIndex >= 0 && currentIndex < tiers.length - 1) {
    return tiers[currentIndex + 1]
  }
  return null
}

export function EmployerDashboard() {
  const { toast } = useToast()
  const [stats, setStats] = useState<OrganizationStats>(EMPTY_STATS)
  const [sponsoredAssessments, setSponsoredAssessments] = useState<SponsoredAssessment[]>([])
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([])

  // Fetch real data from API
  useEffect(() => {
    Promise.all([
      fetch("/api/employer/stats").then(r => r.ok ? r.json() : EMPTY_STATS),
      fetch("/api/employer/sponsored-assessments").then(r => r.ok ? r.json() : []),
      fetch("/api/employer/assessment-requests").then(r => r.ok ? r.json() : []),
    ]).then(([s, sa, ar]) => {
      setStats(s)
      setSponsoredAssessments(sa)
      setAccessRequests(ar)
    }).catch(console.error)
  }, [])
  const [isCommissionDialogOpen, setIsCommissionDialogOpen] = useState(false)
  const [isAccessRequestDialogOpen, setIsAccessRequestDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [upgradeMessage, setUpgradeMessage] = useState("")

  const [candidateSearchEmail, setCandidateSearchEmail] = useState("")
  const [candidateAssessments, setCandidateAssessments] = useState<any[]>([])
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>("")
  const [isSearching, setIsSearching] = useState(false)
  const [candidateFound, setCandidateFound] = useState(false)

  // Commission Assessment Form State
  const [commissionForm, setCommissionForm] = useState({
    candidateName: "",
    candidateEmail: "",
    assessmentName: "",
    message: "",
  })

  // Access Request Form State
  const [accessRequestForm, setAccessRequestForm] = useState({
    candidateEmail: "",
    message: "",
  })

  useEffect(() => {
    // Subscription tier data loaded via stats endpoint
  }, [])

  // ADD FUNCTION TO CHECK LIMITS BEFORE OPENING DIALOGS
  const checkAssessmentLimit = (): boolean => {
    const limits = getTierLimits(stats.subscriptionTier)
    if (stats.assessmentsUsedThisPeriod >= limits.max) {
      const nextTier = getNextTier(stats.subscriptionTier)
      if (nextTier) {
        setUpgradeMessage(
          `You've reached your limit of ${limits.max} assessments for this period. Upgrade to ${nextTier.name} to get up to ${nextTier.limit} assessments per month.`,
        )
      } else {
        setUpgradeMessage(
          `You've reached your limit of ${limits.max} assessments for this period. Please contact us for custom enterprise solutions.`,
        )
      }
      setShowUpgradeDialog(true)
      return false
    }
    return true
  }

  // ADD HANDLERS FOR BUTTON CLICKS THAT CHECK LIMITS FIRST
  const handleCommissionButtonClick = () => {
    if (checkAssessmentLimit()) {
      setIsCommissionDialogOpen(true)
    }
  }

  const handleRequestAccessButtonClick = () => {
    if (checkAssessmentLimit()) {
      setIsAccessRequestDialogOpen(true)
    }
  }

  const handleCommissionAssessment = async () => {
    if (!commissionForm.candidateName || !commissionForm.candidateEmail) {
      toast({
        title: "Error",
        description: "Please provide candidate name and email",
        variant: "destructive",
      })
      return
    }

    // REMOVED LIMIT CHECK FROM HERE - NOW HAPPENS BEFORE DIALOG OPENS

    setIsLoading(true)

    try {
      const response = await fetch("/api/assessments/commission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(commissionForm),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to commission assessment")
      }

      // Refresh data from server
      const [freshStats, freshSponsored] = await Promise.all([
        fetch("/api/employer/stats").then(r => r.ok ? r.json() : stats),
        fetch("/api/employer/sponsored-assessments").then(r => r.ok ? r.json() : sponsoredAssessments),
      ])
      setStats(freshStats)
      setSponsoredAssessments(freshSponsored)

      toast({
        title: "Success",
        description: `Assessment commissioned for ${commissionForm.candidateName}. Invitation email sent.`,
      })

      setCommissionForm({ candidateName: "", candidateEmail: "", assessmentName: "", message: "" })
      setIsCommissionDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to commission assessment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchCandidate = async () => {
    if (!candidateSearchEmail) {
      toast({
        title: "Error",
        description: "Please enter a candidate email",
        variant: "destructive",
      })
      return
    }

    setIsSearching(true)

    try {
      const response = await fetch("/api/candidates/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidates: [{ email: candidateSearchEmail }] }),
      })

      const data = await response.json()
      const validation = data.validations?.[0]

      if (validation?.exists && validation.existingAssessments?.length > 0) {
        setCandidateAssessments(validation.existingAssessments)
        setCandidateFound(true)
      } else {
        setCandidateAssessments([])
        setCandidateFound(false)
        toast({
          title: "No Assessments Found",
          description: validation?.exists
            ? "This candidate has no completed assessments available."
            : "No candidate found with this email address.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to find candidate. Please check the email and try again.",
        variant: "destructive",
      })
      setCandidateFound(false)
    } finally {
      setIsSearching(false)
    }
  }

  const handleRequestAccess = async () => {
    if (!selectedAssessmentId) {
      toast({
        title: "Error",
        description: "Please select an assessment to request access to",
        variant: "destructive",
      })
      return
    }

    // REMOVED LIMIT CHECK FROM HERE - NOW HAPPENS BEFORE DIALOG OPENS

    setIsLoading(true)

    try {
      const selectedAssessment = candidateAssessments.find((a) => a.id === selectedAssessmentId)

      const response = await fetch("/api/employer/assessment-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId: selectedAssessmentId,
          candidateEmail: candidateSearchEmail,
          message: accessRequestForm.message,
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || "Failed to send access request")
      }

      // Refresh data from server
      const [freshStats, freshRequests] = await Promise.all([
        fetch("/api/employer/stats").then(r => r.ok ? r.json() : stats),
        fetch("/api/employer/assessment-requests").then(r => r.ok ? r.json() : accessRequests),
      ])
      setStats(freshStats)
      setAccessRequests(freshRequests)

      toast({
        title: "Success",
        description: `Access request sent to ${candidateSearchEmail}`,
      })

      // Reset form
      setCandidateSearchEmail("")
      setCandidateAssessments([])
      setSelectedAssessmentId("")
      setCandidateFound(false)
      setAccessRequestForm({
        candidateEmail: "",
        message: "",
      })
      setIsAccessRequestDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send access request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendReminder = async (assessment: SponsoredAssessment) => {
    try {
      toast({
        title: "Reminder Sent",
        description: `Reminder email sent to ${assessment.candidate_name}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reminder",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        )
      case "PENDING":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "ACCEPTED":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Accepted
          </Badge>
        )
      case "IN_PROGRESS":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        )
      case "APPROVED":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        )
      case "DECLINED":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Declined
          </Badge>
        )
      case "EXPIRED":
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <XCircle className="w-3 h-3 mr-1" />
            Expired
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTierName = (tier: string) => {
    switch (tier) {
      case "TIER_1_5":
        return "Starter (1-5 assessments)"
      case "TIER_6_12":
        return "Professional (6-12 assessments)"
      case "TIER_13_20":
        return "Business (13-20 assessments)"
      case "TIER_21_40":
        return "Enterprise (21-40 assessments)"
      case "TIER_40_PLUS":
        return "Enterprise Plus (40+ assessments)"
      default:
        return tier
    }
  }

  const usagePercentage =
    (stats.assessmentsAllowedThisPeriod > 0
      ? stats.assessmentsUsedThisPeriod / stats.assessmentsAllowedThisPeriod
      : 0) * 100

  return (
    <div className="space-y-8">
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assessment Limit Reached</DialogTitle>
            <DialogDescription>{upgradeMessage}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Usage:</span>
                    <span className="text-sm font-bold">
                      {stats.assessmentsUsedThisPeriod} / {getTierLimits(stats.subscriptionTier).max}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: "100%" }} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Period ends {formatDistanceToNow(new Date(stats.periodEndsAt), { addSuffix: true })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowUpgradeDialog(false)
                // In production, navigate to upgrade page or open Stripe checkout
                toast({
                  title: "Upgrade Plan",
                  description: "Redirecting to upgrade options...",
                })
              }}
            >
              Upgrade Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Organization Dashboard</h1>
          <div className="mt-2 space-y-1">
            <p className="text-lg text-muted-foreground">Manage assessments and track candidate progress</p>
          </div>
        </div>
        <div className="flex gap-3">
          {/* UPDATED TO USE BUTTON CLICK HANDLER INSTEAD OF DIALOGTRIGGER */}
          <Button variant="outline" onClick={handleRequestAccessButtonClick}>
            <Eye className="h-4 w-4 mr-2" />
            Request Access
          </Button>

          <Dialog
            open={isAccessRequestDialogOpen}
            onOpenChange={(open) => {
              setIsAccessRequestDialogOpen(open)
              if (!open) {
                // Reset form when closing
                setCandidateSearchEmail("")
                setCandidateAssessments([])
                setSelectedAssessmentId("")
                setCandidateFound(false)
                setAccessRequestForm({ candidateEmail: "", message: "" })
              }
            }}
          >
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Request Assessment Access</DialogTitle>
                <DialogDescription>
                  Search for a candidate by email to view their completed assessments, then select which one you'd like
                  to request access to.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="search-candidate-email">Candidate Email *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="search-candidate-email"
                      type="email"
                      placeholder="candidate@example.com"
                      value={candidateSearchEmail}
                      onChange={(e) => setCandidateSearchEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSearchCandidate()
                        }
                      }}
                    />
                    <Button onClick={handleSearchCandidate} disabled={isSearching || !candidateSearchEmail}>
                      {isSearching ? "Searching..." : "Search"}
                    </Button>
                  </div>
                </div>

                {candidateFound && candidateAssessments.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="select-assessment">Select Assessment to Request *</Label>
                    <div className="space-y-2">
                      {candidateAssessments.map((assessment) => (
                        <Card
                          key={assessment.id}
                          className={`cursor-pointer transition-all ${
                            selectedAssessmentId === assessment.id
                              ? "border-blue-500 bg-blue-50"
                              : "hover:border-gray-400"
                          }`}
                          onClick={() => setSelectedAssessmentId(assessment.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-medium">{assessment.name}</div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  Completed{" "}
                                  {formatDistanceToNow(new Date(assessment.completed_at), { addSuffix: true })}
                                </div>
                              </div>
                              {selectedAssessmentId === assessment.id && (
                                <CheckCircle className="w-5 h-5 text-blue-600" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {candidateFound && (
                  <div className="space-y-2">
                    <Label htmlFor="access-message">Message (Optional)</Label>
                    <Textarea
                      id="access-message"
                      placeholder="Add a personal message explaining why you'd like access to their assessment..."
                      rows={4}
                      value={accessRequestForm.message}
                      onChange={(e) =>
                        setAccessRequestForm({
                          ...accessRequestForm,
                          message: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAccessRequestDialogOpen(false)} disabled={isLoading}>
                  Cancel
                </Button>
                <Button onClick={handleRequestAccess} disabled={isLoading || !selectedAssessmentId}>
                  {isLoading ? "Sending..." : "Send Request"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* UPDATED TO USE BUTTON CLICK HANDLER INSTEAD OF DIALOGTRIGGER */}
          <Button onClick={handleCommissionButtonClick}>
            <UserPlus className="h-4 w-4 mr-2" />
            Commission Assessment
          </Button>

          <Dialog open={isCommissionDialogOpen} onOpenChange={setIsCommissionDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Commission New Assessment</DialogTitle>
                <DialogDescription>
                  Create a new coachability assessment for a candidate. They will receive an invitation email to
                  complete the assessment.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="candidate-name">Candidate Name *</Label>
                  <Input
                    id="candidate-name"
                    placeholder="John Doe"
                    value={commissionForm.candidateName}
                    onChange={(e) =>
                      setCommissionForm({
                        ...commissionForm,
                        candidateName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="candidate-email">Candidate Email *</Label>
                  <Input
                    id="candidate-email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={commissionForm.candidateEmail}
                    onChange={(e) =>
                      setCommissionForm({
                        ...commissionForm,
                        candidateEmail: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assessment-name">Assessment Name (Optional)</Label>
                  <Input
                    id="assessment-name"
                    placeholder="Leadership Coachability Assessment"
                    value={commissionForm.assessmentName}
                    onChange={(e) =>
                      setCommissionForm({
                        ...commissionForm,
                        assessmentName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Personal Message (Optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Add a personal message to include in the invitation email..."
                    rows={4}
                    value={commissionForm.message}
                    onChange={(e) =>
                      setCommissionForm({
                        ...commissionForm,
                        message: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCommissionDialogOpen(false)} disabled={isLoading}>
                  Cancel
                </Button>
                <Button onClick={handleCommissionAssessment} disabled={isLoading}>
                  {isLoading ? "Commissioning..." : "Commission Assessment"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissioned Assessments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assessmentsCommissioned}</div>
            <div className="text-xs text-muted-foreground space-y-1 mt-2">
              <div className="flex justify-between">
                <span>Completed:</span>
                <span className="text-green-600 font-medium">{stats.assessmentsCompleted}</span>
              </div>
              <div className="flex justify-between">
                <span>Pending:</span>
                <span className="text-yellow-600 font-medium">{stats.assessmentsPending}</span>
              </div>
              <div className="flex justify-between">
                <span>Expired:</span>
                <span className="text-red-600 font-medium">{stats.assessmentsExpired}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Access Requests</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accessRequestsSent}</div>
            <div className="text-xs text-muted-foreground space-y-1 mt-2">
              <div className="flex justify-between">
                <span>Approved:</span>
                <span className="text-green-600 font-medium">{stats.accessRequestsApproved}</span>
              </div>
              <div className="flex justify-between">
                <span>Pending:</span>
                <span className="text-yellow-600 font-medium">{stats.accessRequestsPending}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscription Plan</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{getTierName(stats.subscriptionTier)}</div>
            <div className="text-xs text-muted-foreground mt-2">
              Period ends {formatDistanceToNow(new Date(stats.periodEndsAt), { addSuffix: true })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage This Period</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.assessmentsUsedThisPeriod} / {stats.assessmentsAllowedThisPeriod}
            </div>
            <div className="mt-2">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${usagePercentage >= 100 ? "bg-red-500" : usagePercentage >= 80 ? "bg-yellow-500" : "bg-green-500"}`}
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{usagePercentage.toFixed(0)}% used</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="commissioned" className="space-y-4">
        <TabsList>
          <TabsTrigger value="commissioned" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Commissioned Assessments ({sponsoredAssessments.length})
          </TabsTrigger>
          <TabsTrigger value="access-requests" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Access Requests ({accessRequests.length})
          </TabsTrigger>
          <TabsTrigger value="organization" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Organization Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="commissioned">
          <Card>
            <CardHeader>
              <CardTitle>Commissioned Assessments</CardTitle>
              <CardDescription>
                Track assessments you've commissioned for candidates. Monitor their progress and view completed reports.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sponsoredAssessments.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Commissioned Assessments</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't commissioned any assessments yet. Get started by commissioning your first assessment.
                  </p>
                  <Button onClick={() => setIsCommissionDialogOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Commission Assessment
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Assessment Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Commissioned</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sponsoredAssessments.map((assessment) => (
                      <TableRow key={assessment.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{assessment.candidate_name}</div>
                            <div className="text-sm text-muted-foreground">{assessment.candidate_email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{assessment.assessment_name}</div>
                        </TableCell>
                        <TableCell>{getStatusBadge(assessment.status)}</TableCell>
                        <TableCell>{getStatusBadge(assessment.assessment_status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(assessment.created_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(assessment.expires_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            {assessment.status === "COMPLETED" ? (
                              <Link href={`/dashboard/reports/${assessment.assessment_id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Report
                                </Button>
                              </Link>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSendReminder(assessment)}
                                disabled={assessment.status === "PENDING"}
                              >
                                <Mail className="h-4 w-4 mr-1" />
                                Send Reminder
                              </Button>
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

        <TabsContent value="access-requests">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Access Requests</CardTitle>
              <CardDescription>
                View requests you've sent to candidates asking for access to their existing assessments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {accessRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Access Requests</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't requested access to any candidate assessments yet.
                  </p>
                  <Button onClick={() => setIsAccessRequestDialogOpen(true)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Request Access
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Assessment Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accessRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{request.candidate_name}</div>
                            <div className="text-sm text-muted-foreground">{request.candidate_email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{request.assessment_name}</div>
                            {request.originally_requested_assessment_name && (
                              <div className="text-xs text-muted-foreground">
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  Alternate Assessment
                                </Badge>
                                <div className="mt-1">
                                  Originally requested: {request.originally_requested_assessment_name}
                                </div>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(request.requested_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(request.expires_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            {request.status === "APPROVED" ? (
                              <Link href={`/dashboard/reports/${request.assessment_id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Assessment
                                </Button>
                              </Link>
                            ) : request.status === "PENDING" ? (
                              <Button variant="outline" size="sm" disabled>
                                <Clock className="h-4 w-4 mr-1" />
                                Awaiting Response
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" disabled>
                                <XCircle className="h-4 w-4 mr-1" />
                                {request.status}
                              </Button>
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

        <TabsContent value="organization">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>Manage your organization details and subscription</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Organization Name</Label>
                    <Input defaultValue="" />
                  </div>
                  <div className="space-y-2">
                    <Label>Billing Email</Label>
                    <Input type="email" defaultValue="" />
                  </div>
                  <div className="space-y-2">
                    <Label>Organization Domain</Label>
                    <Input defaultValue="" />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Plan</Label>
                    <Input disabled value={getTierName(stats.subscriptionTier)} />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Subscription Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Period:</span>
                      <span className="font-medium">
                        Ends {formatDistanceToNow(new Date(stats.periodEndsAt), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Assessments Used:</span>
                      <span className="font-medium">
                        {stats.assessmentsUsedThisPeriod} / {stats.assessmentsAllowedThisPeriod}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Assessments Remaining:</span>
                      <span className="font-medium">
                        {stats.assessmentsAllowedThisPeriod - stats.assessmentsUsedThisPeriod}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button>Save Changes</Button>
                  <Link href="/subscription/manage">
                    <Button variant="outline">Upgrade Plan</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
