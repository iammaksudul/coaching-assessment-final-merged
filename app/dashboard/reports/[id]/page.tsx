"use client"

import { useAuth } from "@/components/auth-provider"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ArrowLeft, Home, Sparkles, RefreshCw, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ShareReportDialog } from "@/components/share-report-dialog"

// FIXED: The 12 domains that never change
const COACHABILITY_DOMAINS = [
  {
    id: "openness-to-feedback",
    name: "Openness to Feedback",
    description: "Your ability to receive and act on feedback from others.",
  },
  {
    id: "self-awareness",
    name: "Self-Awareness",
    description: "Your understanding of your own strengths, weaknesses, and impact on others.",
  },
  {
    id: "learning-orientation",
    name: "Learning Orientation",
    description: "Your enthusiasm for acquiring new skills and knowledge.",
  },
  {
    id: "change-readiness",
    name: "Change Readiness",
    description: "Your ability to adapt to new situations and approaches.",
  },
  {
    id: "emotional-regulation",
    name: "Emotional Regulation",
    description: "Your ability to manage emotions effectively, especially in challenging situations.",
  },
  {
    id: "goal-orientation",
    name: "Goal Orientation",
    description: "Your focus on setting and achieving meaningful objectives.",
  },
  {
    id: "resilience",
    name: "Resilience",
    description: "Your ability to bounce back from setbacks and maintain performance under pressure.",
  },
  {
    id: "communication-skills",
    name: "Communication Skills",
    description: "Your effectiveness in expressing ideas and listening to others.",
  },
  {
    id: "relationship-building",
    name: "Relationship Building",
    description: "Your ability to develop and maintain positive working relationships.",
  },
  {
    id: "accountability",
    name: "Accountability",
    description: "Your willingness to take ownership of your actions and commitments.",
  },
  {
    id: "growth-mindset",
    name: "Growth Mindset",
    description: "Your belief that abilities can be developed through dedication and hard work.",
  },
  {
    id: "action-orientation",
    name: "Action Orientation",
    description: "Your tendency to take initiative and follow through on commitments.",
  },
]

