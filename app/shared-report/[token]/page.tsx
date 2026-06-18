"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Eye, Calendar, Clock, Building2, User, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { FullAccessReport } from "@/components/shared-report/full-access-report"

interface SharedReportData {
  id: string
  participantName: string
  participantEmail: string
  assessmentName: string
  accessLevel: "FULL" | "SUMMARY_ONLY" | "SCORES_ONLY"
  sharedBy: string
  sharedDate: string
  expiresAt: string
  organizationName: string
  contactPerson: string
  personalMessage?: string
  status: "ACTIVE" | "EXPIRED" | "REVOKED"
  viewCount: number
  lastViewedAt?: string
  overallScores: {
    self: number
    referee: number
    combined: number
  }
  domainScores: Record<string, { self: number; referee: number }>
  recommendations?: string[]
  coachFit?: {
    directSupportive: number
    challengingReflective: number
    structuredFlexible: number
    taskRelationship: number
    preferredStyle: string
  }
}

const COACHABILITY_DOMAINS = [
  { id: "openness-to-feedback", name: "Openness to Feedback" },
  { id: "self-awareness", name: "Self-Awareness" },
  { id: "learning-orientation", name: "Learning Orientation" },
  { id: "change-readiness", name: "Change Readiness" },
  { id: "emotional-regulation", name: "Emotional Regulation" },
  { id: "goal-orientation", name: "Goal Orientation" },
  { id: "resilience", name: "Resilience" },
  { id: "communication-skills", name: "Communication Skills" },
  { id: "relationship-building", name: "Relationship Building" },
  { id: "accountability", name: "Accountability" },
  { id: "growth-mindset", name: "Growth Mindset" },
  { id: "action-orientation", name: "Action Orientation" },
]