export default function ReportDetailPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const assessmentId = params.id as string
  const [reportData, setReportData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [aiRecommendations, setAiRecommendations] = useState<any>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const domainsPerPage = 4
  const totalPages = Math.ceil(COACHABILITY_DOMAINS.length / domainsPerPage)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push("/login")
      return
    }

    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/assessments/${assessmentId}/report`)
        if (res.ok) {
          const data = await res.json()
          // Generate recommendations from scores
          const scores = data.domainScores || {}
          const sorted = Object.entries(scores)
            .map(([domain, s]: [string, any]) => ({ domain, avg: ((s.self || 0) + (s.referee || 0)) / 2 }))
            .sort((a, b) => a.avg - b.avg)

          const domainLabels: Record<string, string> = {}
          COACHABILITY_DOMAINS.forEach(d => { domainLabels[d.id] = d.name })

          const recommendations = (data.hasData && sorted.some((s: any) => s.avg > 0))
            ? sorted.slice(0, 3).map((s, i) => ({
                text: `Focus on developing your ${domainLabels[s.domain] || s.domain} skills — this is one of your lower-scoring areas.`,
                domain: domainLabels[s.domain] || s.domain,
                priority: i === 0 ? "High" : i === 1 ? "High" : "Medium",
              })).concat(sorted.slice(-2).reverse().map(s => ({
                text: `Your ${domainLabels[s.domain] || s.domain} is a strength — continue leveraging this in coaching.`,
                domain: domainLabels[s.domain] || s.domain,
                priority: "Low",
              })))
            : []

          // Derive coach-fit from domain scores
          const selfAvg = (d: string) => scores[d]?.self || 3
          setReportData({
            ...data,
            coachFit: {
              directScore: selfAvg("openness-to-feedback"),
              supportiveScore: selfAvg("relationship-building"),
              challengingScore: selfAvg("resilience"),
              reflectiveScore: selfAvg("self-awareness"),
              structuredScore: selfAvg("goal-orientation"),
              flexibleScore: selfAvg("change-readiness"),
              taskScore: selfAvg("action-orientation"),
              relationshipScore: selfAvg("communication-skills"),
              preferredStyle: "Based on your assessment scores, your coaching style preferences are derived from your domain strengths and areas for development.",
            },
            recommendations,
          })
        }
      } catch (error) {
        console.error("Error fetching report:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReport()
  }, [user, router, assessmentId, authLoading])

  // Get domains for current page
  const getCurrentPageDomains = () => {
    const startIndex = currentPage * domainsPerPage
    const endIndex = startIndex + domainsPerPage
    return COACHABILITY_DOMAINS.slice(startIndex, endIndex)
  }

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  const fetchAiRecommendations = async () => {
    if (!reportData?.domainScores) return
    setAiLoading(true)
    setAiError(null)

    try {
      const res = await fetch("/api/recommendations/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domainScores: reportData.domainScores,
          participantName: user?.name || reportData.participant?.name,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || `Request failed (${res.status})`)
      }

      const data = await res.json()

      if (data.source === "ai" && data.recommendations) {
        setAiRecommendations(data)
      } else if (data.rawText) {
        // AI returned text but not parseable JSON -- show raw
        setAiRecommendations({ rawText: data.rawText, source: "ai" })
      } else {
        throw new Error("No recommendations returned")
      }
    } catch (err: any) {
      console.error("AI recommendations failed:", err)
      setAiError(err.message || "Could not generate AI recommendations. Showing standard recommendations below.")
    } finally {
      setAiLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">Please log in to view this assessment.</p>
          <Link href="/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading report...</p>
        </div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <p>Report not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 max-w-4xl">
        {/* Navigation Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="h-4 w-px bg-border" />
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <div className="h-4 w-px bg-border" />
            <Button variant="outline" size="sm" className="gap-2" onClick={async () => {
              try {
                const res = await fetch(`/api/assessments/${assessmentId}/pdf`)
                if (!res.ok) throw new Error("Failed to generate PDF")
                const blob = await res.blob()
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `coachability-report.pdf`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)
              } catch (e) {
                alert("Failed to download PDF. Please try again.")
              }
            }}>
              Download PDF
            </Button>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{reportData.title}</h1>
            <p className="text-lg text-muted-foreground">
              Assessment ID: {assessmentId} for {user.name}
            </p>
            <p className="text-sm text-muted-foreground">
              Viewing as: {user.name} ({user.email})
            </p>
            <p className="text-muted-foreground">Generated on {new Date(reportData.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <ShareReportDialog
            assessmentId={assessmentId}
            assessmentName={reportData.title}
            participantName={user.name}
          />
        </div>

        {!reportData.hasData && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800">No response data available</p>
                  <p className="text-sm text-amber-600">
                    This assessment has {reportData.selfResponseCount || 0} self-responses and {reportData.refereeResponseCount || 0} referee responses.
                    {reportData.selfResponseCount === 0 && " Complete the assessment to see your scores."}
                    {reportData.selfResponseCount > 0 && reportData.refereeResponseCount === 0 && " Waiting for referee responses to generate a full report."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="summary">
          <TabsList className="mb-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="domains">Domain Scores</TabsTrigger>
            <TabsTrigger value="coach-fit">Coach-Client Fit</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Participant</CardTitle>
                  <CardDescription>Information about the assessment participant</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Name:</span>
                      <span>{reportData.participant.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Email:</span>
                      <span>{reportData.participant.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Assessment Date:</span>
                      <span>{new Date(reportData.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Referees</CardTitle>
                  <CardDescription>People who provided feedback</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {reportData.referees.map((referee: any, index: number) => (
                      <div key={index} className="flex justify-between">
                        <span className="font-medium">{referee.name}</span>
                        <span>{referee.relationship}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Overall Coachability Score</CardTitle>
                  <CardDescription>Average scores across all 12 domains</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="flex w-full max-w-md items-center justify-between rounded-lg bg-muted p-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold">
                          {(
                            Object.values(reportData.domainScores).reduce(
                              (acc: number, scores: any) => acc + scores.self,
                              0,
                            ) / Object.values(reportData.domainScores).length
                          ).toFixed(1)}
                        </div>
                        <div className="text-sm text-muted-foreground">Self Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold">
                          {(
                            Object.values(reportData.domainScores).reduce(
                              (acc: number, scores: any) => acc + scores.referee,
                              0,
                            ) / Object.values(reportData.domainScores).length
                          ).toFixed(1)}
                        </div>
                        <div className="text-sm text-muted-foreground">Referee Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold">
                          {(
                            (Object.values(reportData.domainScores).reduce(
                              (acc: number, scores: any) => acc + scores.self,
                              0,
                            ) /
                              Object.values(reportData.domainScores).length +
                              Object.values(reportData.domainScores).reduce(
                                (acc: number, scores: any) => acc + scores.referee,
                                0,
                              ) /
                                Object.values(reportData.domainScores).length) /
                            2
                          ).toFixed(1)}
                        </div>
                        <div className="text-sm text-muted-foreground">Combined</div>
                      </div>
                    </div>
                    <p className="text-center text-muted-foreground">
                      Scores are on a scale of 1 (lowest) to 5 (highest)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="domains">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Domain Scores</CardTitle>
                    <CardDescription>Detailed scores for each of the 12 coachability domains</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage + 1} of {totalPages} ({getCurrentPageDomains().length} domains)
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {getCurrentPageDomains().map((domain) => {
                    const scores = reportData.domainScores[domain.id as keyof typeof reportData.domainScores]
                    return (
                      <div key={domain.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{domain.name}</h3>
                          <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                              <span>Self: {scores.self.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full bg-green-500"></div>
                              <span>Referees: {scores.referee.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-blue-500"
                            style={{ width: `${(scores.self / 5) * 100}%` }}
                          ></div>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-green-500"
                            style={{ width: `${(scores.referee / 5) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-muted-foreground">{domain.description}</p>
                      </div>
                    )
                  })}
                </div>

                {/* PAGINATION CONTROLS */}
                <div className="mt-8 flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={prevPage}
                    disabled={currentPage === 0}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <Button
                        key={i}
                        variant={currentPage === i ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(i)}
                        className="w-8 h-8 p-0"
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    onClick={nextPage}
                    disabled={currentPage === totalPages - 1}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* PROGRESS INDICATOR */}
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Showing domains {currentPage * domainsPerPage + 1}-
                  {Math.min((currentPage + 1) * domainsPerPage, COACHABILITY_DOMAINS.length)} of{" "}
                  {COACHABILITY_DOMAINS.length} total domains
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coach-fit">
            <Card>
              <CardHeader>
                <CardTitle>Coach-Client Fit Profile</CardTitle>
                <CardDescription>Your preferences for coaching style across multiple dimensions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <h3 className="font-medium">Direct vs. Supportive</h3>
                      <div className="flex items-center gap-4">
                        <span className="text-sm">Supportive</span>
                        <div className="relative h-2 flex-1 rounded-full bg-muted">
                          <div
                            className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/4 rounded-full bg-primary"
                            style={{ left: `${(reportData.coachFit.directScore / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">Direct</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium">Challenging vs. Reflective</h3>
                      <div className="flex items-center gap-4">
                        <span className="text-sm">Reflective</span>
                        <div className="relative h-2 flex-1 rounded-full bg-muted">
                          <div
                            className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/4 rounded-full bg-primary"
                            style={{ left: `${(reportData.coachFit.challengingScore / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">Challenging</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium">Structured vs. Flexible</h3>
                      <div className="flex items-center gap-4">
                        <span className="text-sm">Flexible</span>
                        <div className="relative h-2 flex-1 rounded-full bg-muted">
                          <div
                            className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/4 rounded-full bg-primary"
                            style={{ left: `${(reportData.coachFit.structuredScore / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">Structured</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium">Task vs. Relationship Focus</h3>
                      <div className="flex items-center gap-4">
                        <span className="text-sm">Relationship</span>
                        <div className="relative h-2 flex-1 rounded-full bg-muted">
                          <div
                            className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/4 rounded-full bg-primary"
                            style={{ left: `${(reportData.coachFit.taskScore / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">Task</span>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <h3 className="mb-2 font-medium">Preferred Coaching Style</h3>
                    <p>{reportData.coachFit.preferredStyle}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations">
            {/* AI-Powered Recommendations */}
            <Card className="mb-6 border-blue-200 bg-blue-50/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    <div>
                      <CardTitle>AI-Powered Development Recommendations</CardTitle>
                      <CardDescription>
                        Personalized coaching guidance generated by AI based on your weakest scoring domains
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchAiRecommendations}
                    disabled={aiLoading}
                    className="gap-2"
                  >
                    {aiLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : aiRecommendations ? (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        Regenerate
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Get AI Recommendations
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {!aiRecommendations && !aiLoading && !aiError && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Sparkles className="h-10 w-10 mx-auto mb-3 text-blue-400" />
                    <p className="font-medium mb-1">AI analysis available</p>
                    <p className="text-sm">
                      Click "Get AI Recommendations" to generate personalized coaching advice
                      focused on your lowest-scoring domains.
                    </p>
                  </div>
                )}

                {aiLoading && (
                  <div className="text-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Analyzing your assessment scores and generating personalized recommendations...
                    </p>
                  </div>
                )}

                {aiError && (
                  <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-800 text-sm">AI recommendations unavailable</p>
                        <p className="text-sm text-yellow-700 mt-1">{aiError}</p>
                        <p className="text-xs text-yellow-600 mt-2">Standard recommendations are shown below.</p>
                      </div>
                    </div>
                  </div>
                )}

                {aiRecommendations?.recommendations && (
                  <div className="space-y-6">
                    {aiRecommendations.overallInsight && (
                      <div className="rounded-lg bg-blue-100/50 border border-blue-200 p-4">
                        <h4 className="font-medium text-blue-900 mb-1">Overall Coaching Insight</h4>
                        <p className="text-sm text-blue-800 leading-relaxed">{aiRecommendations.overallInsight}</p>
                      </div>
                    )}

                    {aiRecommendations.recommendations.map((rec: any, index: number) => (
                      <div key={index} className="rounded-lg border border-blue-200 bg-background p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="destructive" className="text-xs">
                            {rec.priority} Priority
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {rec.domain}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{rec.analysis}</p>

                        <h5 className="font-medium text-sm mb-2">Recommended Actions</h5>
                        <ul className="space-y-2 mb-4">
                          {rec.actions?.map((action: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-medium mt-0.5">
                                {i + 1}
                              </span>
                              <span className="leading-relaxed">{action}</span>
                            </li>
                          ))}
                        </ul>

                        {rec.resource && (
                          <div className="rounded bg-muted/50 p-3">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Recommended Resource</p>
                            <p className="text-sm">{rec.resource}</p>
                          </div>
                        )}
                      </div>
                    ))}

                    <p className="text-xs text-muted-foreground text-center">
                      Generated by AI based on your assessment scores. Recommendations are for guidance and do not
                      replace professional coaching.
                    </p>
                  </div>
                )}

                {aiRecommendations?.rawText && !aiRecommendations?.recommendations && (
                  <div className="rounded-lg border p-4">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{aiRecommendations.rawText}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Static Fallback Recommendations -- always visible */}
            <Card>
              <CardHeader>
                <CardTitle>Standard Recommendations</CardTitle>
                <CardDescription>Assessment-based suggestions across your 12 domains</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.recommendations.map((recommendation: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs text-white ${
                            recommendation.priority === "High"
                              ? "bg-red-500"
                              : recommendation.priority === "Medium"
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                recommendation.priority === "High"
                                  ? "bg-red-100 text-red-800"
                                  : recommendation.priority === "Medium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                              }`}
                            >
                              {recommendation.priority} Priority
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {recommendation.domain}
                            </span>
                          </div>
                          <p className="font-medium">{recommendation.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