export default function SharedReportPage() {
  const params = useParams()
  const token = params.token as string
  const [reportData, setReportData] = useState<SharedReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const hasTrackedView = useRef(false)

  useEffect(() => {
    const loadReportData = async () => {
      try {
        // Fetch shared report data by token
        const res = await fetch(`/api/user/access-requests`)
        if (res.ok) {
          const data = await res.json()
          // Find the sharing permission matching this token
          const allRequests = [...(data.incoming || []), ...(data.outgoing || [])]
          const match = allRequests.find((r: any) => r.id === token || r.assessment_id === token)
          if (match) {
            // Fetch the actual report
            const reportRes = await fetch(`/api/assessments/${match.assessment_id || token}/report`)
            if (reportRes.ok) {
              const reportData = await reportRes.json()
              const sharedData: SharedReportData = {
                id: token,
                participantName: reportData.participant?.name || "Unknown",
                participantEmail: reportData.participant?.email || "",
                assessmentName: reportData.title || "Coachability Assessment",
                accessLevel: match.permission_level || "FULL",
                sharedBy: reportData.participant?.name || "",
                sharedDate: match.created_at || match.requested_at,
                expiresAt: match.expires_at,
                organizationName: match.organization_name || "",
                contactPerson: match.requested_by_name || "",
                personalMessage: match.request_message || "",
                status: (match.status || "ACTIVE").toUpperCase(),
                viewCount: 0,
                lastViewedAt: null,
                overallScores: {
                  self: Object.values(reportData.domainScores || {}).reduce((sum: number, s: any) => sum + (s.self || 0), 0) / Math.max(Object.keys(reportData.domainScores || {}).length, 1),
                  referee: Object.values(reportData.domainScores || {}).reduce((sum: number, s: any) => sum + (s.referee || 0), 0) / Math.max(Object.keys(reportData.domainScores || {}).length, 1),
                  combined: 0,
                },
                domainScores: reportData.domainScores || {},
                recommendations: [],
                coachFit: { directSupportive: 0.5, challengingReflective: 0.5, structuredFlexible: 0.5, taskRelationship: 0.5, preferredStyle: "" },
              }
              sharedData.overallScores.combined = (sharedData.overallScores.self + sharedData.overallScores.referee) / 2
              setReportData(sharedData)
            } else {
              setError("Report not found")
            }
          } else {
            setError("Shared report not found")
          }
        } else {
          setError("Failed to load shared report")
        }
      } catch (err) {
        setError("Failed to load shared report")
      } finally {
        setIsLoading(false)
      }
    }

    loadReportData()
  }, [token])

  const trackView = async () => {
    // Simulate tracking view
    if (reportData) {
      setReportData({
        ...reportData,
        viewCount: reportData.viewCount + 1,
        lastViewedAt: new Date().toISOString(),
      })
    }
  }

  useEffect(() => {
    if (reportData && reportData.status === "ACTIVE" && !hasTrackedView.current) {
      hasTrackedView.current = true // ensure it never runs again
      trackView()
    }
  }, [reportData])

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading shared report...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !reportData) {
    return (
      <div className="container py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Report Not Found</h3>
              <p className="text-muted-foreground">This shared report link is invalid, expired, or has been revoked.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (reportData.status !== "ACTIVE") {
    return (
      <div className="container py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {reportData.status === "EXPIRED" ? "Report Expired" : "Access Revoked"}
              </h3>
              <p className="text-muted-foreground">
                {reportData.status === "EXPIRED"
                  ? "This shared report has expired and is no longer accessible."
                  : "Access to this report has been revoked by the participant."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getAccessLevelBadge = () => {
    switch (reportData.accessLevel) {
      case "FULL":
        return <Badge className="bg-blue-100 text-blue-800">Full Access</Badge>
      case "SUMMARY_ONLY":
        return <Badge className="bg-green-100 text-green-800">Summary Only</Badge>
      case "SCORES_ONLY":
        return <Badge className="bg-yellow-100 text-yellow-800">Scores Only</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  function renderSummaryOnly() {
    return (
      <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Overall Coachability Assessment</CardTitle>
          <CardDescription>Key insights and overall performance summary</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-primary mb-2">{reportData.overallScores.combined}</div>
            <div className="text-muted-foreground">Overall Coachability Score</div>
            <div className="text-sm text-muted-foreground mt-1">
              Based on self-assessment ({reportData.overallScores.self}) and referee feedback (
              {reportData.overallScores.referee})
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-green-700 mb-3">Key Strengths</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                  Strong learning orientation and growth mindset - actively seeks development opportunities
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                  High accountability and goal orientation - takes ownership and stays focused
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                  Good relationship building skills - works well with others
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-orange-700 mb-3">Development Opportunities</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                  Emotional regulation under pressure - could benefit from stress management techniques
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                  Action orientation and follow-through - setting smaller milestones may help
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                  Openness to challenging feedback - room for growth in receiving difficult input
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Coaching Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm">
                <strong>Coaching Style:</strong> Would benefit from a balanced approach with moderate challenge and
                reflection, structured guidance, and equal focus on tasks and relationships.
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
              <p className="text-sm">
                <strong>Development Focus:</strong> Prioritize emotional regulation and action orientation while
                leveraging existing strengths in learning and accountability.
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
              <p className="text-sm">
                <strong>Success Factors:</strong> Strong foundation for coaching success with high growth mindset and
                willingness to learn. Focus areas are very coachable.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    )
  }

  function renderScoresOnly() {
    return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Coachability Scores</CardTitle>
          <CardDescription>Domain scores and overall assessment results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-8">
            <div className="text-5xl font-bold text-primary mb-2">{reportData.overallScores.combined}</div>
            <div className="text-muted-foreground">Overall Coachability Score</div>
            <div className="grid grid-cols-2 gap-4 mt-4 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{reportData.overallScores.self}</div>
                <div className="text-xs text-muted-foreground">Self Assessment</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{reportData.overallScores.referee}</div>
                <div className="text-xs text-muted-foreground">Referee Average</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Domain Scores</h4>
            <div className="grid gap-3">
              {COACHABILITY_DOMAINS.map((domain) => {
                const scores = reportData.domainScores[domain.id]
                if (!scores) return null
                return (
                  <div key={domain.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium text-sm">{domain.name}</span>
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span>{scores.self}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span>{scores.referee}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span>Self Assessment</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Referee Feedback</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">{reportData.assessmentName}</h1>
            <p className="text-muted-foreground">Shared by {reportData.participantName}</p>
          </div>
          {getAccessLevelBadge()}
        </div>

        {/* Report Info */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{reportData.participantName}</p>
                  <p className="text-muted-foreground">{reportData.participantEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{reportData.organizationName}</p>
                  <p className="text-muted-foreground">{reportData.contactPerson}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Shared</p>
                  <p className="text-muted-foreground">{format(new Date(reportData.sharedDate), "MMM dd, yyyy")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Expires</p>
                  <p className="text-muted-foreground">{format(new Date(reportData.expiresAt), "MMM dd, yyyy")}</p>
                </div>
              </div>
            </div>

            {reportData.personalMessage && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <h4 className="font-medium text-blue-900 mb-2">Personal Message</h4>
                <p className="text-sm text-blue-800">{reportData.personalMessage}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Report Content Based on Access Level */}
      {reportData.accessLevel === "FULL" && <FullAccessReport reportData={reportData} />}
      {reportData.accessLevel === "SUMMARY_ONLY" && renderSummaryOnly()}
      {reportData.accessLevel === "SCORES_ONLY" && renderScoresOnly()}

      {/* Footer */}
      <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>Viewed {reportData.viewCount} times</span>
          </div>
          {reportData.lastViewedAt && (
            <span>Last accessed: {format(new Date(reportData.lastViewedAt), "MMM dd, yyyy 'at' h:mm a")}</span>
          )}
        </div>
        <p className="mt-2">This report was shared through Coaching Digs</p>
      </div>
    </div>
  )
}
